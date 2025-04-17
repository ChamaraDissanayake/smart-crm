import axios from 'axios';
import {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    VerifyEmailResponse,
} from '../types/auth';

const API = axios.create({
    baseURL: 'https://your-backend-api.com/api',
    withCredentials: true,
});

export const register = async (
    data: RegisterRequest
): Promise<RegisterResponse> => {
    const res = await API.post<RegisterResponse>('/auth/register', data);
    return res.data;
};

export const login = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    const res = await API.post<LoginResponse>('/auth/login', data);
    return res.data;
};

export const verifyEmail = async (
    token: string
): Promise<VerifyEmailResponse> => {
    const res = await API.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`);
    return res.data;
};
