import { useEffect, useState } from 'react';
import { CompanyService } from '../../services/CompanyService';
import { Company, CompanyDropdownOption } from '../../types/Company';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AuthService } from '@/services/AuthService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanyInfoForm } from '../CompanyInfoForm';
import { useLocation } from "react-router-dom";

const pageMeta = [
    { path: "home", title: "Home", icon: "/icon-home.png" },
    { path: "contacts", title: "Contacts", icon: "/icon-contact.png" },
    { path: "communication", title: "Communication", icon: "/icon-communication.png" },
    { path: "crm", title: "CRM", icon: "/icon-crm.png" },
    { path: "sales-products", title: "Sales", icon: "/icon-sales.png" },
    { path: "sales-quotation", title: "Sales", icon: "/icon-sales.png" },
    { path: "sales-invoicing", title: "Sales", icon: "/icon-sales.png" },
    { path: "settings-account", title: "Settings", icon: "/icon-settings.png" },
    { path: "settings-team", title: "Settings", icon: "/icon-settings.png" },
    { path: "settings-api", title: "Settings", icon: "/icon-settings.png" },
];

export const Navbar = () => {
    const [userCompanies, setUserCompanies] = useState<CompanyDropdownOption[]>([]);
    const [userFirstLetter, setUserFirstLetter] = useState<string | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    const handleLogout = () => {
        AuthService.logout();
    };

    const handleCreateCompany = async (formData: {
        name: string;
        industry: string;
        location: string;
        size: string;
    }) => {
        try {
            const currentUser = AuthService.getCurrentUser();
            const userId = currentUser?.userId;
            if (userId !== undefined) {
                const newCompany = await CompanyService.createCompany(
                    userId,
                    formData
                );

                setUserCompanies(prev => [
                    ...prev,
                    {
                        id: newCompany.id,
                        name: newCompany.name,
                        isDefault: false
                    }
                ]);

                setSelectedCompanyId(newCompany.id.toString());
                setIsCompanyModalOpen(false);
            } else {
                console.error("User ID is undefined");
            }
        } catch (error) {
            console.error("Error creating company:", error);
        }
    };

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            const firstLetter = currentUser.name.slice(currentUser.name.indexOf(currentUser.name, 0), 1);
            setUserFirstLetter(firstLetter);
        } else {
            AuthService.logout();
            return;
        }

        const fetchData = async () => {
            try {
                const companies: Company[] = await CompanyService.getUserCompanies();

                const mappedCompanies: CompanyDropdownOption[] = companies.map(company => ({
                    id: company.id,
                    name: company.name,
                    isDefault: company.isDefault
                }));
                setUserCompanies(mappedCompanies);

                const defaultCompany = mappedCompanies.find(company => company.isDefault);
                if (defaultCompany) {
                    setSelectedCompanyId(defaultCompany.id.toString());
                }
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        };

        fetchData();
    }, []);

    const location = useLocation();

    // Find the matching page metadata based on the current path
    const currentMeta = pageMeta.find(meta => location.pathname.includes(meta.path));

    // Set default if no match
    const pageTitle = currentMeta?.title || "Dashboard";
    const pageIcon = currentMeta?.icon || "/icon-default.png";

    return (
        <>
            <nav className="flex items-center justify-between px-4 py-2 bg-[#E1DBF3]">
                {/* Left side - Tabs */}
                <div className="flex gap-4">
                    <img className='h-10' src={pageIcon} />
                    <h1 className='content-center text-3xl font-bold'>{pageTitle}</h1>
                </div>

                {/* Right side - Company dropdown and user menu */}
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-md w-60">
                        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                                {userCompanies.map((company) => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="w-[36px] h-[36px] flex items-center justify-center text-white bg-blue-900 rounded-full text-3xl font-semi-bold">
                                {userFirstLetter}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsCompanyModalOpen(true)}>
                                Create Company
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* Company Creation Modal */}
            <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Company</DialogTitle>
                    </DialogHeader>
                    <CompanyInfoForm
                        onSubmit={handleCreateCompany}
                        submitButtonText="Create Company"
                        showSkip={false}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};