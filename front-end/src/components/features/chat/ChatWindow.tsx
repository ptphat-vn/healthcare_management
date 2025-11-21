import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetConversationQuery,
  useSendMessageMutation,
} from "@/services/chatApi";
import type { ChatMessage } from "@/types/chat-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSocketConnection } from "../../../hooks/useSocketConnection";
import { useConversations } from "../../../hooks/useConversations";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";
import EmptyState from "@/components/ui/empty/EmptyState";
import EmojiPickerButton from "@/components/ui/emoji/EmojiPickerButton";
import VideoCallButton from "../videoCall/VideoCallButton";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useGetConversationQuery({
    userId: otherUserId,
    page: 1,
    limit: 100,
  });
  const [sendMessageApi] = useSendMessageMutation();
  const { update } = useConversations(currentUserId);
  const updateRef = useRef(update);

  // Cập nhật ref khi update thay đổi
  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  const conversationId = currentUserId
    ? `${[currentUserId, otherUserId].sort().join("_")}`
    : "";

  // Helper function để normalize message ID
  const normalizeMessageId = (msg: ChatMessage): string | undefined => {
    if (!msg._id) return undefined;
    if (typeof msg._id === "string") return msg._id;
    if (typeof msg._id === "object") {
      return (
        (msg._id as any).$oid ||
        String(msg._id) ||
        (msg._id as any).toString?.()
      );
    }
    return String(msg._id);
  };

  // Memoize handleMessage để tránh re-render không cần thiết
  const handleMessage = useCallback((msg: ChatMessage) => {
    const normalizedMsg: ChatMessage = {
      ...msg,
      _id: normalizeMessageId(msg),
      senderId:
        typeof msg.senderId === "string" ? msg.senderId : String(msg.senderId),
      receiverId:
        typeof msg.receiverId === "string"
          ? msg.receiverId
          : String(msg.receiverId),
      createdAt:
        typeof msg.createdAt === "string"
          ? msg.createdAt
          : msg.createdAt instanceof Date
          ? msg.createdAt.toISOString()
          : new Date().toISOString(),
    };

    console.log('[ChatWindow] Normalized message:', normalizedMsg);

    setMessages((prev) => {
      const msgId = normalizedMsg._id;
      if (
        msgId &&
        prev.some((m) => {
          const mId = normalizeMessageId(m);
          return mId && mId === msgId;
        })
      ) {
        return prev;
      }

      lastMessageRef.current = normalizedMsg;
      return [...prev, normalizedMsg];
    });

    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const lastMessageRef = useRef<ChatMessage | null>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      const msg = lastMessageRef.current;
      updateRef.current(otherUserId, {
        lastMessage: msg.content.substring(0, 50),
        lastMessageTime: new Date(msg.createdAt),
      });
      lastMessageRef.current = null;
    }
  }, [messages, otherUserId, update]);

  const { isConnected } = useSocketConnection(conversationId, handleMessage);

  useEffect(() => {
    if (data?.data?.messages) setMessages(data.data.messages);
  }, [data]);

  useEffect(() => {
    if (error) toast.error("Không thể tải cuộc trò chuyện");
  }, [error]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleSend = async () => {
    const content = inputMessage.trim();
    if (!content || !currentUserId || isSending || content.length > 5000)
      return;

    setInputMessage("");
    setIsSending(true);
    try {
      const res = await sendMessageApi({
        userId: otherUserId,
        message: { content },
      }).unwrap();
      if (res.data) {
        setMessages((prev) =>
          prev.some((m) => m._id === res.data._id) ? prev : [...prev, res.data]
        );

        setTimeout(() => {
          updateRef.current(otherUserId, {
            lastMessage: content.substring(0, 50),
            lastMessageTime: new Date(),
          });
        }, 0);

        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e: unknown) {
      const error = e as { data?: { message?: string } };
      toast.error(error?.data?.message || "Không thể gửi tin nhắn");
      setInputMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading)
    return <LoadingSpinner message="Đang tải cuộc trò chuyện..." />;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        {otherUserAvatar && (
          <img
            src={otherUserAvatar}
            alt={otherUserName}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
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

        {/* Video Call Button - Tích hợp component */}
        {currentUserId && (
          <VideoCallButton
            currentUserId={currentUserId}
            friendId={otherUserId}
            friendName={otherUserName}
          />
        )}

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState title="Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!" />
        ) : (
          messages.map((m) => {
            const own = m.senderId === currentUserId;
            return (
              <div
                key={m._id || `msg-${m.createdAt}-${m.senderId}`}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    own ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      own ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {format(new Date(m.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
            className="flex-1"
            maxLength={5000}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-amber-600 mt-1">
            Realtime tạm mất. Tin nhắn vẫn gửi qua máy chủ.
          </p>
        )}
      </div>
    </div>
  );
}
