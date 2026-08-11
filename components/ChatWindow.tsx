import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, ChatMessage } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { UploadIcon } from './icons/UploadIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatWindowProps {
  session: ChatSession;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';

    const renderContent = () => {
        if (message.content.includes('<')) {
            return (
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                    style={{
                        color: isModel ? '#FFFFFF' : '#1e3a5f'
                    }}
                />
            );
        }
        return <MarkdownRenderer content={message.content} />;
    };

    return (
        <div className={`flex gap-4 my-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`w-fit max-w-3xl p-5 rounded-2xl shadow-md ${
                isModel
                    ? 'bg-brand-secondary text-brand-text rounded-tl-none'
                    : 'bg-brand-gold text-white rounded-br-none'
            }`}>
                {renderContent()}
                {message.sources && message.sources.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-brand-accent/30">
                        <h4 className="text-xs font-bold text-brand-light mb-2">Sources:</h4>
                        <ul className="list-decimal list-inside space-y-1 text-xs">
                            {message.sources.map((source, index) => (
                                source.web && (
                                    <li key={index}>
                                        <a
                                            href={source.web.uri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${isModel ? 'text-brand-gold/80 hover:text-brand-gold' : 'text-blue-100 hover:text-white'} underline transition break-all`}
                                        >
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ session, onSendMessage, isLoading, error }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${session.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.txt`;

    let content = `Chat Export: ${session.title}\n`;
    content += `Exported: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(80)}\n\n`;

    session.messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'YOU' : 'AI';
      content += `${role}:\n`;
      content += `${msg.content}\n`;

      if (msg.sources && msg.sources.length > 0) {
        content += `\nSources:\n`;
        msg.sources.forEach((source, idx) => {
          if (source.web) {
            content += `  ${idx + 1}. ${source.web.title || source.web.uri}\n`;
            content += `     ${source.web.uri}\n`;
          }
        });
      }

      content += `\n${'-'.repeat(80)}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-primary ml-4">
      <header className="px-8 py-4 border-b border-brand-accent flex justify-between items-center flex-shrink-0">
        <h2 className="font-bold text-xl text-brand-text truncate max-w-2xl">{session.title}</h2>
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-accent text-brand-light hover:text-brand-text transition-colors"
            aria-label="Export Conversation"
        >
          <UploadIcon className="w-5 h-5 rotate-180" />
          <span className="text-sm hidden md:inline">Export</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl mx-auto w-full">
        {session.messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="flex gap-4 my-4 justify-start">
                <div className="w-fit max-w-2xl p-4 rounded-2xl bg-brand-secondary rounded-tl-none">
                   <div className="flex items-center gap-2 text-brand-light">
                        <div className="w-3 h-3 bg-brand-gold rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-brand-gold rounded-full animate-pulse delay-75"></div>
                        <div className="w-3 h-3 bg-brand-gold rounded-full animate-pulse delay-150"></div>
                   </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-8 py-6 flex-shrink-0 max-w-4xl mx-auto w-full">
        <div className="bg-brand-secondary rounded-2xl p-3 flex items-end gap-3 border-2 border-brand-accent focus-within:border-brand-gold transition-all shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Dubai real estate..."
            className="w-full bg-transparent px-3 py-2 focus:outline-none resize-none text-brand-text placeholder-brand-light/50 max-h-32"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-gold text-white p-3 rounded-xl hover:bg-yellow-500 disabled:bg-brand-accent disabled:text-brand-light disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md hover:shadow-lg"
            aria-label="Send Message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-brand-light/50 text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;