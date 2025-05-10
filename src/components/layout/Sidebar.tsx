import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    PhoneCall,
    UserRoundPlus,
    ChartNoAxesCombined,
    MessageSquare,
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
        `flex items-center p-2 space-x-2 rounded hover:bg-purple-100 ${isActive(path) ? "bg-purple-200 font-semibold" : ""
        }`;

    const subItemClass = (path: string) =>
        `block p-2 rounded hover:bg-purple-100 ${isActive(path) ? "bg-purple-200 font-semibold" : ""
        }`;

    const handleTopLevelClick = () => setOpenMenu(null);

    const renderLabel = (label: string) => !sidebarCollapsed && <span>{label}</span>;

    return (
        <aside className={`h-full p-4 border-r bg-purple-50 md:block transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Toggle button */}

            <div className="h-[34px] text-right">
                <button
                    onClick={() => setSidebarCollapsed(prev => !prev)}
                    className="hover:bg-purple-100"
                >
                    {sidebarCollapsed ? (
                        <PanelRightClose size={20} className="text-gray-400" />
                    ) : (
                        <PanelLeftClose size={20} className="text-gray-400" />
                    )}
                </button>
            </div>

            <ul className="space-y-2 font-medium">
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
                <li>
                    <Link
                        to="/dashboard/communication"
                        className={menuItemClass("/dashboard/communication")}
                        onClick={handleTopLevelClick}
                    >
                        <MessageSquare size={18} />
                        {renderLabel("Communication")}
                    </Link>
                </li>
                <li>
                    <Link
                        to="/dashboard/crm"
                        className={menuItemClass("/dashboard/crm")}
                        onClick={handleTopLevelClick}
                    >
                        <UserRoundPlus size={18} />
                        {renderLabel("CRM")}
                    </Link>
                </li>

                {/* Sales submenu */}
                <li>
                    <button
                        onClick={() => toggleMenu("sales")}
                        className="flex items-center justify-between w-full p-2 rounded hover:bg-purple-100"
                    >
                        <span className="flex items-center space-x-2">
                            <ChartNoAxesCombined size={18} />
                            {renderLabel("Sales")}
                        </span>
                        {!sidebarCollapsed &&
                            (openMenu === "sales" ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </button>
                    {!sidebarCollapsed && openMenu === "sales" && (
                        <ul className="pl-8 mt-1 space-y-1">
                            <li>
                                <Link
                                    to="/dashboard/sales-products"
                                    className={subItemClass("/dashboard/sales-products")}
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/sales-quotation"
                                    className={subItemClass("/dashboard/sales-quotation")}
                                >
                                    Quotation
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/sales-invoicing"
                                    className={subItemClass("/dashboard/sales-invoicing")}
                                >
                                    Invoicing
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Settings submenu */}
                <li>
                    <button
                        onClick={() => toggleMenu("settings")}
                        className="flex items-center justify-between w-full p-2 rounded hover:bg-purple-100"
                    >
                        <span className="flex items-center space-x-2">
                            <Settings size={18} />
                            {renderLabel("Settings")}
                        </span>
                        {!sidebarCollapsed &&
                            (openMenu === "settings" ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
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
        </aside>
    );
};
