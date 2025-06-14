import { useEffect, useState, useRef, useCallback } from 'react';
import { FaWhatsapp, FaRobot, FaPaperPlane, FaGlobe } from 'react-icons/fa';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ChatService from '@/services/ChatService';
import { toast } from 'react-toastify';
import { ChatHead, Message } from '@/types/Chat';
import { FaTimes } from 'react-icons/fa';
import { UserService } from '@/services/UserService';
import { User } from '@/types/User';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChevronsUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface Contact {
    id: string;
    name: string;
    phone: string;
    channel: string;
    lastMessage: string;
    lastMessageRole?: 'user' | 'assistant';
    currentHandler: 'bot' | 'agent';
    assignee: string;
    createdAt: string;
    time?: string;
}

const CommunicationPage = () => {
    const [selectedChannel, setSelectedChannel] = useState('all');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [unreadThreads, setUnreadThreads] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<string>('');
    const [isFollowUp, setIsFollowUp] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat heads whenever selectedChannel changes
    const fetchChatHeads = useCallback(async () => {
        const companyId = localStorage.getItem('selectedCompany');
        if (!companyId) {
            toast.error('Company ID not found');
            return;
        }

        try {
            const chatHeads: ChatHead[] = await ChatService.getChatHeads(companyId, selectedChannel);
            const formattedContacts: Contact[] = chatHeads.map((head) => ({
                id: head.id,
                name: head.customer.name || head.customer.phone,
                phone: head.customer.phone,
                lastMessage: head.lastMessage?.content || '',
                lastMessageRole: head.lastMessage?.role as 'user' | 'assistant' | undefined,
                channel: head.channel,
                currentHandler: head.currentHandler,
                assignee: head.assignee,
                time: head.lastMessage?.createdAt,
                createdAt: head.lastMessage?.createdAt
                    ? formatTime(head.lastMessage.createdAt)
                    : '',
            }));

            formattedContacts.sort((a, b) => {
                const timeA = a.time ? new Date(a.time).getTime() : 0;
                const timeB = b.time ? new Date(b.time).getTime() : 0;
                return timeB - timeA;
            });

            setContacts(formattedContacts);

            // Update selected contact
            if (selectedContact) {
                const stillExists = formattedContacts.some(c => c.id === selectedContact.id);
                if (!stillExists) {
                    setSelectedContact(null);
                    setMessages([]);
                }
            } else if (formattedContacts.length > 0) {
                setSelectedContact(formattedContacts[0]);
            }

            // ✅ Subscribe to all threads for real-time updates
            formattedContacts.forEach((head) => {
                ChatService.joinThread(head.id, (message: Message) => {
                    // Update chat head
                    setContacts((prev) =>
                        prev.map((c) =>
                            c.id === message.threadId
                                ? {
                                    ...c,
                                    lastMessage: message.content,
                                    lastMessageRole: message.role as 'user' | 'assistant',
                                    createdAt: formatTime(message.createdAt)
                                }
                                : c
                        )
                    );

                    // Append message only if currently selected and not already present
                    if (selectedContact?.id === message.threadId) {
                        setMessages((prev) => {
                            const alreadyExists = prev.some((msg) => msg.id === message.id); // or msg.msgId

                            if (alreadyExists) return prev;

                            const formattedMessage = {
                                ...message,
                                createdAt: formatTime(message.createdAt)
                            };

                            return [...prev, formattedMessage];
                        });
                    }
                });
            });

        } catch (error) {
            console.error(error);
            toast.error('Failed to load contacts');
        }
    }, [selectedChannel, selectedContact]);

    useEffect(() => {
        fetchChatHeads();
    }, [fetchChatHeads]);

    // Fetch chat history when selected contact changes
    useEffect(() => {
        if (!selectedContact) {
            setMessages([]);
            return;
        }

        const fetchChatHistory = async () => {
            try {
                const chatMessages = await ChatService.getChatHistory(selectedContact.id, 0);
                const formattedMessages = chatMessages.map((msg: Message) => ({
                    id: msg.id,
                    threadId: selectedContact.id,
                    role: msg.role,
                    content: msg.content,
                    createdAt: formatTime(msg.createdAt),
                    status: msg.status,
                }));

                setMessages(formattedMessages.reverse());

                // Mark as read when opening
                setUnreadThreads(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(selectedContact.id);
                    return newSet;
                });
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
                toast.error('Failed to load chat history');
            }
        };

        fetchChatHistory();
    }, [selectedContact]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Socket connection for real-time updates
    useEffect(() => {
        const companyId = localStorage.getItem('selectedCompany');
        if (!companyId) return;

        // Subscribe to company chat events
        ChatService.subscribeToChatSocketEvents(companyId);

        const handleNewMessage = (message: Message) => {
            // Update contacts list with new message and move to top
            setContacts(prev => {
                const contactIndex = prev.findIndex(c => c.id === message.threadId);
                if (contactIndex === -1) {
                    // If this is a new thread, refresh the list
                    fetchChatHeads();
                    return prev;
                }

                const updatedContacts = [...prev];
                const contact = updatedContacts[contactIndex];

                // Update the contact with new message info
                const updatedContact = {
                    ...contact,
                    lastMessage: message.content,
                    lastMessageRole: message.role,
                    createdAt: formatTime(message.createdAt)
                };

                // Remove from current position and add to top
                updatedContacts.splice(contactIndex, 1);
                updatedContacts.unshift(updatedContact);

                return updatedContacts;
            });

            // Mark as unread if not the current chat
            if (selectedContact?.id !== message.threadId) {
                setUnreadThreads(prev => new Set(prev).add(message.threadId));
            }
        };

        const handleNewThread = (thread: { id: string; companyId: string }) => {
            if (thread.companyId === companyId) {
                fetchChatHeads();
            }
        };

        // Setup message and thread listeners
        const cleanupMessageListener = ChatService.onNewMessage(handleNewMessage);
        const cleanupThreadListener = ChatService.onNewThread(handleNewThread);

        return () => {
            cleanupMessageListener();
            cleanupThreadListener();
        };
    }, [selectedChannel, selectedContact, fetchChatHeads, contacts]);

    useEffect(() => {
        const companyId = localStorage.getItem('selectedCompany');
        if (companyId) {
            ChatService.subscribeToChatSocketEvents(companyId);

            return () => {
                ChatService.cleanupAllListeners();
            };
        }
    }, []);

    useEffect(() => {
        const getCompanyUsers = async () => {
            const companyId = localStorage.getItem('selectedCompany');
            if (companyId) {
                const users = await UserService.getUsers(companyId);
                setUsers(users);
            }
        };
        getCompanyUsers();
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending || !selectedContact) return;
        setIsSending(true);
        setNewMessage('');

        try {
            if (selectedContact.channel === 'whatsapp') {
                await ChatService.sendWhatsAppMessage(selectedContact.phone, newMessage);
            } else if (selectedContact.channel === 'web') {
                await ChatService.sendWebMessage(selectedContact.id, newMessage);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setNewMessage(newMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectContact = (contact: Contact) => {
        setUnreadThreads(prev => {
            const newSet = new Set(prev);
            newSet.delete(contact.id);
            return newSet;
        });
        setSelectedContact(contact);
    };

    const renderContacts = () => {
        const filteredContacts = contacts
            // .filter(contact => contact.lastMessage) // Only show contacts with messages
            .filter(contact => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                    contact.name.toLowerCase().includes(query) ||
                    contact.phone.toLowerCase().includes(query)
                );
            });

        if (filteredContacts.length === 0) {
            return <p className="mt-10 text-center text-gray-500">No contacts found.</p>;
        }

        return filteredContacts.map((contact) => (
            <div
                key={contact.id}
                className={cn(
                    'p-3 rounded-md cursor-pointer hover:bg-gray-50 flex items-center gap-3 relative w-[19rem]',
                    selectedContact?.id === contact.id && 'bg-gray-100',
                    unreadThreads.has(contact.id) && 'bg-blue-50'
                )}
                onClick={() => handleSelectContact(contact)}
            >
                {/* Avatar */}
                <div className="relative flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                    {contact.name?.charAt(0) || '?'}
                    {unreadThreads.has(contact.id) && (
                        <span className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -top-0.5 -right-0.5 border border-white"></span>
                    )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 overflow-hidden">
                    {/* Top Row: Name + Time */}
                    <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{contact.name || 'Unknown'}</div>
                        <div className="pl-2 text-xs text-gray-500 whitespace-nowrap">{contact.createdAt}</div>
                    </div>
                    {/* Bottom Row: Last Message */}
                    <div className="text-xs truncate text-muted-foreground">
                        {contact.lastMessage}
                    </div>
                </div>
            </div>
        ));
    };

    const handleMarkAsDone = async () => {
        if (!selectedContact?.id) {
            toast.warn('No contact selected');
            return;
        }

        const confirm = window.confirm('Are you sure to mark this conversation as done?');
        if (!confirm) return;

        try {
            // First send the closing message
            setIsSending(true);
            const closingMessage = 'Thank you for contacting us. Have a nice day!';

            if (selectedContact.channel === 'whatsapp') {
                await ChatService.sendWhatsAppMessage(selectedContact.phone, closingMessage);
            } else if (selectedContact.channel === 'web') {
                await ChatService.sendWebMessage(selectedContact.id, closingMessage);
            }

            // Then mark as done
            await ChatService.markAsDone(selectedContact.id);

            toast.success('Conversation marked as done');

            // Update UI
            setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
            setSelectedContact(null);
            setMessages([]);
        } catch (error) {
            console.error('Failed to mark as done:', error);
            toast.error('Failed to complete the operation');
        } finally {
            setIsSending(false);
        }
    };

    const handleFollowUp = async () => {
        console.log('Follow up clicked');
        setIsFollowUp(prev => !prev);
    }

    //Helper method to format date
    const formatTime = (dateInput: string | number | Date): string => {
        return new Date(dateInput).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };


    // Update this when selectedContact changes
    useEffect(() => {
        if (selectedContact) {
            const assignee = selectedContact.currentHandler === 'bot' ? '' : selectedContact.assignee || '';
            setSelectedAssignee(assignee);
        }
    }, [selectedContact]);

    // Add this handler function
    const handleAssigneeChange = async (value: string) => {
        const newAssignee = value === 'unassigned' ? '' : value;

        if (!selectedContact?.id) return;

        try {
            setSelectedAssignee(newAssignee);

            let chatHandler = 'bot';
            let assignedAgentId = null;

            if (newAssignee) {
                chatHandler = 'agent';
                assignedAgentId = newAssignee;
            }

            await ChatService.assignChat(selectedContact.id, chatHandler, assignedAgentId);

            setContacts(prev =>
                prev.map(c =>
                    c.id === selectedContact.id
                        ? { ...c, assignee: newAssignee }
                        : c
                )
            );

            toast.success('Assignee updated');
        } catch (error) {
            console.error('Failed to update assignee:', error);
            toast.error('Failed to update assignee');
            setSelectedAssignee(selectedContact.assignee || '');
        }
    };




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
            <div className="w-full p-2 bg-white border-r md:w-[20rem]">
                <div className="relative p-2 mb-2 border-b">
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full p-2 pl-3 pr-8 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-5 top-1/2 hover:text-gray-600 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <FaTimes className="w-4 h-4 transition-transform hover:scale-110" />
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                    {renderContacts()}
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col flex-1 bg-white min-w-[480px]">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                                    {selectedContact.name.charAt(0)}
                                    {unreadThreads.has(selectedContact.id) && (
                                        <span className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -top-0.5 -right-0.5 border border-white"></span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold">{selectedContact.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {selectedContact.channel === 'whatsapp' ? (
                                            <span className="flex items-center gap-1">
                                                <FaWhatsapp className="text-green-500" />
                                                WhatsApp
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <FaRobot className="text-purple-500" />
                                                ChatBot
                                            </span>
                                        )}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <ChevronsUp size={18} className={isFollowUp ? "text-green-500" : "text-gray-400"} onClick={handleFollowUp} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Toggle Follow Up</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-md w-[8rem] text-sm">
                                    <Select
                                        value={selectedAssignee || 'unassigned'}
                                        onValueChange={handleAssigneeChange}
                                        disabled={!selectedContact}
                                    >
                                        <SelectTrigger className="flex items-center justify-between max-w-[8rem] w-full p-2 text-sm border rounded [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0">
                                            <SelectValue className="truncate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>



                                {/* Mark as Done button */}
                                <button
                                    onClick={handleMarkAsDone}
                                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                    Mark as Done
                                </button>


                            </div>
                        </div>


                        {/* Messages */}
                        {/* <ScrollArea className="flex-1 px-4 space-y-3 bg-green-300"> */}
                        {/* <ScrollArea className="flex-1 px-4 space-y-3 bg-[url('/chat-background.png')] bg-cover bg-center [background-opacity:0.1]"> */}
                        <ScrollArea className="relative flex-1 px-4 space-y-3 bg-[url('/chat-background.jpg')] bg-cover bg-center">

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'max-w-[80%] px-3 py-2 relative mt-4 w-fit',
                                        message.role === 'user'
                                            ? 'bg-gray-50 text-blue-950 self-start mr-auto rounded-lg rounded-tl-none drop-shadow-md'
                                            : 'bg-blue-900 text-white self-end ml-auto rounded-lg rounded-tr-none drop-shadow-md',
                                        message.status === 'failed' && 'opacity-70'
                                    )}
                                >
                                    <div className='mr-4'>{message.content}</div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-xs opacity-70">{message.createdAt}</span>
                                        {message.role === 'user' && (
                                            <span className="text-xs">
                                                {message.status === 'sending' && '🕒'}
                                                {message.status === 'failed' && '❌'}
                                                {message.status === 'sent' && '✓'}
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
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <FaRobot className="mx-auto mb-2 text-4xl text-gray-400" />
                            <p className="text-gray-500">Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationPage;