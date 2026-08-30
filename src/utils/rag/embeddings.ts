import { DocumentChunk, RagCitation } from '@/types/chat';

/**
 * Fast, lightweight subword + term-frequency vector embedding generator.
 * Produces deterministic dense embeddings (dimension 384) with 0 external API calls or heavyweight binaries.
 */
const VECTOR_DIMENSION = 384;

// Simple deterministic hash for consistent token dimension mapping
function hashStringToBucket(str: string, maxBuckets: number): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) % maxBuckets;
}

// Tokenize text into words and character n-grams
function extractTokens(text: string): string[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s_-]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 1);

  const tokens: string[] = [...words];
  // Add character 3-grams & 4-grams for subword matching (handles typos, plurals, prefixes)
  for (const word of words) {
    if (word.length >= 4) {
      for (let i = 0; i <= word.length - 3; i++) {
        tokens.push(word.substring(i, i + 3));
      }
    }
  }

  return tokens;
}

/**
 * Generates a normalized 384-dimensional dense vector for a text string.
 */
export function generateLocalEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const tokens = extractTokens(text);

  if (tokens.length === 0) {
    return vector;
  }

  // Frequency mapping with logarithmic dampening
  const tokenFreq = new Map<string, number>();
  for (const token of tokens) {
    tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1);
  }

  tokenFreq.forEach((count, token) => {
    const bucket = hashStringToBucket(token, VECTOR_DIMENSION);
    const weight = Math.log(1 + count) * (token.length > 3 ? 1.4 : 1.0);
    vector[bucket] += weight;
  });

  // Normalize L2 norm to unit length
  let norm = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIMENSION; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two unit-normalized vectors.
 * Range: [0.0, 1.0]
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Searches chunks for the best matches given a query string.
 * Returns top-K citations ordered by similarity score.
 */
export function searchSimilarChunks(
  query: string,
  chunks: DocumentChunk[],
  topK: number = 4,
  minSimilarity: number = 0.22
): RagCitation[] {
  if (!query || !chunks || chunks.length === 0) return [];

  const queryVector = generateLocalEmbedding(query);
  const queryTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const scored: Array<{ chunk: DocumentChunk; score: number }> = [];

  for (const chunk of chunks) {
    const chunkVector = chunk.vector || generateLocalEmbedding(chunk.text);
    let score = cosineSimilarity(queryVector, chunkVector);

    // Exact term booster (rewards chunks containing exact keywords from query)
    const chunkTextLower = chunk.text.toLowerCase();
    let exactMatches = 0;
    for (const token of queryTokens) {
      if (chunkTextLower.includes(token)) {
        exactMatches++;
      }
    }

    if (queryTokens.length > 0) {
      const matchRatio = exactMatches / queryTokens.length;
      score = score * 0.7 + matchRatio * 0.3; // Blend vector similarity + keyword coverage
    }

    if (score >= minSimilarity) {
      scored.push({ chunk, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ chunk, score }) => ({
    id: `cit_${chunk.id}`,
    documentId: chunk.documentId,
    fileName: chunk.fileName,
    fileType: chunk.fileType,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    snippet: chunk.text,
    similarity: Math.round(score * 100) / 100,
  }));
}
