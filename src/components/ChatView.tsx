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
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-[#0a0a0a] overflow-hidden relative">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[120px] rounded-full" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-white/10">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between">
          {messages.length === 0 ? (
            /* Empty State Hero Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
              {/* Glowing Zoya Logo Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-400 p-[1.5px] shadow-2xl shadow-orange-500/20">
                  <div className="w-full h-full rounded-3xl bg-[#121212] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
                <div className="absolute -inset-2 bg-orange-500/10 rounded-full blur-xl -z-10" />
              </div>

              {/* Title & Tagline */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                What can I help with today?
              </h1>
              <p className="text-sm text-gray-400 max-w-md mb-8">
                Type your thoughts below, choose a contextual shortcut, or tap the orange mic for full voice mode.
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full mb-8 text-left">
                <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.05] hover:border-orange-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-semibold text-white">Instant Reasoning</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    High speed streaming responses with think mode.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.05] hover:border-orange-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Voice Hero Mode</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Real-time audio reactive particle orb with interruption.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#141414] border border-white/[0.05] hover:border-orange-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Local Privacy</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
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
      <div className="w-full bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pt-2">
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
