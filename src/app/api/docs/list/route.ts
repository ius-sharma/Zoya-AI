import { NextRequest, NextResponse } from 'next/server';
import { RagStore } from '@/utils/rag/store';

export const runtime = 'nodejs';

// GET /api/docs/list - Get all indexed documents
export async function GET() {
  try {
    const documents = RagStore.getDocuments();
    const totalChunks = RagStore.getAllChunks().length;

    return NextResponse.json({
      documents,
      totalDocuments: documents.length,
      totalChunks,
    });
  } catch (err: unknown) {
    console.error('Error fetching documents:', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// DELETE /api/docs/list - Delete a specific document or all documents
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    const purgeAll = searchParams.get('purge') === 'true';

    if (purgeAll) {
      RagStore.clearAll();
      return NextResponse.json({ success: true, message: 'All documents purged.' });
    }

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const deleted = RagStore.deleteDocument(documentId);
    if (!deleted) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      documents: RagStore.getDocuments(),
    });
  } catch (err: unknown) {
    console.error('Error deleting document:', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
