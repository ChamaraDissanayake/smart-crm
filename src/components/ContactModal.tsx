import { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { COUNTRIES, Country } from '@/utils/countries';
import { Contact } from '@/types/Contact';

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
    mode
}: ContactModalProps) => {
    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';

    const [contactData, setContactData] = useState<Omit<Contact, 'id'>>({
        name: '',
        email: '',
        phone: '',
        location: '',
        isCompany: false,
        code: 'AE',
    });

    const [selectedPhoneCode, setSelectedPhoneCode] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCountryCodeDropdownOpen, setIsCountryCodeDropdownOpen] = useState(false);
    const [isCountryNameDropdownOpen, setIsCountryNameDropdownOpen] = useState(false);

    const countryCodeRef = useRef<HTMLDivElement>(null);
    const countryNameRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setCountries(COUNTRIES);
    }, []);

    useEffect(() => {
        if (initialData) {
            const matchedCountry = COUNTRIES.find(c => c.code === initialData.code) || COUNTRIES[0];
            setContactData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone?.replace(matchedCountry.callingCode.replace('+', ''), '') || '',
                location: initialData.location || matchedCountry.name,
                isCompany: !!initialData.isCompany,
                code: matchedCountry.code,
            });
            setSelectedPhoneCode(matchedCountry);
        } else {
            const defaultCountry = COUNTRIES.find(c => c.code === 'AE') || COUNTRIES[0];
            setSelectedPhoneCode(defaultCountry);
            setContactData(prev => ({
                ...prev,
                code: defaultCountry.code,
                location: defaultCountry.name
            }));
        }
    }, [initialData, isOpen]);


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

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://via.placeholder.com/20x15';
    };

    const handleCountryCodeChange = (code: string) => {
        const country = countries.find(c => c.code === code);
        if (country) {
            setSelectedPhoneCode(country);
            setContactData(prev => ({ ...prev, code: country.code, location: country.name }));
            setIsCountryCodeDropdownOpen(false);
        }
    };

    const handleCountryNameChange = (country: Country) => {
        setContactData({ ...contactData, location: country.name });
        setIsCountryNameDropdownOpen(false);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // Name is required (and defined in your interface)
        if (!contactData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email is optional but must be valid if provided
        if (contactData.email && contactData.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Phone validation (phone is optional)
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

        // Prepare phone with country code (handle undefined cases)
        const phoneWithCode = contactData.phone
            ? (selectedPhoneCode?.callingCode.replace('+', '') || '') + contactData.phone
            : undefined;

        onSubmit({
            ...contactData,
            phone: phoneWithCode,
            code: selectedPhoneCode?.code || 'AE'
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' && 'Create New Contact'}
                        {mode === 'edit' && 'Edit Contact'}
                        {mode === 'view' && 'View Contact'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'view'
                            ? 'Contact details'
                            : 'Fill the form to add or update a contact.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {/* Contact Type */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Contact Type</label>
                        <div className="flex gap-6">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="individual"
                                    checked={!contactData.isCompany}
                                    onChange={() => setContactData({ ...contactData, isCompany: false })}
                                    className="text-blue-600 form-radio"
                                    disabled={isViewMode}
                                />
                                <span className="ml-2 text-sm text-gray-700">Individual</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="company"
                                    checked={contactData.isCompany}
                                    onChange={() => setContactData({ ...contactData, isCompany: true })}
                                    className="text-blue-600 form-radio"
                                    disabled={isViewMode}
                                />
                                <span className="ml-2 text-sm text-gray-700">Company</span>
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Name *</label>
                        <input
                            type="text"
                            value={contactData.name}
                            onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                            disabled={isViewMode}
                            className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={contactData.email}
                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                            disabled={isViewMode}
                            className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="flex items-center p-2 mt-1 bg-gray-100 rounded-lg">
                            <div ref={countryCodeRef} className="relative mr-2">
                                <button
                                    type="button"
                                    onClick={() => !isViewMode && setIsCountryCodeDropdownOpen(!isCountryCodeDropdownOpen)}
                                    className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 space-x-2 min-w-[110px]"
                                    disabled={isViewMode}
                                >
                                    {selectedPhoneCode && (
                                        <>
                                            <img src={selectedPhoneCode.flag} alt="flag" className="w-5 h-4 bg-black" onError={handleImageError} />
                                            <span>{selectedPhoneCode.callingCode}</span>
                                        </>
                                    )}
                                    {!isViewMode && (
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>
                                {isCountryCodeDropdownOpen && (
                                    <ul className="absolute z-10 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg w-[300px]">
                                        {countries.map((country) => (
                                            <li
                                                key={country.code}
                                                onClick={() => handleCountryCodeChange(country.code)}
                                                className="flex items-center px-3 py-2 space-x-2 text-gray-700 cursor-pointer hover:bg-gray-100"
                                            >
                                                <img src={country.flag} alt={country.name} className="w-5 h-4" onError={handleImageError} />
                                                <span>{country.callingCode}</span>
                                                <span className="text-sm text-gray-500">{country.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <input
                                type="tel"
                                value={contactData.phone}
                                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                className={`flex-1 px-4 py-2 bg-white border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'focus:ring-red-400' : 'focus:ring-blue-400'}`}
                                disabled={isViewMode}
                            />
                        </div>
                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Country</label>
                        <div ref={countryNameRef} className="relative">
                            <button
                                type="button"
                                onClick={() => !isViewMode && setIsCountryNameDropdownOpen(!isCountryNameDropdownOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg"
                                disabled={isViewMode}
                            >
                                <span>{contactData.location || 'Select a country'}</span>
                                {!isViewMode && (
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
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
                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Close</Button>
                        </DialogClose>
                        {!isViewMode && (
                            <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">
                                {isEditMode ? 'Update Contact' : 'Create Contact'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
