import React, { useState } from "react";
import ChatBot from "./ChatBot";
// import ChatService from "../../services/ChatService";
import { BsChatDots } from "react-icons/bs";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

const ChatFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isChatBotOpen, setIsChatBotOpen] = useState(false);

    return (
        <div className="fixed z-50 bottom-5 right-5">
            {/* Floating Action Button */}
            <button
                className="p-2 bg-transparent rounded-full hover:scale-110"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src="/chat.png" alt="Chat" className="w-12 h-12" />
            </button>

            {/* Chat Options */}
            {isOpen && (
                <div className="absolute right-0 flex flex-col gap-2 p-3 bg-white rounded-lg shadow-lg bottom-16">
                    <button
                        onClick={() => {
                            window.open("https://smartclassic.3cx.ae/callus/#LiveChat768401", "_blank");
                            setIsOpen(false); // Close the popup when an option is clicked
                        }}
                        className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-gray-100"
                    >
                        <IoCallOutline className="text-lg text-blue-600" /> Call Us
                    </button>

                    <button
                        onClick={() => {
                            window.open("https://wa.me/971505523995", "_blank");
                            setIsOpen(false); // Close the popup when an option is clicked
                        }}
                        className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-gray-100"
                    >
                        <FaWhatsapp className="text-lg text-green-600" /> WhatsApp
                    </button>

                    <button
                        onClick={() => {
                            setIsChatBotOpen(true); // Open ChatBot modal
                            setIsOpen(false); // Close the popup when an option is clicked
                        }}
                        className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-gray-700 rounded hover:bg-gray-100"
                    >
                        <BsChatDots className="text-lg text-yellow-600" /> Chat
                    </button>
                </div>
            )}

            {/* ChatBot Modal */}
            {isChatBotOpen && <ChatBot onClose={() => setIsChatBotOpen(false)} />}
        </div>
    );
};

export default ChatFAB;
