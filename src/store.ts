import { Chat, AppSettings } from './types';
import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT, STORAGE_KEYS } from './constants';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function loadChats(): Chat[] {
  return safeGet<Chat[]>(STORAGE_KEYS.CHATS, []);
}

export function saveChats(chats: Chat[]): void {
  safeSet(STORAGE_KEYS.CHATS, chats);
}

export function loadSettings(): AppSettings {
  return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, {
    apiKey: '',
    model: DEFAULT_MODEL,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  });
}

export function saveSettings(settings: AppSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function loadActiveChatId(): string | null {
  return safeGet<string | null>(STORAGE_KEYS.ACTIVE_CHAT, null);
}

export function saveActiveChatId(id: string | null): void {
  safeSet(STORAGE_KEYS.ACTIVE_CHAT, id);
}

export function loadSidebarOpen(): boolean {
  return safeGet<boolean>(STORAGE_KEYS.SIDEBAR_OPEN, true);
}

export function saveSidebarOpen(open: boolean): void {
  safeSet(STORAGE_KEYS.SIDEBAR_OPEN, open);
}
