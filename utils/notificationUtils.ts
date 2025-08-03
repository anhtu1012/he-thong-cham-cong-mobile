import Toast from "react-native-toast-message";

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type?: "NOTSUCCESS" | "SUCCESS";
  timestamp?: string;
  data?: any;
}

export const showNotificationToast = (notification: NotificationData) => {
  Toast.show({
    type: notification.type || "info",
    // text1: notification.title,
    text1: notification.message,
    text1Style: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    text2Style: {
      fontSize: 14,
      color: "#666",
      marginTop: 4,
    },
    position: "top",
    topOffset: 20,
    visibilityTime: 5000,
    autoHide: true,
    onPress: () => {
      Toast.hide();
      // Handle notification tap if needed
    },
  });
};

export const showSystemNotification = (
  title: string,
  message: string,
  type: "NOTSUCCESS" | "SUCCESS"
) => {
  showNotificationToast({
    id: Date.now().toString(),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
  });
};
