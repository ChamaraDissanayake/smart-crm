import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthService } from '../services/authService';
import { JSX } from 'react';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const location = useLocation();
    const token = Cookies.get('authToken');

    if (token) {
        try {
            const decoded = AuthService.decodeToken(token);
            const isExpired = decoded.exp * 1000 < Date.now();

            if (!isExpired) {
                // redirect to dashboard unless already on dashboard
                if (location.pathname !== '/dashboard') {
                    return <Navigate to="/dashboard" replace />;
                }
            } else {
                Cookies.remove('authToken');
            }
        } catch {
            Cookies.remove('authToken');
        }
    }

    return children;
};

export default PublicRoute;
