import { useState } from 'react';
import { Contact, NewLeadData } from '../services/OpportunityService';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (leadData: NewLeadData) => void;
    contacts: Contact[];
    stages: string[];
}

export const CreateLeadModal = ({
    isOpen,
    onClose,
    onCreate,
    contacts,
    stages,
}: CreateLeadModalProps) => {
    const [formData, setFormData] = useState<NewLeadData>({
        name: '',
        contactId: contacts[0]?.id || 0,
        expectedRevenue: 0,
        priority: 'medium',
        stage: stages[0] || 'New'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Create New Lead</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Lead Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label>Contact</Label>
                            <Select
                                value={formData.contactId.toString()}
                                onValueChange={(value) => setFormData({ ...formData, contactId: Number(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map(contact => (
                                        <SelectItem key={contact.id} value={contact.id.toString()}>
                                            {contact.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="revenue">Expected Revenue ($)</Label>
                            <Input
                                id="revenue"
                                type="number"
                                value={formData.expectedRevenue}
                                onChange={(e) => setFormData({ ...formData, expectedRevenue: Number(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <Label>Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Stage</Label>
                            <Select
                                value={formData.stage}
                                onValueChange={(value) => setFormData({ ...formData, stage: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map(stage => (
                                        <SelectItem key={stage} value={stage}>
                                            {stage}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Lead
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};