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

export default function ChatWindow({ otherUserId, otherUserName, otherUserAvatar, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useGetConversationQuery({ userId: otherUserId, page: 1, limit: 100 });
  const [sendMessageApi] = useSendMessageMutation();

  const conversationId = currentUserId ? `${[currentUserId, otherUserId].sort().join("_")}` : "";

  useEffect(() => {
    if (data?.data?.messages) setMessages(data.data.messages);
  }, [data]);

  useEffect(() => {
    if (error) toast.error("Không thể tải cuộc trò chuyện");
  }, [error]);

  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    socketService.connect();
    setIsConnected(socketService.isConnected());

    const upsertConv = (msg: ChatMessage) => {
      const key = `chat_conversations_${currentUserId}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = list.findIndex((c: any) => c.userId === otherUserId);
      const existingRole = idx >= 0 ? list[idx].roleCode : undefined;
      const conv = {
        userId: otherUserId,
        userName: otherUserName,
        avatar: otherUserAvatar,
        roleCode: existingRole,
        lastMessage: msg.content.substring(0, 50),
        lastMessageTime: new Date(msg.createdAt),
      };
      if (idx >= 0) list[idx] = { ...list[idx], ...conv };
      else list.unshift(conv);
      localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
    };

    const join = () => (socketService.isConnected() ? socketService.joinRoom(conversationId) : setTimeout(join, 500));
    join();

    const onMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      upsertConv(msg);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const onError = (e: { message: string; code?: string }) => {
      if (e.code === "MAX_RECONNECT_ATTEMPTS" || e.code === "RECONNECT_FAILED") toast.error("Mất kết nối. Vui lòng làm mới trang.");
    };

    const onConnect = () => {
      setIsConnected(true);
      socketService.joinRoom(conversationId);
    };

    const onDisconnect = () => setIsConnected(false);

    socketService.on("message", onMessage);
    socketService.on("error", onError);
    socketService.on("connect", onConnect);
    socketService.on("disconnect", onDisconnect);
    socketService.on("reconnect", onConnect);

    return () => {
      socketService.off("message", onMessage);
      socketService.off("error", onError);
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
      socketService.off("reconnect", onConnect);
      socketService.leaveRoom(conversationId);
    };
  }, [currentUserId, conversationId, otherUserId, otherUserName, otherUserAvatar]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = inputMessage.trim();
    if (!content || !currentUserId || isSending || content.length > 5000) return;

    setInputMessage("");
    setIsSending(true);
    try {
      const res = await sendMessageApi({ userId: otherUserId, message: { content } }).unwrap();
      if (res.data) {
        setMessages((prev) => (prev.some((m) => m._id === res.data._id) ? prev : [...prev, res.data]));
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Không thể gửi tin nhắn");
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
          messages.map((m) => {
            const own = m.senderId === currentUserId;
            return (
              <div key={m._id || `msg-${m.createdAt}-${m.senderId}`} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${own ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-xs mt-1 ${own ? "text-blue-100" : "text-gray-500"}`}>{format(new Date(m.createdAt), "HH:mm")}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
            className="flex-1"
            maxLength={5000}
          />
          <Button onClick={handleSend} disabled={!inputMessage.trim() || isSending} size="icon">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {!isConnected && <p className="text-xs text-amber-600 mt-1">Realtime tạm mất. Tin nhắn vẫn gửi qua máy chủ.</p>}
      </div>
    </div>
  );