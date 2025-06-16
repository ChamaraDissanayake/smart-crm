
import { ChatHead, ContactHeader, RoleType } from '@/types/Communication';

export function formatAndSortChatHeads(chatHeads: ChatHead[]): ContactHeader[] {
    const formatted = chatHeads.map((head) => ({
        id: head.id,
        customerId: head.customer.id,
        name: head.customer.name || head.customer.phone,
        phone: head.customer.phone,
        lastMessage: head.lastMessage?.content || '',
        lastMessageRole: head.lastMessage?.role as RoleType | undefined,
        channel: head.channel,
        currentHandler: head.currentHandler,
        assignee: head.assignee,
        time: head.lastMessage?.createdAt,
        createdAt: head.lastMessage?.createdAt
            ? formatTime(head.lastMessage.createdAt)
            : '',
    }));

    return formatted.sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        return timeB - timeA;
    });
}

export const formatTime = (dateInput: string | number | Date): string => {
    return new Date(dateInput).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};