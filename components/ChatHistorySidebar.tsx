import React, { useState } from 'react';
import { ChatSession } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  setIsOpen
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const showSidebar = isOpen || isHovered;

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      <div
        className="absolute left-0 top-0 bottom-0 w-4 z-40 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
      />

      <aside
        className={`absolute left-0 top-0 bottom-0 bg-brand-secondary flex-shrink-0 flex flex-col transition-all duration-300 shadow-2xl z-50 ${showSidebar ? 'translate-x-0' : '-translate-x-full'
          } w-80 border-r border-brand-accent/30`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 border-b border-brand-accent flex-shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-7 h-7 text-brand-gold" />
            <h1 className="text-lg font-bold tracking-wider text-brand-text">
              Chat History
            </h1>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-brand-text bg-brand-gold hover:bg-yellow-500 transition-colors font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            New Conversation
          </button>
        </div>

        <div className="px-3 mb-2">
          <p className="text-xs text-brand-light uppercase tracking-wider font-semibold">Recent</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`w-full rounded-lg text-sm transition-all group ${activeSessionId === session.id
                ? 'bg-brand-accent text-brand-text'
                : 'text-brand-light hover:bg-brand-primary/50 hover:text-brand-text'
                }`}
            >
              {editingId === session.id ? (
                <div className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(session.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    onBlur={() => handleSaveEdit(session.id)}
                    className="w-full bg-brand-primary text-brand-text px-2 py-1 rounded border border-brand-gold focus:outline-none text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  onClick={() => {
                    onSelectSession(session.id);
                    setIsHovered(false);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{session.title}</div>
                    <div className="text-xs text-brand-light/60 mt-1">
                      {session.messages.length} messages
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => handleStartEdit(session, e)}
                      className="p-1 hover:bg-brand-accent rounded"
                      title="Rename"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-brand-light/50 text-sm py-8">
              No conversations yet
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default ChatHistorySidebar;
