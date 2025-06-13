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
    channel: string;
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