// src/services/ChatService.ts
import axios from "axios";
import socket from "./helpers/socket";
import api from './Api';
import { ChatHead, Message } from "@/types/Communication";
import { CompanyService } from "./CompanyService";

const CHAT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Map to keep track of active message listeners for threads
const activeThreadListeners = new Map<string, (msg: Message) => void>();

// Single variable for current company event listener
let currentCompanyListener: ((err: unknown) => void) | null = null;

const ChatService = {
    subscribeToChatSocketEvents: (companyId: string) => {

        if (!socket.connected) {
            socket.connect();
        }

        // Remove any existing listener for connect_error
        if (currentCompanyListener) {
            socket.off("connect_error", currentCompanyListener);
            currentCompanyListener = null;
        }

        socket.emit("join-company", companyId);

        // Add fresh listener
        currentCompanyListener = (err) => {
            console.error("Socket connection error:", err);
        };

        socket.on("connect_error", currentCompanyListener);

        // Optional unsubscribe logic
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

        // Remove existing listener for this thread to avoid duplicates
        const existingListener = activeThreadListeners.get(threadId);
        if (existingListener) {
            socket.off("new-message", existingListener);
            activeThreadListeners.delete(threadId);
        }

        socket.emit("join-thread", threadId);

        const messageListener = (msg: Message) => {
            if (msg.threadId === threadId) {
                onMessage(msg);
            }
        };

        socket.on("new-message", messageListener);
        activeThreadListeners.set(threadId, messageListener);

        return () => {
            socket.off("new-message", messageListener);
            activeThreadListeners.delete(threadId);
        };
    },

    onNewMessage: (callback: (msg: Message) => void) => {
        socket.on("new-message", callback);

        return () => {
            socket.off("new-message", callback);
        };
    },

    // onNewThread: (callback: (thread: { id: string; companyId: string }) => void) => {
    //     socket.on("new-thread", callback);

    //     return () => {
    //         socket.off("new-thread", callback);
    //     };
    // },


    onNewThread: (callback: (thread: ChatHead & { companyId: string }) => void) => {
        socket.on("new-thread", callback);

        return () => {
            socket.off("new-thread", callback);
        };
    },

    // Use this to send Whatsapp messages only
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
            console.error("Error sending message:", error);
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
            console.error("Error sending message:", error);
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

    assignChat: async (threadId: string, chatHandler: string, assignedAgentId: string | null) => {
        try {
            const res = await api.patch(`/chat/assign`, { threadId, chatHandler, assignedAgentId });
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
    }

};

export default ChatService;