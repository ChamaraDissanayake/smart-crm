import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar from top to bottom on the left */}
            <Sidebar />

            {/* Right side: Navbar at top, content below */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top navbar inside content area */}
                <Navbar />

                {/* Main scrollable content area */}
                <main className="flex-1 overflow-y-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
