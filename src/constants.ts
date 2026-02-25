import { ModelOption } from './types';

export const MODELS: ModelOption[] = [
  { id: 'openai/gpt-5.2', name: 'ChatGPT 5.2', provider: 'OpenAI' },
  { id: 'openai/gpt-5.1', name: 'ChatGPT 5.1', provider: 'OpenAI' },
  { id: 'openai/gpt-5', name: 'ChatGPT 5', provider: 'OpenAI' },
];

export const DEFAULT_MODEL = 'openai/gpt-5.2';

export const DEFAULT_SYSTEM_PROMPT = 'Anda adalah asisten ai yang cerdas, analitis, dan komunikatif.';

export const STORAGE_KEYS = {
  CHATS: 'Chat',
  SETTINGS: 'chatgpt-clone-settings',
  ACTIVE_CHAT: 'chatgpt-clone-active-chat',
  SIDEBAR_OPEN: 'chatgpt-clone-sidebar-open',
};
