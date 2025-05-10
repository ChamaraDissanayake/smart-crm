import { toast } from 'react-toastify';
import api from './Api';

export const CompanyService = {
    // Create Company
    createCompany: async (userId: number, companyData: {
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

    updateCompanyPlan: async (companyId: number, planId: string) => {
        const res = await api.patch(`/company/update-plan/${companyId}`, { planId });
        toast.success('Company details updated successfully!');
        return res.data;
    },

    // Get All Companies for Current User
    getUserCompanies: async () => {
        const res = await api.get('/company/user-companies');
        console.log('Chamara companies', res.data);

        return res.data;
    },

    // Get Specific Company by ID
    getCompanyById: async (companyId: number | string) => {
        const res = await api.get(`/company/${companyId}`);
        return res.data;
    },
};
