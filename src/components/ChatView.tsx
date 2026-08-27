'use client';

import React, { useRef, useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QuickChips } from './QuickChips';
import { InputBar } from './InputBar';
import { useChat } from '@/context/ChatContext';
import { QuickChip } from '@/types/chat';

export const ChatView: React.FC = () => {
  const { activeConversation, sendMessage, isStreaming } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  const handleSelectChip = (chip: QuickChip) => {
    sendMessage(chip.prompt, chip.id);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-[#FAF6F0] overflow-hidden relative">
      {/* Subtle warm rust ambient background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#9C4A1A]/5 blur-[140px] rounded-full" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-stone-300">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between">
          {messages.length === 0 ? (
            /* Empty State Hero Screen in Luxury Satin Cream */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
              {/* Glowing Zoya Logo Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] p-[1.5px] shadow-xl shadow-[#9C4A1A]/20">
                  <div className="w-full h-full rounded-3xl bg-[#FAF6F0] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#9C4A1A]" />
                  </div>
                </div>
                <div className="absolute -inset-2 bg-[#9C4A1A]/10 rounded-full blur-xl -z-10" />
              </div>

              {/* Title & Tagline */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mb-2">
                What can I help with today?
              </h1>
              <p className="text-sm text-[#786A5E] max-w-md mb-8 font-medium">
                Type your thoughts below, choose a contextual shortcut, or tap the mic for full voice mode.
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-lg w-full mb-8 text-left">
                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] hover:border-[#9C4A1A]/40 transition-colors shadow-sm shadow-stone-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#9C4A1A]" />
                    <span className="text-xs font-bold text-[#1C1917]">Instant Reasoning</span>
                  </div>
                  <p className="text-[11px] text-[#786A5E] leading-relaxed">
                    High speed streaming responses with think mode.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] hover:border-[#9C4A1A]/40 transition-colors shadow-sm shadow-stone-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-bold text-[#1C1917]">Voice Hero Mode</span>
                  </div>
                  <p className="text-[11px] text-[#786A5E] leading-relaxed">
                    Real-time audio reactive liquid disc with interruption.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] hover:border-[#9C4A1A]/40 transition-colors shadow-sm shadow-stone-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#7C3512]" />
                    <span className="text-xs font-bold text-[#1C1917]">Local Privacy</span>
                  </div>
                  <p className="text-[11px] text-[#786A5E] leading-relaxed">
                    Conversations safely saved to your local storage.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="space-y-2 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area: Quick Chips + Input Bar */}
      <div className="w-full bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/95 to-transparent pt-2">
        <div className="max-w-3xl mx-auto">
          {/* Quick Action Chips */}
          <div className="px-3 sm:px-4">
            <QuickChips onSelectChip={handleSelectChip} disabled={isStreaming} />
          </div>

          {/* Input Bar */}
          <InputBar onSendMessage={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
};
