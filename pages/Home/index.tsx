import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFormDescriptions } from "../../service/api";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

interface UserProfile {
  id: string;
  code: string;
  userName: string;
  fullName: string;
}

type FormStatus = "PENDING" | "APPROVED" | "REJECTED";

interface FormDescription {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  reason: string;
  status: FormStatus;
  file: string;
  startTime: string;
  endTime: string;
  approvedTime?: string;
  formTitle: string;
  submittedBy: string;
  approvedBy?: string;
}

function HomePage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forms, setForms] = useState<FormDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchForms();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserProfile(parsedUserData);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await getFormDescriptions({});
      if (response.data && response.data.data) {
        // Không lọc theo người dùng, lấy tất cả đơn từ
        const allForms = response.data.data;

        // Sắp xếp theo thời gian tạo mới nhất
        const sortedForms = allForms.sort(
          (a: FormDescription, b: FormDescription) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Lấy 3 đơn gần nhất
        setForms(sortedForms.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lấy danh sách đơn từ",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Map API status to display string
  const getFormStatusText = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  // Status colors
  const getStatusColor = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "#FFA500";
      case "APPROVED":
        return "#4CAF50";
      case "REJECTED":
        return "#FF5252";
      default:
        return "#007BFF";
    }
  };

  const upcomingEvents = [
    { id: 1, title: "Họp team", time: "10:00 - 11:30", date: "15/07/2024" },
    { id: 2, title: "Deadline dự án", time: "17:00", date: "20/07/2024" },
    { id: 3, title: "Workshop", time: "14:00 - 16:00", date: "22/07/2024" },
  ];

  const summaryData = {
    workDays: 21,
    leaveRemaining: 12,
    overtimeHours: 5,
    attendance: "100%",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>
            {userProfile?.fullName || "Người dùng"}
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.statusDot} />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Summary Widget */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Tóm tắt tháng này</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summaryData.workDays}</Text>
              <Text style={styles.summaryLabel}>Ngày làm</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {summaryData.leaveRemaining}
              </Text>
              <Text style={styles.summaryLabel}>Phép còn</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {summaryData.overtimeHours}
              </Text>
              <Text style={styles.summaryLabel}>Giờ OT</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summaryData.attendance}</Text>
              <Text style={styles.summaryLabel}>Chuyên cần</Text>
            </View>
          </View>
        </View>

        {/* Today Widget */}
        <View style={styles.todayContainer}>
          <View style={styles.todayHeader}>
            <AntDesign name="calendar" size={24} color="#3674B5" />
            <Text style={styles.todayTitle}>Hôm nay</Text>
          </View>
          <View style={styles.todayContent}>
            <View style={styles.timeInfo}>
              <Text style={styles.currentDate}>Thứ 4, 08/01/2025</Text>
              <Text style={styles.shiftTime}>Ca làm: 8:00 - 17:00</Text>
            </View>
            <View style={styles.attendanceActions}>
              <TouchableOpacity
                style={[styles.checkinButton, { backgroundColor: "#4CAF50" }]}
                disabled={true}
              >
                <Text style={styles.checkinText}>Đã check-in</Text>
              </TouchableOpacity>
              <Text style={[styles.checkinStatus, { color: "#4CAF50" }]}>
                03:19 PM
              </Text>
            </View>
          </View>

          <View style={styles.attendanceDetails}>
            <View style={styles.timeDetail}>
              <View style={styles.timeDetailIcon}>
                <AntDesign name="clockcircle" size={18} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.timeDetailLabel}>Giờ vào</Text>
                <Text style={styles.timeDetailValue}>03:19 PM</Text>
                <Text style={styles.timeDetailStatus}>Đến đúng giờ</Text>
              </View>
            </View>

            <View style={styles.timeDetail}>
              <View style={styles.timeDetailIcon}>
                <AntDesign name="clockcircle" size={18} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.timeDetailLabel}>Giờ về</Text>
                <Text style={styles.timeDetailValue}>11:33 PM</Text>
                <Text style={styles.timeDetailStatus}>Đã check out</Text>
              </View>
            </View>

            <View style={styles.timeDetail}>
              <View
                style={[styles.timeDetailIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <MaterialCommunityIcons
                  name="clock-time-eight"
                  size={18}
                  color="#3674B5"
                />
              </View>
              <View>
                <Text style={styles.timeDetailLabel}>Tổng thời gian</Text>
                <Text style={styles.timeDetailValue}>07:00p</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Forms Status */}
        <View style={styles.formsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tình trạng đơn từ</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("FormList" as any)}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3674B5" />
              <Text style={styles.loadingText}>
                Đang tải danh sách đơn từ...
              </Text>
            </View>
          ) : forms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có đơn từ nào</Text>
            </View>
          ) : (
            forms.map((form) => (
              <TouchableOpacity key={form.id} style={styles.formItem}>
                <View
                  style={[
                    styles.formLeftBorder,
                    { backgroundColor: getStatusColor(form.status) },
                  ]}
                />
                <View style={styles.formItemContent}>
                  <View style={styles.formHeader}>
                    <View style={styles.formTitleContainer}>
                      <Text style={styles.formType}>{form.formTitle}</Text>
                      <View
                        style={[
                          styles.formBadge,
                          { backgroundColor: getStatusColor(form.status) },
                        ]}
                      >
                        <Text style={styles.formBadgeText}>
                          {getFormStatusText(form.status)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.formIconButton}>
                      <Feather name="more-vertical" size={18} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.formDescription}>
                    Lý do: {form.reason}
                  </Text>

                  <View style={styles.formDetailSection}>
                    <View style={styles.formDetailRow}>
                      <View style={styles.formDetailIcon}>
                        <Feather name="calendar" size={14} color="#3674B5" />
                      </View>
                      <Text style={styles.formDetailText}>
                        Ngày tạo: {formatDate(form.createdAt)}
                      </Text>
                    </View>

                    {form.status !== "PENDING" && (
                      <View style={styles.formDetailRow}>
                        <View style={styles.formDetailIcon}>
                          <Feather name="user" size={14} color="#3674B5" />
                        </View>
                        <Text style={styles.formDetailText}>
                          Người duyệt: {form.approvedBy || "Không xác định"}
                        </Text>
                      </View>
                    )}

                    {form.status === "APPROVED" && (
                      <View style={styles.formDetailRow}>
                        <View style={styles.formDetailIcon}>
                          <Feather
                            name="check-circle"
                            size={14}
                            color="#4CAF50"
                          />
                        </View>
                        <Text style={styles.formDetailText}>
                          Thời gian duyệt: {formatDate(form.updatedAt)}
                        </Text>
                      </View>
                    )}

                    {form.status === "REJECTED" && (
                      <View style={styles.formDetailRow}>
                        <View style={styles.formDetailIcon}>
                          <Feather name="x-circle" size={14} color="#FF5252" />
                        </View>
                        <Text style={styles.formDetailText}>
                          Thời gian từ chối: {formatDate(form.updatedAt)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.formFooter}>
                    <TouchableOpacity
                      style={styles.formButton}
                      onPress={() => {
                        navigation.navigate("FormDetailView" as any, {
                          formId: form.id,
                        });
                      }}
                    >
                      <Text style={styles.formButtonText}>Chi tiết</Text>
                    </TouchableOpacity>

                    {form.status === "PENDING" && (
                      <TouchableOpacity
                        style={[
                          styles.formButton,
                          { backgroundColor: "#ffebee" },
                        ]}
                      >
                        <Text
                          style={[styles.formButtonText, { color: "#FF5252" }]}
                        >
                          Hủy đơn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sự kiện</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventIconContainer}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#3674B5"
                />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate("TimesheetNav" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}
              >
                <AntDesign name="calendar" size={24} color="#2196F3" />
              </View>
              <Text style={styles.quickActionText}>Bảng công</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate("Salary" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={24}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.quickActionText}>Lương</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate("FormList" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <AntDesign name="form" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionText}>Tạo đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => navigation.navigate("Profile" as any)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FCE4EC" }]}
              >
                <AntDesign name="user" size={24} color="#E91E63" />
              </View>
              <Text style={styles.quickActionText}>Cá nhân</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  summaryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3674B5",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  todayContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  todayContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flex: 1,
  },
  currentDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  shiftTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  attendanceActions: {
    alignItems: "center",
  },
  checkinButton: {
    backgroundColor: "#3674B5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  checkinText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkinStatus: {
    fontSize: 12,
    color: "#F57C00",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: "#3674B5",
    fontSize: 14,
  },
  formsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formItem: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  formLeftBorder: {
    width: 4,
    height: "100%",
  },
  formItemContent: {
    flex: 1,
    padding: 12,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  formTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  formType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  formBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  formBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  formIconButton: {
    padding: 4,
  },
  formDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  formDetailSection: {
    marginBottom: 12,
  },
  formDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  formDetailIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  formDetailText: {
    fontSize: 13,
    color: "#666",
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  formButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
    marginLeft: 8,
  },
  formButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3674B5",
  },
  eventsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventIconContainer: {
    marginRight: 12,
    padding: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  eventTime: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  eventDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  quickActionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  quickActionItem: {
    width: "25%",
    alignItems: "center",
    marginVertical: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
  },
  bottomSpace: {
    height: 80, // Space for bottom navigation
  },
  attendanceDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  timeDetailLabel: {
    fontSize: 12,
    color: "#666",
  },
  timeDetailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  timeDetailStatus: {
    fontSize: 11,
    color: "#4CAF50",
    marginTop: 2,
  },
});

export default HomePage;
