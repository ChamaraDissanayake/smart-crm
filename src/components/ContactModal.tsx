import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { COUNTRIES, Country } from '@/utils/countries';
import { Contact } from '@/types/Contact';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { FaWhatsapp, FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contactData: Omit<Contact, 'id'>) => void;
    initialData?: Contact;
    mode: 'create' | 'edit' | 'view';
}

export const ContactModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode: modeFromProps
}: ContactModalProps) => {
    const navigate = useNavigate();
    const defaultCountry = COUNTRIES.find(c => c.code === 'AE') || COUNTRIES[0];
    const [mode, setMode] = useState(modeFromProps);
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';

    const [contactData, setContactData] = useState<Omit<Contact, 'id'>>({
        name: '',
        email: '',
        phone: '',
        location: defaultCountry.name,
        isCompany: false,
        code: defaultCountry.code,
    });

    const [selectedPhoneCode, setSelectedPhoneCode] = useState<Country>(defaultCountry);
    const [countries] = useState<Country[]>(COUNTRIES);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCountryCodeDropdownOpen, setIsCountryCodeDropdownOpen] = useState(false);
    const [isCountryNameDropdownOpen, setIsCountryNameDropdownOpen] = useState(false);

    const countryCodeRef = useRef<HTMLDivElement>(null);
    const countryNameRef = useRef<HTMLDivElement>(null);

    const hasPhoneNumber = !!contactData.phone;

    // Reset form when opening/closing or when initialData changes
    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            // Find the country either by code from initialData or fallback to first country
            const matchedCountry = COUNTRIES.find(c => c.code === initialData.code) || COUNTRIES[0];
            setContactData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone?.replace(matchedCountry.callingCode.replace('+', ''), '') || '',
                location: initialData.location || matchedCountry.name,
                isCompany: !!initialData.isCompany,
                code: matchedCountry.code,
                channels: initialData.channels
            });
            setSelectedPhoneCode(matchedCountry);
        } else {
            // For new contacts, use default country (UAE) or first country if not found
            const defaultCountry = COUNTRIES.find(c => c.code === 'AE') || COUNTRIES[0];
            setContactData({
                name: '',
                email: '',
                phone: '',
                location: defaultCountry.name,
                isCompany: false,
                code: defaultCountry.code,
                channels: []
            });
            setSelectedPhoneCode(defaultCountry);
        }
        setMode(modeFromProps);
        setErrors({});
    }, [isOpen, initialData, modeFromProps]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (countryCodeRef.current && !countryCodeRef.current.contains(target)) {
                setIsCountryCodeDropdownOpen(false);
            }
            if (countryNameRef.current && !countryNameRef.current.contains(target)) {
                setIsCountryNameDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditClick = () => setMode('edit');

    const handleCancelEdit = () => {
        if (initialData) {
            const matchedCountry = COUNTRIES.find(c => c.code === initialData.code) || COUNTRIES[0];
            setContactData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone?.replace(matchedCountry.callingCode.replace('+', ''), '') || '',
                location: initialData.location || matchedCountry.name,
                isCompany: !!initialData.isCompany,
                code: matchedCountry.code,
                channels: initialData.channels || []
            });
            setSelectedPhoneCode(matchedCountry);
        }
        setMode('view');
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://via.placeholder.com/20x15';
    };

    const handleCountryCodeChange = (code: string) => {
        const country = countries.find(c => c.code === code);
        if (country) {
            setSelectedPhoneCode(country);
            setContactData(prev => ({ ...prev, code: country.code }));
            setIsCountryCodeDropdownOpen(false);
        }
    };

    const handleCountryNameChange = (country: Country) => {
        setContactData(prev => ({ ...prev, location: country.name }));
        setIsCountryNameDropdownOpen(false);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!contactData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (contactData.email && contactData.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (contactData.phone && contactData.phone.trim()) {
            const fullPhone = (selectedPhoneCode?.callingCode || '') + contactData.phone;
            if (!/^\+?[0-9]{7,15}$/.test(fullPhone)) {
                newErrors.phone = 'Invalid phone number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isViewMode) return;

        if (!validate()) return;

        const phoneWithCode = contactData.phone
            ? (selectedPhoneCode?.callingCode.replace('+', '') || '') + contactData.phone
            : undefined;

        onSubmit({
            ...contactData,
            phone: phoneWithCode,
            code: selectedPhoneCode?.code || 'AE'
        });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0">
                <div className="flex">
                    {/* Left Side - Profile Section */}
                    <div className="w-1/3 p-6 border-r bg-gray-50">
                        <div className="flex flex-col items-center mb-6">
                            <div className="flex items-center justify-center w-24 h-24 mb-4 overflow-hidden bg-gray-200 rounded-full">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-center">{contactData.name || 'New Contact'}</h2>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Opted In through</h3>

                            {contactData.channels && contactData.channels.length > 0 ? (
                                <div className="flex gap-2 text-lg text-gray-700">
                                    {contactData.channels.includes('whatsapp') && <FaWhatsapp className="text-xl text-green-500" title="WhatsApp" />}
                                    {contactData.channels.includes('web') && <FaRobot className="text-xl text-purple-500" title="Web Chatbot" />}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">Not connected</div>
                            )}
                        </div>

                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Contact Type</h3>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="individual"
                                        name="type"
                                        checked={!contactData.isCompany}
                                        onChange={() => setContactData({ ...contactData, isCompany: false })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        disabled={isViewMode}
                                    />
                                    <label htmlFor="individual" className="text-sm font-medium text-gray-700">
                                        Individual
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="company"
                                        name="type"
                                        checked={contactData.isCompany}
                                        onChange={() => setContactData({ ...contactData, isCompany: true })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        disabled={isViewMode}
                                    />
                                    <label htmlFor="company" className="text-sm font-medium text-gray-700">
                                        Company
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="w-2/3 p-6">
                        <DialogHeader className="mb-6 text-left">
                            <div className="flex items-center">
                                <DialogTitle className="text-xl">
                                    {mode === 'create' && 'Create New Contact'}
                                    {mode === 'edit' && 'Edit Contact'}
                                    {mode === 'view' && 'Contact Details'}
                                </DialogTitle>
                                <DialogDescription />
                                {isViewMode && (
                                    <Button variant="outline" className='ml-4' onClick={handleEditClick}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            {/* Name Field */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Name *</label>
                                <Input
                                    value={contactData.name}
                                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                    disabled={isViewMode}
                                    className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                                <Input
                                    type="email"
                                    value={contactData.email}
                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                    disabled={isViewMode}
                                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="flex items-center gap-2">
                                    <div ref={countryCodeRef} className="relative w-24">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => !isViewMode && setIsCountryCodeDropdownOpen(!isCountryCodeDropdownOpen)}
                                            className="flex items-center justify-between w-full"
                                            disabled={isViewMode}
                                        >
                                            {selectedPhoneCode && (
                                                <>
                                                    <img
                                                        src={selectedPhoneCode.flag}
                                                        alt="flag"
                                                        className="w-5 h-4 mr-2"
                                                        onError={handleImageError}
                                                    />
                                                    <span>{selectedPhoneCode.callingCode}</span>
                                                </>
                                            )}
                                        </Button>
                                        {isCountryCodeDropdownOpen && (
                                            <ul className="absolute z-10 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg w-[300px]">
                                                {countries.map((country) => (
                                                    <li
                                                        key={country.code}
                                                        onClick={() => handleCountryCodeChange(country.code)}
                                                        className="flex items-center px-3 py-2 space-x-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                                                    >
                                                        <img
                                                            src={country.flag}
                                                            alt={country.name}
                                                            className="w-5 h-4"
                                                            onError={handleImageError}
                                                        />
                                                        <span>{country.callingCode}</span>
                                                        <span className="text-sm text-gray-500">{country.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <Input
                                        type="tel"
                                        value={contactData.phone}
                                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                        className={`flex-1 ${errors.phone ? 'border-red-500' : ''}`}
                                        disabled={isViewMode}
                                    />
                                </div>
                                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Location Field */}
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Country</label>
                                <div ref={countryNameRef} className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => !isViewMode && setIsCountryNameDropdownOpen(!isCountryNameDropdownOpen)}
                                        className="flex items-center justify-between w-full"
                                        disabled={isViewMode}
                                    >
                                        <span>{contactData.location || 'Select a country'}</span>
                                    </Button>
                                    {isCountryNameDropdownOpen && (
                                        <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
                                            {COUNTRIES.map((country) => (
                                                <li
                                                    key={country.code}
                                                    onClick={() => handleCountryNameChange(country)}
                                                    className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {country.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {isEditMode ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">
                                            Update Contact
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <DialogClose asChild>
                                            <Button variant="outline" type="button">Close</Button>
                                        </DialogClose>
                                        {mode === 'create' && (
                                            <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">
                                                Create Contact
                                            </Button>
                                        )}
                                        {isViewMode && hasPhoneNumber && (
                                            <Button
                                                className="text-white bg-blue-600 hover:bg-blue-700"
                                                onClick={() => navigate('/dashboard/communication')}>
                                                Start Chat
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};