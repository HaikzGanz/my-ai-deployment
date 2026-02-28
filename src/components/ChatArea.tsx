import { useState, useRef, useEffect, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Message, AppSettings, Chat } from '../types';
import { MODELS } from '../constants';
import { cn } from '../utils/cn';
// [🔥] TAMBAHIN ImageIcon dan CloseIcon
import { ArrowUpIcon, StopIcon, GPTIcon, SidebarIcon, EditIcon, CopyIcon, CheckIcon, ImageIcon, CloseIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatAreaProps {
  chat: Chat | null;
  isStreaming: boolean;
  streamingContent: string;
  settings: AppSettings;
  // [🔥] UBAH SIGNATURE: Sekarang bisa ngirim gambar
  onSendMessage: (content: string, imageUrl?: string | null) => void;
  onStopStreaming: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onChangeModel: (model: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-gray-200"
      title="Copy"
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
}

// [🔥] TAMBAHIN DUKUNGAN NAMPILIN GAMBAR DI CHAT BUBBLE
function MessageItem({ message, isStreaming }: { message: Message & { isStreamingMsg?: boolean; imageUrl?: string }; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('py-4 group')}>
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 mt-0.5">
            {isUser ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-medium text-white">U</span>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#19c37d] flex items-center justify-center p-1">
                <GPTIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white mb-1">
              {isUser ? 'You' : 'ChatGPT'}
            </div>
            <div className={cn('text-[15px] text-gray-200 leading-7 prose-invert max-w-none')}>
              
              {/* [🔥] NAMPILIN GAMBAR KALAU USER NGIRIM GAMBAR */}
              {message.imageUrl && (
                <div className="mb-3">
                  <img src={message.imageUrl} alt="Uploaded" className="max-w-sm rounded-lg border border-white/10 shadow-md" />
                </div>
              )}

              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <>
                  <MarkdownRenderer content={message.content} />
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-gray-300 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            {!isUser && !isStreaming && message.content && (
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={message.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSendMessage }: { onSendMessage: (msg: string) => void; model: string; onChangeModel: (m: string) => void }) {
  const suggestions = [
    { text: 'Explain quantum computing', icon: '⚛️' },
    { text: 'Write a Python function to sort a list', icon: '🐍' },
    { text: 'Plan a 3-day trip to Tokyo', icon: '✈️' },
    { text: 'Help me debug my React code', icon: '🔧' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 mx-auto border border-white/10">
          <GPTIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-white text-center">Ada yang bisa saya bantu?</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(s.text)}
            className="flex items-start gap-3 p-4 rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors text-left group"
          >
            <span className="text-lg">{s.icon}</span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatArea({
  chat,
  isStreaming,
  streamingContent,
  settings,
  onSendMessage,
  onStopStreaming,
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
  onChangeModel,
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  
  // [🔥] STATE BARU BUAT GAMBAR
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // [🔥] FUNGSI BACA GAMBAR JADI BASE64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input biar bisa milih gambar yang sama lagi
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [chat?.messages, streamingContent, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming, chat?.id]);

  const handleSend = () => {
    const trimmed = input.trim();
    // [🔥] SEKARANG BISA NGIRIM KALAU ADA TEKS ATAU ADA GAMBAR
    if ((!trimmed && !selectedImage) || isStreaming) return;
    setInput('');
    // Ngirim teks sekalian gambar (kalau ada)
    onSendMessage(trimmed, selectedImage);
    setSelectedImage(null); // Bersihin gambar abis dikirim
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = chat && chat.messages.length > 0;
  const modelName = MODELS.find(m => m.id === settings.model)?.name || settings.model;

  return (
    <div className="flex flex-col flex-1 h-full bg-[#212121] relative">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-[#212121]">
        <div className="flex items-center gap-2">
          {!sidebarOpen && (
            <>
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <SidebarIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onNewChat}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-200 text-sm font-medium">
            <span>{modelName}</span>
            <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages or Welcome */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {!hasMessages ? (
          <WelcomeScreen
            onSendMessage={onSendMessage}
            model={settings.model}
            onChangeModel={onChangeModel}
          />
        ) : (
          <div className="pb-40">
            {chat.messages.map(msg => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            {isStreaming && streamingContent && (
              <MessageItem
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: Date.now(),
                }}
                isStreaming
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && hasMessages && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-40 left-1/2 -translate-x-1/2 p-2 bg-[#2d2d2d] border border-white/10 rounded-full shadow-lg hover:bg-[#3d3d3d] transition-colors text-gray-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
          </svg>
        </button>
      )}

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* [🔥] KOTAK PREVIEW GAMBAR KALAU UDAH DIPILIH */}
          {selectedImage && (
            <div className="relative inline-block mb-3 bg-[#2f2f2f] border border-white/10 p-2 rounded-xl shadow-lg">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-md object-cover" />
            </div>
          )}

          <div className="relative bg-[#2f2f2f] rounded-2xl border border-white/10 shadow-xl flex items-end">
            
            {/* [🔥] TOMBOL UPLOAD GAMBAR */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-white transition-colors mb-0.5"
              title="Upload Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <TextareaAutosize
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
              maxRows={8}
              className="flex-1 resize-none bg-transparent text-white placeholder-gray-500 py-3.5 pr-14 focus:outline-none text-[15px] leading-6 scrollbar-thin"
              disabled={isStreaming}
            />
            
            <div className="absolute right-2 bottom-2">
              {isStreaming ? (
                <button
                  onClick={onStopStreaming}
                  className="p-2 bg-white rounded-lg hover:bg-gray-200 transition-colors"
                  title="Stop generating"
                >
                  <StopIcon className="w-4 h-4 text-black" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && !selectedImage}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    (input.trim() || selectedImage)
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  )}
                  title="Send message"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2.5">
            ©Copyright By @Haikzone1
          </p>
        </div>
      </div>
    </div>
  );
}