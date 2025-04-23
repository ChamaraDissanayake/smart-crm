import api from './api';

export const subscriptionPlansService = {
    getAllPlans: async () => {
        const res = await api.get('/subscriptions');
        return res.data;
    },

    subscribeToPlan: async (companyId: number, planId: string, billingCycle: string) => {
        const res = await api.post('/subscriptions/subscribe', { companyId, planId, billingCycle });
        return res.data;
    },
}