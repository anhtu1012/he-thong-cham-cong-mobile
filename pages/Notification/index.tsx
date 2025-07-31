import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigation } from '@react-navigation/native';

// Data giả cho thông báo
const mockNotifications = [
  {
    id: '1',
    title: 'Chấm công thành công',
    message: 'Bạn đã chấm công thành công lúc 08:00 sáng hôm nay',
    type: 'success',
    time: '2 phút trước',
    isRead: false,
    icon: 'check-circle',
  },
  {
    id: '2',
    title: 'Nhắc nhở chấm công',
    message: 'Đừng quên chấm công trước 09:00 sáng',
    type: 'warning',
    time: '15 phút trước',
    isRead: false,
    icon: 'clock-circle',
  },
  {
    id: '3',
    title: 'Đơn từ được duyệt',
    message: 'Đơn xin nghỉ phép của bạn đã được phê duyệt',
    type: 'info',
    time: '1 giờ trước',
    isRead: false,
    icon: 'file-done',
  },
  {
    id: '4',
    title: 'Lương tháng 12',
    message: 'Lương tháng 12/2024 đã được chuyển vào tài khoản',
    type: 'success',
    time: '2 giờ trước',
    isRead: true,
    icon: 'dollar',
  },
  {
    id: '5',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 22:00 - 06:00 ngày mai',
    type: 'warning',
    time: '3 giờ trước',
    isRead: true,
    icon: 'tool',
  },
  {
    id: '6',
    title: 'Chúc mừng sinh nhật',
    message: 'Chúc mừng sinh nhật! Chúc bạn một ngày tuyệt vời',
    type: 'info',
    time: '1 ngày trước',
    isRead: true,
    icon: 'gift',
  },
  {
    id: '7',
    title: 'Cập nhật ứng dụng',
    message: 'Phiên bản mới của ứng dụng đã có sẵn',
    type: 'info',
    time: '2 ngày trước',
    isRead: true,
    icon: 'download',
  },
  {
    id: '8',
    title: 'Nhắc nhở họp',
    message: 'Cuộc họp tuần sẽ diễn ra lúc 14:00 chiều nay',
    type: 'warning',
    time: '3 ngày trước',
    isRead: true,
    icon: 'team',
  },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  time: string;
  isRead: boolean;
  icon: string;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications as NotificationItem[]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { setNotificationCount } = useNotification();
  const navigation = useNavigation();
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Cập nhật số thông báo khi có thay đổi
  useEffect(() => {
    const unreadCount = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(unreadCount);
    setNotificationCount(unreadCount);
  }, [notifications, setNotificationCount]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  const getTypeBackground = (type: string) => {
    switch (type) {
      case 'success':
        return '#E8F5E8';
      case 'warning':
        return '#FFF3E0';
      case 'error':
        return '#FFEBEE';
      case 'info':
      default:
        return '#E3F2FD';
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.isRead ? '#fff' : '#F0F8FF' },
        !item.isRead && styles.unreadItem,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeBackground(item.type) }]}>
          <AntDesign name={item.icon as any} size={20} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Đánh dấu đã đọc tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Không có thông báo nào</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <LinearGradient
        colors={['#3674B5', '#0d47a1']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContainer}>
          {/* Nút GoBack */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 12}}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
      {/* <AddNotificationButton /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8, 
    flex: 1, 
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    backgroundColor: '#3674B5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#3674B5',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3674B5',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default NotificationPage; 