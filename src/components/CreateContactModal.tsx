import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (contactData: Omit<Contact, 'id'>) => void;
}

export const CreateContactModal = ({
    isOpen,
    onClose,
    onCreate,
}: CreateContactModalProps) => {
    const [contactData, setContactData] = useState<Omit<Contact, 'id'>>({
        name: '',
        email: '',
        phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(contactData);
        onClose();
        setContactData({ name: '', email: '', phone: '' });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                    <DialogDescription>
                        Add a new contact to your CRM system.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={contactData.name}
                            onChange={(e) =>
                                setContactData({ ...contactData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={contactData.email}
                            onChange={(e) =>
                                setContactData({ ...contactData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={contactData.phone}
                            onChange={(e) =>
                                setContactData({ ...contactData, phone: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit">Create Contact</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};