export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  isStreaming?: boolean;
  thought?: string;
  sources?: { title: string; url?: string }[];
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
