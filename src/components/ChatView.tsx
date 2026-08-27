'use client';

import React, { useRef, useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QuickChips } from './QuickChips';
import { InputBar } from './InputBar';
import { ParticleOrb } from './ParticleOrb';
import { useChat } from '@/context/ChatContext';
import { QuickChip } from '@/types/chat';

export const ChatView: React.FC = () => {
  const { activeConversation, sendMessage, isStreaming, mode } = useChat();
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

  // Determine current active AI state for visual sync
  const currentChatState = isStreaming
    ? mode.deepSearch
      ? 'searching'
      : mode.think
      ? 'thinking'
      : 'generating'
    : 'idle';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] bg-[#07060a] overflow-hidden relative">
      {/* Subtle ambient cosmic background purple glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full" />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-white/10">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between">
          {messages.length === 0 ? (
            /* Empty State Hero Screen with Mini 3D Wave */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
              {/* Compact 3D Particle Wave Hero in Chat */}
              <div className="relative w-full max-w-[480px] h-[160px] mb-2 flex items-center justify-center">
                <ParticleOrb state="idle" size="compact" />
              </div>

              {/* Title & Tagline */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                What can I help with today?
              </h1>
              <p className="text-sm text-gray-400 max-w-md mb-8">
                Type your thoughts below, choose a shortcut, or tap the purple mic for real-time 3D voice mode.
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full mb-6 text-left">
                <div className="p-3 rounded-2xl bg-[#110e17] border border-purple-500/15 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white">Instant Reasoning</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    High speed streaming responses with think mode.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#110e17] border border-purple-500/15 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-semibold text-white">3D Voice Wave</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Real-time audio reactive particle ribbon with instant interrupt.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#110e17] border border-purple-500/15 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Local Privacy</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Conversations safely saved in your local storage.
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

              {/* Mini Ambient Status Wave while AI is processing in Chat */}
              {isStreaming && (
                <div className="w-full flex items-center justify-center my-2 animate-in fade-in duration-300">
                  <div className="w-full max-w-md h-[65px] rounded-2xl bg-white/[0.02] border border-purple-500/20 backdrop-blur-sm px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                      <span>
                        {mode.deepSearch
                          ? 'Searching live sources...'
                          : mode.think
                          ? 'Synthesizing reasoning...'
                          : 'Generating response...'}
                      </span>
                    </div>
                    <div className="w-[120px] h-[55px]">
                      <ParticleOrb state={currentChatState} size="mini" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area: Quick Chips + Input Bar */}
      <div className="w-full bg-gradient-to-t from-[#07060a] via-[#07060a]/95 to-transparent pt-2">
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
