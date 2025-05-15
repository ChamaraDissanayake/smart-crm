import api from './Api';

export const subscriptionPlansService = {
    getAllPlans: async () => {
        const res = await api.get('/subscriptions');
        return res.data;
    },

    subscribeToPlan: async (companyId: string, planId: string, billingCycle: string) => {
        const res = await api.post('/subscriptions/subscribe', { companyId, planId, billingCycle });
        return res.data;
    },
}