import { useState, useEffect } from "react";
import ChatWindow from "@/components/features/chat/ChatWindow";
import ChatList from "@/components/features/chat/ChatList";
import { socketService } from "@/services/socketService";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/chat-type";

export default function ChatPage() {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const { update } = useConversations(currentUserId);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>();

  // Global listener để cập nhật conversation list khi nhận message từ bất kỳ conversation nào
  useEffect(() => {
    if (!currentUserId) return;

    const handleGlobalMessage = (msg: ChatMessage) => {
      // Xác định userId của người kia trong conversation
      const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      
      // Cập nhật conversation list với message mới nhất
      update(String(otherUserId), {
        lastMessage: String(msg.content || '').substring(0, 50),
        lastMessageTime: new Date(msg.createdAt),
      });
    };

    socketService.on("message", handleGlobalMessage);

    return () => {
      socketService.off("message", handleGlobalMessage);
    };
  }, [currentUserId, update]);

  const handleSelectChat = (
    userId: string,
    userName: string,
    avatar?: string
  ) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserAvatar(avatar);
  };

  const handleCloseChat = () => {
    setSelectedUserId(undefined);
    setSelectedUserName("");
    setSelectedUserAvatar(undefined);
  };

  return (
    <div className="h-[calc(100vh-4rem-1.5rem)] flex -m-3">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r bg-white">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedUserId={selectedUserId}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedUserId ? (
          <ChatWindow
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            otherUserAvatar={selectedUserAvatar}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Select a chat to start</p>
              <p className="text-sm">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}