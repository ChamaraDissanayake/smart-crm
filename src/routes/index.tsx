import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/authentication/LandingPage';
import SignUpPage from '../pages/authentication/SignUpPage';
import SignInPage from '../pages/authentication/SignInPage';
import VerifyEmailPage from '../pages/authentication/VerifyEmailPage';
import CompanyInfoPage from '../pages/authentication/CompanyInfoPage';
import NotFoundPage from '../pages/NotFoundPage';
import DashboardPage from '../pages/DashboardPage';
import ForgotPasswordPage from '../pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from '../pages/authentication/ResetPasswordPage';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/company-info" element={<CompanyInfoPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
