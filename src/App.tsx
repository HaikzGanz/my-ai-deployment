import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Message, AppSettings } from './types';
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

// [🔥] KITA KEMBALI PAKE JALUR CEPAT: signInWithPopup
import { auth, googleProvider } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [useCustomUrl, setUseCustomUrl] = useState(() => localStorage.getItem('USE_CUSTOM_URL') === 'true');
  const [customApiUrl, setCustomApiUrl] = useState(() => localStorage.getItem('CUSTOM_API_URL') || '');

  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => loadActiveChatId());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(() => loadSidebarOpen());
  const [showSettings, setShowSettings] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cuma mantau perubahan status login
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      // [🔥] BALIK PAKE POP-UP BIAR KILAT! (Pastikan Support Email di Firebase udah diisi)
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Gagal login Pop-up:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const handleUrlModeChange = (isCustom: boolean) => {
    setUseCustomUrl(isCustom);
    localStorage.setItem('USE_CUSTOM_URL', isCustom.toString());
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomApiUrl(e.target.value);
    localStorage.setItem('CUSTOM_API_URL', e.target.value);
  };

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
    if (activeChat && activeChat.messages.length === 0) return;
    createChat();
  }, [activeChat, createChat]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
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
      const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
      return;
    }

    try {
      const isCustom = localStorage.getItem('USE_CUSTOM_URL') === 'true';
      const customUrl = localStorage.getItem('CUSTOM_API_URL');
      const endpointUrl = isCustom && customUrl ? customUrl : '/api-ai/v1/chat/completions';

      const response = await fetch(endpointUrl, {
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

  const handleSendMessage = useCallback(async (content: string, imageUrl?: string | null) => {
    if (isStreaming) return;

    let currentChat = activeChat;
    let targetChatId = activeChatId;

    if (!currentChat) {
      currentChat = createChat();
      targetChatId = currentChat.id;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      ...(imageUrl && { imageUrl }), 
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

    if (isFirstMessage) {
      generateTitle(content, targetChatId!);
    }

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

  useEffect(() => {
    if (user && !settings.apiKey) {
      const timer = setTimeout(() => setShowSettings(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user, settings.apiKey]);


  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-[#171717] flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-500 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 tracking-widest text-sm">LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-[#171717] flex flex-col items-center justify-center text-white p-4">
        <div className="w-full max-w-md bg-[#212121] rounded-2xl p-8 shadow-2xl border border-white/10 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 mb-2">
            AI AGENT
          </h1>
          <p className="text-gray-400 mb-8 text-sm">Authentication Required</p>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="w-full border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 tracking-wider">API CONFIGURATION</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="apiMode" 
                  checked={!useCustomUrl}
                  onChange={() => handleUrlModeChange(false)}
                  className="w-4 h-4 accent-gray-400 cursor-pointer"
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  Use Website URL API (MegaLLM/Proxy)
                </span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="apiMode" 
                    checked={useCustomUrl}
                    onChange={() => handleUrlModeChange(true)}
                    className="w-4 h-4 accent-gray-400 cursor-pointer"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Customize API URL
                  </span>
                </label>

                {useCustomUrl && (
                  <div className="pl-7 mt-2 transition-all duration-300 ease-in-out">
                    <input
                      type="url"
                      value={customApiUrl}
                      onChange={handleCustomUrlChange}
                      placeholder="e.g. https://api.openai.com/v1/chat/completions"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden relative">
      <button 
        onClick={handleLogout} 
        className="absolute top-3 right-3 z-50 bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-800/50 hover:text-red-300 text-xs font-bold border border-red-500/30 transition-all tracking-wider"
        title="Logout dari Markas"
      >
        LOGOUT
      </button>

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