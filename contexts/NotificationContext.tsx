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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "../service/api";

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
  const [notificationCount, setNotificationCount] = useState(0);
  const [userCode, setUserCode] = useState<string | null>(null);
  const socket = useSocket();

  // Get userCode from AsyncStorage

  const getUserCode = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserCode(parsedUserData.userCode || parsedUserData.code);
      }
    } catch (error) {
      console.error("Error getting userCode from AsyncStorage:", error);
    }
  };
  useEffect(() => {
    getUserCode();
  }, []);

  // Handle socket notifications
  useEffect(() => {
    if (!socket || !userCode) return;

    const handleNotification = async (data: any) => {
      try {
        console.log("Received socket notification:", data);
        if (data.formId === "5") {
          try {
            const res = await getUser(data.userCode);
            if (res.data.data.length > 0) {
              // Cập nhật userData vào AsyncStorage
              await AsyncStorage.setItem(
                "userData",
                JSON.stringify(res.data.data[0])
              );
            }
          } catch (apiError) {
            console.error("Error calling API to update user data:", apiError);
          }
        }
        // Đảm bảo tất cả các giá trị là string và không undefined/null
        const notification: NotificationData = {
          id: String(data.id || Date.now()),
          title: String(data.title || "Thông báo mới"),
          message: String(
            data.message || data.content || "Bạn có thông báo mới"
          ),
          type: data.type || "info",
          timestamp: data.createdAt || new Date().toISOString(),
          data: data.data || data,
        };

        // Show toast immediately
        showNotificationToast(notification);

        // Increment notification count
        incrementNotification();
      } catch (error) {
        console.error("Error handling socket notification:", error);

        // Fallback notification với giá trị string đảm bảo
        showNotificationToast({
          id: String(Date.now()),
          title: "Thông báo mới",
          message: "Bạn có thông báo mới từ hệ thống",
          type: "NOTSUCCESS",
        });

        incrementNotification();
      }
    };

    // Listen for notifications with dynamic key using userCode
    const notificationKey = `NOTIFICATION_CREATED_${userCode}`;
    socket.on(notificationKey, handleNotification);

    // Also listen for other common notification events
    socket.on("notification", handleNotification);
    socket.on("new_notification", handleNotification);

    return () => {
      socket.off(notificationKey, handleNotification);
      socket.off("notification", handleNotification);
      socket.off("new_notification", handleNotification);
    };
  }, [socket, userCode]);

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
