import { Conversation, Message } from '@/types/chat';

const STORAGE_KEY = 'zoya_ai_conversations_v1';
const ACTIVE_CONVO_KEY = 'zoya_ai_active_id';

export function getStoredConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

export function getStoredActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CONVO_KEY);
}

export function saveStoredActiveId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_CONVO_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CONVO_KEY);
  }
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function generateConversationTitle(firstMessage: string): string {
  const clean = firstMessage.trim().replace(/^["']|["']$/g, '');
  if (!clean) return 'New conversation';

  // If starts with common prefixes, clean them
  const stripped = clean.replace(/^(can you|please|what is|how to|tell me about|explain)\s+/i, '');
  const capitalized = stripped.charAt(0).toUpperCase() + stripped.slice(1);

  if (capitalized.length <= 32) return capitalized;
  return capitalized.slice(0, 29).trim() + '...';
}

export function createNewConversation(): Conversation {
  return {
    id: 'convo_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    title: 'New conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}
