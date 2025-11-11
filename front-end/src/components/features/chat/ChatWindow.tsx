import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetConversationQuery, useSendMessageMutation } from "@/services/chatApi";
import { socketService } from "@/services/socketService";
import type { ChatMessage } from "@/types/chat-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onClose?: () => void;
}

export default function ChatWindow({
  otherUserId,
  otherUserName,
  otherUserAvatar,
  onClose,
}: ChatWindowProps) {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const { data: conversationData, isLoading, error: conversationError } = useGetConversationQuery({
    userId: otherUserId,
    page: 1,
    limit: 100,
  });

  const [sendMessageApi] = useSendMessageMutation();

  const conversationId = currentUserId
    ? `${[currentUserId, otherUserId].sort().join("_")}`
    : "";

  useEffect(() => {
    if (conversationData?.data?.messages) {
      setMessages(conversationData.data.messages);
    }
  }, [conversationData]);

  useEffect(() => {
    if (conversationError) toast.error("Không thể tải cuộc trò chuyện");
  }, [conversationError]);

  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    socketService.connect();
    setIsConnected(socketService.isConnected());

    const joinRoom = () => {
      if (socketService.isConnected()) {
        socketService.joinRoom(conversationId);
      } else {
        setTimeout(joinRoom, 500);
      }
    };
    joinRoom();

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId) return;
      
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
      
      // Lưu conversation vào localStorage với roleCode
      const saved = localStorage.getItem(`chat_conversations_${currentUserId}`);
      const conversations = saved ? JSON.parse(saved) : [];
      const existingIndex = conversations.findIndex((c: any) => c.userId === otherUserId);
      
      // Xác định roleCode từ userName hoặc từ message
      const isDoctor = otherUserName.toLowerCase().includes("bác sĩ") || 
                       otherUserName.toLowerCase().includes("doctor") ||
                       otherUserName.toLowerCase().includes("consultant");
      
      const convData = {
        userId: otherUserId,
        userName: otherUserName,
        avatar: otherUserAvatar,
        roleCode: isDoctor ? "consultant" : undefined,
        lastMessage: msg.content.substring(0, 50),
        lastMessageTime: new Date(msg.createdAt),
      };
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = { ...conversations[existingIndex], ...convData };
      } else {
        conversations.unshift(convData);
      }
      
      localStorage.setItem(
        `chat_conversations_${currentUserId}`,
        JSON.stringify(conversations.slice(0, 20))
      );
      
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const handlers = {
      message: handleNewMessage,
      error: (err: { message: string; code?: string }) => {
        if (err.code === "MAX_RECONNECT_ATTEMPTS" || err.code === "RECONNECT_FAILED") {
          toast.error("Mất kết nối. Vui lòng làm mới trang.");
        }
      },
      connect: () => {
        setIsConnected(true);
        socketService.joinRoom(conversationId);
      },
      disconnect: () => setIsConnected(false),
      reconnect: () => {
        setIsConnected(true);
        socketService.joinRoom(conversationId);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socketService.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach((event) => {
        socketService.off(event, handlers[event as keyof typeof handlers]);
      });
      socketService.leaveRoom(conversationId);
    };
  }, [currentUserId, conversationId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const content = inputMessage.trim();
    if (!content || !currentUserId || isSending || content.length > 5000) return;

    setInputMessage("");
    setIsSending(true);

    try {
      const result = await sendMessageApi({
        userId: otherUserId,
        message: { content },
      }).unwrap();

      if (result.data) {
        setMessages((prev) =>
          prev.some((m) => m._id === result.data._id) ? prev : [...prev, result.data]
        );
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Không thể gửi tin nhắn");
      setInputMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        {otherUserAvatar && (
          <img
            src={otherUserAvatar}
            alt={otherUserName}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-500" />
                <p className="text-sm text-green-600">Đã kết nối</p>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-gray-400" />
                <p className="text-sm text-gray-500">Đang kết nối...</p>
              </>
            )}
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={msg._id || `msg-${msg.createdAt}-${msg.senderId}`}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Nhập tin nhắn..."
            disabled={isSending || !isConnected}
            className="flex-1"
            maxLength={5000}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending || !isConnected}
            size="icon"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-amber-600 mt-1">Mất kết nối. Tin nhắn sẽ được gửi khi kết nối lại.</p>
        )}
      </div>
    </div>
  );
}