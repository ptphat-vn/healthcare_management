export interface ChatMessage {
    _id?: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    metadata?: Record<string, unknown>;
    read?: boolean;
    createdAt: string | Date;
  }
  
  export interface ConversationResponse {
    messages: ChatMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  export interface SendMessageRequest {
    content: string;
    metadata?: Record<string, unknown>;
  }
  
  export interface ConversationParticipant {
    userId: string;
    fullName: string;
    avatar?: string;
    roleCode?: string;
  }