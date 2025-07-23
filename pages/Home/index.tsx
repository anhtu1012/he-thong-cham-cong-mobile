import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
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
  RefreshControl,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { RootStackParamList } from "../../utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFormDescriptions, getTimeSchedule } from "../../service/api";
import Toast from "react-native-toast-message";
import TodayWidget from "../../components/TodayWidget";
import FormsStatusWidget from "../../components/FormsStatusWidget";

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

interface WorkingSchedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  timeKeepingId: string | null;
  code: string;
  userCode: string;
  userContractCode: string;
  status: string;
  date: string;
  fullName: string;
  shiftCode: string;
  shiftName: string;
  branchName: string;
  branchCode: string;
  addressLine: string;
  startShiftTime: string;
  endShiftTime: string;
  workingHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  statusTimeKeeping: string | null;
  positionName: string;
  managerFullName: string;
}

function HomePage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forms, setForms] = useState<FormDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState<WorkingSchedule | null>(
    null
  );
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data when component mounts
  const loadInitialData = async () => {
    await loadUserProfile();
    await fetchForms();
  };

  useLayoutEffect(() => {
    loadInitialData();
  }, []);

  // Load today schedule khi userProfile được set lần đầu
  useEffect(() => {
    if (userProfile?.code) {
      fetchTodaySchedule(userProfile.code);
    }
  }, [userProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchForms();
    }, [])
  );

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
        // Lọc đơn từ của người dùng hiện tại
        const userForms = response.data.data;
        // Sắp xếp theo thời gian tạo mới nhất
        const sortedForms = userForms.sort(
          (a: FormDescription, b: FormDescription) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log("sortedForms");
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

  const fetchTodaySchedule = async (userCode?: string) => {
    try {
      setLoadingSchedule(true);

      // Lấy ngày hiện tại fromDate và ngày mai toDate đầu ngày 00h đến 23h59
      const fromData = new Date(getCurrentDateString() + "T00:00:00");
      const toDate = new Date(getCurrentDateString() + "T23:59:59");

      // Sử dụng userCode từ parameter hoặc từ state
      const codeToUse = userCode || userProfile?.code;
      if (!codeToUse) {
        throw new Error("Không có thông tin mã người dùng");
      }

      const response = await getTimeSchedule(
        fromData,
        toDate,
        codeToUse
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        // Lấy lịch làm việc của ngày hôm nay (phần tử đầu tiên)
        setTodaySchedule(response.data.data[0]);
      } else {
        console.log("Không có lịch làm việc cho ngày hôm nay");
        setTodaySchedule(null);
      }
    } catch (error) {
      console.error("Error fetching today's schedule:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lấy lịch làm việc hôm nay",
      });
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Load user profile trước
      await loadUserProfile();
      
      // Fetch forms
      await fetchForms();
      
      // Chỉ fetch schedule nếu có userProfile
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData?.code) {
          await fetchTodaySchedule(parsedUserData.code);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Lấy ngày hiện tại theo định dạng chuẩn
  const getCurrentDateString = () => {
    const today = new Date();
    // Trả về ngày hiện tại theo định dạng YYYY-MM-DD
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
        <TodayWidget
          todaySchedule={todaySchedule}
          loadingSchedule={loadingSchedule}
        />

        {/* Forms Status */}
        <FormsStatusWidget
          forms={forms}
          loading={loading}
          formatDate={formatDate}
          onFormUpdate={fetchForms}
        />

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
});

export default HomePage;
