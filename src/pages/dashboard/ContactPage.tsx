import { useState, useEffect } from 'react';
import { PlusCircle, Download, Search, Edit, Trash2, Building2, SquareUser } from 'lucide-react';
import { ContactModal } from '../../components/ContactModal';
import { Button } from '@/components/ui/button';
import { OpportunityService } from '@/services/OpportunityService';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Contact } from '@/types/Contact';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

const ContactPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [contactModalMode, setContactModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'individual'>('all');
    const [withPhoneOnly, setWithPhoneOnly] = useState(false);
    const [withEmailOnly, setWithEmailOnly] = useState(false);
    const [searchParams] = useSearchParams();
    const contactIdFromUrl = searchParams.get('id');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const data = await OpportunityService.getCompanyContacts();
            setContacts(data);

            // Handle modal open by ID from URL
            console.log('Chamara contact', contactIdFromUrl);

            if (contactIdFromUrl) {
                const matched = data.find((c) => c.id === contactIdFromUrl);
                if (matched) {
                    setSelectedContact(matched);
                    setContactModalMode('view');
                    setIsContactModalOpen(true);
                } else {
                    console.log('Chamara not match', data);

                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setSelectedContact(null);
        setContactModalMode('create');
        setIsContactModalOpen(true);
    };

    const handleViewContact = (contact: Contact) => {
        setSelectedContact(contact);
        setContactModalMode('view');
        setIsContactModalOpen(true);
    };

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact);
        setContactModalMode('edit');
        setIsContactModalOpen(true);
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        try {
            const success = await OpportunityService.deleteContact(contactId);
            if (success) {
                setContacts(prev => prev.filter(c => c.id !== contactId));
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleSubmitContact = async (contactData: Omit<Contact, 'id'>) => {
        try {
            if (contactModalMode === 'create') {
                const newContact = await OpportunityService.createContact(contactData);
                if (newContact) {
                    setContacts(prev => [newContact, ...prev]);
                }
            } else if (contactModalMode === 'edit' && selectedContact) {
                const updatedContact = await OpportunityService.updateContact(selectedContact.id, contactData);
                if (updatedContact) {
                    setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
                }
            }
        } catch (error) {
            console.error('Error submitting contact:', error);
        } finally {
            setIsContactModalOpen(false);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        const query = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !searchTerm ||
            (contact.name?.toLowerCase().includes(query) ?? false) ||
            (contact.phone?.includes(query) ?? false);

        const matchesType =
            typeFilter === 'all' ||
            (typeFilter === 'company' && contact.isCompany) ||
            (typeFilter === 'individual' && !contact.isCompany);

        const matchesPhone = !withPhoneOnly || !!contact.phone;
        const matchesEmail = !withEmailOnly || !!contact.email;

        return matchesSearch && matchesType && matchesPhone && matchesEmail;
    });

    return (
        <div className="flex flex-col h-full p-6 bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold">Contacts</h1>
                <div className="flex items-center gap-2">

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Filter Contacts</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Contact Type - keep submenu */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Type</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTypeFilter('all')}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('company')}>Companies</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTypeFilter('individual')}>Individuals</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* With Phone - checkbox */}
                            <DropdownMenuCheckboxItem
                                checked={withPhoneOnly}
                                onCheckedChange={(checked) => setWithPhoneOnly(checked)}
                            >
                                With Phone
                            </DropdownMenuCheckboxItem>

                            {/* With Email - checkbox */}
                            <DropdownMenuCheckboxItem
                                checked={withEmailOnly}
                                onCheckedChange={(checked) => setWithEmailOnly(checked)}
                            >
                                With Email
                            </DropdownMenuCheckboxItem>

                            {/* Separator and Clear Button */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setTypeFilter('all')
                                    setWithPhoneOnly(false)
                                    setWithEmailOnly(false)
                                }}
                                className="justify-center font-medium text-red-600"
                            >
                                Clear All Filters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-80"
                        />
                    </div>

                    <Button variant="primary" className="gap-2" onClick={handleCreateClick}>
                        <PlusCircle size={16} />
                        Create Contact
                    </Button>

                    <Button variant="secondary" className="gap-2">
                        <Download size={16} />
                        Import Contact
                    </Button>
                </div>

            </div>


            {/* Contact List */}
            <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                ) : filteredContacts.length > 0 ? (
                    <div className="overflow-x-auto">
                        {/* 👆 wrap the table with this to prevent layout issues on smaller screens */}
                        {filteredContacts.length > 0 ? (
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="text-sm font-semibold text-left text-gray-700 bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-800">
                                    {filteredContacts.map((contact, index) => {
                                        const displayName = contact.name?.trim() || "Unknown";

                                        return (
                                            <tr
                                                key={contact.id}
                                                className="transition border-t cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleViewContact(contact)}
                                            >
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3">{displayName}</td>
                                                <td className="px-4 py-3">{contact.email || '-'}</td>
                                                <td className="px-4 py-3">{contact.phone || '-'}</td>
                                                <td className="px-4 py-3">
                                                    {contact.isCompany ? (
                                                        <span className="inline-flex items-center text-red-600">
                                                            <Building2 size={16} className="mr-1" />
                                                            Company
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-blue-600">
                                                            <SquareUser size={16} className="mr-1" />
                                                            Individual
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right"
                                                    onClick={(e) => e.stopPropagation()} // Prevents row click
                                                >
                                                    <div className="flex items-center justify-end gap-2">
                                                        {contact.phone && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => navigate('/dashboard/communication')}
                                                            >
                                                                <FaWhatsapp className="text-xl text-green-500" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleEditContact(contact)}
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleDeleteContact(contact.id)}
                                                        >
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>


                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                {contacts.length === 0 ? 'No contacts available' : 'No matching contacts found'}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        {contacts.length === 0 ? 'No contacts available' : 'No matching contacts found'}
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleSubmitContact}
                initialData={selectedContact || undefined}
                mode={contactModalMode}
            />
        </div>
    );
};

export default ContactPage;