import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "@/types/chat-type";
import type { RootState } from "@/stores/store";
import { store } from "@/stores/store";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private readonly maxAttempts = 5;

  connect() {
    if (this.socket?.connected) return;

    const { auth: { accessToken: token } } = store.getState() as RootState;
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!token || !apiUrl) {
      console.warn("Socket: Missing token or API URL");
      return;
    }

    if (this.socket && !this.socket.connected) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.socket = io(apiUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxAttempts,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      this.emit("connect", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      this.emit("disconnect", { reason });
      if (reason === "io server disconnect") this.socket?.connect();
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      const code = this.reconnectAttempts >= this.maxAttempts 
        ? "MAX_RECONNECT_ATTEMPTS" 
        : "CONNECTION_ERROR";
      this.emit("error", { message: error.message, code });
    });

    this.socket.on("reconnect", () => {
      this.reconnectAttempts = 0;
      this.emit("reconnect", {});
    });

    this.socket.on("reconnect_failed", () => {
      this.emit("error", { message: "Failed to reconnect", code: "RECONNECT_FAILED" });
    });

    this.socket.on("message", (msg: ChatMessage) => this.emit("message", msg));
    this.socket.on("error", (err: { message: string }) => this.emit("error", err));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
    this.listeners.clear();
  }

  joinRoom(conversationId: string) {
    if (!conversationId?.trim()) return;

    if (this.socket?.connected) {
      this.socket.emit("join", { roomId: conversationId });
    } else {
      const handler = () => {
        if (this.socket?.connected) {
          this.socket.emit("join", { roomId: conversationId });
          this.socket.off("connect", handler);
        }
      };
      this.socket?.once("connect", handler);
    }
  }

  leaveRoom(conversationId: string) {
    if (conversationId && this.socket?.connected) {
      this.socket.emit("leave", { roomId: conversationId });
    }
  }

  sendMessage(payload: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!payload?.conversationId || !payload.content?.trim()) {
      this.emit("error", { message: "Invalid message payload" });
      return;
    }
    if (!this.socket?.connected) {
      this.emit("error", { message: "Socket not connected" });
      return;
    }
    this.socket.emit("message", payload);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in socket listener for ${event}:`, error);
      }
    });
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();