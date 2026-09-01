'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Conversation,
  Message,
  ChatMode,
  VoiceState,
  VoiceStatus,
  ProviderConfig,
  DocumentItem,
  RagCitation,
  MemoryItem,
  MemoryProfile,
  MemoryCategory,
} from '@/types/chat';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveId,
  saveStoredActiveId,
  generateConversationTitle,
  createNewConversation,
} from '@/utils/storage';
import {
  getStoredMemoryProfile,
  saveStoredMemoryProfile,
  recordVisit,
  addOrUpdateMemoryItem,
  deleteMemoryItem,
  clearMemoryProfile,
  exportMemoriesToJson,
  importMemoriesFromJson,
  extractMemoryTags,
  detectUserExplicitFacts,
  DEFAULT_MEMORY_PROFILE,
} from '@/utils/memory';

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
  // Mini Memory (Yaaddasht)
  memoryProfile: MemoryProfile;
  isMemoryModalOpen: boolean;
  setIsMemoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addMemory: (key: string, value: string, category?: MemoryCategory) => void;
  removeMemory: (id: string) => void;
  clearAllMemories: () => void;
  importMemories: (jsonString: string) => boolean;
  exportMemories: () => string;
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
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile>(DEFAULT_MEMORY_PROFILE);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);
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

  // Mini Memory Actions
  const addMemory = useCallback((key: string, value: string, category: MemoryCategory = 'fact') => {
    setMemoryProfile((prev) => {
      const { profile } = addOrUpdateMemoryItem(prev, key, value, category);
      return profile;
    });
  }, []);

  const removeMemory = useCallback((id: string) => {
    setMemoryProfile((prev) => deleteMemoryItem(prev, id));
  }, []);

  const clearAllMemories = useCallback(() => {
    setMemoryProfile((prev) => clearMemoryProfile(prev));
  }, []);

  const importMemories = useCallback((jsonString: string): boolean => {
    try {
      setMemoryProfile((prev) => {
        const updated = importMemoriesFromJson(prev, jsonString);
        if (updated.userName) {
          setUserName(updated.userName);
        }
        return updated;
      });
      return true;
    } catch (e) {
      console.error('Failed to import memory JSON:', e);
      return false;
    }
  }, []);

  const exportMemories = useCallback((): string => {
    return exportMemoriesToJson(memoryProfile);
  }, [memoryProfile]);

  // Load from localStorage & fetch documents on mount
  useEffect(() => {
    const savedConvos = getStoredConversations();
    const savedActiveId = getStoredActiveId();

    if (typeof window !== 'undefined') {
      const loadedProfile = getStoredMemoryProfile();
      const updatedProfile = recordVisit(loadedProfile);
      setMemoryProfile(updatedProfile);

      const savedName = updatedProfile.userName || localStorage.getItem('zoya_ai_user_name');
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
    setMemoryProfile((prev) => {
      const updated: MemoryProfile = { ...prev, userName: trimmed };
      saveStoredMemoryProfile(updated);
      return updated;
    });
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

      // Client-side heuristics: detect if user explicitly stated their name or preferences
      const detectedFacts = detectUserExplicitFacts(userMsgText);
      if (detectedFacts.length > 0) {
        let currentProfile = memoryProfile;
        for (const fact of detectedFacts) {
          const { profile } = addOrUpdateMemoryItem(currentProfile, fact.key, fact.value, fact.category);
          currentProfile = profile;
          if (fact.isNameUpdate && fact.value) {
            setUserName(fact.value);
          }
        }
        setMemoryProfile(currentProfile);
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyToSend,
            userName,
            memoryProfile,
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

        // Helper: parse <think>...</think> and strip <memory_save .../> tags from accumulated raw text
        const parseThinkAndMemoryBlock = (raw: string): { thought: string; content: string } => {
          // 1. First extract and remove any memory_save tags from raw stream
          const { cleanContent: cleanRaw } = extractMemoryTags(raw);

          // 2. Check for <think>...</think> block
          const thinkOpenTag = '<think>';
          const thinkCloseTag = '</think>';
          const openIdx = cleanRaw.indexOf(thinkOpenTag);
          if (openIdx === -1) {
            return { thought: '', content: cleanRaw };
          }
          const closeIdx = cleanRaw.indexOf(thinkCloseTag);
          if (closeIdx === -1) {
            // Still streaming inside <think> block - hide everything after <think>
            const beforeThink = cleanRaw.substring(0, openIdx).trim();
            const insideThink = cleanRaw.substring(openIdx + thinkOpenTag.length).trim();
            return { thought: insideThink, content: beforeThink };
          }
          // Both tags found - extract thought and clean content
          const thoughtText = cleanRaw.substring(openIdx + thinkOpenTag.length, closeIdx).trim();
          const afterThink = cleanRaw.substring(closeIdx + thinkCloseTag.length).trim();
          const beforeThink = cleanRaw.substring(0, openIdx).trim();
          const cleanContent = (beforeThink + (beforeThink && afterThink ? '\n' : '') + afterThink).trim();
          return { thought: thoughtText, content: cleanContent };
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          const parsed = parseThinkAndMemoryBlock(accumulatedText);

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
                          content: parsed.content,
                          thought: parsed.thought || m.thought,
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

        // Finalize streaming: extract any emitted memories from final accumulated text
        const { extracted: newMemories } = extractMemoryTags(accumulatedText);
        if (newMemories.length > 0) {
          setMemoryProfile((prev) => {
            let updated = prev;
            for (const mem of newMemories) {
              const res = addOrUpdateMemoryItem(updated, mem.key, mem.value, mem.category || 'fact');
              updated = res.profile;
              if (mem.key.toLowerCase().includes('name') && mem.value) {
                setUserName(mem.value);
              }
            }
            return updated;
          });
        }

        const finalParsed = parseThinkAndMemoryBlock(accumulatedText);

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvoId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: finalParsed.content,
                        thought: finalParsed.thought || m.thought,
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
        return finalParsed.content;
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
    [activeId, conversations, userName, memoryProfile, providerConfig, ragEnabled]
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
        memoryProfile,
        isMemoryModalOpen,
        setIsMemoryModalOpen,
        addMemory,
        removeMemory,
        clearAllMemories,
        importMemories,
        exportMemories,
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
