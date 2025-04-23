import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CompanyService } from '../../services/companyService';
import { CompanyAPIResponse, CompanyDropdownOption } from '../../types/Company';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

export const Navbar = () => {
    const [userCompanies, setUserCompanies] = useState<CompanyDropdownOption[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const companies: CompanyAPIResponse[] = await CompanyService.getUserCompanies();
                const mappedCompanies: CompanyDropdownOption[] = companies.map(company => ({
                    id: company.id,
                    name: company.name
                }));
                setUserCompanies(mappedCompanies);
            } catch (error) {
                console.error("Error fetching company data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <nav className="flex items-center justify-between px-4 py-2 bg-blue-300 shadow">
            {/* Left side - New button with dropdown */}
            <div>
                Pipeline
            </div>

            {/* Right side - Company dropdown, Add Company button, and user greeting */}
            <div className="flex items-center gap-4">
                <div className="w-60">
                    <Select>
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

                <Button className="gap-2">
                    <PlusCircle size={16} />
                    Add Company
                </Button>

                <span className="text-sm font-medium">Hi, John</span>
            </div>
        </nav>
    );
};