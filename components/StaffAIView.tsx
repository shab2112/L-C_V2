import React, { useState } from 'react';
import { User, ChatMode } from '../types';
import ChatHistorySidebar from './ChatHistorySidebar';
import ChatWindow from './ChatWindow';
import useChat from '../hooks/useChat';

const StaffAIView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {
        sessions,
        activeSession,
        activeSessionId,
        isLoading,
        error,
        handleNewSession,
        handleSendMessage,
        handleDeleteSession,
        handleRenameSession,
        setActiveSessionId
    } = useChat(currentUser, ChatMode.Staff);

    const renderContent = () => {
        if (!activeSession) {
            return (
                <div className="flex-1 flex items-center justify-center text-brand-light">
                    <div className="text-center max-w-md px-6">
                        <h2 className="text-2xl font-bold text-brand-text mb-4">Welcome to Pro AI</h2>
                        <p className="text-brand-light mb-6">
                            Your internal assistant for campaign metrics, content schedules, and more.
                            Hover over the left edge to view your chat history and start a new conversation.
                        </p>
                    </div>
                </div>
            );
        }
        return (
            <ChatWindow
                session={activeSession}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                error={error}
            />
        );
    }

    return (
        <div className="relative h-full overflow-hidden bg-brand-primary rounded-xl shadow-lg">
            <ChatHistorySidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewSession={handleNewSession}
                onSelectSession={setActiveSessionId}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            {renderContent()}
        </div>
    );
};

export default StaffAIView;
