export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  imageUrl?: string; // [🔥] INI SELANG INFUS GAMBARNYA
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  systemPrompt: string;
}

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
};