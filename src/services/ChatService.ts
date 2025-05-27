// src/services/ChatService.ts
import axios from "axios";
import socket from "./helpers/socket";
import api from './Api';
import { Message } from "@/types/Chat";
import { AuthService } from "./AuthService";

const CHAT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatService = {
    connectToThread: (threadId: string, onMessage: (msg: Message) => void) => {
        if (!socket.connected) {
            socket.connect();
        }

        socket.emit("join-thread", threadId);

        socket.on("new-message", onMessage);

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });

        return () => {
            socket.off("new-message", onMessage);
        };
    },

    //Use this to send Whatsapp messages only
    sendWhatsAppMessage: async (to: string, message: string) => {
        try {
            const companyId = localStorage.getItem('selectedCompany');
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
            console.log('Chamara chat data', res.data);

            return res.data;
        } catch (error) {
            console.error(error);
        }
    },

    assignChat: async (assignee: string, threadId: string) => {
        try {
            const userId = AuthService.getCurrentUserId();
            const res = await api.patch(`/chat/assign`, { threadId, userId, assignee });
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

};

export default ChatService;