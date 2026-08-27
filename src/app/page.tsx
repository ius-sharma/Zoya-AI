'use client';

import React from 'react';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { VoiceModeScreen } from '@/components/VoiceModeScreen';

function MainApp() {
  const { voiceState } = useChat();

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Screen 1: Main Chat View */}
      <TopBar />
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <ChatView />
      </main>

      {/* Screen 2: Voice Mode (The Hero Screen Takeover) */}
      {voiceState.isOpen && <VoiceModeScreen />}
    </div>
  );
}

export default function Home() {
  return (
    <ChatProvider>
      <MainApp />
    </ChatProvider>
  );
}
