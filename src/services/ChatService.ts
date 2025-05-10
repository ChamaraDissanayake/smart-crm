import axios from "axios";
const CHAT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ChatMessage {
    id: string;
    text: string;
    sender: "bot" | "user";
}

export interface ChatHistoryResponse {
    chatHistory: { role: string; content: string; timestamp: number }[];
}

const ChatService = {
    sendChatMessage: async (userId: string, companyId: string, userInput: string): Promise<{ botResponse: string }> => {
        try {
            console.log('Chamara', 'userId', userId, 'companyId', companyId, 'userInput', userInput);

            const response = await axios.post<{ botResponse: string }>(
                CHAT_BASE_URL + '/chat',
                { companyId, userInput }
            );

            return response.data;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },
};

export default ChatService;
