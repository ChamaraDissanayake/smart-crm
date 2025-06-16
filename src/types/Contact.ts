import { ChannelType } from "./Communication";

export interface Contact {
    id: string;
    name: string;
    email?: string;
    code?: string;
    phone?: string;
    location?: string;
    isCompany?: boolean;
    channels?: ChannelType[];
}