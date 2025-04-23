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
        // return [
        //     { id: 1, name: 'Website Redesign Project', contact: contacts[0], stage: 'New', expectedRevenue: 15000, priority: 'high' },
        //     { id: 2, name: 'E-commerce Platform', contact: contacts[1], stage: 'Qualified', expectedRevenue: 25000, priority: 'medium' },
        //     { id: 3, name: 'Mobile App Development', contact: contacts[2], stage: 'Proposition', expectedRevenue: 35000, priority: 'high' },
        //     { id: 4, name: 'Digital Marketing Campaign', contact: contacts[3], stage: 'New', expectedRevenue: 10000, priority: 'low' },
        //     { id: 5, name: 'CRM Implementation', contact: contacts[4], stage: 'Qualified', expectedRevenue: 20000, priority: 'medium' },
        //     { id: 6, name: 'Cloud Migration', contact: contacts[0], stage: 'Won', expectedRevenue: 40000, priority: 'high' },
        //     { id: 7, name: 'Data Analytics', contact: contacts[1], stage: 'Lost', expectedRevenue: 18000, priority: 'medium' },
        // ];
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

    updateLeadStage: (leadId: number, newStage: string): Promise<boolean> => {
        console.log(`Updating lead ${leadId} to stage ${newStage}`);
        return Promise.resolve(true);
    }
};