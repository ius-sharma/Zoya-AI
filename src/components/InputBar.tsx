'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, ArrowUp, Paperclip } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const ROTATING_PLACEHOLDERS = [
  'Chat with Zoya...',
  'Tell me anything, bestie...',
  'Ask for advice, jokes, or help...',
  'Share what is on your mind...',
];

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled = false }) => {
  const { openVoiceMode, isStreaming, activeId, setIsVaultOpen, documents, ragEnabled } = useChat();
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const prevStreamingRef = useRef<boolean>(isStreaming);

  // Auto-focus textarea on mount or when switching/creating chats
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 80);
    }
  }, [activeId]);

  // Auto-focus textarea automatically as soon as AI finishes streaming/responding
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Rotate silky placeholder hints smoothly when input is empty
  useEffect(() => {
    if (input.trim()) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || disabled || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Retain focus seamlessly
      textareaRef.current.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const isHasText = input.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-0.5">
      {/* Outer Atelier Silk Capsule */}
      <div className="relative rounded-[26px] bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E8D8C8] dark:border-[#2E2722] shadow-lg shadow-stone-300/35 dark:shadow-black/50 focus-within:border-[#B85D19]/40 focus-within:ring-2 focus-within:ring-[#B85D19]/15 transition-all duration-300 overflow-hidden">
        {/* Upper Area: Textarea with Silky Typography */}
        <div className="px-4 pt-3 pb-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
            rows={1}
            className="w-full max-h-36 min-h-[28px] bg-transparent text-[#292524] dark:text-[#FAF6F0] placeholder-[#A89F91] dark:placeholder-[#6E645A] text-sm sm:text-base resize-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none caret-[#9C4A1A] dark:caret-[#D97706] leading-relaxed transition-all"
          />
        </div>

        {/* Bottom Integrated Dock */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
          {/* Left: Attachment & Knowledge Vault Pill */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsVaultOpen(true)}
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                documents.length > 0 && ragEnabled
                  ? 'text-[#9C4A1A] dark:text-[#D97706] bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 hover:bg-[#9C4A1A]/20'
                  : 'text-[#8C7A6B] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] hover:bg-[#FAF6F0] dark:hover:bg-[#26221E]'
              }`}
              title="Knowledge Vault (Upload notes/PDFs for local RAG)"
              aria-label="Open Knowledge Vault"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Quick Vault Status Badge */}
            {documents.length > 0 && (
              <button
                type="button"
                onClick={() => setIsVaultOpen(true)}
                className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                  ragEnabled
                    ? 'bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 text-[#9C4A1A] dark:text-[#D97706] hover:bg-[#9C4A1A]/20'
                    : 'bg-[#FAF6F0] dark:bg-[#26221E] text-[#8C7A6B] dark:text-[#786A5E] border border-[#E8D8C8] dark:border-[#38302A]'
                }`}
                title="Click to manage Knowledge Vault"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{documents.length} {documents.length === 1 ? 'Doc' : 'Docs'} Vault {ragEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>

          {/* Right Dock: Voice Mode Mic + Dedicated Send Arrow Button */}
          <div className="flex items-center gap-1.5 pl-2 shrink-0">
            {/* 1. Voice Mode Mic Button */}
            <button
              type="button"
              onClick={openVoiceMode}
              disabled={disabled || isStreaming}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full p-[1.5px] transition-all duration-300 ease-out overflow-hidden cursor-pointer focus:outline-none ${
                !isHasText
                  ? 'bg-transparent shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:scale-105 active:scale-95'
                  : 'bg-[#FAF6F0] dark:bg-[#26221E] hover:bg-[#F5EBE0] dark:hover:bg-[#2E2722] shadow-none hover:scale-105 active:scale-95'
              }`}
              title="Open Voice Mode"
              aria-label="Enter Voice Mode"
            >
              {/* Luminous 3D Glass Sphere Layer (Fades smoothly) */}
              <div
                className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#fff5d6_20%,#fde047_45%,#f59e0b_70%,#d97706_100%)] shadow-inner transition-all duration-300 ease-out pointer-events-none ${
                  !isHasText ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              />
              {/* Internal Caustic Glint */}
              <div
                className={`absolute inset-[1.5px] rounded-full bg-[radial-gradient(circle_at_70%_75%,rgba(255,255,255,0.6)_0%,rgba(253,224,71,0.35)_35%,transparent_70%)] transition-opacity duration-300 pointer-events-none ${
                  !isHasText ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {/* Top-Left Curved Glass Sheen */}
              <div
                className={`absolute top-[2.5px] left-[5px] w-3 h-1.5 rounded-full bg-gradient-to-b from-white/95 to-white/20 -rotate-[35deg] blur-[0.3px] transition-opacity duration-300 pointer-events-none ${
                  !isHasText ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Mic Icon */}
              <div
                className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
                  !isHasText
                    ? 'text-[#7C3512] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] scale-100'
                    : 'text-[#8C7A6B] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] scale-95'
                }`}
              >
                <Mic className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>
            </button>

            {/* 2. Dedicated Send Arrow Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isHasText || disabled || isStreaming}
              className={`relative flex items-center justify-center w-8 h-8 rounded-full p-[1.5px] transition-all duration-300 ease-out overflow-hidden focus:outline-none ${
                isHasText
                  ? 'bg-transparent shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-[#F5EBE0]/80 dark:bg-[#26221E]/80 shadow-none cursor-not-allowed opacity-60'
              }`}
              title={isHasText ? 'Send message (Enter)' : 'Type to send'}
              aria-label="Send message"
            >
              {/* Luminous 3D Glass Sphere Layer (Fades smoothly on typing) */}
              <div
                className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,#ffffff_0%,#fff5d6_20%,#fde047_45%,#f59e0b_70%,#d97706_100%)] shadow-inner transition-all duration-300 ease-out pointer-events-none ${
                  isHasText ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              />
              {/* Internal Caustic Glint */}
              <div
                className={`absolute inset-[1.5px] rounded-full bg-[radial-gradient(circle_at_70%_75%,rgba(255,255,255,0.6)_0%,rgba(253,224,71,0.35)_35%,transparent_70%)] transition-opacity duration-300 pointer-events-none ${
                  isHasText ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {/* Top-Left Curved Glass Sheen */}
              <div
                className={`absolute top-[2.5px] left-[5px] w-3 h-1.5 rounded-full bg-gradient-to-b from-white/95 to-white/20 -rotate-[35deg] blur-[0.3px] transition-opacity duration-300 pointer-events-none ${
                  isHasText ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Send Arrow Icon */}
              <div
                className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
                  isHasText
                    ? 'text-[#7C3512] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] scale-100'
                    : 'text-[#BFAF9E] dark:text-[#574E45] scale-95'
                }`}
              >
                <ArrowUp className="w-4 h-4 font-bold stroke-[2.8]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Subtle branding hint */}
      <div className="text-center pt-1.5">
        <span className="text-[11px] text-[#8C7A6B] dark:text-[#786A5E]">
          Zoya is your AI best friend. Verify important facts.
        </span>
      </div>
    </div>
  );
};
