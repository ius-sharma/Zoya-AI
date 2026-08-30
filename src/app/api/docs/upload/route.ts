import { NextRequest, NextResponse } from 'next/server';
import { DocumentItem, DocumentChunk } from '@/types/chat';
import { chunkText } from '@/utils/rag/chunker';
import { RagStore } from '@/utils/rag/store';
import mammoth from 'mammoth';

export const runtime = 'nodejs';

// Helper to safely parse PDF buffers
async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; numpages: number }> {
  try {
    // Dynamic import to prevent bundler issues with pdf-parse in Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      numpages: data.numpages || 1,
    };
  } catch (err) {
    console.error('PDF parsing error:', err);
    // Fallback: extract ASCII strings from buffer
    const rawString = buffer.toString('binary');
    const matches = rawString.match(/\(([^)]+)\)/g) || [];
    const text = matches.map((m) => m.slice(1, -1)).join(' ');
    return { text: text.trim() || 'Failed to extract text from PDF.', numpages: 1 };
  }
}

// Helper to safely parse DOCX buffers
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
      const documentId = 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let extractedText = '';
      let pageCount = 1;

      if (fileExt === 'pdf') {
        const pdfResult = await parsePdfBuffer(buffer);
        extractedText = pdfResult.text;
        pageCount = pdfResult.numpages;
      } else if (fileExt === 'docx') {
        extractedText = await parseDocxBuffer(buffer);
      } else {
        // Plain text, Markdown, Source Code, JSON, CSV
        extractedText = buffer.toString('utf-8');
      }

      if (!extractedText || !extractedText.trim()) {
        continue;
      }

      // Chunk the text
      const chunks: DocumentChunk[] = chunkText(
        extractedText,
        {
          documentId,
          fileName,
          fileType: fileExt || 'txt',
          pageNumber: pageCount > 1 ? 1 : undefined,
        },
        {
          chunkSize: 650,
          chunkOverlap: 120,
        }
      );

      const docItem: DocumentItem = {
        id: documentId,
        fileName,
        fileType: fileExt,
        fileSize,
        pageCount: pageCount > 1 ? pageCount : undefined,
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
