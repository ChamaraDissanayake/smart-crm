export interface Company {
    id: number;
    name: string;
    industry: number;
    location?: string;
    size: number;
    planId: string;
    isActive: boolean;
    isDefault: boolean;
}

export interface CompanyDropdownOption {
    id: number;
    name: string;
    isDefault: boolean;
}