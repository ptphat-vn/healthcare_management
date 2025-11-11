import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User as UserIcon, Send, Stethoscope, Users, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { useGetAllUserQuery } from "@/services/userApi";
import type { User } from "@/types/user.type";

interface ChatListProps {
  onSelectChat: (userId: string, userName: string, avatar?: string) => void;
  selectedUserId?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  avatar?: string;
  roleCode?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export default function ChatList({ onSelectChat, selectedUserId }: ChatListProps) {
  const { user } = useAuth();
  const currentUserId = user?.data?._id;
  const [selectedUserIdInput, setSelectedUserIdInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMode, setActiveMode] = useState<"doctor" | "other">("doctor");
  const [expandedSection, setExpandedSection] = useState<"doctor" | "other" | null>("doctor");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users based on active mode and search term
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUserQuery({
    search: searchTerm || undefined,
    status: 1, // Only active users
    limit: 100, // Limit results for better performance
  });

  useEffect(() => {
    const saved = localStorage.getItem(`chat_conversations_${currentUserId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(
          parsed.map((c: any) => ({
            ...c,
            lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined,
          }))
        );
      } catch (e) {
        console.error("Failed to load conversations", e);
      }
    }
  }, [currentUserId]);

  const doctorConversations = useMemo(
    () =>
      conversations.filter(
        (c) => c.roleCode === "consultant" || c.roleCode === "doctor" || c.userName.toLowerCase().includes("bác sĩ")
      ),
    [conversations]
  );

  const otherConversations = useMemo(
    () =>
      conversations.filter(
        (c) => c.roleCode !== "consultant" && c.roleCode !== "doctor" && !c.userName.toLowerCase().includes("bác sĩ")
      ),
    [conversations]
  );

  // Prepare combobox options based on active mode
  const userOptions = useMemo(() => {
    if (!usersData?.data?.user) return [];

    return usersData.data.user
      .filter((user: User) => {
        // Exclude current user
        if (user._id === currentUserId) return false;
        
        // Filter by role based on active mode
        if (activeMode === "doctor") {
          // Show doctors/consultants
          return user.roleCode === "consultant" || user.roleCode === "doctor";
        } else {
          // Show other users (not doctors)
          return user.roleCode !== "consultant" && user.roleCode !== "doctor";
        }
      })
      .map((user: User) => ({
        value: user._id,
        label: user.fullName || `User ${user._id.substring(0, 8)}...`,
        description: `${user.email || "No email"}${user.roleCode ? ` • ${user.roleCode}` : ""}`,
      }));
  }, [usersData, currentUserId, activeMode]);

  const saveConversation = (userId: string, userName: string, avatar?: string, roleCode?: string) => {
    const newConv: Conversation = {
      userId,
      userName,
      avatar,
      roleCode,
      lastMessageTime: new Date(),
    };

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.userId !== userId);
      const updated = [newConv, ...filtered].slice(0, 20);
      localStorage.setItem(`chat_conversations_${currentUserId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartChat = () => {
    const userId = selectedUserIdInput.trim();
    if (!userId) {
      toast.error("Vui lòng chọn người dùng để chat");
      return;
    }
    if (userId === currentUserId) {
      toast.error("Không thể chat với chính mình");
      return;
    }

    // Find selected user to get their info
    const selectedUser = usersData?.data?.user?.find((u: User) => u._id === userId);
    const userName = selectedUser?.fullName || (activeMode === "doctor" ? "Bác sĩ tư vấn" : `User ${userId.substring(0, 8)}...`);
    const roleCode = selectedUser?.roleCode || (activeMode === "doctor" ? "consultant" : undefined);
    const avatar = selectedUser?.avatar;

    saveConversation(userId, userName, avatar, roleCode);
    onSelectChat(userId, userName, avatar);
    setSelectedUserIdInput("");
    setSearchTerm("");
    toast.success(`Đã mở chat với ${userName}`);
  };

  const handleSelectConversation = (conv: Conversation) => {
    onSelectChat(conv.userId, conv.userName, conv.avatar);
  };

  const ConversationCard = ({ conv, isSelected }: { conv: Conversation; isSelected: boolean }) => (
    <Card
      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-blue-200" : ""
      }`}
      onClick={() => handleSelectConversation(conv)}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            conv.roleCode === "consultant" || conv.roleCode === "doctor"
              ? "bg-green-100"
              : "bg-blue-100"
          }`}
        >
          {conv.roleCode === "consultant" || conv.roleCode === "doctor" ? (
            <Stethoscope className="w-5 h-5 text-green-600" />
          ) : (
            <UserIcon className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{conv.userName}</p>
          {conv.lastMessage && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b space-y-3">
        <h2 className="text-lg font-semibold">Chat</h2>

        {/* Mode selector */}
        <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
          <button
            onClick={() => {
              setActiveMode("doctor");
              setSelectedUserIdInput("");
              setSearchTerm("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeMode === "doctor"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Bác sĩ
          </button>
          <button
            onClick={() => {
              setActiveMode("other");
              setSelectedUserIdInput("");
              setSearchTerm("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeMode === "other"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Người khác
          </button>
        </div>

        {/* User selection with Combobox */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                options={userOptions}
                value={selectedUserIdInput}
                onValueChange={(value) => {
                  setSelectedUserIdInput(value);
                  // Update search term when user selects from dropdown
                  const selectedUser = usersData?.data?.user?.find((u: User) => u._id === value);
                  if (selectedUser) {
                    setSearchTerm(selectedUser.fullName || "");
                  }
                }}
                placeholder={
                  activeMode === "doctor"
                    ? "Tìm kiếm bác sĩ..."
                    : "Tìm kiếm người dùng..."
                }
                searchPlaceholder="Tìm theo tên, email..."
                emptyMessage={
                  isLoadingUsers
                    ? "Đang tải..."
                    : activeMode === "doctor"
                    ? "Không tìm thấy bác sĩ nào"
                    : "Không tìm thấy người dùng nào"
                }
                disabled={isLoadingUsers}
              />
            </div>
            <Button 
              onClick={handleStartChat} 
              size="icon"
              disabled={!selectedUserIdInput || isLoadingUsers}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {activeMode === "doctor"
              ? "Chọn bác sĩ từ danh sách để bắt đầu tư vấn"
              : "Chọn người dùng từ danh sách để bắt đầu chat"}
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs text-center text-gray-400">
              {activeMode === "doctor"
                ? "Chọn bác sĩ từ danh sách ở trên để bắt đầu tư vấn"
                : "Chọn người dùng từ danh sách ở trên để bắt đầu chat"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {/* Section: Chat với bác sĩ */}
            {doctorConversations.length > 0 && (
              <div>
                <button
                  onClick={() =>
                    setExpandedSection(expandedSection === "doctor" ? null : "doctor")
                  }
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-green-600" />
                    <span>Chat với bác sĩ ({doctorConversations.length})</span>
                  </div>
                  {expandedSection === "doctor" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "doctor" && (
                  <div className="mt-2 space-y-2">
                    {doctorConversations.map((conv) => (
                      <ConversationCard
                        key={conv.userId}
                        conv={conv}
                        isSelected={selectedUserId === conv.userId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section: Chat với người khác */}
            {otherConversations.length > 0 && (
              <div>
                <button
                  onClick={() =>
                    setExpandedSection(expandedSection === "other" ? null : "other")
                  }
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Chat với người khác ({otherConversations.length})</span>
                  </div>
                  {expandedSection === "other" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "other" && (
                  <div className="mt-2 space-y-2">
                    {otherConversations.map((conv) => (
                      <ConversationCard
                        key={conv.userId}
                        conv={conv}
                        isSelected={selectedUserId === conv.userId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}