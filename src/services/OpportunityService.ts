import { generateLeads } from "./helpers/GenerateLeads";
import { toast } from 'react-toastify';
import api from './Api';
import { Contact } from "@/types/Communication";
import { CompanyService } from "./CompanyService";

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
    contactId: string;
    expectedRevenue: number;
    priority: 'low' | 'medium' | 'high';
    stage: string;
}

export const OpportunityService = {
    getContacts: (): Contact[] => {
        return [
            { id: '1', name: 'John Smith', email: 'john@example.com', phone: '123-456-7890' },
            { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '234-567-8901' },
            { id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '345-678-9012' },
            { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '456-789-0123' },
            { id: '5', name: 'Robert Wilson', email: 'robert@example.com', phone: '567-890-1234' },
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

    getStages: (): string[] => {
        return ['New', 'Qualified', 'Proposition', 'Won', 'Lost'];
    },

    getCompanyContacts: async (): Promise<Contact[]> => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const { data } = await api.get('/customer/get-customers', {
                params: { companyId, limit: 1000, offset: 0 },
            });
            return data.contacts || [];
        } catch (error) {
            toast.error('Failed to fetch contacts');
            console.error('Error fetching contacts:', error);
            return [];
        }
    },

    getCompanyContactCount: async (): Promise<number> => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const { data } = await api.get('/customer/get-count', {
                params: { companyId },
            });
            return data.customerCount || 0;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return 0;
        }
    },

    createContact: async (contactData: Omit<Contact, 'id'>): Promise<Contact | null> => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const { data } = await api.post('/customer/create-customer', {
                ...contactData,
                companyId
            });
            toast.success('Contact created successfully!');
            return data.customer;
        } catch (error) {
            toast.error('Failed to create contact');
            console.error('Error creating contact:', error);
            return null;
        }
    },

    updateContact: async (contactId: string, contactData: Omit<Contact, 'id'>): Promise<Contact | null> => {
        try {
            const companyId = await CompanyService.getCompanyId();
            const { data } = await api.post(`/customer/update-customer`, {
                id: contactId,
                companyId,
                ...contactData
            });
            toast.success('Contact updated successfully!');
            return data.customer;
        } catch (error) {
            toast.error('Failed to update contact');
            console.error('Error updating contact:', error);
            return null;
        }
    },

    deleteContact: async (contactId: string): Promise<boolean> => {
        try {
            await api.delete(`/customer/delete-customer/${contactId}`);
            toast.success('Contact deleted successfully!');
            return true;
        } catch (error) {
            toast.error('Failed to delete contact');
            console.error('Error deleting contact:', error);
            return false;
        }
    },

    updateLeadStage: (leadId: number, newStage: string): Promise<boolean> => {
        console.log(`Updating lead ${leadId} to stage ${newStage}`);
        return Promise.resolve(true);
    }
};
