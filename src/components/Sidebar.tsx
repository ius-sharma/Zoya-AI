'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Settings, Database, Brain, Pin, Tag, Check } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Conversation } from '@/types/chat';
import { formatRelativeTime } from '@/utils/storage';

const TAG_OPTIONS = [
  { id: 'Study', label: 'Study', icon: '📚', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  { id: 'Coding', label: 'Coding', icon: '💻', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'Work', label: 'Work', icon: '💼', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  { id: 'Ideas', label: 'Ideas', icon: '💡', color: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30' },
  { id: 'Personal', label: 'Personal', icon: '✨', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
];

const TAG_MAP: Record<string, { label: string; icon: string; color: string }> = Object.fromEntries(
  TAG_OPTIONS.map((t) => [t.id, t])
);

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeId,
    selectConversation,
    deleteConversation,
    togglePinConversation,
    setConversationTag,
    createNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSettingsOpen,
    setIsVaultOpen,
    documents,
    memoryProfile,
    setIsMemoryModalOpen,
  } = useChat();

  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [tagMenuOpenConvoId, setTagMenuOpenConvoId] = useState<string | null>(null);

  // Close tag dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setTagMenuOpenConvoId(null);
    };
    if (tagMenuOpenConvoId) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [tagMenuOpenConvoId]);

  // Close sidebar on Escape key press
  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Only display conversations that have actual messages sent (ignoring empty drafts)
  const historyConversations = conversations.filter(
    (c) => c && Array.isArray(c.messages) && c.messages.length > 0
  );

  // Filter conversations based on selected tag or pinned status
  const filteredConversations = historyConversations.filter((c) => {
    if (selectedTagFilter === 'All') return true;
    if (selectedTagFilter === 'Pinned') return !!c.isPinned;
    return c.tag === selectedTagFilter;
  });

  const pinnedConversations =
    selectedTagFilter === 'All'
      ? filteredConversations.filter((c) => !!c.isPinned)
      : [];

  const unpinnedConversations =
    selectedTagFilter === 'All'
      ? filteredConversations.filter((c) => !c.isPinned)
      : filteredConversations;

  const renderConversationItem = (convo: Conversation) => {
    const isActive = convo.id === activeId;
    const isPinned = !!convo.isPinned;
    const timeDisplay = formatRelativeTime(convo.updatedAt || convo.createdAt);
    const tagInfo = convo.tag ? TAG_MAP[convo.tag] : null;
    const isTagMenuOpen = tagMenuOpenConvoId === convo.id;

    return (
      <div
        key={convo.id}
        onClick={() => {
          selectConversation(convo.id);
          setIsSidebarOpen(false);
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
          isActive
            ? 'bg-[#FFFFFF] dark:bg-[#241F1C] text-[#7C3512] dark:text-[#FAF6F0] border border-[#E0D0BE] dark:border-[#38302A] shadow-sm font-semibold'
            : 'text-[#574E45] dark:text-[#A89F91] hover:bg-[#FFFFFF]/70 dark:hover:bg-[#241F1C]/70 hover:text-[#292524] dark:hover:text-[#FAF6F0] border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
          <MessageSquare
            className={`w-4 h-4 shrink-0 ${
              isActive
                ? 'text-[#9C4A1A] dark:text-[#D97706]'
                : 'text-[#8C7A6B] dark:text-[#786A5E] group-hover:text-[#574E45] dark:group-hover:text-[#FAF6F0]'
            }`}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs truncate font-medium flex-1">
                {convo.title || 'Untitled chat'}
              </span>
              {tagInfo && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border shrink-0 ${tagInfo.color}`}
                >
                  {tagInfo.icon} {tagInfo.label}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#8C7A6B] dark:text-[#786A5E] font-normal">
              {timeDisplay}
            </span>
          </div>
        </div>

        {/* Action buttons on right */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pin Button */}
          <button
            type="button"
            onClick={() => togglePinConversation(convo.id)}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isPinned
                ? 'opacity-100 text-[#9C4A1A] dark:text-[#D97706]'
                : 'opacity-0 group-hover:opacity-100 text-[#8C7A6B] dark:text-[#A89F91] hover:text-[#9C4A1A] dark:hover:text-[#D97706] hover:bg-[#EFE6DD] dark:hover:bg-[#2E2722]'
            }`}
            title={isPinned ? 'Unpin chat' : 'Pin to top'}
            aria-label={isPinned ? 'Unpin chat' : 'Pin chat'}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current rotate-45' : ''}`} />
          </button>

          {/* Tag Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTagMenuOpenConvoId(isTagMenuOpen ? null : convo.id);
              }}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                isTagMenuOpen
                  ? 'opacity-100 text-[#9C4A1A] dark:text-[#D97706] bg-[#EFE6DD] dark:bg-[#2E2722]'
                  : 'opacity-0 group-hover:opacity-100 text-[#8C7A6B] dark:text-[#A89F91] hover:text-[#9C4A1A] dark:hover:text-[#D97706] hover:bg-[#EFE6DD] dark:hover:bg-[#2E2722]'
              }`}
              title="Set tag/folder"
              aria-label="Set tag"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>

            {/* Tag selector popup menu */}
            {isTagMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-36 p-1.5 bg-[#FFFFFF] dark:bg-[#1C1917] border border-[#E0D0BE] dark:border-[#2E2722] rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#786A5E] dark:text-[#A89F91]">
                  Assign Tag
                </div>
                {TAG_OPTIONS.map((tag) => {
                  const isSelected = convo.tag === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setConversationTag(convo.id, isSelected ? undefined : tag.id);
                        setTagMenuOpenConvoId(null);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5EBE0] dark:bg-[#26221E] text-[#9C4A1A] dark:text-[#D97706] font-semibold'
                          : 'text-[#292524] dark:text-[#FAF6F0] hover:bg-[#F5EBE0]/60 dark:hover:bg-[#26221E]/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-3 h-3 text-[#9C4A1A] dark:text-[#D97706]" />
                      )}
                    </button>
                  );
                })}
                {convo.tag && (
                  <button
                    type="button"
                    onClick={() => {
                      setConversationTag(convo.id, undefined);
                      setTagMenuOpenConvoId(null);
                    }}
                    className="w-full text-left px-2 py-1.5 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border-t border-[#E8D8C8] dark:border-[#2E2722] mt-1 pt-1 cursor-pointer"
                  >
                    Clear tag
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => deleteConversation(convo.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8C7A6B] dark:text-[#A89F91] hover:text-red-600 dark:hover:text-red-400 hover:bg-[#EFE6DD] dark:hover:bg-[#2E2722] rounded-md transition-all cursor-pointer"
            title="Delete conversation"
            aria-label="Delete conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay for outside click to close */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
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
            onClick={() => {
              createNewChat();
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9C4A1A] via-[#B85D19] to-[#7C3512] hover:from-[#B85D19] hover:to-[#8B3A0F] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#9C4A1A]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Quick Tag & Pinned Filter Bar */}
        {historyConversations.length > 0 && (
          <div className="px-3 pb-2 pt-0.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none">
            {['All', 'Pinned', 'Study', 'Coding', 'Work', 'Ideas', 'Personal'].map((filterName) => {
              const isSelected = selectedTagFilter === filterName;
              const count =
                filterName === 'All'
                  ? historyConversations.length
                  : filterName === 'Pinned'
                  ? historyConversations.filter((c) => c.isPinned).length
                  : historyConversations.filter((c) => c.tag === filterName).length;

              if (filterName !== 'All' && count === 0 && selectedTagFilter !== filterName) {
                return null;
              }

              const icon =
                filterName === 'Pinned'
                  ? '📌'
                  : filterName === 'All'
                  ? ''
                  : TAG_MAP[filterName]?.icon || '';

              return (
                <button
                  key={filterName}
                  type="button"
                  onClick={() => setSelectedTagFilter(filterName)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#9C4A1A] text-white shadow-xs'
                      : 'bg-[#FAF6F0] dark:bg-[#201C19] text-[#786A5E] dark:text-[#A89F91] hover:bg-[#EFE6DD] dark:hover:bg-[#2A241F] border border-[#E0D0BE] dark:border-[#2E2722]'
                  }`}
                >
                  {icon && <span>{icon}</span>}
                  <span>{filterName}</span>
                  {count > 0 && <span className="text-[9px] opacity-75 font-normal">({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Conversations List with Pinned Section & Tag support */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
          {filteredConversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#786A5E] dark:text-[#8C7A6B]">
              {selectedTagFilter === 'All'
                ? 'No previous conversations yet.'
                : `No chats found under "${selectedTagFilter}".`}
            </div>
          ) : (
            <>
              {/* Pinned Section (Visible when filter is All and pinned chats exist) */}
              {selectedTagFilter === 'All' && pinnedConversations.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9C4A1A] dark:text-[#D97706] flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-current rotate-45" />
                    <span>Pinned ({pinnedConversations.length})</span>
                  </div>
                  {pinnedConversations.map((convo) => renderConversationItem(convo))}
                </div>
              )}

              {/* Recent / Filtered Section */}
              <div className="space-y-1">
                {selectedTagFilter === 'All' && pinnedConversations.length > 0 && (
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#786A5E] dark:text-[#A89F91] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Recent ({unpinnedConversations.length})</span>
                  </div>
                )}
                {unpinnedConversations.map((convo) => renderConversationItem(convo))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E0D0BE] dark:border-[#2E2722] bg-[#FAF6F0] dark:bg-[#141210] space-y-1.5">
          {/* Mini Memory Button */}
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              setIsMemoryModalOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#574E45] dark:text-[#C5B8AB] hover:text-[#1C1917] dark:hover:text-[#FAF6F0] hover:bg-[#EFE6DD] dark:hover:bg-[#26221E] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#9C4A1A] dark:text-[#D97706]" />
              <span>Mini Memory</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#9C4A1A]/10 dark:bg-[#D97706]/15 text-[#9C4A1A] dark:text-[#D97706] font-bold">
              {memoryProfile.memories.length}
            </span>
          </button>

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

          <div className="flex items-center justify-between text-[11px] text-[#786A5E] dark:text-[#8C7A6B] px-2 font-medium pt-1">
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
