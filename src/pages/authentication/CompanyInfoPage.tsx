import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompanyService } from '../../services/CompanyService';
import handleError from '../../utils/handleError';
import { CompanyInfoForm } from '../../components/CompanyInfoForm';

const CompanyInfoPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleSubmit = async (formData: {
        name: string;
        industry: string;
        location: string;
        size: string;
    }) => {
        setLoading(true);
        try {
            const userId = searchParams.get('userId');
            if (!userId) {
                throw new Error('User ID not found in URL');
            }
            const response = await CompanyService.createCompany(userId, formData);
            navigate('/choose-plan?companyId=' + response.id);
        } catch (error) {
            handleError(error, true);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-[#E1DBF3]">
            <CompanyInfoForm
                onSubmit={handleSubmit}
                loading={loading}
                showSkip={true}
                onSkip={handleSkip}
            />
        </div>
    );
};

export default CompanyInfoPage;