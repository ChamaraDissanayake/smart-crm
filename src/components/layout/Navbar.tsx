import { useEffect, useState } from 'react';
import { CompanyService } from '../../services/companyService';
import { Company, CompanyDropdownOption } from '../../types/Company';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from 'react-router-dom';
import { AuthService } from '@/services/authService';

export const Navbar = () => {
    const [userCompanies, setUserCompanies] = useState<CompanyDropdownOption[]>([]);
    const [userFirstName, setUserFirstName] = useState<string | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

    const handleLogout = () => {
        AuthService.logout();
    };

    useEffect(() => {
        const token = AuthService.getCurrentUserToken()?.token;
        if (token) {
            const decodedToken = AuthService.decodeToken(token);
            const firstName = decodedToken.name.split(' ')[0];
            setUserFirstName(firstName);
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

                // Find and set the default company
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

    return (
        <nav className="flex items-center justify-between px-4 py-2 bg-blue-300 shadow">
            {/* Left side - Tabs (unchanged) */}
            <div className="flex gap-2">
                <NavLink to="/dashboard/pipeline">
                    {({ isActive }) => (
                        <Button variant="navtab" data-active={isActive}>
                            Pipeline
                        </Button>
                    )}
                </NavLink>

                <NavLink to="/dashboard/contacts">
                    {({ isActive }) => (
                        <Button variant="navtab" data-active={isActive}>
                            Contacts
                        </Button>
                    )}
                </NavLink>
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
                        <div className="flex items-center gap-1 cursor-pointer">
                            <span className="text-sm font-medium">Hi, {userFirstName}</span>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('Create company clicked')}>
                            Create Company
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};