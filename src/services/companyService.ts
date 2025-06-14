import { toast } from 'react-toastify';
import api from './Api';

export const CompanyService = {
    // Create Company
    createCompany: async (userId: string, companyData: {
        name: string;
        industry: string;
        location: string;
        size: string;
    }) => {
        const data = {
            ...companyData,
            userId,
        };
        const res = await api.post('/company', data);
        toast.success('Company created successfully!');
        return res.data;
    },

    setDefaultCompany: async (companyId: string) => {
        try {
            const res = await api.patch(`/company/set-default/${companyId}`);
            toast.success('Default company updated.');
            return res.data;
        } catch (error) {
            toast.error('Failed to update default company.');
            throw error;
        }
    },

    updateCompanyPlan: async (companyId: string, planId: string) => {
        const res = await api.patch(`/company/update-plan/${companyId}`, { planId });
        toast.success('Company details updated successfully!');
        return res.data;
    },

    // Get All Companies for Current User
    getUserCompanies: async () => {
        const res = await api.get('/company/user-companies');
        return res.data;
    },

    // Get Specific Company by ID
    getCompanyById: async (companyId: number | string) => {
        const res = await api.get(`/company/${companyId}`);
        return res.data;
    },

    getCompanyId: async (): Promise<string | null> => {
        for (let i = 0; i < 3; i++) {
            const companyId = localStorage.getItem('selectedCompany');
            if (companyId) {
                return companyId;
            }
            // Wait 500ms before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return null;
    }
};
