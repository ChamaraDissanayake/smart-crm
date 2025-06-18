import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { ChatHead, ContactHeader, Message, RoleType } from '@/types/Communication';
import { UserService } from '@/services/UserService';
import { User } from '@/types/User';
import { formatAndSortChatHeads, formatTime } from '@/utils/chat';
import { CompanyService } from '@/services/CompanyService';
import { ChatArea } from './ChatArea';
import ChatService from '@/services/ChatService';
import { useDebounce } from '@/hooks/useDebounce';

const CommunicationPage = () => {
    const [selectedChannel, setSelectedChannel] = useState('all');
    const [contacts, setContacts] = useState<ContactHeader[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactHeader[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactHeader | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [unreadThreads, setUnreadThreads] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<string>('');
    const [isFollowUp, setIsFollowUp] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Fetch chat heads whenever selectedChannel changes
    const fetchChatHeads = useCallback(async () => {
        const companyId = await CompanyService.getCompanyId();
        if (!companyId) {
            toast.error('Company ID not found');
            return;
        }

        try {
            let formattedContacts = contacts;
            if (formattedContacts.length === 0) {
                const chatHeads: ChatHead[] = await ChatService.getChatHeads(companyId, selectedChannel);
                formattedContacts = formatAndSortChatHeads(chatHeads);
                setContacts(formattedContacts);
            }

            // Update selected contact
            if (selectedContact) {
                const stillExists = formattedContacts.some(c => c.id === selectedContact.id);
                if (!stillExists) {
                    setSelectedContact(null);
                    setMessages([]);
                }
            } else if (!selectedContact && formattedContacts.length > 0) {
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
                                    lastMessageRole: message.role as RoleType,
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
    }, [contacts, selectedChannel, selectedContact]);

    useEffect(() => {
        if (filteredContacts.length === 0 && contacts.length > 0 && selectedContact === null) {
            console.log('Do not reload');
        } else {
            fetchChatHeads();
        }
    }, [filteredContacts, contacts, selectedContact, fetchChatHeads]);

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
        async function messageHandle() {
            const companyId = await CompanyService.getCompanyId();
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
                if (selectedContactRef.current?.id !== message.threadId) {
                    setUnreadThreads(prev => new Set(prev).add(message.threadId));
                }
            };

            const handleNewThread = (thread: ChatHead & { companyId: string }) => {
                if (thread.companyId !== companyId) return;

                setContacts(prev => {
                    // Check if the thread already exists
                    const alreadyExists = prev.some(c => c.id === thread.id);
                    if (alreadyExists) return prev;

                    const formattedContact: ContactHeader = {
                        id: thread.id,
                        name: thread.customer.name || thread.customer.phone,
                        phone: thread.customer.phone,
                        customerId: thread.customer.id,
                        lastMessage: thread.lastMessage?.content || '',
                        lastMessageRole: thread.lastMessage?.role as RoleType | undefined,
                        channel: thread.channel,
                        currentHandler: thread.currentHandler,
                        assignee: thread.assignee,
                        time: thread.lastMessage?.createdAt,
                        createdAt: thread.lastMessage?.createdAt
                            ? formatTime(thread.lastMessage.createdAt)
                            : '',
                    };

                    const updatedContacts = [formattedContact, ...prev];

                    // Sort by latest message time
                    updatedContacts.sort((a, b) => {
                        const timeA = a.time ? new Date(a.time).getTime() : 0;
                        const timeB = b.time ? new Date(b.time).getTime() : 0;
                        return timeB - timeA;
                    });

                    return updatedContacts;
                });

                // Auto-select if nothing is selected
                setSelectedContact(prev => {
                    if (prev) return prev;
                    return {
                        id: thread.id,
                        name: thread.customer.name || thread.customer.phone,
                        phone: thread.customer.phone,
                        customerId: thread.customer.id,
                        lastMessage: thread.lastMessage?.content || '',
                        lastMessageRole: thread.lastMessage?.role as RoleType | undefined,
                        channel: thread.channel,
                        currentHandler: thread.currentHandler,
                        assignee: thread.assignee,
                        time: thread.lastMessage?.createdAt,
                        createdAt: thread.lastMessage?.createdAt
                            ? formatTime(thread.lastMessage.createdAt)
                            : '',
                    };
                });

                // ✅ Join the new thread socket room to receive messages in real-time
                ChatService.joinThread(thread.id, (message: Message) => {
                    setContacts(prev =>
                        prev.map(c =>
                            c.id === message.threadId
                                ? {
                                    ...c,
                                    lastMessage: message.content,
                                    lastMessageRole: message.role as RoleType,
                                    createdAt: formatTime(message.createdAt),
                                    time: message.createdAt
                                }
                                : c
                        )
                    );

                    if (selectedContact?.id === message.threadId) {
                        setMessages(prev => {
                            const alreadyExists = prev.some((msg) => msg.id === message.id);
                            if (alreadyExists) return prev;

                            return [...prev, {
                                ...message,
                                createdAt: formatTime(message.createdAt)
                            }];
                        });
                    }
                });
            };


            // Setup message and thread listeners
            const cleanupMessageListener = ChatService.onNewMessage(handleNewMessage);
            const cleanupThreadListener = ChatService.onNewThread(handleNewThread);

            return () => {
                cleanupMessageListener();
                cleanupThreadListener();
            };
        }
        messageHandle();
    }, [selectedChannel, selectedContact, fetchChatHeads, contacts, filteredContacts]);

    useEffect(() => {
        async function initializeSocket() {
            const companyId = await CompanyService.getCompanyId();
            if (companyId) {
                ChatService.subscribeToChatSocketEvents(companyId);

                return () => {
                    ChatService.cleanupAllListeners();
                };
            }
        }
        initializeSocket();
    }, []);

    useEffect(() => {
        const getCompanyUsers = async () => {
            const companyId = await CompanyService.getCompanyId();
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

    const handleSelectContact = (contact: ContactHeader) => {
        setUnreadThreads(prev => {
            const newSet = new Set(prev);
            newSet.delete(contact.id);
            return newSet;
        });
        setSelectedContact(contact);
    };

    const selectedContactRef = useRef<ContactHeader | null>(null);
    useEffect(() => {
        selectedContactRef.current = selectedContact;
    }, [selectedContact]);

    useEffect(() => {
        const filtered = contacts
            .filter(contact => selectedChannel === 'all' || contact.channel === selectedChannel)
            .filter(contact => {
                if (!debouncedSearchQuery) return true;
                const query = debouncedSearchQuery.toLowerCase();
                return (
                    contact?.name?.toLowerCase().includes(query) ||
                    contact?.phone?.toLowerCase().includes(query)
                );
            });

        setFilteredContacts(filtered);

        const existsInFiltered = filtered.some(c => c.id === selectedContactRef.current?.id);

        if (!existsInFiltered) {
            setSelectedContact(filtered[0] || null);
        }

        if (filtered.length > 0) {
            if (!existsInFiltered) {
                setSelectedContact(filtered[0]);
            }
        } else {
            if (selectedContactRef.current !== null) {
                setSelectedContact(null);
            }
        }
    }, [contacts, selectedChannel, debouncedSearchQuery]);

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

            await ChatService.assignChat(selectedContact.id, chatHandler, assignedAgentId, selectedContact.channel, selectedContact?.phone);

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

    const unreadCounts = useMemo(() => {
        const counts = {
            all: 0,
            whatsapp: 0,
            web: 0
        };

        for (const contact of contacts) {
            if (unreadThreads.has(contact.id)) {
                counts.all++;
                if (contact.channel === 'whatsapp') counts.whatsapp++;
                if (contact.channel === 'web') counts.web++;
            }
        }

        return counts;
    }, [contacts, unreadThreads]);

    return (
        <ChatArea
            selectedChannel={selectedChannel}
            unreadCounts={unreadCounts}
            onChannelChange={setSelectedChannel}
            filteredContacts={filteredContacts}
            selectedContact={selectedContact}
            unreadThreads={unreadThreads}
            searchQuery={searchQuery}
            onSelectContact={handleSelectContact}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            users={users}
            selectedAssignee={selectedAssignee}
            isFollowUp={isFollowUp}
            onAssigneeChange={handleAssigneeChange}
            onMarkAsDone={handleMarkAsDone}
            onToggleFollowUp={handleFollowUp}
            messages={messages}
            newMessage={newMessage}
            isSending={isSending}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
        />
    );
};

export default CommunicationPage;