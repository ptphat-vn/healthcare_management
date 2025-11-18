import { useEffect, useState, useRef } from "react";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat-type";
import { useAuth } from "./useAuth";

export function useSocketConnection(conversationId: string, onMessage?: (msg: ChatMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const userId = user?.data?._id;
  
  // Sử dụng ref để lưu callback, tránh re-run effect
  const onMessageRef = useRef(onMessage);
  
  // Cập nhật ref khi callback thay đổi
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!conversationId) return;

    socketService.connect();
    
    // Set userId cho socket service (chỉ set, không identify vì socket sẽ tự identify khi connect)
    if (userId) {
      socketService.setUserId(userId, false); // Thêm flag để không identify ngay
    }
    
    setIsConnected(socketService.isConnected());

    // Track timeout và mounted state
    let joinTimeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    const hasJoinedRef = { current: false }; // Sử dụng ref object thay vì biến thường

    // Hàm join room với retry logic
    const joinRoom = () => {
      if (!isMounted) return;
      
      if (socketService.isConnected() && conversationId && !hasJoinedRef.current) {
        socketService.joinRoom(conversationId);
        hasJoinedRef.current = true; // Đánh dấu đã join
        if (joinTimeoutId) {
          clearTimeout(joinTimeoutId);
          joinTimeoutId = null;
        }
      } else if (isMounted && !hasJoinedRef.current) {
        // Retry nếu chưa join
        joinTimeoutId = setTimeout(() => {
          if (isMounted) joinRoom();
        }, 500);
      }
    };
    
    // Join room ngay nếu đã connected, nếu không thì đợi connect event
    if (socketService.isConnected()) {
      joinRoom();
    }

    // Wrapper function sử dụng ref để tránh dependency issues
    const handleMessage = (msg: ChatMessage) => {
      console.log('[Socket] Received message:', {
        conversationId: msg.conversationId,
        expectedConversationId: conversationId,
        messageId: msg._id,
        messageIdType: typeof msg._id,
        senderId: msg.senderId,
        senderIdType: typeof msg.senderId
      });
      
      if (msg.conversationId === conversationId) {
        console.log('[Socket] Message matches conversation, calling callback');
        onMessageRef.current?.(msg);
      } else {
        console.log('[Socket] Message conversationId mismatch, ignoring');
      }
    };
    
    const handleError = (e: { message: string; code?: string }) => {
      if (e.code === "MAX_RECONNECT_ATTEMPTS" || e.code === "RECONNECT_FAILED") {
        toast.error("Mất kết nối. Vui lòng làm mới trang.");
      }
    };
    
    const handleConnect = () => {
      setIsConnected(true);
      // Không cần setUserId ở đây vì socket đã tự identify khi connect
      // Chỉ cần join room nếu chưa join
      if (conversationId && !hasJoinedRef.current) {
        hasJoinedRef.current = true;
        socketService.joinRoom(conversationId);
      }
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      hasJoinedRef.current = false; // Reset khi disconnect
    };

    // Đăng ký listeners
    socketService.on("message", handleMessage);
    socketService.on("error", handleError);
    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);
    socketService.on("reconnect", handleConnect);

    return () => {
      // Đánh dấu component đã unmount
      isMounted = false;
      
      // Clear timeout nếu còn
      if (joinTimeoutId) {
        clearTimeout(joinTimeoutId);
      }
      
      // Cleanup: gỡ tất cả listeners
      socketService.off("message", handleMessage);
      socketService.off("error", handleError);
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
      socketService.off("reconnect", handleConnect);
      
      // Leave room khi unmount
      if (conversationId) {
        socketService.leaveRoom(conversationId);
      }
    };
  }, [conversationId, userId]);

  return { isConnected };
}

