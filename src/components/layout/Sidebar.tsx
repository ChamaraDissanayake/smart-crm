import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    PhoneCall,
    MessageSquare,
    //   ChevronsUp,
    UserRoundPlus,
    //   BarChart3,
    //   Brain,
    //   LayoutGrid,
    //   LineChart,
    Settings,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelRightClose
} from "lucide-react";

export const Sidebar = () => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
    const location = useLocation();

    const toggleMenu = (key: string) => {
        setOpenMenu(prev => (prev === key ? null : key));
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItemClass = (path: string) =>
        `flex items-center p-2 space-x-2 rounded hover:bg-blue-100 ${isActive(path) ? "bg-blue-200 font-semibold" : ""
        }`;

    const subItemClass = (path: string) =>
        `block p-2 rounded hover:bg-blue-100 ${isActive(path) ? "bg-blue-200 font-semibold" : ""
        }`;

    const handleTopLevelClick = () => setOpenMenu(null);

    const renderLabel = (label: string) => !sidebarCollapsed && <span>{label}</span>;

    return (
        <aside className="p-2 overflow-y-auto transition-all duration-300 border-r bg-blue-50 md:block drop-shadow-md">
            <div className="flex items-center justify-between mb-4">
                {/* Logo or title */}
                <div className={`${sidebarCollapsed ? "hidden" : ""}`}>
                    <h1 className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'cursive' }}>
                        GO Smart
                    </h1>
                </div>

                {/* Toggle button */}
                <div className={`${sidebarCollapsed ? "w-full text-center" : "text-right"}`}>
                    <button
                        onClick={() => setSidebarCollapsed(prev => !prev)}
                        className="hover:bg-blue-100"
                        style={{ verticalAlign: 'sub' }}
                    >
                        {sidebarCollapsed ? (
                            <PanelRightClose size={20} className="text-gray-400" />
                        ) : (
                            <PanelLeftClose size={20} className="text-blue-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="pr-1 mt-4">
                <ul className="space-y-2 font-medium">
                    {/* Top-level items */}
                    <li>
                        <Link
                            to="/dashboard/home"
                            className={menuItemClass("/dashboard/home")}
                            onClick={handleTopLevelClick}
                        >
                            <Home size={18} />
                            {renderLabel("Home")}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/dashboard/contacts"
                            className={menuItemClass("/dashboard/contacts")}
                            onClick={handleTopLevelClick}
                        >
                            <PhoneCall size={18} />
                            {renderLabel("Contacts")}
                        </Link>
                    </li>
                    {/* <li>
                        <Link
                            to="/dashboard/communication"
                            className={menuItemClass("/dashboard/communication")}
                            onClick={handleTopLevelClick}
                        >
                            <MessageSquare size={18} />
                            {renderLabel("Conversations")}
                        </Link>
                    </li> */}

                    {/* Communication submenu */}
                    <li>
                        <button
                            onClick={() => toggleMenu("communication")}
                            className="flex items-center justify-between w-full p-2 rounded hover:bg-blue-100"
                        >
                            <span className="flex items-center space-x-2">
                                <MessageSquare size={18} />
                                {renderLabel("Communication")}
                            </span>
                            {!sidebarCollapsed &&
                                (openMenu === "communication" ? (
                                    <ChevronDown size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                ))}
                        </button>
                        {!sidebarCollapsed && openMenu === "communication" && (
                            <ul className="pl-8 mt-1 space-y-1">
                                <li>
                                    <Link
                                        to="/dashboard/communication/my-conversations"
                                        className={subItemClass("/dashboard/communication/my-conversations")}
                                    >
                                        My Conversation
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/follow-ups"
                                        className={subItemClass("/dashboard/follow-ups")}
                                    >
                                        AI Follow Ups
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/communication"
                                        className={subItemClass("/dashboard/communication")}
                                    >
                                        All Conversation
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/communication/statistics"
                                        className={subItemClass("/dashboard/communication/statistics")}
                                    >
                                        Statistics
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/communication/settings"
                                        className={subItemClass("/dashboard/communication/settings")}
                                    >
                                        Settings
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* CRM submenu */}
                    <li>
                        <button
                            onClick={() => toggleMenu("crm")}
                            className="flex items-center justify-between w-full p-2 rounded hover:bg-blue-100"
                        >
                            <span className="flex items-center space-x-2">
                                <UserRoundPlus size={18} />
                                {renderLabel("CRM")}
                            </span>
                            {!sidebarCollapsed &&
                                (openMenu === "crm" ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                        </button>
                        {!sidebarCollapsed && openMenu === "crm" && (
                            <ul className="pl-8 mt-1 space-y-1">
                                <li>
                                    <Link
                                        to="/dashboard/crm"
                                        className={subItemClass("/dashboard/crm")}
                                    >
                                        Leads
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/sales-invoicing"
                                        className={subItemClass("/dashboard/sales-invoicing")}
                                    >
                                        Sales
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Settings submenu */}
                    <li>
                        <button
                            onClick={() => toggleMenu("settings")}
                            className="flex items-center justify-between w-full p-2 rounded hover:bg-blue-100"
                        >
                            <span className="flex items-center space-x-2">
                                <Settings size={18} />
                                {renderLabel("General Settings")}
                            </span>
                            {!sidebarCollapsed &&
                                (openMenu === "settings" ? (
                                    <ChevronDown size={16} />
                                ) : (
                                    <ChevronRight size={16} />
                                ))}
                        </button>
                        {!sidebarCollapsed && openMenu === "settings" && (
                            <ul className="pl-8 mt-1 space-y-1">
                                <li>
                                    <Link
                                        to="/dashboard/settings-account"
                                        className={subItemClass("/dashboard/settings-account")}
                                    >
                                        Account
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/settings-team"
                                        className={subItemClass("/dashboard/settings-team")}
                                    >
                                        Team
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard/settings-api"
                                        className={subItemClass("/dashboard/settings-api")}
                                    >
                                        API Integration
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </aside>
    );
};
