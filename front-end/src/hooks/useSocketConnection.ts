import { useEffect, useState } from "react";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat-type";

export function useSocketConnection(conversationId: string, onMessage?: (msg: ChatMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    socketService.connect();
    setIsConnected(socketService.isConnected());

    const join = () => (socketService.isConnected() ? socketService.joinRoom(conversationId) : setTimeout(join, 500));
    join();

    const onMsg = (msg: ChatMessage) => {
      if (msg.conversationId === conversationId) onMessage?.(msg);
    };
    const onErr = (e: { message: string; code?: string }) => {
      if (e.code === "MAX_RECONNECT_ATTEMPTS" || e.code === "RECONNECT_FAILED") toast.error("Mất kết nối. Vui lòng làm mới trang.");
    };
    const onConnect = () => {
      setIsConnected(true);
      socketService.joinRoom(conversationId);
    };
    const onDisconnect = () => setIsConnected(false);

    socketService.on("message", onMsg);
    socketService.on("error", onErr);
    socketService.on("connect", onConnect);
    socketService.on("disconnect", onDisconnect);
    socketService.on("reconnect", onConnect);

    return () => {
      socketService.off("message", onMsg);
      socketService.off("error", onErr);
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
      socketService.off("reconnect", onConnect);
      socketService.leaveRoom(conversationId);
    };
  }, [conversationId, onMessage]);

  return { isConnected };
}

