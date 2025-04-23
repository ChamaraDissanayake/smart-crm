import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.tsx';
import PipelinePage from '../pages/dashboard/PipelinePage.tsx';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Navigation */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 py-4 overflow-y-auto bg-white">
                    <Outlet />
                    <PipelinePage />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;