import api from './api';

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
        return res.data;
    },

    updateCompanyPlan: async (companyId: number, planId: string) => {
        const res = await api.patch(`/company/update-plan/${companyId}`, { planId });
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
};
