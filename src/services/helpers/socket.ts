// src/services/helpers/socket.ts
import { Message } from "@/types/Chat";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
    "new-message": (message: Message) => void;
}

interface ClientToServerEvents {
    "join-thread": (threadId: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    import.meta.env.VITE_BASE_URL || "http://localhost:3000",
    {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        autoConnect: false, // We'll manually connect after setting up listeners
        withCredentials: true,
    }
);

export default socket;