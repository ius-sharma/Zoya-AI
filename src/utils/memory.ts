import { MemoryItem, MemoryProfile, MemoryCategory } from '@/types/chat';

const MEMORY_STORAGE_KEY = 'zoya_ai_memory_v1';

export const DEFAULT_MEMORY_PROFILE: MemoryProfile = {
  userName: 'Ayush',
  memories: [
    {
      id: 'mem_default_1',
      key: 'Preferred Language',
      value: 'Hinglish (Hindi and English mix)',
      category: 'preference',
      updatedAt: Date.now(),
    },
    {
      id: 'mem_default_2',
      key: 'Conversational Tone',
      value: 'Witty, warm, and helpful best friend',
      category: 'preference',
      updatedAt: Date.now(),
    },
  ],
  lastVisited: Date.now(),
  visitCount: 1,
};

export function getStoredMemoryProfile(): MemoryProfile {
  if (typeof window === 'undefined') return DEFAULT_MEMORY_PROFILE;
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      // Check if existing user name is stored in legacy key
      const legacyName = localStorage.getItem('zoya_ai_user_name');
      const initialProfile: MemoryProfile = {
        ...DEFAULT_MEMORY_PROFILE,
        userName: legacyName && legacyName.trim() ? legacyName.trim() : 'Ayush',
        lastVisited: Date.now(),
        visitCount: 1,
      };
      saveStoredMemoryProfile(initialProfile);
      return initialProfile;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.memories)) {
      return DEFAULT_MEMORY_PROFILE;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load memory profile from localStorage:', err);
    return DEFAULT_MEMORY_PROFILE;
  }
}

export function saveStoredMemoryProfile(profile: MemoryProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(profile));
    if (profile.userName && profile.userName.trim()) {
      localStorage.setItem('zoya_ai_user_name', profile.userName.trim());
    }
  } catch (err) {
    console.error('Failed to save memory profile to localStorage:', err);
  }
}

export function recordVisit(profile: MemoryProfile): MemoryProfile {
  const updated: MemoryProfile = {
    ...profile,
    visitCount: (profile.visitCount || 1) + 1,
    lastVisited: Date.now(),
  };
  saveStoredMemoryProfile(updated);
  return updated;
}

export function addOrUpdateMemoryItem(
  profile: MemoryProfile,
  key: string,
  value: string,
  category: MemoryCategory = 'fact'
): { profile: MemoryProfile; item: MemoryItem } {
  const cleanKey = key.trim();
  const cleanVal = value.trim();
  if (!cleanKey || !cleanVal) {
    throw new Error('Key and value cannot be empty');
  }

  const existingIndex = profile.memories.findIndex(
    (m) => m.key.toLowerCase() === cleanKey.toLowerCase()
  );

  let newItem: MemoryItem;
  let updatedMemories = [...profile.memories];

  if (existingIndex >= 0) {
    newItem = {
      ...updatedMemories[existingIndex],
      key: cleanKey,
      value: cleanVal,
      category,
      updatedAt: Date.now(),
    };
    updatedMemories[existingIndex] = newItem;
  } else {
    newItem = {
      id: 'mem_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      key: cleanKey,
      value: cleanVal,
      category,
      updatedAt: Date.now(),
    };
    updatedMemories.push(newItem);
  }

  const updatedProfile: MemoryProfile = {
    ...profile,
    memories: updatedMemories,
  };

  saveStoredMemoryProfile(updatedProfile);
  return { profile: updatedProfile, item: newItem };
}

export function deleteMemoryItem(profile: MemoryProfile, id: string): MemoryProfile {
  const updatedMemories = profile.memories.filter((m) => m.id !== id);
  const updatedProfile: MemoryProfile = {
    ...profile,
    memories: updatedMemories,
  };
  saveStoredMemoryProfile(updatedProfile);
  return updatedProfile;
}

export function clearMemoryProfile(profile: MemoryProfile): MemoryProfile {
  const resetProfile: MemoryProfile = {
    ...profile,
    memories: [],
  };
  saveStoredMemoryProfile(resetProfile);
  return resetProfile;
}

export function exportMemoriesToJson(profile: MemoryProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function importMemoriesFromJson(
  currentProfile: MemoryProfile,
  jsonString: string
): MemoryProfile {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.memories)) {
    throw new Error('Invalid memory JSON structure');
  }

  // Deduplicate against existing memories by key
  const keyMap = new Map<string, MemoryItem>();
  currentProfile.memories.forEach((m) => keyMap.set(m.key.toLowerCase(), m));

  parsed.memories.forEach((item: any) => {
    if (item && item.key && item.value) {
      const validCategory: MemoryCategory =
        item.category === 'identity' ||
        item.category === 'preference' ||
        item.category === 'goal' ||
        item.category === 'fact'
          ? item.category
          : 'general';

      const mem: MemoryItem = {
        id: item.id || 'mem_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        key: String(item.key).trim(),
        value: String(item.value).trim(),
        category: validCategory,
        updatedAt: Number(item.updatedAt) || Date.now(),
      };
      keyMap.set(mem.key.toLowerCase(), mem);
    }
  });

  const mergedProfile: MemoryProfile = {
    ...currentProfile,
    userName: (parsed.userName && String(parsed.userName).trim()) || currentProfile.userName,
    memories: Array.from(keyMap.values()),
  };

  saveStoredMemoryProfile(mergedProfile);
  return mergedProfile;
}

/**
 * Parses <memory_save key="..." value="..." category="..."/> tags emitted by LLM
 */
export function extractMemoryTags(content: string): {
  cleanContent: string;
  extracted: Array<{ key: string; value: string; category?: MemoryCategory }>;
} {
  const extracted: Array<{ key: string; value: string; category?: MemoryCategory }> = [];
  const tagRegex = /<memory_save\s+key=(["'])(.*?)\1\s+value=(["'])(.*?)\3(?:\s+category=(["'])(.*?)\5)?\s*\/?>/gi;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(content)) !== null) {
    const key = match[2]?.trim();
    const value = match[4]?.trim();
    const categoryRaw = match[6]?.trim().toLowerCase();
    const category: MemoryCategory | undefined =
      categoryRaw === 'identity' ||
      categoryRaw === 'preference' ||
      categoryRaw === 'goal' ||
      categoryRaw === 'fact'
        ? (categoryRaw as MemoryCategory)
        : undefined;

    if (key && value) {
      extracted.push({ key, value, category });
    }
  }

  const cleanContent = content.replace(tagRegex, '').trim();
  return { cleanContent, extracted };
}

/**
 * Client-side heuristic parser to detect explicit user statements like:
 * "Mera naam Rahul hai", "Call me Rocky", "My favorite color is Blue"
 */
export function detectUserExplicitFacts(userText: string): Array<{
  key: string;
  value: string;
  category: MemoryCategory;
  isNameUpdate?: boolean;
}> {
  const results: Array<{
    key: string;
    value: string;
    category: MemoryCategory;
    isNameUpdate?: boolean;
  }> = [];

  const text = userText.trim();

  // 1. Name detection in Hinglish / English
  // "mera naam Rahul hai", "mera name Rahul h", "my name is Rahul", "call me Rahul", "naam Rahul hai"
  const namePatterns = [
    /(?:mera\s+naam|mera\s+name|my\s+name\s+is|mujhe|call\s+me)\s+([A-Za-z]+)(?:\s+hai|\s+h)?/i,
    /(?:naam\s+([A-Za-z]+)\s+hai)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      if (
        extractedName.length >= 2 &&
        !['hai', 'kya', 'zoya', 'bhai', 'yaar', 'please', 'nahi', 'kuch'].includes(
          extractedName.toLowerCase()
        )
      ) {
        const capitalized =
          extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase();
        results.push({
          key: 'User Name',
          value: capitalized,
          category: 'identity',
          isNameUpdate: true,
        });
        break;
      }
    }
  }

  // 2. Preference detection
  // "mujhe coffee pasand hai", "i like python", "i love dark chocolate", "mera favorite X Y hai"
  const favPatterns = [
    /(?:mera|meri)\s+fav(?:orite)?\s+([a-zA-Z\s]+)\s+(?:hai|h)/i,
    /mujhe\s+([a-zA-Z\s]+)\s+pasand\s+(?:hai|h)/i,
    /i\s+(?:love|like|prefer)\s+([a-zA-Z\s]+)/i,
  ];

  for (const pattern of favPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = match[1].trim();
      if (val.length >= 3 && val.length <= 40) {
        results.push({
          key: 'Preference: ' + val,
          value: val,
          category: 'preference',
        });
        break;
      }
    }
  }

  return results;
}
