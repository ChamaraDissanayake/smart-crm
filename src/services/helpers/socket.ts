// src/services/helpers/socket.ts
import { ChatHead, Message } from "@/types/Communication";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
    "new-message": (message: Message) => void;
    "new-thread": (thread: ChatHead & { companyId: string }) => void;
}

interface ClientToServerEvents {
    "join-thread": (threadId: string) => void;
    "join-company": (companyId: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    import.meta.env.VITE_BASE_URL || "http://localhost:3000",
    {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        autoConnect: false, // We'll manually connect after setting up listeners
        withCredentials: true,

        // 🔒 Long-living connection settings
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000, // Connection timeout (ms)
    }
);

export default socket;