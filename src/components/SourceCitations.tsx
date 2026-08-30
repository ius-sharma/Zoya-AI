'use client';

import React, { useState } from 'react';
import { FileText, FileCode, BookOpen, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';
import { RagCitation } from '@/types/chat';

interface SourceCitationsProps {
  citations: RagCitation[];
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({ citations }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!citations || citations.length === 0) {
    return null;
  }

  const handleCopySnippet = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFileIcon = (fileType: string) => {
    const ext = fileType.toLowerCase();
    if (['py', 'js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-3.5 h-3.5 text-[#B85D19] dark:text-[#D97706]" />;
    }
    if (ext === 'pdf') {
      return <BookOpen className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#E87A38]" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#7C3512] dark:text-[#C5B8AB]" />;
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-[#E8D8C8]/80 dark:border-[#2E2722]/80 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#786A5E] dark:text-[#A89F91]">
          Sources & Citations ({citations.length})
        </span>
      </div>

      {/* Citations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((cit) => {
          const isExpanded = expandedId === cit.id;
          const matchPercent = Math.round(cit.similarity * 100);

          return (
            <div
              key={cit.id}
              onClick={() => setExpandedId(isExpanded ? null : cit.id)}
              className={`group flex flex-col rounded-xl p-2.5 border cursor-pointer transition-all duration-200 ${
                isExpanded
                  ? 'bg-[#FFFFFF] dark:bg-[#241F1C] border-[#B85D19]/50 dark:border-[#D97706]/50 shadow-md ring-1 ring-[#B85D19]/20'
                  : 'bg-[#FAF6F0]/90 dark:bg-[#1C1917]/90 hover:bg-[#FFFFFF] dark:hover:bg-[#241F1C] border-[#E0D0BE] dark:border-[#2E2722] hover:border-[#B85D19]/30'
              }`}
            >
              {/* Top Row: Icon + File Name + Score + Expand arrow */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="p-1 rounded-md bg-[#F5EBE0] dark:bg-[#2E2722] shrink-0">
                    {getFileIcon(cit.fileType)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#1C1917] dark:text-[#FAF6F0] truncate">
                      {cit.fileName}
                    </span>
                    {cit.pageNumber && (
                      <span className="text-[10px] text-[#8C7A6B] dark:text-[#A89F91] font-medium">
                        Page {cit.pageNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 text-[#9C4A1A] dark:text-[#D97706]">
                    {matchPercent}% Match
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#786A5E] dark:text-[#A89F91]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#786A5E] dark:text-[#A89F91]" />
                  )}
                </div>
              </div>

              {/* Excerpt Snippet (Collapsible) */}
              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-[#E8D8C8] dark:border-[#38302A] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-[#8C7A6B] dark:text-[#A89F91]">
                    <span className="font-semibold italic">Referenced Text Excerpt:</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopySnippet(cit.id, cit.snippet, e)}
                      className="flex items-center gap-1 hover:text-[#1C1917] dark:hover:text-[#FAF6F0] transition-colors"
                      title="Copy excerpt"
                    >
                      {copiedId === cit.id ? (
                        <Check className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === cit.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-[#574E45] dark:text-[#C5B8AB] bg-[#F5EBE0]/60 dark:bg-[#141210] p-2 rounded-lg leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    &ldquo;{cit.snippet}&rdquo;
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
