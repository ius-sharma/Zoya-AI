export interface RagCitation {
  id: string;
  documentId: string;
  fileName: string;
  fileType: string;
  pageNumber?: number;
  chunkIndex: number;
  snippet: string;
  similarity: number;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  chunkCount: number;
  uploadedAt: number;
  status: 'indexing' | 'ready' | 'error';
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  fileName: string;
  fileType: string;
  pageNumber?: number;
  chunkIndex: number;
  text: string;
  vector?: number[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  thought?: string;
  sources?: { title: string; url?: string }[];
  citations?: RagCitation[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ChatMode {
  deepSearch: boolean;
  think: boolean;
}

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'paused';

export interface VoiceState {
  isOpen: boolean;
  status: VoiceStatus;
  userTranscript: string;
  interimTranscript: string;
  aiResponse: string;
  isMuted: boolean;
}

export interface QuickChip {
  id: string;
  label: string;
  iconName?: string;
  prompt: string;
}

export type LLMProvider = 'default' | 'openai' | 'anthropic' | 'gemini' | 'groq';

export interface ProviderConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  customBaseUrl?: string;
}

export type MemoryCategory = 'identity' | 'preference' | 'goal' | 'fact' | 'general';

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: MemoryCategory;
  updatedAt: number;
}

export interface MemoryProfile {
  userName: string;
  memories: MemoryItem[];
  lastVisited: number;
  visitCount: number;
}


