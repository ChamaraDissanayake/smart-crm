import ChatService, { ChatMessage } from "@/services/ChatService";
import React, { useState, useEffect, useRef } from "react";

import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

interface ChatBotProps {
    onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "1", text: "Welcome! How can I assist you?", sender: "bot" },
    ]);
    const [inputText, setInputText] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Generate or retrieve user ID from localStorage
    const userId = (() => {
        // Check if a user ID already exists in localStorage
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            return storedUserId; // Use the existing user ID
        } else {
            // Generate a new unique ID and store it in localStorage
            const newUserId = uuidv4();
            localStorage.setItem("userId", newUserId);
            return newUserId;
        }
    })();

    const selectedCompanyId = (() => {
        const storedCompanyId = localStorage.getItem("selectedCompany");
        if (storedCompanyId) {
            return storedCompanyId; // Use the existing user ID
        } else {
            return '';
        }
    })();

    // Typing GIF URL (use any suitable GIF)
    const typingGif = "https://media.tenor.com/mT5Timqns1sAAAAi/loading-dots-bouncing-dots.gif";

    // Scroll to the latest message smoothly
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputText.trim() === "" || isSending) return;

        const newMessage: ChatMessage = {
            id: String(messages.length + 1),
            text: inputText.trim(),
            sender: "user",
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputText("");
        setIsSending(true);

        // Show Typing GIF
        setTimeout(() => {
            const typingMessage: ChatMessage = {
                id: String(messages.length + 2),
                text: typingGif, // Store the GIF URL as text
                sender: "bot",
            };

            setMessages((prevMessages) => [...prevMessages, typingMessage]);
        }, 3000);

        try {
            const response = await ChatService.sendChatMessage(userId, selectedCompanyId, inputText.trim());

            // Replace Typing GIF with actual response
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.text === typingGif
                        ? { id: String(messages.length + 2), text: response.botResponse, sender: "bot" }
                        : msg
                )
            );
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div
            className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg z-1000 w-96 h-[400px] max-w-full overflow-hidden font-sans"
            style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
        >
            <div className="flex flex-col h-full">
                <span
                    className="absolute text-3xl text-gray-100 cursor-pointer top-2 right-5 hover:text-gray-300"
                    onClick={onClose}
                >
                    &times;
                </span>

                {/* Chat header */}
                <div className="flex items-center p-4 bg-blue-900 rounded-t-lg">
                    <img
                        src="../../../public/bot.jpg"
                        alt="Profile"
                        className="w-10 h-10 mr-3 rounded-full"
                    />
                    <div className="text-white">
                        <h4 className="text-lg font-semibold">Ayisha</h4>
                        <span className="text-sm opacity-70">SR Customer Happiness Advisor</span>
                    </div>
                </div>

                {/* Chat body */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-950">
                    <div className="flex flex-col gap-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`p-3 rounded-lg max-w-[80%] ${message.sender === "bot"
                                    ? "bg-blue-100 self-start rounded-bl-none text-blue-800"
                                    : "bg-green-100 self-end rounded-br-none text-green-800"
                                    }`}
                            >
                                {message.text === typingGif ? (
                                    <img src={typingGif} alt="Typing..." className="w-12 h-6" />
                                ) : (
                                    <p className="text-sm">{message.text}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Reference for scrolling */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat input area */}
                <div className="flex gap-2 p-4 border-t border-red-900">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 p-2 bg-gray-900 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isSending}
                        className={`px-4 py-2 text-white rounded-lg ${isSending
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                            }`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
