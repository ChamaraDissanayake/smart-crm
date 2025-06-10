import { useState, useEffect } from 'react';
import { PlusCircle, Download, Search, Edit, Trash2, Building2, SquareUser } from 'lucide-react';
import { ContactModal } from '../../components/ContactModal';
import { Button } from '@/components/ui/button';
import { OpportunityService } from '@/services/OpportunityService';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/types/Contact';

const ContactPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [contactModalMode, setContactModalMode] = useState<'create' | 'edit' | 'view'>('create');
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
                console.log('Chamara - if:', contactData);
                const newContact = await OpportunityService.createContact(contactData);
                if (newContact) {
                    setContacts(prev => [...prev, newContact]);
                }
            } else if (contactModalMode === 'edit' && selectedContact) {
                // console.log('Chamara - else if:', contactData);
                const updatedContact = await OpportunityService.updateContact(selectedContact.id, contactData);
                if (updatedContact) {
                    console.log('Chamara - updatedContact:', updatedContact);

                    setContacts(prev => prev.map(c => c.id === selectedContact.id ? updatedContact : c));
                }
            }
        } catch (error) {
            console.error('Error submitting contact:', error);
        } finally {
            setIsContactModalOpen(false);
        }
    };

    // const filteredContacts = contacts.filter(c =>
    //     (c.name || 'unknown').toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const filteredContacts = contacts.filter(contact => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase().trim();
        return (
            (contact.name || 'unknown').toLowerCase().includes(query) ||
            (contact.phone ? contact.phone.includes(query) : false)
        );
    });


    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-4 bg-white border-b">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <div className="flex items-center gap-2">
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
            </div>

            {/* Contact List */}
            <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                ) : filteredContacts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredContacts.map((contact) => {
                            const displayName = contact.name?.trim() || "Unknown";
                            return (
                                <div
                                    key={contact.id}
                                    className="
                                        p-4 flex flex-col justify-between border rounded-lg shadow-sm 
                                        hover:shadow-lg min-h-[154px]
                                        hover:-translate-y-1 transition-transform duration-300
                                    "
                                >

                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleViewContact(contact)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h2
                                                className={`text-lg font-semibold ${contact.isCompany ? "text-red-900" : "text-blue-900"
                                                    }`}
                                            >
                                                {displayName}
                                            </h2>

                                            <span>
                                                {contact.isCompany ? (
                                                    <Building2 className="text-red-900" />
                                                ) : (
                                                    <SquareUser className="text-blue-900" />
                                                )}
                                            </span>
                                        </div>
                                        {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                                        {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                                    </div>

                                    {/* Align this block to the bottom */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            {contact.phone && (
                                                <Button variant="outline" size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/dashboard/communication');
                                                    }} >
                                                    <FaWhatsapp className="text-xl text-green-500" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditContact(contact);
                                                }} >
                                                <Edit size={16} />
                                            </Button>

                                            <Button size="icon" variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteContact(contact.id);
                                                }} >
                                                <Trash2 size={16} className="text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            );
                        })}
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