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
    channel: 'web' | 'whatsapp' | 'all';
    customer: Customer;
    currentHandler: 'bot' | 'agent';
    assignee: string;
    lastMessage?: {
        content: string,
        role: string,
        createdAt: string
    }
}

export interface Message {
    id: string;
    threadId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ContactHeader {
    id: string;
    name: string;
    phone: string;
    channel: 'web' | 'whatsapp' | 'all';
    lastMessage: string;
    lastMessageRole?: 'user' | 'assistant';
    currentHandler: 'bot' | 'agent';
    assignee: string;
    createdAt: string;
    time?: string;
}