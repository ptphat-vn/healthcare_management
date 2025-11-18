export interface NotificationData {
  conversationId?: string;
  messageId?: string;
  senderName?: string;
  patientCode?: string;
  testType?: string;
  testCode?: string;
  testName?: string;
  errorCode?: string;
  priority?: string;
  [key: string]: unknown;
}

export interface Notification {
  _id: string;
  userId: string;
  actorId?: string;
  type:
    | "message"
    | "chat_message"
    | "test_order"
    | "test_result"
    | "system_alert";
  title: string;
  body: string;
  data?: NotificationData;
  read: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface NotificationSummary {
  message: string;
  data: {
    unreadCount: number;
    latest: Notification[];
  };
}
