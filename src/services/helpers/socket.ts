import { ChatHead, Message } from "@/types/Communication";
import { io, Socket } from "socket.io-client";

// Socket events
interface ServerToClientEvents {
    "new-message": (message: Message) => void;
    "new-thread": (thread: ChatHead & { companyId: string }) => void;
}

interface ClientToServerEvents {
    "join-thread": (threadId: string) => void;
    "join-company": (companyId: string) => void;
}

// Create socket instance
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    import.meta.env.VITE_BASE_URL || "http://localhost:3000",
    {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        autoConnect: false,
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
    }
);

// --- Connection Status Handling ---
let hasShownDisconnectAlert = false;

socket.on("connect", () => {
    console.log("✅ Socket connected.");
    hasShownDisconnectAlert = false;
});

socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected. Reason:", reason);

    if (!hasShownDisconnectAlert) {
        console.log("Real-time connection lost. Please refresh the page or check your internet connection.");
        hasShownDisconnectAlert = true;
    }

    // Optional: try manual reconnect if needed
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

socket.on("connect_error", (err) => {
    console.error("🚫 Connection error:", err.message);
});

// --- Optional: Reconnect when tab becomes visible ---
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !socket.connected) {
        console.log("🔄 Reconnecting socket after tab became visible.");
        socket.connect();
    }
});

export default socket;