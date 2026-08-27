'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { QuickChips } from './QuickChips';
import { InputBar } from './InputBar';
import { useChat } from '@/context/ChatContext';
import { QuickChip } from '@/types/chat';

export const ChatView: React.FC = () => {
  const { activeConversation, sendMessage, isStreaming } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [greetingText, setGreetingText] = useState<string>('Welcome, Ayush');

  const messages = activeConversation?.messages || [];
  const isHeroEmpty = messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Compute rotational dynamic time-aware greeting with user name (Claude / Gemini / Editorial style)
  useEffect(() => {
    let name = 'Ayush';
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zoya_ai_user_name');
      if (savedName && savedName.trim()) {
        name = savedName.trim();
      }
    }

    const hour = new Date().getHours();
    let pool: string[] = [];

    if (hour >= 5 && hour < 12) {
      pool = ['Good morning', 'Early start', 'Morning clarity', 'Fresh thoughts'];
    } else if (hour >= 12 && hour < 17) {
      pool = ['Good afternoon', 'Midday focus', 'Afternoon flow', 'Creative momentum'];
    } else if (hour >= 17 && hour < 22) {
      pool = ['Good evening', 'Unwinding tonight', 'Evening inspiration', 'Refining ideas'];
    } else {
      // 10 PM to 5 AM: Late night deep work
      pool = ['Late night focus', 'Quiet hours', 'Midnight thoughts', 'Deep night work'];
    }

    const chosenPrefix = pool[Math.floor(Math.random() * pool.length)];
    setGreetingText(`${chosenPrefix}, ${name}`);
  }, [activeConversation?.id]);

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

      {/* Main Dynamic Viewport Container */}
      <div
        className={`flex-1 flex flex-col w-full h-full transition-all duration-500 ease-out ${
          isHeroEmpty ? 'justify-center items-center pb-8' : 'justify-between'
        }`}
      >
        {/* 1. Scrollable Messages Area (Active Chat Mode) */}
        {!isHeroEmpty ? (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-stone-300 w-full animate-in fade-in duration-300">
            <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end space-y-2 py-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : null}

        {/* 2. Hero Center Greeting (Centered in empty state) */}
        {isHeroEmpty ? (
          <div className="text-center px-4 mb-8 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="font-serif italic font-normal text-4xl sm:text-6xl text-[#1C1917] tracking-tight leading-tight select-none">
              {greetingText}
            </h1>
          </div>
        ) : null}

        {/* 3. Input & Quick Chips Unit (Centered in empty state, anchored at bottom in active chat) */}
        <div
          className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-out ${
            isHeroEmpty
              ? 'px-3 sm:px-4'
              : 'bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/95 to-transparent pt-2'
          }`}
        >
          {/* Quick Action Chips */}
          <div className="px-3 sm:px-4 mb-1">
            <QuickChips onSelectChip={handleSelectChip} disabled={isStreaming} />
          </div>

          {/* Input Bar */}
          <InputBar onSendMessage={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
};
