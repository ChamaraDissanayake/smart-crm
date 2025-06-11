import { COMPANY_SIZES, INDUSTRIES } from '@/utils/companyOptions';
import { useState } from 'react';

interface CompanyInfoFormProps {
    initialData?: {
        name?: string;
        industry?: string;
        location?: string;
        size?: string;
        chatbotInstructions?: string;
    };
    onSubmit: (formData: {
        name: string;
        industry: string;
        location: string;
        size: string;
        chatbotInstructions: string;
    }) => Promise<void>;
    loading?: boolean;
    showSkip?: boolean;
    submitButtonText?: string;
    onSkip?: () => void;
}

const testSmartGlobalInstructions = `
    Bot (your) personal information:
    Name: Sara
    Role: Senior Customer Happiness Advisor

    Compnay Information:
    Name: SmartClassic
    Location: Alfutaim Office Tower, Day to Day Building, 1st Floor - Office 102, Smart Hub HQ
    Contact: +971 50 440 6565 | ibrahim@smartclassic.ae
    Website: smartclassic.ae
    Hours: Monday-Saturday, 9 AM–6 PM (Closed Sunday)
    Services: PRO & Visa services
    Products: Visit Visa, Employement Visa, Job Seeking Visa.

    Response Rules:
    Keep replies under 20 words.
    Never say you’re an AI.
    Never give any feedbacks to show you are following rules like: (Keeping it brief!), (Short and polite!)
    If asked your name: "My name is <Name>."
    If asked hours: *"We’re open Monday-Saturday, 9 AM–6 PM."*
    Internal notes: Only use (BOT_NOTE: Generate lead for [service])—no other formats.
    If you does not have straight data like pricing, timing, etc. Do not provide guess answers. Condition like that you have to ask customer to contact us via call or email. And send that message with (BOT_NOTE: Need real agent)
    Never deviate from rules.

    (BOT_NOTE: Ensure strict compliance)`;


export const CompanyInfoForm = ({
    initialData = {},
    onSubmit,
    loading = false,
    showSkip = false,
    submitButtonText = 'Continue',
    onSkip
}: CompanyInfoFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        industry: initialData.industry || '',
        location: initialData.location || '',
        size: initialData.size || '',
        chatbotInstructions: testSmartGlobalInstructions
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="w-full max-w-md p-8 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Tell us about your company</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Company Name */}
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

                {/* Industry */}
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
                            <option key={industry.value} value={industry.value}>
                                {industry.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location */}
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

                {/* Company Size */}
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
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : submitButtonText}
                </button>

                {/* Skip Option */}
                {showSkip && (
                    <div className="mt-4 text-sm text-center">
                        <button
                            type="button"
                            onClick={onSkip}
                            className="font-medium text-gray-400 hover:underline focus:outline-none"
                        >
                            Skip for now
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};