'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';
import { useChat } from '@/context/ChatContext';

export const ChatView: React.FC = () => {
  const { activeConversation, sendMessage, isStreaming, userName, memoryProfile } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [greetingText, setGreetingText] = useState<string>('Welcome, Ayush');

  const messages = activeConversation?.messages || [];
  const isHeroEmpty = messages.length === 0;

  // Auto-scroll smoothly to bottom on new messages or streaming chunks
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    if (!isHeroEmpty) {
      scrollToBottom('smooth');
    }
  }, [messages.length, messages[messages.length - 1]?.content, isStreaming, isHeroEmpty]);

  // Compute rotational dynamic time-aware & memory-aware greeting with user name
  useEffect(() => {
    const name = userName || memoryProfile?.userName || 'Ayush';
    const hour = new Date().getHours();
    const isReturning = (memoryProfile?.visitCount || 1) > 1;
    let pool: string[] = [];

    if (isReturning && Math.random() > 0.4) {
      pool = [
        `Arre ${name}, wapas aa gaye!`,
        `Welcome back, ${name}`,
        `Good to see you again, ${name}`,
        `Ready for more, ${name}?`,
      ];
    } else if (hour >= 5 && hour < 12) {
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
    const finalGreeting = chosenPrefix.includes(name) ? chosenPrefix : `${chosenPrefix}, ${name}`;
    setGreetingText(finalGreeting);
  }, [activeConversation?.id, userName, memoryProfile]);


  const handleSend = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#FAF6F0] dark:bg-[#12100E] transition-colors duration-200">
      {/* Subtle warm rust ambient background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#9C4A1A]/5 dark:bg-[#B85D19]/10 blur-[140px] rounded-full" />

      {/* Main Dynamic Viewport Container */}
      <div
        className={`flex-1 flex flex-col w-full h-full min-h-0 overflow-hidden transition-all duration-500 ease-out ${
          isHeroEmpty ? 'justify-center items-center pb-8' : 'justify-between'
        }`}
      >
        {/* 1. Scrollable Messages Area (Active Chat Mode) - THIS IS THE ONLY SCROLLING ELEMENT */}
        {!isHeroEmpty ? (
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700 w-full animate-in fade-in duration-300"
          >
            <div className="max-w-3xl mx-auto space-y-3 pb-4 pt-2">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>
        ) : null}

        {/* 2. Hero Center Greeting (Centered in empty state) */}
        {isHeroEmpty ? (
          <div className="text-center px-4 mb-8 animate-in fade-in zoom-in-95 duration-500">
            <h1 className="font-serif italic font-normal text-4xl sm:text-6xl text-[#1C1917] dark:text-[#FAF6F0] tracking-tight leading-tight select-none">
              {greetingText}
            </h1>
          </div>
        ) : null}

        {/* 3. Input Unit (Centered in empty state, permanently docked at bottom in active chat) */}
        <div
          className={`shrink-0 w-full z-20 transition-all duration-500 ease-out ${
            isHeroEmpty
              ? 'max-w-3xl mx-auto px-3 sm:px-4'
              : 'bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/95 dark:from-[#12100E] dark:via-[#12100E]/95 to-transparent pt-2 pb-1'
          }`}
        >
          <InputBar onSendMessage={handleSend} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
};
