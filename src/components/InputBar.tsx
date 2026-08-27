'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, ArrowUp, Globe, Brain, Paperclip } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const ROTATING_PLACEHOLDERS = [
  'Ask Zoya anything...',
  'Brainstorm novel concepts...',
  'Analyze, code, or draft...',
  'Explore deep thoughts with Zoya...',
];

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled = false }) => {
  const { mode, toggleDeepSearch, toggleThink, openVoiceMode, isStreaming } = useChat();
  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      <div className="relative rounded-[26px] bg-[#FFFFFF] border border-[#E8D8C8] shadow-lg shadow-stone-300/35 focus-within:border-[#B85D19]/40 focus-within:ring-2 focus-within:ring-[#B85D19]/15 transition-all duration-300 overflow-hidden">
        {/* Upper Area: Compact Textarea with Silky Typography */}
        <div className="px-4 pt-3 pb-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
            rows={1}
            className="w-full max-h-36 min-h-[28px] bg-transparent text-[#292524] placeholder-[#A89F91] text-sm sm:text-base resize-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-none caret-[#9C4A1A] leading-relaxed transition-all"
          />
        </div>

        {/* Bottom Integrated Dock (Compact Tight Spacing) */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-0.5">
          {/* Left Dock: Tools & Intelligence Modes */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attachment Button */}
            <button
              type="button"
              className="flex items-center justify-center w-7 h-7 rounded-full text-[#8C7A6B] hover:text-[#292524] hover:bg-[#FAF6F0] transition-colors"
              title="Attach document or image (Coming soon)"
              aria-label="Attach file"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Deep Search Toggle in Light Soft Amber */}
            <button
              type="button"
              onClick={toggleDeepSearch}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mode.deepSearch
                  ? 'bg-[#FAF0E6] text-[#9C4A1A] border border-[#E8D0BE] shadow-xs'
                  : 'text-[#8C7A6B] hover:text-[#292524] hover:bg-[#FAF6F0] border border-transparent'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Deep Search</span>
            </button>

            {/* Think Reasoning Toggle in Light Soft Caramel */}
            <button
              type="button"
              onClick={toggleThink}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mode.think
                  ? 'bg-[#FEF6EE] text-[#B85D19] border border-[#F0D8C4] shadow-xs'
                  : 'text-[#8C7A6B] hover:text-[#292524] hover:bg-[#FAF6F0] border border-transparent'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>Think</span>
            </button>
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
                  : 'bg-[#FAF6F0] hover:bg-[#F5EBE0] shadow-none hover:scale-105 active:scale-95'
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
                    : 'text-[#8C7A6B] hover:text-[#292524] scale-95'
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
                  : 'bg-[#F5EBE0]/80 shadow-none cursor-not-allowed opacity-60'
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
                    : 'text-[#BFAF9E] scale-95'
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
        <span className="text-[11px] text-[#8C7A6B]">
          Zoya can make mistakes. Verify important information.
        </span>
      </div>
    </div>
  );
};
