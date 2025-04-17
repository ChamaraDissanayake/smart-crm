import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import SignUpPage from '../pages/SignUpPage';
import SignInPage from '../pages/SignInPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import CompanyDetailsPage from '../pages/CompanyDetailsPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/company-details" element={<CompanyDetailsPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;
