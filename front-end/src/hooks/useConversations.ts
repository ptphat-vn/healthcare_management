import { useState, useEffect } from "react";
import { useGetRecentConversationsQuery } from "@/services/chatApi";

export interface Conversation {
  userId: string;
  userName: string;
  avatar?: string;
  roleCode?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export function useConversations(currentUserId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const { data: serverData } = useGetRecentConversationsQuery(
    { limit: 20 },
    { skip: !currentUserId }
  );

  useEffect(() => {
    if (!currentUserId) return;
    const key = `chat_conversations_${currentUserId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(
          parsed.map((c: Conversation & { lastMessageTime?: string | Date }) => ({
            ...c,
            lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined,
          }))
        );
      } catch (e) {
        console.error("Failed to load conversations from cache", e);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    if (serverData?.data?.conversations) {
      const serverConversations = serverData.data.conversations.map((c: Conversation & { lastMessageTime?: string | Date }) => ({
        ...c,
        lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined,
      }));
      setConversations(serverConversations);

      if (currentUserId) {
        const key = `chat_conversations_${currentUserId}`;
        localStorage.setItem(key, JSON.stringify(serverConversations));
        window.dispatchEvent(new CustomEvent("chatConversationUpdated"));
      }
    }
  }, [serverData, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    const key = `chat_conversations_${currentUserId}`;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConversations(
            parsed.map((c: Conversation & { lastMessageTime?: string | Date }) => ({
              ...c,
              lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined,
            }))
          );
        } catch (e) {
          console.error("Failed to load conversations from storage event", e);
        }
      }
    };
    const handleCustom = () => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConversations(
            parsed.map((c: Conversation & { lastMessageTime?: string | Date }) => ({
              ...c,
              lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined,
            }))
          );
        } catch (e) {
          console.error("Failed to load conversations from custom event", e);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("chatConversationUpdated", handleCustom as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("chatConversationUpdated", handleCustom as EventListener);
    };
  }, [currentUserId]);

  const save = (conv: Conversation) => {
    if (!currentUserId) return;
    const key = `chat_conversations_${currentUserId}`;
    setConversations((prev) => {
      const updated = [conv, ...prev.filter((c) => c.userId !== conv.userId)].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("chatConversationUpdated"));
      return updated;
    });
  };

  const update = (userId: string, updates: Partial<Conversation>) => {
    if (!currentUserId) return;
    const key = `chat_conversations_${currentUserId}`;
    setConversations((prev) => {
      const updated = prev.map((c) => (c.userId === userId ? { ...c, ...updates } : c));
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("chatConversationUpdated"));
      return updated;
    });
  };

  return { conversations, save, update };
}

