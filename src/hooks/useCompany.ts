import { useState, useEffect } from 'react';

export const useCompany = () => {
    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('selectedCompany');
        console.log('Chamara test saved', saved);
        if (saved) setCompanyId(saved);
    }, []);

    const switchCompany = (id: string) => {
        console.log('Chamara test id', id);

        localStorage.setItem('selectedCompany', id);
        setCompanyId(id);
    };

    return { companyId, switchCompany };
};
