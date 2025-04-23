import { generateLeads } from "./helpers/generateLeads";

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface Lead {
    id: number;
    name: string;
    contact: Contact;
    stage: string;
    expectedRevenue: number;
    priority: 'low' | 'medium' | 'high';
}

export interface NewLeadData {
    name: string;
    contactId: number;
    expectedRevenue: number;
    priority: 'low' | 'medium' | 'high';
    stage: string;
}

export const OpportunityService = {
    getStages: (): string[] => {
        return ['New', 'Qualified', 'Proposition', 'Won', 'Lost'];
    },

    getContacts: (): Contact[] => {
        return [
            { id: 1, name: 'John Smith', email: 'john@example.com', phone: '123-456-7890' },
            { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '234-567-8901' },
            { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '345-678-9012' },
            { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '456-789-0123' },
            { id: 5, name: 'Robert Wilson', email: 'robert@example.com', phone: '567-890-1234' },
        ];
    },

    getLeads: (): Lead[] => {
        const contacts = OpportunityService.getContacts();
        return generateLeads(contacts);
    },

    createLead: (leadData: NewLeadData): Promise<Lead> => {
        const contacts = OpportunityService.getContacts();
        const newLead: Lead = {
            id: Math.max(0, ...OpportunityService.getLeads().map(l => l.id)) + 1,
            name: leadData.name,
            contact: contacts.find(c => c.id === leadData.contactId)!,
            stage: leadData.stage,
            expectedRevenue: leadData.expectedRevenue,
            priority: leadData.priority
        };
        return Promise.resolve(newLead);
    },

    createContact: (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
        const newContact: Contact = {
            id: Math.max(0, ...OpportunityService.getContacts().map(c => c.id)) + 1,
            ...contactData
        };
        return Promise.resolve(newContact);
    },

    updateLeadStage: (leadId: number, newStage: string): Promise<boolean> => {
        console.log(`Updating lead ${leadId} to stage ${newStage}`);
        return Promise.resolve(true);
    }
};