import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import useSocket from "../hook/useSocket";
import {
  showNotificationToast,
  NotificationData,
} from "../utils/notificationUtils";

interface NotificationContextType {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  incrementNotification: () => void;
  decrementNotification: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notificationCount, setNotificationCount] = useState(2); // Số thông báo mặc định
  const socket = useSocket();

  // Handle socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log("Received notification from socket:", data);

      try {
        // Parse notification data
        const notification: NotificationData = {
          id: data.id || Date.now().toString(),
          title: data.title || "Thông báo mới",
          message: data.message || data.content || "Bạn có thông báo mới",
          type: data.type || "info",
          timestamp: data.timestamp || new Date().toISOString(),
          data: data.data || data,
        };

        // Show toast immediately
        showNotificationToast(notification);

        // Increment notification count
        incrementNotification();
      } catch (error) {
        console.error("Error handling socket notification:", error);

        // Fallback notification
        showNotificationToast({
          id: Date.now().toString(),
          title: "Thông báo mới",
          message: "Bạn có thông báo mới từ hệ thống",
          type: "info",
        });

        incrementNotification();
      }
    };

    // Listen for notifications with key 'noti'
    socket.on("noti", handleNotification);

    // Also listen for other common notification events
    socket.on("notification", handleNotification);
    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("noti", handleNotification);
      socket.off("notification", handleNotification);
      socket.off("new_notification", handleNotification);
    };
  }, [socket]);

  const incrementNotification = useCallback(() => {
    setNotificationCount((prev) => prev + 1);
  }, []);

  const decrementNotification = useCallback(() => {
    setNotificationCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
  }, []);

  const value: NotificationContextType = {
    notificationCount,
    setNotificationCount,
    incrementNotification,
    decrementNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
