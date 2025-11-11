import { useState } from "react";
import ChatWindow from "@/components/features/chat/ChatWindow";
import ChatList from "@/components/features/chat/ChatList";

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>();

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
    <div className="h-[calc(100vh-4rem)] flex">
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