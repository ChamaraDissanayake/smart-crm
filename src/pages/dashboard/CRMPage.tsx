import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import {
    OpportunityService,
    Lead,
    NewLeadData,
} from '../../services/OpportunityService';
import { CreateLeadModal } from '../../components/CreateLeadModal';
import { ContactModal } from '../../components/ContactModal';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/Contact';

const CRMPage = () => {
    const [stages, setStages] = useState<string[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

    useEffect(() => {
        setStages(OpportunityService.getStages());
        setLeads(OpportunityService.getLeads());
        setContacts(OpportunityService.getContacts());
    }, []);

    const handleCreateLead = async (leadData: NewLeadData) => {
        try {
            const newLead = await OpportunityService.createLead(leadData);
            setLeads([...leads, newLead]);
        } catch (error) {
            console.error('Failed to create lead:', error);
        }
    };

    const handleCreateContact = async (contactData: Omit<Contact, 'id'>) => {
        try {
            const newContact = await OpportunityService.createContact(contactData);
            if (newContact) {
                setContacts([...contacts, newContact]);
            }
        } catch (error) {
            console.error('Failed to create contact:', error);
        }
    };

    const handleDragStart = (lead: Lead) => {
        setDraggedLead(lead);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: string) => {
        e.preventDefault();
        console.log(`Dragging over ${stage}`);

    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, stage: string) => {
        e.preventDefault();
        if (draggedLead && draggedLead.stage !== stage) {
            const updatedLeads = leads.map(lead =>
                lead.id === draggedLead.id ? { ...lead, stage } : lead
            );
            setLeads(updatedLeads);

            try {
                await OpportunityService.updateLeadStage(draggedLead.id, stage);
            } catch (error) {
                console.error('Failed to update lead stage:', error);
                setLeads(leads); // revert on failure
            }
        }
    };

    const getLeadsByStage = (stage: string) =>
        leads.filter(lead => lead.stage === stage);

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'New': return 'bg-blue-100 border-blue-300';
            case 'Qualified': return 'bg-purple-100 border-purple-300';
            case 'Proposition': return 'bg-yellow-100 border-yellow-300';
            case 'Won': return 'bg-green-100 border-green-300';
            case 'Lost': return 'bg-red-100 border-red-300';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="py-4">
            {/* Page header - stays fixed at top */}
            <div className="sticky top-0 z-10 pt-4 pb-2 bg-white border-b">
                <div className="flex flex-row items-center justify-between px-4 mb-2 gap-x-4">
                    <h1 className="text-2xl font-bold">Pipeline</h1>
                    <div className="flex gap-2">
                        <Button variant="primary" className="gap-2" type="button" onClick={() => setIsLeadModalOpen(true)}>
                            <PlusCircle size={16} />
                            Create Lead
                        </Button>
                        <Button variant="secondary" className="gap-2" type="button" onClick={() => setIsContactModalOpen(true)}>
                            <PlusCircle size={16} />
                            Create Contact
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main scrollable container */}
            <div className="relative overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
                {/* Column headers container - sticky vertically but scrolls horizontally */}
                <div className="sticky top-[0] z-10 bg-white">
                    <div className="flex px-4">
                        {stages.map(stage => (
                            <div
                                key={stage}
                                className={`flex-shrink-0 w-64 mr-4 rounded-t-lg ${getStageColor(stage)}`}
                            >
                                <div className="p-3 font-semibold">
                                    {stage} ({getLeadsByStage(stage).length})
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columns content - scrolls both directions */}
                <div className="flex px-4">
                    {stages.map(stage => (
                        <div
                            key={stage}
                            className={`flex-shrink-0 w-64 mr-4 rounded-lg border ${getStageColor(stage)}`}
                            onDragOver={(e) => handleDragOver(e, stage)}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            {/* Hidden spacer matching header height */}
                            <div className="opacity-0 pointer-events-none h-[52px]"></div>
                            <div className="p-2 space-y-2">
                                {getLeadsByStage(stage).map(lead => (
                                    <div
                                        key={lead.id}
                                        className="p-3 bg-white rounded shadow cursor-move"
                                        draggable
                                        onDragStart={() => handleDragStart(lead)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium">{lead.name}</h3>
                                                <p className="text-sm text-gray-600">{lead.contact.name}</p>
                                            </div>
                                            <span className={`w-3 h-3 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <span className="font-medium">${lead.expectedRevenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CreateLeadModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onCreate={handleCreateLead}
                contacts={contacts}
                stages={stages}
            />

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleCreateContact} // replaces onCreate
                mode="create"
            />
        </div>
    );
};

export default CRMPage;
