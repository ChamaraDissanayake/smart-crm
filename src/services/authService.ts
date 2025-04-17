import api from './api';
import Cookies from 'js-cookie';

interface UserData {
    email: string;
    password: string;
    name: string;
    phone?: string;
};

interface LoginResponse {
    token: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
};

interface ApiError extends Error {
    response?: {
        data?: {
            message?: string;
        };
        status?: number;
    };
};

interface CheckEmailResponse {
    exists: boolean;
    message: string;
};

export const AuthService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>('/user/login', { email, password });
            if (response.data.token) {
                Cookies.set('authToken', response.data.token, {
                    expires: 7,
                    secure: import.meta.env.PROD,
                    sameSite: 'strict' as const,
                });
            }
            return response.data;
        } catch (error) {
            const err = error as ApiError;
            throw new Error(err.response?.data?.message || 'Login failed');
        }
    },

    async signUp(userData: UserData): Promise<void> {
        try {
            await api.post('/user/register', userData);
        } catch (error) {
            const err = error as ApiError;
            throw new Error(err.response?.data?.message || 'Registration failed');
        }
    },

    async checkDuplicateEmail(email: string): Promise<CheckEmailResponse> {
        const response = await api.get<CheckEmailResponse>(`/user/check-duplicate-user?email=${encodeURIComponent(email)}`);
        return response.data;
    },

    async resendVerificationEmail(email: string): Promise<void> {
        try {
            console.log('Resending verification email to:', email);

            await api.post('/user/resend-verification-email', { email });
        } catch (error) {
            const err = error as ApiError;
            throw new Error(err.response?.data?.message || 'Verification email send failed');
        }
    },

    logout(): void {
        Cookies.remove('authToken');
        window.location.href = '/login';
    },

    getCurrentUser(): { token: string } | null {
        const token = Cookies.get('authToken');
        return token ? { token } : null;
    },

    async verifyEmail(token: string): Promise<{ isVerified: boolean }> {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/check-user-verification?token=${token}`);
        return res.json();
    }

};