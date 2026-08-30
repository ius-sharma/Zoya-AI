'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, BrainCircuit, Sparkles } from 'lucide-react';
import { Message } from '@/types/chat';
import { SourceCitations } from './SourceCitations';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(true);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-3.5">
        {/* User Message Bubble in Rich Atelier Rust */}
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 bg-[#9C4A1A] text-white rounded-2xl rounded-tr-sm shadow-md shadow-[#9C4A1A]/20 text-sm leading-relaxed transition-all font-medium whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col my-4 group">
      {/* AI Header with Avatar & Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] flex items-center justify-center shadow-sm shadow-[#9C4A1A]/20">
            <Sparkles className="w-3 h-3 text-white font-bold" />
          </div>
          <span className="text-xs font-bold text-[#574E45] dark:text-[#A89F91]">Zoya AI</span>
        </div>

        {/* Action icons */}
        {message.content && !message.isStreaming && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] p-1 rounded-md transition-all hover:bg-[#F5EBE0] dark:hover:bg-[#26221E]"
            title="Copy response"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
                <span className="text-[#9C4A1A] dark:text-[#D97706] font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Thought reasoning accordion (if Think mode was active) */}
      {message.thought && (
        <div className="mb-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E0D0BE] dark:border-[#2E2722] overflow-hidden shadow-sm">
          <button
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-[#7C3512] dark:text-[#E8D8C8] bg-[#F5EBE0]/70 dark:bg-[#26221E]/70 hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Thought Process</span>
            </div>
            {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isThoughtOpen && (
            <div className="p-3.5 text-xs font-mono text-[#574E45] dark:text-[#C5B8AB] whitespace-pre-wrap border-t border-[#E8D8C8] dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#141210] leading-relaxed">
              {message.thought}
            </div>
          )}
        </div>
      )}

      {/* Rich Markdown Output */}
      <div className="pl-7 pr-2 font-sans">
        {!message.content && message.isStreaming ? (
          <div className="flex items-center gap-2 text-[#786A5E] dark:text-[#A89F91] py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9C4A1A] dark:bg-[#D97706] animate-ping" />
            <span className="text-xs font-medium tracking-wide">Zoya is analyzing & writing...</span>
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {message.isStreaming && message.content && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-[#9C4A1A] dark:bg-[#D97706] animate-pulse align-middle rounded-full" />
        )}

        {/* Local-First Document Citations */}
        {message.citations && message.citations.length > 0 && (
          <SourceCitations citations={message.citations} />
        )}
      </div>
    </div>
  );
};
