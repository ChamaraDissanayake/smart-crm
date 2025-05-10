import Cookies from 'js-cookie';
import { AuthService } from '../services/AuthService';
import { JSX } from 'react';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const token = Cookies.get('authToken');

    if (token) {
        try {
            const decoded = AuthService.decodeToken(token);
            const isExpired = decoded.exp * 1000 < Date.now();
            if (isExpired) {
                Cookies.remove('authToken');
            }
        } catch {
            Cookies.remove('authToken');
        }
    }

    return children;
};

export default PublicRoute;
