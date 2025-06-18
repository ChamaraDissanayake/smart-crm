// src/services/ChatService.ts
import axios from "axios";
import socket from "./helpers/socket";
import api from "./Api";
import { ChannelType, ChatHead, Message } from "@/types/Communication";
import { CompanyService } from "./CompanyService";

const CHAT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Track thread-specific message handlers
const threadMessageHandlers = new Map<string, (msg: Message) => void>();

// Track global message handlers
const globalMessageHandlers = new Set<(msg: Message) => void>();

// Only attach the socket listener once
let isNewMessageListenerAttached = false;

// Company-level error handler
let currentCompanyListener: ((err: unknown) => void) | null = null;

// 🚀 Setup the global "new-message" socket listener
const ensureNewMessageListener = () => {
    if (isNewMessageListenerAttached) return;

    socket.on("new-message", (msg: Message) => {
        // First, check if there's a thread-specific handler
        const threadHandler = threadMessageHandlers.get(msg.threadId);
        if (threadHandler) {
            threadHandler(msg);
        }

        // Then notify global handlers
        for (const handler of globalMessageHandlers) {
            handler(msg);
        }
    });

    isNewMessageListenerAttached = true;
};

const ChatService = {
    subscribeToChatSocketEvents: (companyId: string) => {
        if (!socket.connected) {
            socket.connect();
        }

        if (currentCompanyListener) {
            socket.off("connect_error", currentCompanyListener);
            currentCompanyListener = null;
        }

        socket.emit("join-company", companyId);

        currentCompanyListener = (err) => {
            console.error("Socket connection error:", err);
        };

        socket.on("connect_error", currentCompanyListener);

        return () => {
            if (currentCompanyListener) {
                socket.off("connect_error", currentCompanyListener);
                currentCompanyListener = null;
            }
        };
    },

    joinThread: (threadId: string, onMessage: (msg: Message) => void) => {
        if (!socket.connected) {
            socket.connect();
        }

        // Remove previous handler if any
        threadMessageHandlers.delete(threadId);

        socket.emit("join-thread", threadId);
        threadMessageHandlers.set(threadId, onMessage);

        ensureNewMessageListener();

        return () => {
            threadMessageHandlers.delete(threadId);
        };
    },

    onNewMessage: (callback: (msg: Message) => void) => {
        globalMessageHandlers.add(callback);

        ensureNewMessageListener();

        return () => {
            globalMessageHandlers.delete(callback);
        };
    },

    onNewThread: (callback: (thread: ChatHead & { companyId: string }) => void) => {
        socket.on("new-thread", callback);
        return () => {
            socket.off("new-thread", callback);
        };
    },

    sendWhatsAppMessage: async (to: string, message: string) => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const response = await axios.post(`${CHAT_BASE_URL}/whatsapp/send`, {
                to,
                message,
                companyId
            });
            return response.data;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            throw error;
        }
    },

    sendWebMessage: async (threadId: string, message: string) => {
        try {
            const response = await axios.post(`${CHAT_BASE_URL}/chat/chat-web-send`, {
                threadId,
                message
            });
            return response.data;
        } catch (error) {
            console.error("Error sending web message:", error);
            throw error;
        }
    },

    getChatHeads: async (companyId: string, channel: string = 'all') => {
        try {
            const res = await api.get('/chat/chat-heads', {
                params: { companyId, channel }
            });

            return res.data;
        } catch (error) {
            console.error('Error fetching chat heads:', error);
            throw error;
        }
    },

    getChatHistory: async (threadId: string, offset: number = 0) => {
        try {
            const res = await api.get('/chat/chat-history', {
                params: { threadId, offset }
            });

            return res.data;
        } catch (error) {
            console.error(error);
        }
    },

    assignChat: async (threadId: string, chatHandler: string, assignedAgentId: string | null, channel: ChannelType, phone?: string) => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const res = await api.patch(`/chat/assign`, { threadId, chatHandler, assignedAgentId, channel, phone, companyId });
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    },

    markAsDone: async (threadId: string) => {
        try {
            const res = await api.patch(`/chat/mark-as-done`, { threadId });
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    },

    cleanupAllListeners: () => {
        if (socket.connected) {
            socket.removeAllListeners();
            socket.disconnect();
        }

        threadMessageHandlers.clear();
        globalMessageHandlers.clear();
        isNewMessageListenerAttached = false;
    }
};

export default ChatService;
