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
import { useEffect } from "react";
import { socketService } from "@/services/socketService";
import {
  useGetNotificationsSummaryQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/services/notificationApi";
import type { Notification as NotificationType } from "@/types/notification.type";

export default function Notification() {
  const { data: summary, refetch } = useGetNotificationsSummaryQuery(10);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = summary?.data?.latest || [];
  const unreadCount = summary?.data?.unreadCount || 0;

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification: NotificationType) => {
      console.log('[Notification] Received notification event:', notification);
      toast.info(notification.title, {
        description: notification.body,
      });
      refetch();
    };

    const handleUnreadCountUpdate = (data: any) => {
      console.log('[Notification] Received unread-count update:', data);
      // Refetch để cập nhật unread count và danh sách notifications
      refetch();
    };

    socketService.on("notification", handleNewNotification);
    socketService.on("notification:unread-count", handleUnreadCountUpdate);

    return () => {
      socketService.off("notification", handleNewNotification);
      socketService.off("notification:unread-count", handleUnreadCountUpdate);
    };
  }, [refetch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      // Không hiển thị toast khi thành công
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      // Không hiển thị toast khi thành công
    } catch {
      toast.error("Failed to mark all as read");
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
                onClick={() => handleMarkAsRead(notification._id)}
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
