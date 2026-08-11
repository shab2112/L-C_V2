
import { useState, useCallback, useEffect } from 'react';
import { ChatSession, ChatMessage, User, ChatMode } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { chatSessionsService, chatMessagesService } from '../lib/db/chat';

const generateSmartTitle = (firstMessage: string): string => {
    const maxLength = 50;
    let title = firstMessage.trim();

    if (title.length > maxLength) {
        title = title.substring(0, maxLength);
        const lastSpace = title.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.7) {
            title = title.substring(0, lastSpace);
        }
        title += '...';
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);

    return title;
};

const useChat = (currentUser: User, mode: ChatMode) => {
    const [sessions, setSessions] = useState<{ [key in ChatMode]: ChatSession[] }>({
        [ChatMode.Staff]: [],
        [ChatMode.Client]: [],
    });
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentSessions = sessions[mode];
    const currentSetActiveSessions = (newSessions: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => {
        setSessions(prev => ({
            ...prev,
            [mode]: typeof newSessions === 'function' ? newSessions(prev[mode]) : newSessions
        }));
    };

    useEffect(() => {
        loadSessionsFromDB();
    }, [mode, currentUser.id]);

    const loadSessionsFromDB = async () => {
        try {
            const dbSessions = await chatSessionsService.getByMode(currentUser.id, mode);
            const sessionsWithMessages = await Promise.all(
                dbSessions.map(async (session) => {
                    const messages = await chatMessagesService.getBySession(session.id);
                    return {
                        id: session.id,
                        title: session.title,
                        messages: messages.map(m => ({
                            role: m.role as 'user' | 'model',
                            content: m.content,
                            sources: m.sources ? (m.sources as any) : undefined,
                            action: m.action || undefined
                        }))
                    };
                })
            );

            currentSetActiveSessions(sessionsWithMessages);

            if (sessionsWithMessages.length === 0) {
                handleNewSession();
            } else if (!sessionsWithMessages.find(s => s.id === activeSessionId)) {
                setActiveSessionId(sessionsWithMessages[0]?.id || null);
            }
        } catch (err) {
            console.error('Failed to load sessions:', err);
            handleNewSession();
        }
    };

    const handleNewSession = async () => {
        const isClientMode = mode === ChatMode.Client;
        const now = new Date();
        const dateTimeString = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const welcomeMessage = isClientMode
            ? `Hello ${currentUser.name}, how can I assist you with your real estate needs today?\n\n**${dateTimeString}**`
            : `Hello ${currentUser.name}. I am Pro AI, your internal assistant. How can I help you? You can ask about campaign metrics, content schedules, and more.\n\n**${dateTimeString}**`;

        try {
            const dbSession = await chatSessionsService.create({
                user_id: currentUser.id,
                title: 'New Conversation',
                mode: mode
            });

            await chatMessagesService.create({
                session_id: dbSession.id,
                role: 'model',
                content: welcomeMessage,
                sources: null,
                action: ''
            });

            const newSession: ChatSession = {
                id: dbSession.id,
                title: dbSession.title,
                messages: [{ role: 'model', content: welcomeMessage }],
            };

            currentSetActiveSessions(prev => [newSession, ...prev]);
            setActiveSessionId(dbSession.id);
        } catch (err) {
            console.error('Failed to create session:', err);
            setError('Failed to create new conversation');
        }
    };

    const handleSendMessage = useCallback(async (message: string) => {
        if (!activeSessionId) return;

        const userMessage: ChatMessage = { role: 'user', content: message };
        const currentSession = currentSessions.find(s => s.id === activeSessionId);
        if (!currentSession) return;

        const historyWithUserMessage = [...currentSession.messages, userMessage];
        currentSetActiveSessions(prev =>
            prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: historyWithUserMessage } : s
            )
        );

        try {
            await chatMessagesService.create({
                session_id: activeSessionId,
                role: 'user',
                content: message,
                sources: null,
                action: ''
            });
        } catch (err) {
            console.error('Failed to save user message:', err);
        }

        setIsLoading(true);
        setError(null);

        try {
            const historyForGemini = currentSession.messages.map(m => ({
                role: m.role,
                text: m.content
            }));

            const response = await sendMessageToGemini(historyForGemini, message);

            const aiMessage: ChatMessage = {
                role: 'model',
                content: response.text,
                sources: response.groundingMetadata?.webSearchQueries ?
                    response.groundingMetadata.webSearchQueries : undefined
            };

            await chatMessagesService.create({
                session_id: activeSessionId,
                role: 'model',
                content: response.text,
                sources: response.groundingMetadata ? JSON.parse(JSON.stringify(response.groundingMetadata)) : null,
                action: ''
            });

            currentSetActiveSessions(prev =>
                prev.map(s => {
                    if (s.id === activeSessionId) {
                        const newMessages = [...historyWithUserMessage, aiMessage];

                        let newTitle = s.title;
                        if (s.messages.length <= 1) {
                            newTitle = generateSmartTitle(message);
                            chatSessionsService.update(activeSessionId, { title: newTitle }).catch(console.error);
                        }

                        return { ...s, title: newTitle, messages: newMessages };
                    }
                    return s;
                })
            );

        } catch (err) {
            const errorMessageContent = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessageContent);
            const errorMessage: ChatMessage = { role: 'model', content: errorMessageContent };
            currentSetActiveSessions(prev =>
                prev.map(s => s.id === activeSessionId ? { ...s, messages: [...historyWithUserMessage, errorMessage] } : s)
            );
        } finally {
            setIsLoading(false);
        }
    }, [activeSessionId, currentSessions, mode]);

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await chatMessagesService.deleteBySession(sessionId);
            await chatSessionsService.delete(sessionId);

            currentSetActiveSessions(prev => prev.filter(s => s.id !== sessionId));

            if (activeSessionId === sessionId) {
                const remainingSessions = currentSessions.filter(s => s.id !== sessionId);
                if (remainingSessions.length > 0) {
                    setActiveSessionId(remainingSessions[0].id);
                } else {
                    handleNewSession();
                }
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
            setError('Failed to delete conversation');
        }
    };

    const handleRenameSession = async (sessionId: string, newTitle: string) => {
        try {
            await chatSessionsService.update(sessionId, { title: newTitle });

            currentSetActiveSessions(prev =>
                prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s)
            );
        } catch (err) {
            console.error('Failed to rename session:', err);
            setError('Failed to rename conversation');
        }
    };

    const activeSession = currentSessions.find(s => s.id === activeSessionId);

    return {
        sessions: currentSessions,
        activeSessionId,
        activeSession,
        isLoading,
        error,
        handleNewSession,
        handleSendMessage,
        handleDeleteSession,
        handleRenameSession,
        setActiveSessionId,
    };
};

export default useChat;