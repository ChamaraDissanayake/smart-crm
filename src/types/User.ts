export interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface UserApi {
    id: string;
    name: string;
    phone: string;
    email: string;
    created_at: string;
    google_id: string;
    is_deleted: boolean;
    is_verified: boolean;
    password: string;
    provider: string;
    updated_at: string;
}