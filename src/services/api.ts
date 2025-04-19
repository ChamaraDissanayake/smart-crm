import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// List of routes that shouldn't trigger 401 redirect
const AUTH_ROUTES = [
    '/user/login',
    '/user/register',
    '/user/verify-email',
    '/user/forgot-password',
    '/user/reset-password',
    '/user/resend-verification-email',
    // Add other auth routes as needed
];

api.interceptors.request.use((config) => {
    const token = Cookies.get('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = AUTH_ROUTES.some(route =>
            error.config.url?.includes(route)
        );

        if (error.response?.status === 401 && !isAuthRoute) {
            Cookies.remove('authToken');
            window.location.href = '/signin';
        }

        return Promise.reject(error);
    }
);

export default api;