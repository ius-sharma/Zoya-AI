'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Sparkles, Pencil, Send } from 'lucide-react';
import { Message } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { SourceCitations } from './SourceCitations';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { editAndResendMessage, isStreaming } = useChat();

  const isUser = message.role === 'user';

  // Sync editText if message.content changes
  useEffect(() => {
    setEditText(message.content);
  }, [message.content]);

  // Auto-focus and position cursor at end when editing begins
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || isStreaming) return;
    setIsEditing(false);
    editAndResendMessage(message.id, editText.trim());
  };

  if (isUser) {
    if (isEditing) {
      return (
        <div className="flex justify-end my-3.5 w-full">
          <div className="w-full max-w-[85%] sm:max-w-[75%] bg-[#FFFFFF] dark:bg-[#1C1917] rounded-2xl border border-[#9C4A1A]/40 dark:border-[#D97706]/40 p-3.5 shadow-lg shadow-stone-300/30 dark:shadow-black/50 transition-all">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 220)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditText(message.content);
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
              }}
              rows={2}
              className="w-full bg-transparent text-[#292524] dark:text-[#FAF6F0] text-sm leading-relaxed outline-none resize-none font-medium caret-[#9C4A1A] dark:caret-[#D97706] max-h-56"
              placeholder="Edit your prompt..."
            />
            <div className="flex items-center justify-between pt-2.5 border-t border-[#E8D8C8] dark:border-[#2E2722] mt-2">
              <span className="text-[11px] text-[#8C7A6B] dark:text-[#A89F91] hidden sm:inline">
                Enter to send • Shift+Enter for newline • Esc to cancel
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.content);
                  }}
                  className="px-3 py-1 text-xs font-medium text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() || isStreaming}
                  className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold bg-[#9C4A1A] hover:bg-[#B85D19] dark:bg-[#D97706] dark:hover:bg-[#B45309] text-white rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end my-3.5 group">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 bg-[#9C4A1A] text-white rounded-2xl rounded-tr-sm shadow-md shadow-[#9C4A1A]/20 text-sm leading-relaxed transition-all font-medium whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Action icons on hover */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1">
          <button
            onClick={() => {
              setEditText(message.content);
              setIsEditing(true);
            }}
            disabled={isStreaming}
            className="flex items-center gap-1 text-[11px] text-[#786A5E] dark:text-[#A89F91] hover:text-[#9C4A1A] dark:hover:text-[#D97706] px-1.5 py-0.5 rounded-md transition-colors hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Edit and resend prompt"
          >
            <Pencil className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] px-1.5 py-0.5 rounded-md transition-colors hover:bg-[#F5EBE0] dark:hover:bg-[#26221E] cursor-pointer"
            title="Copy message"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
                <span className="text-[#9C4A1A] dark:text-[#D97706] font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
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
