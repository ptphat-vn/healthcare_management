import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, User as UserIcon, Send, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { useGetAllLabUserQuery, useGetAllPatientQuery } from "@/services/userApi";
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
  const roleCode = user?.data?.roleCode;
  const isPatient = roleCode === "patient";
  const isDoctor = roleCode === "doctor" || roleCode === "consultant" || roleCode === "lab_user";
  const targetLabel = isPatient ? "bác sĩ" : "bệnh nhân";

  const [selectedUserIdInput, setSelectedUserIdInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedSection, setExpandedSection] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams = { search: searchTerm || undefined, status: 1, limit: 100 };
  const { data: labUsersData, isLoading: isLoadingLabUsers } = useGetAllLabUserQuery(queryParams, { skip: !isPatient } as any);
  const { data: patientsData, isLoading: isLoadingPatients } = useGetAllPatientQuery(queryParams, { skip: !isDoctor } as any);
  const usersData = isPatient ? labUsersData : patientsData;
  const isLoadingUsers = isPatient ? isLoadingLabUsers : isLoadingPatients;

  useEffect(() => {
    const saved = localStorage.getItem(`chat_conversations_${currentUserId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({ ...c, lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined })));
      } catch (e) {
        console.error("Failed to load conversations", e);
      }
    }
  }, [currentUserId]);

  const userOptions = useMemo(
    () =>
      (usersData?.data?.user || [])
        .filter((u: User) => u._id !== currentUserId)
        .map((u: User) => ({
          value: u._id,
          label: u.fullName || `User ${u._id.substring(0, 8)}...`,
          description: `${u.email || "No email"}${u.roleCode ? ` • ${u.roleCode}` : ""}`,
        })),
    [usersData, currentUserId]
  );

  const saveConversation = (userId: string, userName: string, avatar?: string, roleCode?: string) => {
    const newConv = { userId, userName, avatar, roleCode, lastMessageTime: new Date() };
    setConversations((prev) => {
      const updated = [newConv, ...prev.filter((c) => c.userId !== userId)].slice(0, 20);
      localStorage.setItem(`chat_conversations_${currentUserId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartChat = () => {
    const userId = selectedUserIdInput.trim();
    if (!userId || userId === currentUserId) {
      toast.error(userId ? "Không thể chat với chính mình" : `Vui lòng chọn ${targetLabel} để chat`);
      return;
    }

    const selectedUser = usersData?.data?.user?.find((u: User) => u._id === userId);
    const userName = selectedUser?.fullName || (isPatient ? "Bác sĩ tư vấn" : `Bệnh nhân ${userId.substring(0, 8)}...`);
    const partnerRoleCode = selectedUser?.roleCode || (isPatient ? "consultant" : "patient");

    saveConversation(userId, userName, selectedUser?.avatar, partnerRoleCode);
    onSelectChat(userId, userName, selectedUser?.avatar);
    setSelectedUserIdInput("");
    setSearchTerm("");
    toast.success(`Đã mở chat với ${userName}`);
  };

  const isDoctorRole = (code?: string) => code === "consultant" || code === "doctor";
  const Icon = isPatient ? Stethoscope : UserIcon;
  const iconColor = isPatient ? "text-green-600" : "text-blue-600";
  const bgColor = isPatient ? "bg-green-100" : "bg-blue-100";

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b space-y-3">
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                options={userOptions}
                value={selectedUserIdInput}
                onValueChange={(value) => {
                  setSelectedUserIdInput(value);
                  const u = usersData?.data?.user?.find((u: User) => u._id === value);
                  if (u) setSearchTerm(u.fullName || "");
                }}
                placeholder={`Tìm kiếm ${targetLabel}...`}
                searchPlaceholder="Tìm theo tên, email..."
                emptyMessage={isLoadingUsers ? "Đang tải..." : `Không tìm thấy ${targetLabel} nào`}
                disabled={isLoadingUsers || !isPatient && !isDoctor}
              />
            </div>
            <Button onClick={handleStartChat} size="icon" disabled={!selectedUserIdInput || isLoadingUsers || (!isPatient && !isDoctor)}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Chọn {targetLabel} từ danh sách để bắt đầu chat</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">Chưa có cuộc trò chuyện nào</p>
            <p className="text-xs text-center text-gray-400">Chọn {targetLabel} từ danh sách ở trên để bắt đầu chat</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <button
              onClick={() => setExpandedSection(!expandedSection)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <span>Chat với {targetLabel} ({conversations.length})</span>
              </div>
              {expandedSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSection && (
              <div className="mt-2 space-y-2">
                {conversations.map((conv) => (
                  <Card
                    key={conv.userId}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUserId === conv.userId ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={() => onSelectChat(conv.userId, conv.userName, conv.avatar)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDoctorRole(conv.roleCode) ? "bg-green-100" : bgColor}`}>
                        {isDoctorRole(conv.roleCode) ? (
                          <Stethoscope className="w-5 h-5 text-green-600" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{conv.userName}</p>
                        {conv.lastMessage && <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}