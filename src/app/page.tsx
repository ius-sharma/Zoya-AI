'use client';

import React from 'react';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { VoiceModeScreen } from '@/components/VoiceModeScreen';
import { SettingsModal } from '@/components/SettingsModal';
import { KnowledgeVaultModal } from '@/components/KnowledgeVaultModal';

function MainApp() {
  const { voiceState } = useChat();

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#FAF6F0] dark:bg-[#12100E] text-[#292524] dark:text-[#FAF6F0] flex flex-col overflow-hidden fixed inset-0 transition-colors duration-200">
      {/* Top Bar (Permanently pinned at top, never scrolls) */}
      <TopBar />
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <ChatView />
      </main>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Knowledge Vault Modal */}
      <KnowledgeVaultModal />

      {/* Voice Mode Takeover */}
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
