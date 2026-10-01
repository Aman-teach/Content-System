"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { useAuth } from "@/context/AuthContext";

export type ContentItem = {
  id: string;
  title: string;
  type: string;
  platforms: string[];
  date: Date;
  status: string;
  thumbnail?: string;
  caption?: string;
  videoUrl?: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  time: string;
  read: boolean;
  roleContext: string;
  link: string;
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6abd15200019b4edff61";
const POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID || "6abd15600025a1442d8b";
const NOTIFICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID || "6abd3cd200151c423f82";

type ContentContextType = {
  items: ContentItem[];
  addItem: (item: Omit<ContentItem, "id">) => Promise<void>;
  updateItemDate: (id: string, newDate: Date) => Promise<void>;
  updateItemStatus: (id: string, newStatus: string) => Promise<void>;
  updateItemDetails: (id: string, updates: Partial<Omit<ContentItem, "id" | "date" | "status">>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  notifications: NotificationItem[];
  markAllNotificationsAsRead: (role: string) => void;
  addNotification: (notification: Omit<NotificationItem, "id" | "time" | "read">) => Promise<void>;
  loading: boolean;
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load items and notifications from Appwrite when user is logged in
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setLoading(true);
        // Fetch posts
        const postsResponse = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.limit(100), Query.orderDesc("date")]
        );
        
        const loadedItems: ContentItem[] = postsResponse.documents.map((doc: Record<string, unknown>) => ({
          id: doc.$id as string,
          title: doc.title as string,
          type: doc.type as string,
          platforms: (doc.platforms as string[]) || [],
          date: new Date(doc.date as string),
          status: doc.status as string,
          thumbnail: doc.thumbnail as string | undefined,
          caption: doc.caption as string | undefined,
          videoUrl: doc.videoUrl as string | undefined,
        }));
        setItems(loadedItems);

        // Fetch notifications
        const notifsResponse = await databases.listDocuments(
          DATABASE_ID,
          NOTIFICATIONS_COLLECTION_ID,
          [Query.limit(100), Query.orderDesc("$createdAt")]
        );

        const loadedNotifs: NotificationItem[] = notifsResponse.documents.map((doc: Record<string, unknown>) => ({
          id: doc.$id as string,
          type: doc.type as string,
          message: doc.message as string,
          time: new Date(doc.$createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: doc.read as boolean,
          roleContext: doc.roleContext as string,
          link: doc.link as string,
        }));
        setNotifications(loadedNotifs);

      } catch (err) {
        console.error("Failed to load data from Appwrite:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const addItem = async (newItem: Omit<ContentItem, "id">) => {
    const tempId = Date.now().toString();
    const itemWithId = { ...newItem, id: tempId };
    
    setItems((prev) => [itemWithId, ...prev]);

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          title: newItem.title,
          type: newItem.type,
          platforms: newItem.platforms,
          date: newItem.date.toISOString(),
          status: newItem.status,
          thumbnail: newItem.thumbnail || "",
          caption: newItem.caption || "",
          videoUrl: newItem.videoUrl || "",
        }
      );

      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...i, id: doc.$id } : i))
      );
    } catch (err) {
      console.error("Failed to save post to Appwrite:", err);
    }
  };

  const updateItemDate = async (id: string, newDate: Date) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const updatedDate = new Date(targetItem.date);
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date: updatedDate } : item))
    );

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        id,
        { date: updatedDate.toISOString() }
      );
    } catch (err) {
      console.error("Failed to update date in Appwrite:", err);
    }
  };

  const updateItemStatus = async (id: string, newStatus: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        id,
        { status: newStatus }
      );
    } catch (err) {
      console.error("Failed to update status in Appwrite:", err);
    }
  };

  const updateItemDetails = async (id: string, updates: Partial<Omit<ContentItem, "id" | "date" | "status">>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        id,
        updates
      );
    } catch (err) {
      console.error("Failed to update item details in Appwrite:", err);
    }
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        id
      );
    } catch (err) {
      console.error("Failed to delete item from Appwrite:", err);
    }
  };

  const addNotification = async (notif: Omit<NotificationItem, "id" | "time" | "read">) => {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        {
          roleContext: notif.roleContext,
          type: notif.type,
          message: notif.message,
          link: notif.link,
          read: false
        }
      );
      
      const newNotif: NotificationItem = {
        id: doc.$id,
        type: doc.type,
        message: doc.message,
        time: "Just now",
        read: doc.read,
        roleContext: doc.roleContext,
        link: doc.link,
      };
      
      setNotifications(prev => [newNotif, ...prev]);
    } catch (err) {
      console.error("Failed to create notification:", err);
    }
  };

  const markAllNotificationsAsRead = async (role: string) => {
    // UI optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        (n.roleContext === role || n.roleContext === "both") && !n.read
          ? { ...n, read: true }
          : n
      )
    );
    
    // Update in Appwrite
    try {
      const unread = notifications.filter(n => (n.roleContext === role || n.roleContext === "both") && !n.read);
      for (const n of unread) {
        await databases.updateDocument(DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, n.id, {
          read: true
        });
      }
    } catch (err) {
      console.error("Failed to mark notifications as read in Appwrite", err);
    }
  };

  return (
    <ContentContext.Provider
      value={{
        items,
        addItem,
        updateItemDate,
        updateItemStatus,
        updateItemDetails,
        deleteItem,
        notifications,
        markAllNotificationsAsRead,
        addNotification,
        loading,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
