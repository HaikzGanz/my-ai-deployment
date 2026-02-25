import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Message, AppSettings } from './types';
// constants used in store.ts
import {
  loadChats, saveChats,
  loadSettings, saveSettings,
  loadActiveChatId, saveActiveChatId,
  loadSidebarOpen, saveSidebarOpen,
} from './store';
import { streamChat, buildMessages } from './api';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => loadActiveChatId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(() => loadSidebarOpen());
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  // Persist state changes
  useEffect(() => { saveChats(chats); }, [chats]);
  useEffect(() => { saveActiveChatId(activeChatId); }, [activeChatId]);
  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveSidebarOpen(sidebarOpen); }, [sidebarOpen]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const createChat = useCallback((): Chat => {
    const chat: Chat = {
      id: uuidv4(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.model,
    };
    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
    return chat;
  }, [settings.model]);

  const handleNewChat = useCallback(() => {
    // If there's already an empty active chat, don't create a new one
    if (activeChat && activeChat.messages.length === 0) return;
    createChat();
  }, [activeChat, createChat]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleDeleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  }, [activeChatId]);

  const handleRenameChat = useCallback((id: string, title: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c));
  }, []);

  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev;
      return next;
    });
  }, []);

  const handleChangeModel = useCallback((model: string) => {
    setSettings(prev => ({ ...prev, model }));
  }, []);

  const handleStopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const generateTitle = useCallback(async (userMessage: string, chatId: string) => {
    if (!settings.apiKey) {
      // Use first few words as fallback
      const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
      return;
    }

    try {
      const response = await fetch('/api-ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'openai/gpt-5.2',
          messages: [
            {
              role: 'user',
              content: `Generate a very short title (max 6 words) for a conversation that starts with this message. Return only the title, no quotes or punctuation at the end:\n\n"${userMessage.slice(0, 200)}"`,
            },
          ],
          max_tokens: 8192,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const title = data.choices?.[0]?.message?.content?.trim() || userMessage.slice(0, 40);
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
      } else {
        const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
      }
    } catch {
      const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
    }
  }, [settings.apiKey]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    let currentChat = activeChat;
    let targetChatId = activeChatId;

    // Create chat if needed
    if (!currentChat) {
      currentChat = createChat();
      targetChatId = currentChat.id;
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentChat.messages, userMessage];
    const isFirstMessage = currentChat.messages.length === 0;

    setChats(prev =>
      prev.map(c =>
        c.id === targetChatId
          ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    // Generate title for first message
    if (isFirstMessage) {
      generateTitle(content, targetChatId!);
    }

    // Start streaming
    setIsStreaming(true);
    setStreamingContent('');

    const abortController = new AbortController();
    abortRef.current = abortController;

    let fullContent = '';
    const apiMessages = buildMessages(settings.systemPrompt, updatedMessages);

    await streamChat(
      settings.apiKey,
      settings.model,
      apiMessages,
      (chunk) => {
        fullContent += chunk;
        setStreamingContent(fullContent);
      },
      () => {
        // Done
        if (fullContent) {
          const assistantMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: fullContent,
            timestamp: Date.now(),
          };
          setChats(prev =>
            prev.map(c =>
              c.id === targetChatId
                ? { ...c, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() }
                : c
            )
          );
        }
        setIsStreaming(false);
        setStreamingContent('');
        abortRef.current = null;
      },
      (error) => {
        // Error
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `⚠️ **Error:** ${error}`,
          timestamp: Date.now(),
        };
        setChats(prev =>
          prev.map(c =>
            c.id === targetChatId
              ? { ...c, messages: [...updatedMessages, errorMessage], updatedAt: Date.now() }
              : c
          )
        );
        setIsStreaming(false);
        setStreamingContent('');
        abortRef.current = null;
      },
      abortController.signal
    );
  }, [isStreaming, activeChat, activeChatId, settings, createChat, generateTitle]);

  // Show settings on first visit if no API key
  useEffect(() => {
    if (!settings.apiKey) {
      const timer = setTimeout(() => setShowSettings(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onOpenSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      <ChatArea
        chat={activeChat}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        settings={settings}
        onSendMessage={handleSendMessage}
        onStopStreaming={handleStopStreaming}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        onNewChat={handleNewChat}
        onChangeModel={handleChangeModel}
      />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
