'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Conversation,
  Message,
  ChatMode,
  VoiceState,
  VoiceStatus,
  ProviderConfig,
  DocumentItem,
  RagCitation,
} from '@/types/chat';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveId,
  saveStoredActiveId,
  generateConversationTitle,
  createNewConversation,
} from '@/utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

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
  providerConfig: ProviderConfig;
  updateProviderConfig: (config: ProviderConfig) => void;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  // Knowledge Vault & Local RAG
  isVaultOpen: boolean;
  setIsVaultOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ragEnabled: boolean;
  setRagEnabled: (enabled: boolean) => void;
  toggleRag: () => void;
  documents: DocumentItem[];
  isUploadingDocs: boolean;
  uploadDocuments: (files: File[]) => Promise<boolean>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  purgeAllDocuments: () => Promise<boolean>;
  fetchDocuments: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [ragEnabled, setRagEnabledState] = useState<boolean>(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>('Ayush');
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'default',
    model: 'llama-3.3-70b-versatile',
  });
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

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

  const applyTheme = useCallback((selectedTheme: ThemeMode) => {
    if (typeof window === 'undefined') return;
    let isDark = false;
    if (selectedTheme === 'dark') {
      isDark = true;
    } else if (selectedTheme === 'light') {
      isDark = false;
    } else if (selectedTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setResolvedTheme('light');
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zoya_ai_theme', newTheme);
      }
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  const setRagEnabled = useCallback((enabled: boolean) => {
    setRagEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoya_ai_rag_enabled', String(enabled));
    }
  }, []);

  const toggleRag = useCallback(() => {
    setRagEnabledState((prev) => {
      const nextVal = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zoya_ai_rag_enabled', String(nextVal));
      }
      return nextVal;
    });
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/docs/list');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.documents)) {
          setDocuments(data.documents);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch documents:', err);
    }
  }, []);

  const uploadDocuments = useCallback(
    async (files: File[]): Promise<boolean> => {
      if (!files || files.length === 0) return false;
      setIsUploadingDocs(true);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const res = await fetch('/api/docs/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          await fetchDocuments();
          setIsUploadingDocs(false);
          return true;
        }
      } catch (err) {
        console.error('Document upload error:', err);
      }
      setIsUploadingDocs(false);
      return false;
    },
    [fetchDocuments]
  );

  const deleteDocument = useCallback(
    async (documentId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/docs/list?id=${encodeURIComponent(documentId)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setDocuments((prev) => prev.filter((d) => d.id !== documentId));
          return true;
        }
      } catch (err) {
        console.error('Delete document error:', err);
      }
      return false;
    },
    []
  );

  const purgeAllDocuments = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/docs/list?purge=true', {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocuments([]);
        return true;
      }
    } catch (err) {
      console.error('Purge documents error:', err);
    }
    return false;
  }, []);

  // Load from localStorage & fetch documents on mount
  useEffect(() => {
    const savedConvos = getStoredConversations();
    const savedActiveId = getStoredActiveId();

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('zoya_ai_user_name');
      if (savedName && savedName.trim()) {
        setUserName(savedName.trim());
      }

      const savedProvider = localStorage.getItem('zoya_ai_provider_config');
      if (savedProvider) {
        try {
          const parsed = JSON.parse(savedProvider);
          if (parsed && parsed.provider) {
            setProviderConfig(parsed);
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      const savedTheme = localStorage.getItem('zoya_ai_theme') as ThemeMode | null;
      const initialTheme: ThemeMode = savedTheme || 'light';
      setThemeState(initialTheme);
      applyTheme(initialTheme);

      const savedRag = localStorage.getItem('zoya_ai_rag_enabled');
      if (savedRag !== null) {
        setRagEnabledState(savedRag === 'true');
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = () => {
        const currentSaved = localStorage.getItem('zoya_ai_theme') as ThemeMode | null;
        if (currentSaved === 'system') {
          applyTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleSystemChange);
    }

    if (savedConvos.length > 0) {
      if (savedActiveId && savedConvos.some((c) => c.id === savedActiveId)) {
        setConversations(savedConvos);
        setActiveId(savedActiveId);
      } else {
        const initialDraft = createNewConversation();
        setConversations([initialDraft, ...savedConvos]);
        setActiveId(initialDraft.id);
      }
    } else {
      const initialDraft = createNewConversation();
      setConversations([initialDraft]);
      setActiveId(initialDraft.id);
    }

    fetchDocuments();
    setIsLoaded(true);
  }, [applyTheme, fetchDocuments]);

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

  const updateProviderConfig = useCallback((config: ProviderConfig) => {
    setProviderConfig(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoya_ai_provider_config', JSON.stringify(config));
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
    const currentActive = conversations.find((c) => c.id === activeId);
    if (currentActive && (!currentActive.messages || currentActive.messages.length === 0)) {
      setIsSidebarOpen(false);
      return;
    }

    const nonEmptyOnly = conversations.filter((c) => c && c.messages && c.messages.length > 0);
    const newConvo = createNewConversation();
    setConversations([newConvo, ...nonEmptyOnly]);
    setActiveId(newConvo.id);
    setIsSidebarOpen(false);
  }, [activeId, conversations]);

  const selectConversation = useCallback((id: string) => {
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
            providerConfig,
            quickAction,
            ragEnabled,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error('Chat API response failed');
        }

        // Check for attached RAG citations header
        let incomingCitations: RagCitation[] | undefined;
        const citationsHeader = response.headers.get('X-Rag-Citations');
        if (citationsHeader) {
          try {
            incomingCitations = JSON.parse(decodeURIComponent(citationsHeader));
          } catch (e) {
            console.warn('Failed to parse citations header:', e);
          }
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
                          citations: incomingCitations || m.citations,
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
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        isStreaming: false,
                        citations: incomingCitations || m.citations,
                      }
                    : m
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
    [activeId, conversations, userName, providerConfig, ragEnabled]
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
        providerConfig,
        updateProviderConfig,
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isVaultOpen,
        setIsVaultOpen,
        ragEnabled,
        setRagEnabled,
        toggleRag,
        documents,
        isUploadingDocs,
        uploadDocuments,
        deleteDocument,
        purgeAllDocuments,
        fetchDocuments,
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
