export interface Company {
    id: string;
    name: string;
    industry: number;
    location?: string;
    size: number;
    planId: string;
    chatbotInstructions: string;
    isActive: boolean;
    isDefault: boolean;
}

export interface CompanyDropdownOption {
    id: string;
    name: string;
    isDefault: boolean;
}