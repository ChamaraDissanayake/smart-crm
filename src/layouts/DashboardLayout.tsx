import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.tsx';
import DashboardPage from '../pages/dashboard/DashboardPage.tsx';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Navigation */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 py-4 overflow-y-auto bg-gradient-to-br from-blue-300 to-white">
                    <Outlet />
                    <DashboardPage />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;