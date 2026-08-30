'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileCode,
  BookOpen,
  Trash2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { DocumentItem } from '@/types/chat';

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const KnowledgeVaultModal: React.FC = () => {
  const {
    isVaultOpen,
    setIsVaultOpen,
    documents,
    ragEnabled,
    toggleRag,
    uploadDocuments,
    deleteDocument,
    purgeAllDocuments,
    isUploadingDocs,
  } = useChat();

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isVaultOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadDocuments(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadDocuments(Array.from(e.target.files));
      e.target.value = ''; // reset
    }
  };

  const getFileIcon = (fileType: string) => {
    const ext = fileType.toLowerCase();
    if (['py', 'js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-[#B85D19] dark:text-[#D97706]" />;
    }
    if (ext === 'pdf') {
      return <BookOpen className="w-4 h-4 text-[#9C4A1A] dark:text-[#E87A38]" />;
    }
    return <FileText className="w-4 h-4 text-[#7C3512] dark:text-[#C5B8AB]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#FAF6F0] dark:bg-[#181513] border border-[#E0D0BE] dark:border-[#2E2722] rounded-3xl shadow-2xl shadow-stone-900/40 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D0BE] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#141210]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] flex items-center justify-center shadow-md shadow-[#9C4A1A]/20">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917] dark:text-[#FAF6F0] tracking-tight">
                Knowledge Vault (Local RAG)
              </h2>
              <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                Zero data leakage • 100% private document search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* RAG Master Switch */}
            <button
              type="button"
              onClick={toggleRag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                ragEnabled
                  ? 'bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 border-[#9C4A1A]/30 dark:border-[#D97706]/30 text-[#9C4A1A] dark:text-[#D97706]'
                  : 'bg-[#FAF6F0] dark:bg-[#26221E] border-[#E8D8C8] dark:border-[#38302A] text-[#786A5E] dark:text-[#8C7A6B]'
              }`}
              title="Toggle Knowledge Vault retrieval for all chats"
            >
              {ragEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
                  <span>Vault Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-[#786A5E] dark:text-[#8C7A6B]" />
                  <span>Vault Paused</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsVaultOpen(false)}
              className="p-1.5 text-[#786A5E] dark:text-[#A89F91] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-full transition-colors"
              aria-label="Close Knowledge Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
          {/* Drag & Drop Upload Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              dragActive
                ? 'border-[#9C4A1A] bg-[#9C4A1A]/5 scale-[1.01]'
                : 'border-[#E0D0BE] dark:border-[#38302A] bg-[#FFFFFF]/70 dark:bg-[#1C1917]/70 hover:bg-[#FFFFFF] dark:hover:bg-[#1C1917] hover:border-[#9C4A1A]/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.py,.js,.ts,.tsx,.jsx,.json,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isUploadingDocs ? (
              <div className="flex flex-col items-center gap-2 text-center py-2">
                <Loader2 className="w-8 h-8 text-[#9C4A1A] dark:text-[#D97706] animate-spin" />
                <span className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF6F0]">
                  Indexing documents & creating local vector embeddings...
                </span>
                <span className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B]">
                  Processing completely on your device.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 rounded-full bg-[#F5EBE0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#D97706]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#1C1917] dark:text-[#FAF6F0]">
                    Drop your PDFs, notes, or code files here
                  </p>
                  <p className="text-xs text-[#786A5E] dark:text-[#A89F91]">
                    Supports <span className="font-mono font-medium">.pdf, .docx, .txt, .md, .py, .js, .json</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note Banner */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#141210] border border-[#E8D8C8] dark:border-[#2E2722] text-xs text-[#574E45] dark:text-[#C5B8AB]">
            <ShieldCheck className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706] shrink-0" />
            <span>
              <strong>100% Privacy Guarantee:</strong> Your files never leave this machine. Chunks & vectors stay locally in your private workspace.
            </span>
          </div>

          {/* Indexed Documents List Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#786A5E] dark:text-[#A89F91]">
                Indexed Documents ({documents.length})
              </span>
              {documents.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 text-[#9C4A1A] dark:text-[#D97706]">
                  {documents.reduce((acc, d) => acc + d.chunkCount, 0)} Chunks Ready
                </span>
              )}
            </div>

            {documents.length > 0 && (
              <button
                type="button"
                onClick={purgeAllDocuments}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purge Vault</span>
              </button>
            )}
          </div>

          {/* Documents List */}
          {documents.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF]/60 dark:bg-[#1C1917]/60 rounded-2xl border border-[#E0D0BE] dark:border-[#2E2722]">
              <FileText className="w-8 h-8 mx-auto text-[#A89F91] dark:text-[#574E45] mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB]">
                No documents in Knowledge Vault yet.
              </p>
              <p className="text-[11px] text-[#786A5E] dark:text-[#8C7A6B] mt-0.5">
                Upload your semester notes, research papers, or project documentation above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: DocumentItem) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E0D0BE] dark:border-[#2E2722] hover:border-[#9C4A1A]/30 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="p-2 rounded-xl bg-[#F5EBE0] dark:bg-[#26221E] shrink-0">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#FAF6F0] truncate">
                        {doc.fileName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[#786A5E] dark:text-[#8C7A6B] mt-0.5">
                        <span>{formatBytes(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.chunkCount} chunks</span>
                        {doc.pageCount && (
                          <>
                            <span>•</span>
                            <span>{doc.pageCount} pages</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-[#8C7A6B] dark:text-[#A89F91] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-lg transition-colors shrink-0"
                    title="Remove document from Vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E0D0BE] dark:border-[#2E2722] bg-[#FFFFFF] dark:bg-[#141210]">
          <div className="flex items-center gap-1.5 text-xs text-[#786A5E] dark:text-[#A89F91]">
            <Sparkles className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
            <span>Ask questions anytime in chat to search your vault!</span>
          </div>

          <button
            type="button"
            onClick={() => setIsVaultOpen(false)}
            className="px-4 py-2 bg-[#9C4A1A] hover:bg-[#803810] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
