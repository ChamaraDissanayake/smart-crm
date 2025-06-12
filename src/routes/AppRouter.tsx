import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import CRMPage from '../pages/dashboard/CRMPage';
import ContactPage from '../pages/dashboard/ContactPage';
import HomePage from '../pages/dashboard/HomePage';
import CommunicationPage from '@/pages/dashboard/CommunicationPage';
import AccountPage from '@/pages/dashboard/settings/AccountPage';
import ApiPage from '@/pages/dashboard/settings/ApiPage';
import TeamPage from '@/pages/dashboard/settings/TeamPage';
import ProductsPage from '@/pages/dashboard/sales/ProductsPage';
import QuotationPage from '@/pages/dashboard/sales/QuotationPage';
import InvoicingPage from '@/pages/dashboard/sales/InvoicingPage';
import FollowUpsPage from '@/pages/dashboard/FollowUpsPage';

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
                    {/* Redirect /dashboard to /dashboard/crm */}
                    {/* <Route index element={<Navigate to="crm" replace />} /> */}
                    <Route path="home" element={<HomePage />} />
                    <Route path="contacts" element={<ContactPage />} />
                    <Route path="communication" element={<CommunicationPage />} />
                    <Route path="follow-ups" element={<FollowUpsPage />} />
                    <Route path="crm" element={<CRMPage />} />
                    <Route path="sales-products" element={<ProductsPage />} />
                    <Route path="sales-quotation" element={<QuotationPage />} />
                    <Route path="sales-invoicing" element={<InvoicingPage />} />
                    <Route path="settings-account" element={<AccountPage />} />
                    <Route path="settings-team" element={<TeamPage />} />
                    <Route path="settings-api" element={<ApiPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
