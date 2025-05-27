// src/pages/CommunicationPage.tsx

import { useEffect, useState, useRef } from 'react';
import { FaWhatsapp, FaRobot, FaPaperPlane, FaGlobe } from 'react-icons/fa';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ChatService from '@/services/ChatService';
import { toast } from 'react-toastify';
import { ChatHead, Message } from '@/types/Chat';

interface Contact {
    id: string;
    name: string;
    phone: string;
    lastMessage: string;
    time: string;
}

const CommunicationPage = () => {
    const [selectedChannel, setSelectedChannel] = useState('all'); // Default to 'all'
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat heads whenever selectedChannel changes
    useEffect(() => {
        const companyId = localStorage.getItem('selectedCompany');
        if (!companyId) {
            throw 'Can not find company id';
        }

        const fetchChatHeads = async () => {
            try {
                // Pass channel param to backend (lowercase)
                const chatHeads: ChatHead[] = await ChatService.getChatHeads(companyId, selectedChannel);

                const formattedContacts: Contact[] = chatHeads.map((head) => ({
                    id: head.id,
                    name: head.customer.name || head.customer.phone,
                    phone: head.customer.phone,
                    lastMessage: head.lastMessage?.content || '',
                    time: head.lastMessage?.createdAt
                        ? new Date(head.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '',
                }));

                setContacts(formattedContacts);
                setSelectedContact(formattedContacts.length > 0 ? formattedContacts[0] : null);
                setMessages([]); // Reset messages on channel switch
            } catch (error) {
                console.error(error);
                toast.error('Failed to load contacts');
            }
        };

        fetchChatHeads();
    }, [selectedChannel]);

    useEffect(() => {
        if (!selectedContact) {
            setMessages([]); // Clear messages if no contact selected
            return;
        }

        const fetchChatHistory = async () => {
            try {
                const chatMessages = await ChatService.getChatHistory(selectedContact.id, 0);
                // Format messages to match your Message interface and UI needs:
                const formattedMessages = chatMessages.map((msg: Message) => ({
                    id: msg.id,
                    threadId: selectedContact.id,
                    role: msg.role,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));

                setMessages(formattedMessages.reverse()); // reverse to show oldest first
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
                toast.error('Failed to load chat history');
            }
        };

        fetchChatHistory();
    }, [selectedContact]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending || !selectedContact) return;

        setIsSending(true);

        try {
            await ChatService.sendWhatsAppMessage(selectedContact.phone, newMessage);
            // Keep the message in the input disabled until received by socket
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setIsSending(false);
        }
    };

    // const toggleAssign = async (assignee: 'bot' | 'agent') => {
    //     try {
    //         const threadId = selectedContact?.id;
    //         if (threadId) {
    //             await ChatService.assignChat(threadId, assignee)
    //         } else {
    //             throw 'Thread id not found'
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    useEffect(() => {
        if (!selectedContact) return;

        const threadId = selectedContact.id;

        const cleanup = ChatService.connectToThread(threadId, (incomingMessage) => {
            // Ensure the incoming message is for the current thread
            if (incomingMessage.threadId !== threadId) return;

            setMessages((prev) => [
                ...prev,
                {
                    id: incomingMessage.id,
                    threadId: incomingMessage.threadId,
                    content: incomingMessage.content,
                    role: incomingMessage.role,
                    createdAt: new Date(incomingMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);

            // Clear and enable input when assistant message arrives
            if (incomingMessage.role === 'assistant') {
                setNewMessage('');
                setIsSending(false);
            }
        });

        return cleanup;
    }, [selectedContact]);

    return (
        <div className="flex h-full bg-gray-50">
            {/* Channels Sidebar */}
            <div className="w-20 p-3 space-y-4 bg-white border-r md:w-52">
                <h4 className="hidden font-semibold text-center md:block">Channels</h4>
                <div className="flex flex-col items-center gap-3 md:items-start">
                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'all' && 'bg-blue-100 text-blue-600'
                        )}
                        onClick={() => setSelectedChannel('all')}
                        title="All Channels"
                    >
                        <FaGlobe className="text-xl text-blue-500" />
                        <span className="hidden md:inline">All</span>
                    </button>
                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'whatsapp' && 'bg-green-100 text-green-600'
                        )}
                        onClick={() => setSelectedChannel('whatsapp')}
                        title="WhatsApp"
                    >
                        <FaWhatsapp className="text-xl text-green-500" />
                        <span className="hidden md:inline">WhatsApp</span>
                    </button>
                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'web' && 'bg-purple-100 text-purple-600'
                        )}
                        onClick={() => setSelectedChannel('web')}
                        title="ChatBot"
                    >
                        <FaRobot className="text-xl text-purple-500" />
                        <span className="hidden md:inline">ChatBot</span>
                    </button>
                </div>
            </div>

            {/* Contacts List */}
            <div className="w-full p-2 bg-white border-r md:w-64">
                <div className="p-2 mb-2 border-b">
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full p-2 text-sm border rounded"
                    />
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                    {contacts.length === 0 && (
                        <p className="mt-10 text-center text-gray-500">No contacts found.</p>
                    )}
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className={cn(
                                'p-3 rounded-md cursor-pointer hover:bg-gray-50 flex items-center gap-3',
                                selectedContact?.id === contact.id && 'bg-gray-100'
                            )}
                            onClick={() => setSelectedContact(contact)}
                        >
                            <div className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                                {contact.name.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate">{contact.name || "Unknown"}</div>
                                <div className="text-xs truncate text-muted-foreground">
                                    {contact.lastMessage}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">{contact.time}</div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col flex-1 bg-white">
                {/* Chat Header */}
                {selectedContact && (
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                                {selectedContact.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold">{selectedContact.name}</div>
                                {/* <div className="flex items-center gap-1 text-xs text-green-500">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Online
                                </div> */}
                            </div>
                        </div>
                        <div>
                            <select className="p-2 text-sm border rounded">
                                <option>Unassigned</option>
                                <option>My Team</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 space-y-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'max-w-[80%] px-3 py-1 relative mt-4',
                                message.role === 'user'
                                    ? 'bg-[#E9E7F9] text-[#5A47A4] self-start mr-auto rounded-lg rounded-tl-none'
                                    : 'bg-[#5A47A4] text-white self-end ml-auto rounded-lg rounded-tr-none'
                            )}
                        >
                            <div>{message.content}</div>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs opacity-70">{message.createdAt}</span>
                                {message.role === 'assistant' && (
                                    <span className="text-xs">
                                        {message.status === 'sending'
                                            ? '🕒'
                                            : message.status === 'sent'
                                                ? '✓'
                                                : message.status === 'delivered'
                                                    ? '✓✓'
                                                    : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Type a message..."
                            disabled={isSending}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isSending || !newMessage.trim()}
                            className="p-3 text-white bg-green-500 rounded-lg disabled:opacity-50"
                            title="Send Message"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationPage;
