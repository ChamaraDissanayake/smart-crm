import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/authentication/LandingPage';
import SignUpPage from '../pages/authentication/SignUpPage';
import SignInPage from '../pages/authentication/SignInPage';
import VerifyEmailPage from '../pages/authentication/VerifyEmailPage';
import CompanyInfoPage from '../pages/authentication/CompanyInfoPage';
import NotFoundPage from '../pages/NotFoundPage';
import ForgotPasswordPage from '../pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from '../pages/authentication/ResetPasswordPage';
import ChoosePlanPage from '../pages/authentication/ChoosePlanPage';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PipelinePage from '../pages/dashboard/PipelinePage';
import ContactPage from '../pages/dashboard/ContactPage';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
                <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
                <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

                {/* Auth Flow Steps */}
                <Route path="/company-info" element={<PrivateRoute><CompanyInfoPage /></PrivateRoute>} />
                <Route path="/choose-plan" element={<PrivateRoute><ChoosePlanPage /></PrivateRoute>} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                    {/* Redirect /dashboard to /dashboard/pipeline */}
                    <Route index element={<Navigate to="pipeline" replace />} />
                    <Route path="pipeline" element={<PipelinePage />} />
                    <Route path="contacts" element={<ContactPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
