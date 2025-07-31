import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  incrementNotification: () => void;
  decrementNotification: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(2); // Số thông báo mặc định

  const incrementNotification = () => {
    setNotificationCount(prev => prev + 1);
  };

  const decrementNotification = () => {
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

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
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 