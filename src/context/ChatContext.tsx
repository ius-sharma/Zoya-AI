'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Conversation, Message, ChatMode, VoiceState, VoiceStatus } from '@/types/chat';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveId,
  saveStoredActiveId,
  generateConversationTitle,
  createNewConversation,
} from '@/utils/storage';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeId: string | null;
  mode: ChatMode;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  toggleDeepSearch: () => void;
  toggleThink: () => void;
  voiceState: VoiceState;
  setVoiceState: React.Dispatch<React.SetStateAction<VoiceState>>;
  openVoiceMode: () => void;
  closeVoiceMode: () => void;
  setVoiceStatus: (status: VoiceStatus) => void;
  isStreaming: boolean;
  sendMessage: (content: string, quickAction?: string) => Promise<string | null>;
  createNewChat: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  userName: string;
  updateUserName: (name: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Ayush');

  const [mode, setMode] = useState<ChatMode>({
    deepSearch: false,
    think: false,
  });

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isOpen: false,
    status: 'idle',
    userTranscript: '',
    interimTranscript: '',
    aiResponse: '',
    isMuted: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedConvos = getStoredConversations();
    const savedActiveId = getStoredActiveId();

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zoya_ai_user_name');
      if (savedName && savedName.trim()) {
        setUserName(savedName.trim());
      }
    }

    if (savedConvos.length > 0) {
      if (savedActiveId && savedConvos.some((c) => c.id === savedActiveId)) {
        setConversations(savedConvos);
        setActiveId(savedActiveId);
      } else {
        // Create an active draft session while keeping saved history intact
        const initialDraft = createNewConversation();
        setConversations([initialDraft, ...savedConvos]);
        setActiveId(initialDraft.id);
      }
    } else {
      const initialDraft = createNewConversation();
      setConversations([initialDraft]);
      setActiveId(initialDraft.id);
    }
    setIsLoaded(true);
  }, []);

  // Save only non-empty conversations to localStorage on updates
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredConversations(conversations);
    saveStoredActiveId(activeId);
  }, [conversations, activeId, isLoaded]);

  const updateUserName = useCallback((name: string) => {
    const trimmed = name.trim() || 'Ayush';
    setUserName(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoya_ai_user_name', trimmed);
    }
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const toggleDeepSearch = useCallback(() => {
    setMode((prev) => ({ ...prev, deepSearch: !prev.deepSearch }));
  }, []);

  const toggleThink = useCallback(() => {
    setMode((prev) => ({ ...prev, think: !prev.think }));
  }, []);

  const openVoiceMode = useCallback(() => {
    setVoiceState((prev) => ({
      ...prev,
      isOpen: true,
      status: 'listening',
      userTranscript: '',
      interimTranscript: '',
      aiResponse: '',
    }));
  }, []);

  const closeVoiceMode = useCallback(() => {
    setVoiceState((prev) => ({
      ...prev,
      isOpen: false,
      status: 'idle',
      userTranscript: '',
      interimTranscript: '',
      aiResponse: '',
    }));
  }, []);

  const setVoiceStatus = useCallback((status: VoiceStatus) => {
    setVoiceState((prev) => ({ ...prev, status }));
  }, []);

  const createNewChat = useCallback(() => {
    // Check if the current conversation is already an empty draft
    const currentActive = conversations.find((c) => c.id === activeId);
    if (currentActive && (!currentActive.messages || currentActive.messages.length === 0)) {
      // Already on an empty draft, just close the sidebar
      setIsSidebarOpen(false);
      return;
    }

    // Keep only conversations with messages + create one new fresh draft
    const nonEmptyOnly = conversations.filter((c) => c && c.messages && c.messages.length > 0);
    const newConvo = createNewConversation();
    setConversations([newConvo, ...nonEmptyOnly]);
    setActiveId(newConvo.id);
    setIsSidebarOpen(false);
  }, [activeId, conversations]);

  const selectConversation = useCallback((id: string) => {
    // When user selects a past conversation, prune any unsent empty drafts
    setConversations((prev) => {
      return prev.filter((c) => c.id === id || (c.messages && c.messages.length > 0));
    });
    setActiveId(id);
    setIsSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      const remainingWithMessages = remaining.filter((c) => c.messages && c.messages.length > 0);
      if (remainingWithMessages.length === 0) {
        const fresh = createNewConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      return remaining;
    });

    setActiveId((prevId) => {
      if (prevId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id || null;
      }
      return prevId;
    });
  }, [conversations]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (content: string, quickAction?: string): Promise<string | null> => {
      if (!content.trim()) return null;

      const userMsgText = content.trim();
      const userMessage: Message = {
        id: 'msg_u_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        role: 'user',
        content: userMsgText,
        createdAt: Date.now(),
      };

      const assistantMsgId = 'msg_a_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        isStreaming: true,
      };

      let currentConvoId = activeId;
      let targetConvo = conversations.find((c) => c.id === currentConvoId);

      if (!targetConvo) {
        targetConvo = createNewConversation();
        currentConvoId = targetConvo.id;
        setConversations((prev) => [targetConvo!, ...prev]);
        setActiveId(currentConvoId);
      }

      // Compute new title if this is the first message
      const shouldUpdateTitle = targetConvo.messages.length === 0;
      const newTitle = shouldUpdateTitle ? generateConversationTitle(userMsgText) : targetConvo.title;

      // Update state with user message & empty assistant placeholder
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConvoId) {
            return {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: [...c.messages, userMessage, assistantMessage],
            };
          }
          return c;
        })
      );

      setIsStreaming(true);

      // Collect payload (strictly non-empty messages for LLM compatibility)
      const historyToSend = [...targetConvo.messages, userMessage]
        .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyToSend,
            userName,
            quickAction,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Chat API response failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          const currentContent = accumulatedText;

          // Update active conversation assistant message in-place
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === currentConvoId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: currentContent,
                          isStreaming: true,
                        }
                      : m
                  ),
                };
              }
              return c;
            })
          );
        }

        // Finalize streaming
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                ),
              };
            }
            return c;
          })
        );

        setIsStreaming(false);
        return accumulatedText;
      } catch (err) {
        console.error('Error sending message:', err);
        const fallbackText = "Arre dost, connection me thodi issue aayi. Ek baar refresh karke dubara bhejo!";
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: fallbackText,
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
        setIsStreaming(false);
        return fallbackText;
      }
    },
    [activeId, conversations, userName]
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeId,
        mode,
        setMode,
        toggleDeepSearch,
        toggleThink,
        voiceState,
        setVoiceState,
        openVoiceMode,
        closeVoiceMode,
        setVoiceStatus,
        isStreaming,
        sendMessage,
        createNewChat,
        selectConversation,
        deleteConversation,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        userName,
        updateUserName,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
