import fs from 'fs';
import path from 'path';
import { DocumentItem, DocumentChunk, RagCitation } from '@/types/chat';
import { generateLocalEmbedding, searchSimilarChunks } from './embeddings';

interface StoreData {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
}

const DATA_DIR = path.join(process.cwd(), '.zoya_data');
const STORE_FILE = path.join(DATA_DIR, 'rag_store.json');

// In-memory cache for fast access
let inMemoryStore: StoreData | null = null;

function ensureStorage(): StoreData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.documents) && Array.isArray(parsed.chunks)) {
        inMemoryStore = parsed;
        return inMemoryStore!;
      }
    }
  } catch (err) {
    console.warn('Failed to load rag_store.json from disk, starting fresh:', err);
  }

  inMemoryStore = { documents: [], chunks: [] };
  return inMemoryStore;
}

function persistStorage(): void {
  if (!inMemoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist rag_store.json to disk:', err);
  }
}

export const RagStore = {
  getDocuments(): DocumentItem[] {
    const store = ensureStorage();
    return store.documents;
  },

  getAllChunks(): DocumentChunk[] {
    const store = ensureStorage();
    return store.chunks;
  },

  addDocument(doc: DocumentItem, chunks: DocumentChunk[]): void {
    const store = ensureStorage();

    // Remove existing with same ID if any
    store.documents = store.documents.filter((d) => d.id !== doc.id);
    store.chunks = store.chunks.filter((c) => c.documentId !== doc.id);

    // Compute embeddings for chunks if not present
    const preparedChunks = chunks.map((chunk) => ({
      ...chunk,
      vector: chunk.vector || generateLocalEmbedding(chunk.text),
    }));

    store.documents.unshift(doc);
    store.chunks.push(...preparedChunks);

    persistStorage();
  },

  deleteDocument(documentId: string): boolean {
    const store = ensureStorage();
    const initialDocCount = store.documents.length;

    store.documents = store.documents.filter((d) => d.id !== documentId);
    store.chunks = store.chunks.filter((c) => c.documentId !== documentId);

    if (store.documents.length !== initialDocCount) {
      persistStorage();
      return true;
    }
    return false;
  },

  clearAll(): void {
    inMemoryStore = { documents: [], chunks: [] };
    persistStorage();
  },

  query(query: string, topK: number = 4): RagCitation[] {
    const store = ensureStorage();
    if (!store.chunks || store.chunks.length === 0) {
      return [];
    }
    return searchSimilarChunks(query, store.chunks, topK);
  },
};
