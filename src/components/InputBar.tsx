'use client';

import React, { useState, useRef } from 'react';
import { Mic, ArrowUp, Globe, Brain } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled = false }) => {
  const { mode, toggleDeepSearch, toggleThink, openVoiceMode, isStreaming } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-1">
      {/* Outer rounded pill container in Pure Silk Cream */}
      <div className="relative rounded-3xl bg-[#FFFFFF] border border-[#E8D8C8] shadow-xl shadow-stone-300/40 focus-within:border-[#9C4A1A] focus-within:ring-1 focus-within:ring-[#9C4A1A]/30 transition-all">
        {/* Top bar inside input: Mode Toggles */}
        <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-1">
          {/* Deep Search Toggle */}
          <button
            type="button"
            onClick={toggleDeepSearch}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              mode.deepSearch
                ? 'bg-[#9C4A1A]/10 text-[#7C3512] border border-[#9C4A1A]/35 shadow-sm'
                : 'text-[#786A5E] hover:text-[#292524] hover:bg-[#F5EBE0] border border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deep Search</span>
          </button>

          {/* Think Toggle */}
          <button
            type="button"
            onClick={toggleThink}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              mode.think
                ? 'bg-[#D97706]/15 text-[#7C3512] border border-[#D97706]/40 shadow-sm'
                : 'text-[#786A5E] hover:text-[#292524] hover:bg-[#F5EBE0] border border-transparent'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Think</span>
          </button>
        </div>

        {/* Input Area + Action Buttons */}
        <div className="flex items-end gap-2 px-3 pb-2.5 pt-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 max-h-36 min-h-[28px] bg-transparent text-[#292524] placeholder-[#A89F91] text-sm sm:text-base resize-none focus:outline-none px-1 py-1 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {/* Send Arrow Button (active when input has text) */}
            {input.trim() ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || isStreaming}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#9C4A1A] text-white hover:bg-[#7C3512] active:scale-95 transition-all shadow-md shadow-[#9C4A1A]/30 font-bold"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 font-bold stroke-[2.5]" />
              </button>
            ) : null}

            {/* Circular Rust Brown Mic Button (switches to Voice Mode) */}
            <button
              type="button"
              onClick={openVoiceMode}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] hover:from-[#9C4A1A] hover:to-[#C25E1A] text-white shadow-lg shadow-[#9C4A1A]/30 hover:scale-105 active:scale-95 transition-all group"
              aria-label="Switch to Voice Mode"
              title="Enter Voice Mode"
            >
              <Mic className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D97706] ring-2 ring-[#FFFFFF] animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle branding hint */}
      <div className="text-center pt-2">
        <span className="text-[11px] text-[#786A5E]">
          Zoya AI can make mistakes. Verify important information.
        </span>
      </div>
    </div>
  );
};
