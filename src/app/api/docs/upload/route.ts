import { NextRequest, NextResponse } from 'next/server';
import { DocumentItem, DocumentChunk } from '@/types/chat';
import { chunkText } from '@/utils/rag/chunker';
import { RagStore } from '@/utils/rag/store';
import { extractText as extractPdfText } from 'unpdf';
import mammoth from 'mammoth';

export const runtime = 'nodejs';

// Safe PDF Parser powered by Mozilla PDF.js (unpdf)
async function parsePdfBuffer(
  buffer: Uint8Array
): Promise<{ pages: Array<{ pageNumber: number; text: string }>; totalPages: number }> {
  try {
    const result = await extractPdfText(buffer);
    const rawText: unknown = result.text;
    const totalPages =
      result.totalPages || (Array.isArray(rawText) ? rawText.length : 1);

    if (Array.isArray(rawText)) {
      const pages = rawText
        .map((pageText, idx) => ({
          pageNumber: idx + 1,
          text: typeof pageText === 'string' ? pageText.trim() : '',
        }))
        .filter((p) => p.text.length > 0);
      return { pages, totalPages };
    } else if (typeof rawText === 'string' && rawText.trim().length > 0) {
      return { pages: [{ pageNumber: 1, text: rawText.trim() }], totalPages };
    }
  } catch (err) {
    console.error('unpdf extraction error:', err);
  }
  return { pages: [], totalPages: 1 };
}

// Safe DOCX Parser
async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (err) {
    console.error('DOCX parsing error:', err);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const processedDocs: DocumentItem[] = [];

    for (const file of files) {
      const fileName = file.name;
      const fileSize = file.size;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      const documentId =
        'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const buffer = Buffer.from(arrayBuffer);

      const chunks: DocumentChunk[] = [];
      let totalPagesCount = 1;

      if (fileExt === 'pdf') {
        const { pages, totalPages } = await parsePdfBuffer(uint8);
        totalPagesCount = totalPages || 1;

        if (pages.length > 0) {
          pages.forEach((page) => {
            const pageChunks = chunkText(
              page.text,
              {
                documentId,
                fileName,
                fileType: 'pdf',
                pageNumber: page.pageNumber,
              },
              { chunkSize: 650, chunkOverlap: 120 }
            );
            chunks.push(...pageChunks);
          });
        }
      } else if (fileExt === 'docx') {
        const extractedText = await parseDocxBuffer(buffer);
        if (extractedText.trim()) {
          const docxChunks = chunkText(
            extractedText,
            {
              documentId,
              fileName,
              fileType: 'docx',
            },
            { chunkSize: 650, chunkOverlap: 120 }
          );
          chunks.push(...docxChunks);
        }
      } else {
        // Plain text, Markdown, Source Code, JSON, CSV
        const extractedText = buffer.toString('utf-8');
        if (extractedText.trim()) {
          const textChunks = chunkText(
            extractedText,
            {
              documentId,
              fileName,
              fileType: fileExt || 'txt',
            },
            { chunkSize: 650, chunkOverlap: 120 }
          );
          chunks.push(...textChunks);
        }
      }

      if (chunks.length === 0) {
        console.warn(`No text could be extracted from ${fileName}`);
        continue;
      }

      const docItem: DocumentItem = {
        id: documentId,
        fileName,
        fileType: fileExt,
        fileSize,
        pageCount: totalPagesCount > 1 ? totalPagesCount : undefined,
        chunkCount: chunks.length,
        uploadedAt: Date.now(),
        status: 'ready',
      };

      // Add to local vector store
      RagStore.addDocument(docItem, chunks);
      processedDocs.push(docItem);
    }

    return NextResponse.json({
      success: true,
      documents: processedDocs,
      totalIndexed: processedDocs.length,
    });
  } catch (err: unknown) {
    console.error('Error in /api/docs/upload:', err);
    const message = err instanceof Error ? err.message : 'Failed to process documents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
