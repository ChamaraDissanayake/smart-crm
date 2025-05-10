import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { AuthService } from "../services/AuthService";
import { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const token = Cookies.get("authToken");

    if (token) {
        try {
            const decoded = AuthService.decodeToken(token);
            if (decoded.exp * 1000 > Date.now()) {
                return children;
            } else {
                AuthService.logout();
            }
        } catch (err) {
            console.log(err);

            AuthService.logout();
        }
    }

    return <Navigate to="/signin" />;
};

export default PrivateRoute;
