'use client';

import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Sparkles } from 'lucide-react';
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
  } = useChat();

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#0e0e0e] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Conversations</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Previous Conversations Section Header */}
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-orange-400/80" />
          <span>Previous conversations</span>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-gray-500">
              No previous conversations yet.
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = convo.id === activeId;
              const timeDisplay = formatRelativeTime(convo.updatedAt || convo.createdAt);

              return (
                <div
                  key={convo.id}
                  onClick={() => selectConversation(convo.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-orange-500/15 text-white border border-orange-500/30'
                      : 'text-gray-300 hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">
                        {convo.title || 'Untitled chat'}
                      </span>
                      <span className="text-[10px] text-gray-500">{timeDisplay}</span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/[0.08] rounded-md transition-all shrink-0"
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
        <div className="p-3 border-t border-white/[0.06] bg-[#0c0c0c]">
          <div className="flex items-center justify-between text-[11px] text-gray-500 px-2">
            <span>Zoya AI Core 2.5</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
