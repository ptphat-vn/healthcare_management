import { useState, useEffect } from "react";
import ChatWindow from "@/components/features/chat/ChatWindow/ChatWindow";
import ChatList from "@/components/features/chat/ChatList/ChatList";
import { socketService } from "@/services/socketService";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/chat-type";

export default function ChatPage() {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const { update } = useConversations(currentUserId);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string>();

  useEffect(() => {
    if (!currentUserId) return;

    const handleGlobalMessage = (msg: ChatMessage) => {
      const otherUserId =
        msg.senderId === currentUserId ? msg.receiverId : msg.senderId;

      update(String(otherUserId), {
        lastMessage: String(msg.content || "").substring(0, 50),
        lastMessageTime: new Date(msg.createdAt),
      });
    };

    socketService.on("message", handleGlobalMessage);
    return () => socketService.off("message", handleGlobalMessage);
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
    <div className="h-[calc(100vh-4rem-1.5rem)] flex flex-col md:flex-row -m-3 bg-white">
      <div className="bg-white border-r w-full md:w-80 md:flex-shrink-0 h-[60vh] md:h-full">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedUserId={selectedUserId}
        />
      </div>

      <div
        className={`flex-1 w-full h-full ${
          selectedUserId ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedUserId ? (
          <div className="flex-1 min-w-0">
            <ChatWindow
              otherUserId={selectedUserId}
              otherUserName={selectedUserName}
              otherUserAvatar={selectedUserAvatar}
              onClose={handleCloseChat}
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0 flex items-center justify-center bg-white">
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