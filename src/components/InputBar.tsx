'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, ArrowUp, Globe, Brain, Sparkles } from 'lucide-react';
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
    // Auto-expand up to 140px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-1">
      {/* Outer rounded pill container */}
      <div className="relative rounded-3xl bg-[#141414] border border-white/[0.08] shadow-2xl shadow-black/80 focus-within:border-orange-500/40 focus-within:ring-1 focus-within:ring-orange-500/30 transition-all">
        {/* Top bar inside input: Mode Toggles */}
        <div className="flex items-center gap-2 px-3.5 pt-2.5 pb-1">
          {/* Deep Search Toggle */}
          <button
            type="button"
            onClick={toggleDeepSearch}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              mode.deepSearch
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deep Search</span>
          </button>

          {/* Think Toggle */}
          <button
            type="button"
            onClick={toggleThink}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              mode.think
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
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
            className="flex-1 max-h-36 min-h-[28px] bg-transparent text-white placeholder-gray-500 text-sm sm:text-base resize-none focus:outline-none px-1 py-1 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {/* Send Arrow Button (active when input has text) */}
            {input.trim() ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || isStreaming}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black hover:bg-gray-200 active:scale-95 transition-all shadow-md"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 font-bold" />
              </button>
            ) : null}

            {/* Circular Orange Mic Button (switches to Voice Mode) */}
            <button
              type="button"
              onClick={openVoiceMode}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all group"
              aria-label="Switch to Voice Mode"
              title="Enter Voice Mode"
            >
              <Mic className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-[#141414] animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle branding hint */}
      <div className="text-center pt-2">
        <span className="text-[11px] text-gray-500">
          Zoya AI can make mistakes. Verify important information.
        </span>
      </div>
    </div>
  );
};
