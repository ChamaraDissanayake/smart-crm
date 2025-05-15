import { useState, useEffect } from 'react';

export const useCompany = () => {
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('selectedCompany');
        if (saved) setCompanyId(saved);
    }, []);

    const switchCompany = (id: string) => {
        localStorage.setItem('selectedCompany', id);
        setCompanyId(id);
    };

    return { companyId, switchCompany };
};
