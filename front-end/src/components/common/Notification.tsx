import {
  Bell,
  AlertCircle,
  Info,
  MessageSquare,
  TestTube,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { socketService } from "@/services/socketService";
import {
  useGetNotificationsSummaryQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/services/notificationApi";
import type { Notification as NotificationType } from "@/types/notification.type";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roleCode = user?.data?.roleCode || "patient";
  const { data: summary, refetch } = useGetNotificationsSummaryQuery(10);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const normalizeNotification = useCallback(
    (raw: any): NotificationType => {
      const normalizeId = (id: any) => {
        if (!id) return generateId();
        if (typeof id === "string") return id;
        if (typeof id === "object" && "$oid" in id) return (id as any).$oid;
        return String(id);
      };

      return {
        _id: normalizeId(raw?._id),
        userId: String(raw?.userId ?? user?.data?._id ?? ""),
        actorId: raw?.actorId ? String(raw.actorId) : undefined,
        type: raw?.type ?? "message",
        title:
          raw?.title ??
          (raw?.data?.senderName
            ? `${raw.data.senderName} sent you a message`
            : "New notification"),
        body: raw?.body ?? raw?.data?.snippet ?? "",
        data: raw?.data,
        read: Boolean(raw?.read),
        createdAt: raw?.createdAt
          ? new Date(raw.createdAt).toISOString()
          : new Date().toISOString(),
      };
    },
    [user?.data?._id]
  );

  const normalizeList = useCallback(
    (input: any): NotificationType[] => {
      if (!input) return [];
      const arr = Array.isArray(input) ? input : [input];
      return arr.map((item) => normalizeNotification(item));
    },
    [normalizeNotification]
  );

  useEffect(() => {
    if (summary?.data) {
      const normalizedList = normalizeList(summary.data.latest);
      // Merge với notifications hiện tại, tránh duplicate
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id));
        const newOnes = normalizedList.filter((n) => !existingIds.has(n._id));
        // Giữ lại notifications từ socket nếu chưa có trong summary
        const merged = [...newOnes, ...prev];
        // Sort theo createdAt mới nhất trước
        return merged
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 10);
      });
      // Chỉ update count từ server nếu lớn hơn count hiện tại (tránh ghi đè khi có notification mới từ socket)
      const serverCount =
        summary.data.unreadCount ??
        (summary.data as any).count ??
        (summary.data as any).total ??
        0;
      setUnreadCount((prev) => Math.max(prev, serverCount));
    }
  }, [summary, normalizeList]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification: NotificationType) => {
      console.log("[Notification] Received notification event:", notification);
      toast.info(notification.title, {
        description: notification.body,
      });
      refetch();
    };

    const handleUnreadCountUpdate = (data: any) => {
      console.log("[Notification] Received unread-count update:", data);
      // Refetch để cập nhật unread count và danh sách notifications
      refetch();
    };

    socketService.on("notification", handleNewNotification);
    socketService.on("notification:unread-count", handleUnreadCountUpdate);

    return () => {
      socketService.off("notification", handleNewNotification);
      socketService.off("notification:unread-count", handleUnreadCountUpdate);
    };
  }, [refetch, user?.data?._id, normalizeNotification]);

  const handleMarkAsRead = async (id: string) => {
    try {
      console.log("Marking notification as read:", id);
      // Chỉ trừ count nếu notification chưa được đọc
      const notification = notifications.find((n) => n._id === id);
      const wasUnread = notification && !notification.read;

      const result = await markAsRead(id).unwrap();
      console.log("Mark as read result:", result);

      // Update local state
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item))
      );

      // Chỉ trừ count nếu notification chưa được đọc
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      // Refetch để sync với server
      refetch();
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      // Refetch để sync với server
      refetch();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleViewAll = () => {
    navigate(`/${roleCode}/chat`);
  };

  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // If it's a message notification, navigate to chat with the sender
    if (
      (notification.type === "message" ||
        notification.type === "chat_message") &&
      notification.actorId
    ) {
      const senderName = notification.data?.senderName || "Người dùng";
      const senderAvatar = notification.data?.senderAvatar;

      // Navigate to chat page with userId query param
      navigate(`/${roleCode}/chat?userId=${notification.actorId}`, {
        state: {
          userName: senderName,
          avatar: senderAvatar,
        },
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
      case "chat_message":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "test_order":
        return <TestTube className="w-4 h-4 text-green-600" />;
      case "test_result":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "system_alert":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50";
    switch (type) {
      case "message":
      case "chat_message":
        return "bg-blue-50";
      case "test_order":
        return "bg-green-50";
      case "test_result":
        return "bg-yellow-50";
      case "system_alert":
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  const formatTimestamp = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: vi,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-base font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0",
                  getNotificationBgColor(notification.type, notification.read)
                )}
                onClick={() => {
                  if (
                    notification.type === "message" ||
                    notification.type === "chat_message"
                  ) {
                    handleNotificationClick(notification);
                  } else {
                    handleMarkAsRead(notification._id);
                  }
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        !notification.read && "text-gray-900"
                      )}
                    >
                      {notification.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.body}
                    {notification.data?.senderName && (
                      <span className="font-medium">
                        {" "}
                        - {notification.data.senderName}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-blue-600 hover:text-blue-700"
                onClick={handleViewAll}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
