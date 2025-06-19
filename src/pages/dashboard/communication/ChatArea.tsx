import { FaWhatsapp, FaRobot, FaPaperPlane, FaGlobe, FaTimes } from 'react-icons/fa';
import { ChevronsUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Message, ContactHeader } from '@/types/Communication';
import { User } from '@/types/User';
import { useNavigate } from 'react-router-dom';
import { LinkifyMessage } from '@/utils/linkifyOptions';
import { AttachmentHandler, PendingAttachment } from './AttachmentHandler';
import { useState } from 'react';

interface ChatAreaProps {
    // Channel Sidebar
    selectedChannel: string;
    unreadCounts: {
        all: number;
        whatsapp: number;
        web: number;
    };
    onChannelChange: (channel: string) => void;

    // Contact List
    filteredContacts: ContactHeader[];
    selectedContact: ContactHeader | null;
    unreadThreads: Set<string>;
    searchQuery: string;
    onSelectContact: (contact: ContactHeader) => void;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;

    // Chat Header
    users: User[];
    selectedAssignee: string;
    isFollowUp: boolean;
    onAssigneeChange: (value: string) => void;
    onMarkAsDone: () => void;
    onToggleFollowUp: () => void;

    // Messages
    messages: Message[];
    newMessage: string;
    isSending: boolean;
    onMessageChange: (value: string) => void;
    onSendMessage: (message: string, attachments: PendingAttachment[]) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatArea = ({
    selectedChannel,
    unreadCounts,
    onChannelChange,
    filteredContacts,
    selectedContact,
    unreadThreads,
    searchQuery,
    onSelectContact,
    onSearchChange,
    onClearSearch,
    users,
    selectedAssignee,
    isFollowUp,
    onAssigneeChange,
    onMarkAsDone,
    onToggleFollowUp,
    messages,
    newMessage,
    isSending,
    onMessageChange,
    onSendMessage,
    messagesEndRef,
}: ChatAreaProps) => {

    const navigate = useNavigate();
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

    const handleContactClick = () => {
        if (selectedContact) {
            navigate(`/dashboard/contacts?id=${selectedContact.customerId}`);
        }
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Channel Sidebar */}
            <div className="w-20 p-3 space-y-4 bg-white border-r md:w-52">
                <h4 className="hidden font-semibold text-center md:block">Channels</h4>
                <div className="flex flex-col items-center gap-3 md:items-start">
                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'all' && 'bg-blue-100 text-blue-600'
                        )}
                        onClick={() => onChannelChange('all')}
                        title="All Channels"
                    >
                        <div className="relative">
                            <FaGlobe className="text-xl text-blue-500" />
                            {unreadCounts.all > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] leading-4 text-white bg-red-500 rounded-full flex items-center justify-center border border-white">
                                    {unreadCounts.all}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline">All</span>
                    </button>

                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'whatsapp' && 'bg-green-100 text-green-600'
                        )}
                        onClick={() => onChannelChange('whatsapp')}
                        title="WhatsApp"
                    >
                        <div className="relative">
                            <FaWhatsapp className="text-xl text-green-500" />
                            {unreadCounts.whatsapp > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] leading-4 text-white bg-red-500 rounded-full flex items-center justify-center border border-white">
                                    {unreadCounts.whatsapp}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline">WhatsApp</span>
                    </button>

                    <button
                        className={cn(
                            'p-2 rounded-full md:rounded-md md:w-full md:flex md:items-center md:gap-2',
                            selectedChannel === 'web' && 'bg-purple-100 text-purple-600'
                        )}
                        onClick={() => onChannelChange('web')}
                        title="ChatBot"
                    >
                        <div className="relative">
                            <FaRobot className="text-xl text-purple-500" />
                            {unreadCounts.web > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] leading-4 text-white bg-red-500 rounded-full flex items-center justify-center border border-white">
                                    {unreadCounts.web}
                                </span>
                            )}
                        </div>
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
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={onClearSearch}
                            className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-5 top-1/2 hover:text-gray-600 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <FaTimes className="w-4 h-4 transition-transform hover:scale-110" />
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                    {filteredContacts.length === 0 ? (
                        <p className="mt-10 text-center text-gray-500">No contacts found.</p>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={cn(
                                    'p-3 rounded-md cursor-pointer hover:bg-gray-50 flex items-center gap-3 relative w-[19rem]',
                                    selectedContact?.id === contact.id && 'bg-gray-100',
                                    unreadThreads.has(contact.id) && 'bg-blue-50'
                                )}
                                onClick={() => onSelectContact(contact)}
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                                    {contact.name?.charAt(0) || '?'}
                                    {unreadThreads.has(contact.id) && selectedContact?.id !== contact.id && (
                                        <span className="absolute w-2.5 h-2.5 bg-red-500 rounded-full -top-0.5 -right-0.5 border border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium truncate">{contact.name || 'Unknown'}</div>
                                        <div className="pl-2 text-xs text-gray-500 whitespace-nowrap">{contact.createdAt}</div>
                                    </div>
                                    <div className="text-xs truncate text-muted-foreground">
                                        {contact.lastMessage}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 bg-white min-w-[590px]">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={handleContactClick} // 👉 replace with your actual click handler
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                                    {selectedContact.name.charAt(0)}
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
                                                    <ChevronsUp
                                                        size={18}
                                                        className={isFollowUp ? "text-green-500" : "text-gray-400"}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent parent click
                                                            onToggleFollowUp();
                                                        }}
                                                    />
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
                                        onValueChange={onAssigneeChange}
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

                                <button
                                    onClick={onMarkAsDone}
                                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                    Mark as Done
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
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
                                    <LinkifyMessage
                                        content={message.content}
                                        className="mr-4 break-words"
                                    />
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
                        {/* <div className="p-3 border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => onMessageChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Type a message..."
                                    disabled={isSending}
                                />
                                <button
                                    onClick={onSendMessage}
                                    disabled={isSending || !newMessage.trim()}
                                    className="p-3 text-white bg-green-500 rounded-lg disabled:opacity-50"
                                    title="Send Message"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div> */}

                        {/* Message Input Area */}
                        <div className="relative p-3 space-y-2 border-t">
                            <div className='absolute bottom-[21px] left-[12px]'>
                                <AttachmentHandler onAttachmentsChange={setPendingAttachments} />
                            </div>

                            <div className="flex items-center gap-2 ml-[2.5rem]">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => onMessageChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage(newMessage, pendingAttachments)}
                                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                    disabled={isSending}
                                />

                                <button
                                    onClick={() => {
                                        console.log('Attachments to send:', pendingAttachments);
                                        console.log('Message:', newMessage);

                                        onSendMessage(newMessage, pendingAttachments); // ✅ Pass attachments
                                        setPendingAttachments([]);
                                    }}
                                    disabled={isSending || (!newMessage.trim() && pendingAttachments.length === 0)}
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