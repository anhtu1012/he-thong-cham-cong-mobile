import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import SalaryCriteria from "./SalaryCriteria";
import Details from "./Details";
import Summary from "./Summary";
import { formatCurrency } from "../../utils/string";
import { getBangLuong } from "../../service/salaryPage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "../../models/timekeeping";
import { Salary } from "../../models/salary";
import History from "./History";

const { width } = Dimensions.get("window");

const SalaryPage = () => {
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date()
      .toLocaleDateString("en-GB", {
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/")
      .split(" ")
      .reverse()
      .join("/")
  );
  const [activeTab, setActiveTab] = useState("summary"); // summary, details, history, SalaryCriteria
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false); // Thêm state cho modal chọn tháng/năm
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [salaryData, setSalaryData] = useState<Salary>();
  const [salaryHistory, setSalaryHistory] = useState<Salary[]>([]);

  const salaryCriteriaData = {
    id: "6",
    createdAt: "2025-06-19T15:42:19.296Z",
    updatedAt: "2025-06-19T15:42:19.296Z",
    code: "POS2506190006",
    positionName: "Nhân viên Hỗ trợ khách hàng",
    role: "R4",
    description: "Staff",
    baseSalary: 80000,
    allowance: 1000000,
    overtimeSalary: 100000,
    lateFine: 50000,
  };
  useEffect(() => {
    loadUserProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userProfile) {
        fetchBangLuong(selectedMonth);
      }
    }, [userProfile, selectedMonth])
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
  const fetchBangLuong = async (selectedMonth: string) => {
    if (!userProfile) return;
    try {
      const res = await getBangLuong(userProfile.code, selectedMonth);
      const resHistory = await getBangLuong(userProfile.code);
      setSalaryHistory(resHistory.data.data);
      setSalaryData(res.data.data[0]);
    } catch (error) {}
  };

  const chartData = {
    labels: salaryHistory.map((item) => item.month.split("/")[0]),
    datasets: [
      {
        data: salaryHistory.map((item) => item.totalSalary / 1000000),
        color: (opacity = 1) => `rgba(54, 116, 181, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Function to update attendance data in real-time
  const updateAttendanceData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  };

  // Effect to auto-update data when component mounts
  useEffect(() => {
    updateAttendanceData();
    // Set up a periodic refresh every 5 minutes when in SalaryCriteria tab
    let intervalId: NodeJS.Timeout | undefined;

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  // Add a useEffect to recalculate totalAllowances whenever values change
  useEffect(() => {
    // In a real app, this would fetch updated data or recalculate from API data
    // For this demo we just ensure the update is visible to the user
    if (activeTab === "details" && refreshing) {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  }, [activeTab, refreshing]);

  // Hàm chuyển đổi tháng
  const changeMonth = (direction: "prev" | "next") => {
    const [month, year] = selectedMonth.split("/").map(Number);
    let newMonth = month + (direction === "next" ? 1 : -1);
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedMonth(`${newMonth.toString().padStart(2, "0")}/${newYear}`);
  };

  // Danh sách tháng/năm để chọn
  const monthsList = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (23 - i));
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${m}/${y}`;
  });

  // Render tab navigation UI
  const renderTabNavigation = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === "summary" && styles.activeTab]}
        onPress={() => setActiveTab("summary")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "summary" && styles.activeTabText,
          ]}
        >
          Tổng quan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === "details" && styles.activeTab]}
        onPress={() => setActiveTab("details")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "details" && styles.activeTabText,
          ]}
        >
          Chi tiết
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabItem, activeTab === "history" && styles.activeTab]}
        onPress={() => setActiveTab("history")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "history" && styles.activeTabText,
          ]}
        >
          Lịch sử
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === "SalaryCriteria" && styles.activeTab,
        ]}
        onPress={() => setActiveTab("SalaryCriteria")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "SalaryCriteria" && styles.activeTabText,
          ]}
        >
          Tiêu chí lương
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeaderSection = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng lương</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="download" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => changeMonth("prev")}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectedMonthContainer}
          onPress={() => setMonthPickerVisible(true)}
        >
          <Text style={styles.selectedMonthText}>{selectedMonth}</Text>
          <AntDesign
            name="caretdown"
            size={12}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={() => changeMonth("next")}
        >
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Modal chọn tháng/năm */}
      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMonthPickerVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                width: 260,
                maxHeight: 400,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Chọn tháng/năm
              </Text>
              <FlatList
                data={monthsList.reverse()}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                      alignItems: "center",
                      backgroundColor:
                        item === selectedMonth ? "#e3f2fd" : "#fff",
                      borderRadius: 8,
                      marginBottom: 2,
                    }}
                    onPress={() => {
                      setSelectedMonth(item);
                      setMonthPickerVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#3674B5",
                        fontWeight: item === selectedMonth ? "bold" : "normal",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {renderTabNavigation()}
    </View>
  );

  const renderTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3674B5" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "summary":
        return salaryData ? (
          <Summary
            salaryData={salaryData}
            chartData={chartData}
            width={width}
            styles={styles}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Không có dữ liệu lương.</Text>
          </View>
        );
      case "details":
        return salaryData ? (
          <Details
            salaryData={salaryData}
            refreshing={refreshing}
            styles={styles}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Không có dữ liệu lương.</Text>
          </View>
        );
      case "history":
        return (
          <History
            salaryHistory={salaryHistory}
            formatCurrency={formatCurrency}
          />
        );
      case "SalaryCriteria":
        return <SalaryCriteria salaryCriteriaData={salaryCriteriaData} />;
      default:
        return <View />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        style={styles.headerGradient}
      >
        {renderHeaderSection()}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTab()}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Add styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 30, // Add padding at the bottom to avoid overlap with tab navigation
  },
  headerGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  monthArrow: {
    padding: 8,
  },
  selectedMonthContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  selectedMonthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  gradientSummaryContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  netSalaryContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  netSalaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  currencyText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  quickInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  quickInfoLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  quickInfoDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  componentsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  componentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  componentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 3,
  },
  componentDescription: {
    fontSize: 12,
    color: "#666",
  },
  componentValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  netSalaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  netSalaryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3674B5",
  },
  netSalaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chart: {
    marginTop: 8,
    borderRadius: 16,
  },
  detailsContainer: {
    padding: 0,
  },
  refreshingIndicator: {
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  refreshingText: {
    color: "#3674B5",
    fontSize: 14,
  },
  detailsSummaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  detailsSummaryLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 4,
  },
  detailsSummaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  detailsSummaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  detailSectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailItemCard: {
    padding: 16,
  },
  deductionCard: {
    backgroundColor: "#fff",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailItemIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailItemLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  detailItemTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailItemTotalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  detailItemTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  netSalaryCard: {
    backgroundColor: "#3674B5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  netSalaryCardLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  netSalaryCardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  historyContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#3674B5",
    marginRight: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  historyDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  SalaryCriteriaContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  SalaryCriteriaSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
  },
  SalaryCriteriaSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  SalaryCriteriaSummaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  SalaryCriteriaSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  SalaryCriteriaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  attendanceDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
  },
  weekendDay: {
    backgroundColor: "#f8bbd0",
  },
  currentDay: {
    backgroundColor: "#3674B5",
  },
  attendanceDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3674B5",
  },
  weekendDayText: {
    color: "#e91e63",
  },
  attendanceContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  attendanceDate: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  attendanceStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  lateStatus: {
    backgroundColor: "#fff3e0",
  },
  earlyStatus: {
    backgroundColor: "#e1f5fe",
  },
  absentStatus: {
    backgroundColor: "#ffebee",
  },
  weekendStatus: {
    backgroundColor: "#f8bbd0",
  },
  attendanceStatusText: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "500",
  },
  lateStatusText: {
    color: "#ff9800",
  },
  earlyStatusText: {
    color: "#03a9f4",
  },
  absentStatusText: {
    color: "#f44336",
  },
  weekendStatusText: {
    color: "#e91e63",
  },
  attendanceTime: {
    padding: 10,
    alignItems: "flex-end",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 5,
    width: 45,
    textAlign: "right",
  },
  timeValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  hoursValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3674B5",
  },
  noTimeData: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#3674B5",
    fontSize: 16,
  },
});

export default SalaryPage;
