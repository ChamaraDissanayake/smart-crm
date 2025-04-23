// Note from Chamara: This is a helper function to generate leads for the opportunityService. Need to delete this when get actual data from api.

import { Contact, Lead } from "../opportunityService";

export const generateLeads = (contacts: Contact[]): Lead[] => {
    const stages = ['New', 'Qualified', 'Proposition', 'Won', 'Lost'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    const projectTypes = [
        'Website', 'Mobile App', 'E-commerce', 'CRM', 'Cloud',
        'Marketing', 'Analytics', 'Integration', 'Consulting', 'Support'
    ];
    const projectDescriptors = [
        'Redesign', 'Implementation', 'Migration', 'Development',
        'Strategy', 'Consulting', 'Optimization', 'Automation'
    ];

    const leads: Lead[] = [];

    for (let i = 1; i <= 1000; i++) {
        const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)] as 'low' | 'medium' | 'high';

        const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
        const descriptor = projectDescriptors[Math.floor(Math.random() * projectDescriptors.length)];
        const projectName = `${projectType} ${descriptor} ${i <= 50 ? 'Project' : 'Initiative'}`;

        // Generate revenue based on project type and priority
        let baseRevenue;
        switch (projectType) {
            case 'Website':
            case 'Marketing':
                baseRevenue = 10000 + Math.random() * 20000;
                break;
            case 'Mobile App':
            case 'E-commerce':
                baseRevenue = 15000 + Math.random() * 30000;
                break;
            case 'Cloud':
            case 'CRM':
                baseRevenue = 20000 + Math.random() * 40000;
                break;
            default:
                baseRevenue = 8000 + Math.random() * 25000;
        }

        // Adjust based on priority
        const revenueMultiplier = randomPriority === 'high' ? 1.5 : randomPriority === 'medium' ? 1.2 : 1;
        const expectedRevenue = Math.round(baseRevenue * revenueMultiplier / 1000) * 1000;

        leads.push({
            id: i,
            name: projectName,
            contact: randomContact,
            stage: randomStage,
            expectedRevenue,
            priority: randomPriority
        });
    }

    return leads;
};
