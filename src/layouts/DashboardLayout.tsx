import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.tsx';
import { Sidebar } from '../components/layout/Sidebar.tsx';

const DashboardLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Navigation */}
            <Navbar />

            {/* Content Area (Sidebar + Page Content) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar below Navbar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
