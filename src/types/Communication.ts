import { Customer } from "./Customer";

export interface Contact {
    id: string;
    name: string;
    email?: string;
    code?: string;
    phone?: string;
    location?: string;
    isCompany?: boolean;
}
export interface ChatHead {
    id: string;
    channel: ChannelType;
    customer: Customer;
    currentHandler: CurrentHandlerType;
    assignee: string;
    lastMessage?: {
        content: string;
        role: string;
        createdAt: string;
    }
}

export interface Message {
    id: string;
    threadId: string;
    role: RoleType;
    content: string;
    createdAt: string;
    status?: StatusType;
}

export interface ContactHeader {
    id: string;
    name: string;
    phone: string;
    channel: ChannelType;
    lastMessage: string;
    lastMessageRole?: RoleType;
    currentHandler: CurrentHandlerType;
    assignee: string;
    createdAt: string;
    time?: string;
}

export type ChannelType = 'all' | 'whatsapp' | 'web';
export type CurrentHandlerType = 'bot' | 'agent';
export type RoleType = 'user' | 'assistant';
export type StatusType = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';