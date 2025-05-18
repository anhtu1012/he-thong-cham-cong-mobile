import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../utils/routes";

const { width } = Dimensions.get("window");

type FormStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";

interface FormItem {
  id: number;
  type: string;
  date: string;
  status: FormStatus;
  description: string;
  reviewer: string;
  reviewerTitle: string;
  reviewDate?: string;
  rejectReason?: string;
}

function HomePage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Mock data - replace with actual data from API
  const pendingForms: FormItem[] = [
    {
      id: 1,
      type: "Đơn nghỉ phép",
      date: "12/07/2024",
      status: "Chờ duyệt",
      description: "Nghỉ phép có lương - Lý do: Việc gia đình",
      reviewer: "Trần Văn B",
      reviewerTitle: "Trưởng phòng",
    },
    {
      id: 2,
      type: "Đơn tăng ca",
      date: "10/07/2024",
      status: "Đã duyệt",
      description: "OT 3 giờ - Dự án ABC cần gấp",
      reviewer: "Trần Văn B",
      reviewerTitle: "Trưởng phòng",
      reviewDate: "10/07/2024 15:30",
    },
    {
      id: 3,
      type: "Đơn vắng mặt",
      date: "05/07/2024",
      status: "Từ chối",
      description: "Vắng có phép - Lý do: Đi khám bệnh",
      reviewer: "Trần Văn B",
      reviewerTitle: "Trưởng phòng",
      rejectReason: "Đã hết ngày phép trong tháng",
    },
  ];

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

  // Status colors
  const getStatusColor = (status: FormStatus): string => {
    switch (status) {
      case "Chờ duyệt":
        return "#FFA500";
      case "Đã duyệt":
        return "#4CAF50";
      case "Từ chối":
        return "#FF5252";
      default:
        return "#007BFF";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>Nguyễn Văn A</Text>
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
              onPress={() => navigation.navigate("CreateForm" as any)}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {pendingForms.map((form) => (
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
                    <Text style={styles.formType}>{form.type}</Text>
                    <View
                      style={[
                        styles.formBadge,
                        { backgroundColor: getStatusColor(form.status) },
                      ]}
                    >
                      <Text style={styles.formBadgeText}>{form.status}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.formIconButton}>
                    <Feather name="more-vertical" size={18} color="#999" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.formDescription}>{form.description}</Text>

                <View style={styles.formDetailSection}>
                  <View style={styles.formDetailRow}>
                    <View style={styles.formDetailIcon}>
                      <Feather name="calendar" size={14} color="#3674B5" />
                    </View>
                    <Text style={styles.formDetailText}>
                      Ngày tạo: {form.date}
                    </Text>
                  </View>

                  <View style={styles.formDetailRow}>
                    <View style={styles.formDetailIcon}>
                      <Feather name="user" size={14} color="#3674B5" />
                    </View>
                    <Text style={styles.formDetailText}>
                      Người duyệt: {form.reviewer} ({form.reviewerTitle})
                    </Text>
                  </View>

                  {form.status === "Đã duyệt" && form.reviewDate && (
                    <View style={styles.formDetailRow}>
                      <View style={styles.formDetailIcon}>
                        <Feather
                          name="check-circle"
                          size={14}
                          color="#4CAF50"
                        />
                      </View>
                      <Text style={styles.formDetailText}>
                        Thời gian duyệt: {form.reviewDate}
                      </Text>
                    </View>
                  )}

                  {form.status === "Từ chối" && form.rejectReason && (
                    <View style={styles.formDetailRow}>
                      <View style={styles.formDetailIcon}>
                        <Feather name="x-circle" size={14} color="#FF5252" />
                      </View>
                      <Text style={styles.formDetailText}>
                        Lý do từ chối: {form.rejectReason}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.formFooter}>
                  <TouchableOpacity style={styles.formButton}>
                    <Text style={styles.formButtonText}>Chi tiết</Text>
                  </TouchableOpacity>

                  {form.status === "Chờ duyệt" && (
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
          ))}
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
              onPress={() => navigation.navigate("CreateForm" as any)}
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
