'use client';

import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Settings, Database } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { formatRelativeTime } from '@/utils/storage';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeId,
    selectConversation,
    deleteConversation,
    createNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSettingsOpen,
    setIsVaultOpen,
    documents,
  } = useChat();

  // Only display conversations that have actual messages sent (ignoring empty drafts)
  const historyConversations = conversations.filter(
    (c) => c && Array.isArray(c.messages) && c.messages.length > 0
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#F5EBE0] dark:bg-[#181513] border-r border-[#E0D0BE] dark:border-[#2E2722] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl shadow-stone-300/30 dark:shadow-black/60 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E0D0BE] dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#141210]">
          <span className="font-bold text-base text-[#292524] dark:text-[#FAF6F0] tracking-tight">Zoya Chats</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-[#786A5E] dark:text-[#A89F91] hover:text-[#292524] dark:hover:text-[#FAF6F0] hover:bg-[#EFE6DD] dark:hover:bg-[#26221E] rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9C4A1A] via-[#B85D19] to-[#7C3512] hover:from-[#B85D19] hover:to-[#8B3A0F] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#9C4A1A]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Previous Conversations Section Header */}
        <div className="px-4 py-2 text-xs font-bold text-[#786A5E] dark:text-[#A89F91] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
          <span>Previous conversations</span>
        </div>

        {/* Conversations List (Only shows chats where messages exist) */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
          {historyConversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#786A5E] dark:text-[#8C7A6B]">
              No previous conversations yet.
            </div>
          ) : (
            historyConversations.map((convo) => {
              const isActive = convo.id === activeId;
              const timeDisplay = formatRelativeTime(convo.updatedAt || convo.createdAt);

              return (
                <div
                  key={convo.id}
                  onClick={() => selectConversation(convo.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#FFFFFF] dark:bg-[#241F1C] text-[#7C3512] dark:text-[#FAF6F0] border border-[#E0D0BE] dark:border-[#38302A] shadow-sm font-semibold'
                      : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FFFFFF]/70 dark:hover:bg-[#241F1C]/70 hover:text-[#292524] dark:hover:text-[#FAF6F0] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#9C4A1A] dark:text-[#D97706]' : 'text-[#8C7A6B] dark:text-[#786A5E] group-hover:text-[#574E45] dark:group-hover:text-[#FAF6F0]'
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate font-medium">
                        {convo.title || 'Untitled chat'}
                      </span>
                      <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">{timeDisplay}</span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8C7A6B] dark:text-[#A89F91] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#EFE6DD] dark:hover:bg-[#2E2722] rounded-md transition-all shrink-0"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E0D0BE] dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#141210] space-y-2">
          {/* Knowledge Vault Button */}
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              setIsVaultOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#EFE6DD] dark:hover:bg-[#26221E] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Knowledge Vault</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 text-[#9C4A1A] dark:text-[#D97706] font-bold">
              {documents.length} Docs
            </span>
          </button>

          <button
            onClick={() => {
              setIsSidebarOpen(false);
              setIsSettingsOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#EFE6DD] dark:hover:bg-[#26221E] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#8C7A6B] dark:text-[#A89F91]" />
              <span>Settings & Appearance</span>
            </div>
            <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">Theme</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-[#786A5E] dark:text-[#8C7A6B] px-2 font-medium">
            <span>Zoya AI Core 2.5</span>
            <span className="flex items-center gap-1 text-[#9C4A1A] dark:text-[#D97706]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C4A1A] dark:bg-[#D97706] animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
