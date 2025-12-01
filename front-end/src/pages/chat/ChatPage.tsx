import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import ChatWindow from "@/components/features/chat/ChatWindow/ChatWindow";
import ChatList from "@/components/features/chat/ChatList/ChatList";
import { socketService } from "@/services/socketService";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useChatPeers } from "@/hooks/useChatPeers";
import type { ChatMessage } from "@/types/chat-type";

export default function ChatPage() {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const { update, conversations, save } = useConversations(currentUserId);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string>();

  const userIdFromQuery = searchParams.get("userId");

  interface LocationState {
    userName?: string;
    avatar?: string;
  }
  const stateUserName = (location.state as LocationState | null)?.userName;
  const stateAvatar = (location.state as LocationState | null)?.avatar;

  const clearUserIdParam = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("userId");
      return params;
    });
  }, [setSearchParams]);

  // Use useChatPeers to get user info if needed
  const { users } = useChatPeers("");

  useEffect(() => {
    if (
      userIdFromQuery &&
      userIdFromQuery !== currentUserId &&
      userIdFromQuery !== selectedUserId
    ) {
      if (stateUserName) {
        setSelectedUserId(userIdFromQuery);
        setSelectedUserName(stateUserName);
        setSelectedUserAvatar(stateAvatar);

        const existingConversation = conversations.find(
          (c) => c.userId === userIdFromQuery
        );
        if (!existingConversation) {
          save({
            userId: userIdFromQuery,
            userName: stateUserName,
            avatar: stateAvatar,
            lastMessageTime: new Date(),
          });
        }

        clearUserIdParam();
      } else {
        const userFromList = users?.find((u) => u._id === userIdFromQuery);
        const conversation = conversations.find(
          (c) => c.userId === userIdFromQuery
        );

        if (userFromList) {
          setSelectedUserId(userIdFromQuery);
          setSelectedUserName(userFromList.fullName || "Người dùng");
          setSelectedUserAvatar(userFromList.avatar);
          clearUserIdParam();
        } else if (conversation) {
          setSelectedUserId(userIdFromQuery);
          setSelectedUserName(conversation.userName);
          setSelectedUserAvatar(conversation.avatar);
          clearUserIdParam();
        }
      }
    }
  }, [
    userIdFromQuery,
    currentUserId,
    selectedUserId,
    stateUserName,
    stateAvatar,
    users,
    conversations,
    save,
    clearUserIdParam,
  ]);

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
    clearUserIdParam();
  };

  const handleCloseChat = () => {
    setSelectedUserId(undefined);
    setSelectedUserName("");
    setSelectedUserAvatar(undefined);
  };

  return (
    <div className="h-[calc(100vh-4rem-1.5rem)] flex flex-col md:flex-row -m-3 bg-white">
      <div className="bg-white border-r w-full md:w-80 md:shrink-0 h-[60vh] md:h-full">
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
