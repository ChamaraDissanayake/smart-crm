export interface CompanyAPIResponse {
    id: number;
    name: string;
    industry: number;
    location: string;
    size: number;
    plan_id: string;
    is_active: number;
    is_deleted: number;
    created_at: string;
    updated_at: string;
}

export interface CompanyDropdownOption {
    id: number;
    name: string;
}