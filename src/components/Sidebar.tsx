import { useState, useMemo } from 'react';
import { Chat } from '../types';
import { cn } from '../utils/cn';
// [🔥] IMPORT LOGO HAIKZ
import { TrashIcon, EditIcon, SearchIcon, HaikzLogo } from './Icons';
// [🔥] IMPORT TIPE USER DARI FIREBASE
import { User } from 'firebase/auth';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggle: () => void;
  user?: User | null; // [🔥] PROPERTI USER MASUK SINI
}

function groupChatsByDate(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const last7Days = today - 7 * 86400000;
  const last30Days = today - 30 * 86400000;

  const groups: { label: string; chats: Chat[] }[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Previous 7 Days', chats: [] },
    { label: 'Previous 30 Days', chats: [] },
    { label: 'Older', chats: [] },
  ];

  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const chat of sorted) {
    const t = chat.updatedAt;
    if (t >= today) groups[0].chats.push(chat);
    else if (t >= yesterday) groups[1].chats.push(chat);
    else if (t >= last7Days) groups[2].chats.push(chat);
    else if (t >= last30Days) groups[3].chats.push(chat);
    else groups[4].chats.push(chat);
  }

  return groups.filter(g => g.chats.length > 0);
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  isOpen,
  onToggle,
  user, // [🔥] MENGGUNAKAN DATA USER
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(c => c.title.toLowerCase().includes(q));
  }, [chats, searchQuery]);

  const groupedChats = useMemo(() => groupChatsByDate(filteredChats), [filteredChats]);

  const startRename = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const commitRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[40] md:hidden cursor-pointer touch-none"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onTouchStart={(e) => {
            e.preventDefault(); // [🔥] OBAT ANTI-FASTHAND BUG
            e.stopPropagation();
            onToggle();
          }}
        />
      )}

      {/* [🔥] KUNCI FIX BUG-NYA ADA DI DUA ELEMEN INI BRE! */}
      <aside
        className={cn(
          'fixed md:relative z-40 flex flex-col h-full bg-[#171717] transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0'
        )}
      >
        <div className="flex flex-col h-full w-[260px]">
          {/* Header */}
          <div className="flex items-center justify-between p-2 pt-3">
            
            {/* [🔥] LOGO HAIKZGPT DI POJOK KIRI ATAS */}
            <div className="flex items-center gap-2 px-2">
              <HaikzLogo className="w-7 h-7" />
              <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">HAIKZ</span>
            </div>

            <div className="flex items-center">
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white md:hidden"
                title="Close sidebar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <button
                onClick={onNewChat}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                title="New chat"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          {chats.length > 3 && (
            <div className="px-2 pb-2 mt-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-4 scrollbar-thin mt-2">
            {groupedChats.map(group => (
              <div key={group.label}>
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 sticky top-0 bg-[#171717] z-10">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.chats.map(chat => (
                    <div
                      key={chat.id}
                      className={cn(
                        'group relative flex items-center rounded-lg cursor-pointer transition-colors',
                        chat.id === activeChatId
                          ? 'bg-white/10'
                          : 'hover:bg-white/[0.06]'
                      )}
                      onClick={() => onSelectChat(chat.id)}
                      onMouseEnter={() => setHoveredId(chat.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {editingId === chat.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename();
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditTitle('');
                            }
                          }}
                          className="flex-1 bg-transparent text-sm text-white px-3 py-2.5 focus:outline-none"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-gray-200 truncate px-3 py-2.5">
                            {chat.title}
                          </span>
                          {(hoveredId === chat.id || chat.id === activeChatId) && (
                            <div className="absolute right-1 flex items-center gap-0.5 bg-gradient-to-l from-[#171717] via-[#171717] to-transparent pl-6 pr-1">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  startRename(chat);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                              >
                                <EditIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onDeleteChat(chat.id);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {chats.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                No conversations yet
              </div>
            )}
          </div>

          {/* Bottom settings & Profile */}
          <div className="border-t border-white/10 flex flex-col">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-3 w-full px-5 py-4 hover:bg-white/[0.06] transition-colors text-gray-300 hover:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </button>

            {/* [🔥] TAMPILAN PROFIL USER */}
            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-t border-white/5 bg-[#121212]">
                <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-white/10" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate">{user.displayName}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}