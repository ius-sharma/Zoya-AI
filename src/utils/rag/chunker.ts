import { DocumentChunk } from '@/types/chat';

interface ChunkOptions {
  chunkSize?: number; // Target characters per chunk (~100-150 words)
  chunkOverlap?: number; // Overlap characters
}

export function chunkText(
  text: string,
  meta: {
    documentId: string;
    fileName: string;
    fileType: string;
    pageNumber?: number;
  },
  options: ChunkOptions = {}
): DocumentChunk[] {
  const { chunkSize = 600, chunkOverlap = 100 } = options;

  if (!text || !text.trim()) {
    return [];
  }

  // Normalize newlines and excess whitespace
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
  if (cleanText.length <= chunkSize) {
    return [
      {
        id: `chk_${meta.documentId}_${meta.pageNumber || 1}_0`,
        documentId: meta.documentId,
        fileName: meta.fileName,
        fileType: meta.fileType,
        pageNumber: meta.pageNumber,
        chunkIndex: 0,
        text: cleanText,
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < cleanText.length) {
      // Find natural break points (sentence end, paragraph break, or space)
      const slice = cleanText.substring(startIndex, endIndex + 80);
      const sentenceBreak = slice.lastIndexOf('. ');
      const newlineBreak = slice.lastIndexOf('\n');
      const spaceBreak = slice.lastIndexOf(' ');

      if (sentenceBreak > chunkSize * 0.7) {
        endIndex = startIndex + sentenceBreak + 1;
      } else if (newlineBreak > chunkSize * 0.7) {
        endIndex = startIndex + newlineBreak;
      } else if (spaceBreak > chunkSize * 0.7) {
        endIndex = startIndex + spaceBreak;
      }
    } else {
      endIndex = cleanText.length;
    }

    const chunkContent = cleanText.substring(startIndex, endIndex).trim();
    if (chunkContent.length > 20) {
      chunks.push({
        id: `chk_${meta.documentId}_${meta.pageNumber || 1}_${chunkIndex}`,
        documentId: meta.documentId,
        fileName: meta.fileName,
        fileType: meta.fileType,
        pageNumber: meta.pageNumber,
        chunkIndex,
        text: chunkContent,
      });
      chunkIndex++;
    }

    if (endIndex >= cleanText.length) {
      break;
    }

    startIndex = Math.max(startIndex + 1, endIndex - chunkOverlap);
  }

  return chunks;
}
