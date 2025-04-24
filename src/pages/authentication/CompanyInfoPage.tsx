import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompanyService } from '../../services/companyService';
import { COMPANY_SIZES, INDUSTRIES } from '../../utils/companyOptions';
import handleError from '../../utils/handleError';
import { toast } from 'react-toastify';

const CompanyInfoPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        location: '',
        size: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = searchParams.get('userId');
            if (!userId) {
                console.log('User ID not found in URL');
                throw new Error('Something went wrong. Please try again.');
            }
            const response = await CompanyService.createCompany(userId, formData);

            toast.success('Company details saved!');
            navigate('/choose-plan?companyId=' + response.id);
        } catch (error) {
            handleError(error, true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-300 to-white">
                <div className="w-full max-w-md p-8 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Tell us about your company</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Industry</label>
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select industry</option>
                                {INDUSTRIES.map(industry => (
                                    <option key={industry.value} value={industry.value}>{industry.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Company Size</label>
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            >
                                <option value="">Select size</option>
                                {COMPANY_SIZES.map(size => (
                                    <option key={size.value} value={size.value}>{size.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </button>
                        <div className="mt-4 text-sm text-center">
                            <a
                                href="/dashboard/pipeline"
                                className="font-medium text-gray-400 hover:underline"
                            >
                                Skip for now
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CompanyInfoPage;
