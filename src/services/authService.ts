import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from './Api';

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

interface DecodedToken {
    type: string;
    userId: string;
    name: string;
    email: string;
    isVerified?: boolean;
    exp: number;
    iat: number;
}

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
            console.error('Login failed:', error);
            throw error;
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

    async forgotPassword(email: string): Promise<void> {
        try {
            console.log('Sending password reset request for ', email);
            await api.post('/user/request-password-reset', { email });
        } catch (error) {
            const err = error as ApiError;
            throw new Error(err.response?.data?.message || 'Verification email send failed');
        }
    },

    async resetPassword(token: string, newPassword: string) {
        try {
            const response = await api.post('/user/reset-password', {
                token,
                newPassword,
            });
            return response.data;
        } catch (error) {
            console.error('Reset password failed:', error);
            throw error;
        }
    },

    logout(): void {
        Cookies.remove('authToken');
        localStorage.clear();
        window.location.href = '/';
    },

    getCurrentUserToken(): { token: string } | null {
        const token = Cookies.get('authToken');
        return token ? { token } : null;
    },

    getCurrentUser(): DecodedToken | null {
        const token = this.getCurrentUserToken()?.token;
        return token ? this.decodeToken(token) : null;
    },

    async verificationCheck(email: string): Promise<{ isVerified: boolean, userId: string }> {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/check-user-verification?email=${email}`);
        return res.json();
    },

    async verifyEmail(token: string): Promise<{ isVerified: boolean }> {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/verify-email?token=${token}`);
        return res.json();
    },

    decodeToken(token: string): DecodedToken {
        if (token) {
            return jwtDecode<DecodedToken>(token);
        } else {
            throw new Error('Token is not provided');
        }
    },

};