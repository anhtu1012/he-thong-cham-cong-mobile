import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  Feather,
  Entypo,
} from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import FaceRegisterPage from "../../components/FaceRegisterPage";

const { width } = Dimensions.get("window");

const ProfilePage = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("thongTinChung");

  // Mock user data
  const userData = {
    name: "Phạm Anh Tú Nè",
    position: "Nhân viên thường/Fulltime",
    department: "CHI NHÁNH 1 QUANG TRUNG",
    status: "Đang làm việc",
    employeeId: "001541",
    email: "fpt@gmail.com",
    phone: "0912345678",
    joinDate: "01/01/2023",
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  };

  // Mock attendance data
  const attendanceData = {
    workDays: {
      chiSo: 22,
      tongSo: 24,
      tbCaNhan: 22,
    },
    diMuon: 1,
    veSom: 0,
    nghiPhep: 0,
    tangCa: 2,
  };

  // Mock salary data
  const salaryData = {
    totalMonthly: "24,093,000đ",
    dailyRate: "1,145,400đ",
    monthlyRate: "23,052,900đ",
    totalRevenue: "0đ",
    roi: "0đ",
  };

  // Mock salary history
  const salaryHistory = [
    { month: "Tháng 12", amount: "24,093", trend: "down" },
    { month: "Tháng 11", amount: "26,117", trend: "up" },
    { month: "Tháng 10", amount: "22,151", trend: "down" },
    { month: "Tháng 9", amount: "23,301", trend: "up" },
    { month: "Tháng 8", amount: "25,802", trend: "up" },
  ];

  // Mock form history data
  const formHistory = [
    {
      id: 1,
      type: "Đơn nghỉ phép",
      status: "Đã duyệt",
      createdDate: "15/12/2024",
      approvedDate: "16/12/2024",
      leaveDate: "20/12/2024",
      duration: "1 ngày",
      reason: "Việc gia đình",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 2,
      type: "Đơn tăng ca",
      status: "Đã duyệt",
      createdDate: "10/12/2024",
      approvedDate: "11/12/2024",
      workDate: "12/12/2024",
      duration: "3 giờ",
      reason: "Hoàn thiện dự án ABC",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 3,
      type: "Đơn xin nghỉ",
      status: "Từ chối",
      createdDate: "05/12/2024",
      rejectDate: "06/12/2024",
      leaveDate: "08/12/2024",
      duration: "1 ngày",
      reason: "Có việc cá nhân",
      rejectReason: "Đã hết ngày phép trong tháng",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 4,
      type: "Đơn đi muộn",
      status: "Chờ duyệt",
      createdDate: "18/12/2024",
      delayDate: "20/12/2024",
      delayTime: "1 giờ",
      reason: "Kẹt xe",
      approver: "Trần Văn B (Trưởng phòng)",
    },
  ];

  // Get status color
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Đã duyệt":
        return "#4CAF50";
      case "Từ chối":
        return "#F44336";
      case "Chờ duyệt":
        return "#FFC107";
      default:
        return "#999";
    }
  };

  // Improved navigation function
  const handleGoBack = () => {
    // Use CommonActions for more reliable navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "DrawerHomeScreen" }],
      })
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "thongTinChung":
        return (
          <View style={styles.tabContent}>
            {/* Profile card */}
            <View style={styles.profileCard}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/32.jpg",
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profilePosition}>{userData.position}</Text>
                <Text style={styles.profileDepartment}>
                  {userData.department}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{userData.status}</Text>
                </View>
              </View>
            </View>

            {/* Contact info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin nhân sự</Text>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#ffebee" }]}>
                  <Feather name="mail" size={18} color="#F44336" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
                  <Feather name="phone" size={18} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Điện thoại</Text>
                  <Text style={styles.infoValue}>{userData.phone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e3f2fd" }]}>
                  <Feather name="calendar" size={18} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày vào làm</Text>
                  <Text style={styles.infoValue}>{userData.joinDate}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff8e1" }]}>
                  <Feather name="map-pin" size={18} color="#FFC107" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{userData.address}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "soYeuLyLich":
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsContainer}>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Chỉ số</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.chiSo}
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Tổng số</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.tongSo}
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>TB Cá nhân / Nhóm</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.tbCaNhan}
                </Text>
              </View>
            </View>

            <View style={styles.attendanceList}>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Ngày công</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.workDays.chiSo} công
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Đi muộn</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={[styles.attendanceValue, { color: "#FF5252" }]}>
                    {attendanceData.diMuon} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Về sớm</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.veSom} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Xin nghỉ</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.nghiPhep} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Tăng ca</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={[styles.attendanceValue, { color: "#4CAF50" }]}>
                    {attendanceData.tangCa} giờ
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "congViec":
        return (
          <View style={styles.tabContent}>
            {/* Salary Overview Card with Gradient */}
            <LinearGradient
              colors={["#3674B5", "#2196F3"]}
              style={styles.salaryGradientCard}
            >
              <View style={styles.salaryOverviewHeader}>
                <Text style={styles.salaryOverviewTitle}>
                  Tổng lương đã nhận của bạn
                </Text>
                <Feather
                  name="info"
                  size={18}
                  color="#fff"
                  style={{ opacity: 0.8 }}
                />
              </View>

              <Text style={styles.salaryTotalAmount}>24,093,000đ</Text>

              <View style={styles.salaryStatusContainer}>
                <View style={styles.salaryStatusDot} />
                <Text style={styles.salaryStatusText}>
                  Đã thanh toán (12/07/2024)
                </Text>
              </View>

              <View style={styles.salaryQuickInfo}>
                <View style={styles.salaryQuickInfoItem}>
                  <Text style={styles.salaryQuickInfoValue}>1,145,400đ</Text>
                  <Text style={styles.salaryQuickInfoLabel}>Lương / ngày</Text>
                </View>
                <View style={styles.salaryDivider} />
                <View style={styles.salaryQuickInfoItem}>
                  <Text style={styles.salaryQuickInfoValue}>23,052,900đ</Text>
                  <Text style={styles.salaryQuickInfoLabel}>Lương / tháng</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Salary Details Cards */}
            <View style={styles.salaryDetailsGrid}>
              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#C8E6C9" },
                  ]}
                >
                  <FontAwesome name="dollar" size={22} color="#4CAF50" />
                </View>
                <Text style={styles.salaryDetailLabel}>Lương cơ bản</Text>
                <Text style={styles.salaryDetailValue}>15,000,000đ</Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#BBDEFB" },
                  ]}
                >
                  <MaterialIcons name="timer" size={22} color="#2196F3" />
                </View>
                <Text style={styles.salaryDetailLabel}>Lương làm thêm</Text>
                <Text style={styles.salaryDetailValue}>1,500,000đ</Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#FFF8E1" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#FFECB3" },
                  ]}
                >
                  <MaterialIcons
                    name="card-giftcard"
                    size={22}
                    color="#FFC107"
                  />
                </View>
                <Text style={styles.salaryDetailLabel}>Phụ cấp</Text>
                <Text style={styles.salaryDetailValue}>2,000,000đ</Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#FFEBEE" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#FFCDD2" },
                  ]}
                >
                  <MaterialIcons
                    name="remove-circle-outline"
                    size={22}
                    color="#F44336"
                  />
                </View>
                <Text style={styles.salaryDetailLabel}>Khấu trừ</Text>
                <Text style={[styles.salaryDetailValue, { color: "#F44336" }]}>
                  -1,800,000đ
                </Text>
              </View>
            </View>

            {/* Salary History */}
            <View style={styles.salaryHistoryContainer}>
              <View style={styles.salaryHistoryHeader}>
                <View style={styles.salaryHistoryTitleContainer}>
                  <MaterialIcons name="history" size={20} color="#3674B5" />
                  <Text style={styles.salaryHistoryTitle}>Lịch sử lương</Text>
                </View>
                <View style={styles.yearSelector}>
                  <Text style={styles.yearText}>Năm 2024</Text>
                  <AntDesign name="down" size={12} color="#666" />
                </View>
              </View>

              {/* Salary History Chart Placeholder */}
              <View style={styles.salaryChartContainer}>
                <View style={styles.salaryChartYAxis}>
                  <Text style={styles.salaryChartLabel}>30M</Text>
                  <Text style={styles.salaryChartLabel}>25M</Text>
                  <Text style={styles.salaryChartLabel}>20M</Text>
                  <Text style={styles.salaryChartLabel}>15M</Text>
                </View>
                <View style={styles.salaryChartBars}>
                  <View style={styles.salaryChartBarContainer}>
                    <View
                      style={[
                        styles.salaryChartBar,
                        { height: 120, backgroundColor: "#4CAF50" },
                      ]}
                    />
                    <Text style={styles.salaryChartBarLabel}>Tháng 8</Text>
                  </View>
                  <View style={styles.salaryChartBarContainer}>
                    <View
                      style={[
                        styles.salaryChartBar,
                        { height: 100, backgroundColor: "#4CAF50" },
                      ]}
                    />
                    <Text style={styles.salaryChartBarLabel}>Tháng 9</Text>
                  </View>
                  <View style={styles.salaryChartBarContainer}>
                    <View
                      style={[
                        styles.salaryChartBar,
                        { height: 90, backgroundColor: "#F44336" },
                      ]}
                    />
                    <Text style={styles.salaryChartBarLabel}>Tháng 10</Text>
                  </View>
                  <View style={styles.salaryChartBarContainer}>
                    <View
                      style={[
                        styles.salaryChartBar,
                        { height: 110, backgroundColor: "#4CAF50" },
                      ]}
                    />
                    <Text style={styles.salaryChartBarLabel}>Tháng 11</Text>
                  </View>
                  <View style={styles.salaryChartBarContainer}>
                    <View
                      style={[
                        styles.salaryChartBar,
                        { height: 105, backgroundColor: "#F44336" },
                      ]}
                    />
                    <Text style={styles.salaryChartBarLabel}>Tháng 12</Text>
                  </View>
                </View>
              </View>

              {/* Salary History List */}
              <View style={styles.salaryHistoryList}>
                {[
                  { month: "Tháng 12", amount: "24,093,000", trend: "down" },
                  { month: "Tháng 11", amount: "26,117,000", trend: "up" },
                  { month: "Tháng 10", amount: "22,151,000", trend: "down" },
                  { month: "Tháng 9", amount: "23,301,000", trend: "up" },
                  { month: "Tháng 8", amount: "25,802,000", trend: "up" },
                ].map((item, index) => (
                  <View key={index} style={styles.salaryHistoryItem}>
                    <View style={styles.salaryHistoryMonthContainer}>
                      <Text style={styles.salaryMonth}>{item.month}</Text>
                    </View>
                    <View style={styles.salaryAmountContainer}>
                      {item.trend === "up" ? (
                        <View style={styles.salaryTrendContainer}>
                          <Entypo
                            name="triangle-up"
                            size={14}
                            color="#4CAF50"
                          />
                          <Text
                            style={[
                              styles.salaryTrendValue,
                              { color: "#4CAF50" },
                            ]}
                          >
                            +3.5%
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.salaryTrendContainer}>
                          <Entypo
                            name="triangle-down"
                            size={14}
                            color="#F44336"
                          />
                          <Text
                            style={[
                              styles.salaryTrendValue,
                              { color: "#F44336" },
                            ]}
                          >
                            -7.8%
                          </Text>
                        </View>
                      )}
                      <Text style={styles.salaryAmount}>{item.amount}đ</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Download Salary Slip Button */}
              <TouchableOpacity style={styles.downloadSalaryButton}>
                <AntDesign name="download" size={18} color="#fff" />
                <Text style={styles.downloadSalaryText}>Tải phiếu lương</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "lichSuDon":
        return (
          <View style={styles.tabContent}>
            <View style={styles.formStatsContainer}>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>24</Text>
                <Text style={styles.formStatsLabel}>Tất cả</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>4</Text>
                <Text style={styles.formStatsLabel}>Công việc</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>20</Text>
                <Text style={styles.formStatsLabel}>Duyệt</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>3</Text>
                <Text style={styles.formStatsLabel}>Từ chối</Text>
              </View>
            </View>

            <View style={styles.formFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.formFilterTab,
                  { borderBottomColor: "#3674B5", borderBottomWidth: 2 },
                ]}
              >
                <Text style={[styles.formFilterText, { color: "#3674B5" }]}>
                  Tất cả (24)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formFilterTab}>
                <Text style={styles.formFilterText}>Công việc (4)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formFilterTab}>
                <Text style={styles.formFilterText}>Duyệt (20)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formList}>
              {formHistory.map((form) => (
                <View key={form.id} style={styles.formCard}>
                  <View style={styles.formCardHeader}>
                    <View style={styles.formTypeContainer}>
                      <View
                        style={[
                          styles.formTypeIcon,
                          {
                            backgroundColor: form.type.includes("nghỉ")
                              ? "#E3F2FD"
                              : form.type.includes("tăng ca")
                              ? "#E8F5E9"
                              : "#FFF8E1",
                          },
                        ]}
                      >
                        <Feather
                          name={
                            form.type.includes("nghỉ")
                              ? "calendar"
                              : form.type.includes("tăng ca")
                              ? "clock"
                              : form.type.includes("muộn")
                              ? "alert-circle"
                              : "file-text"
                          }
                          size={16}
                          color={
                            form.type.includes("nghỉ")
                              ? "#2196F3"
                              : form.type.includes("tăng ca")
                              ? "#4CAF50"
                              : form.type.includes("muộn")
                              ? "#FF9800"
                              : "#3674B5"
                          }
                        />
                      </View>
                      <Text style={styles.formTypeName}>{form.type}</Text>
                    </View>
                    <View
                      style={[
                        styles.formStatusBadge,
                        {
                          backgroundColor: getStatusColor(form.status) + "22",
                          borderColor: getStatusColor(form.status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.formStatusText,
                          { color: getStatusColor(form.status) },
                        ]}
                      >
                        {form.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formDetailsContainer}>
                    <View style={styles.formDetail}>
                      <Text style={styles.formDetailLabel}>Ngày tạo:</Text>
                      <Text style={styles.formDetailValue}>
                        {form.createdDate}
                      </Text>
                    </View>

                    {form.status === "Đã duyệt" && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>Ngày duyệt:</Text>
                        <Text style={styles.formDetailValue}>
                          {form.approvedDate}
                        </Text>
                      </View>
                    )}

                    {form.status === "Từ chối" && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>
                          Ngày từ chối:
                        </Text>
                        <Text style={styles.formDetailValue}>
                          {form.rejectDate}
                        </Text>
                      </View>
                    )}

                    {form.leaveDate && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>Ngày nghỉ:</Text>
                        <Text style={styles.formDetailValue}>
                          {form.leaveDate}
                        </Text>
                      </View>
                    )}

                    {form.workDate && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>Ngày làm:</Text>
                        <Text style={styles.formDetailValue}>
                          {form.workDate}
                        </Text>
                      </View>
                    )}

                    {form.delayDate && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>
                          Ngày đi muộn:
                        </Text>
                        <Text style={styles.formDetailValue}>
                          {form.delayDate}
                        </Text>
                      </View>
                    )}

                    {form.duration && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>Thời gian:</Text>
                        <Text style={styles.formDetailValue}>
                          {form.duration}
                        </Text>
                      </View>
                    )}

                    <View style={styles.formDetail}>
                      <Text style={styles.formDetailLabel}>Lý do:</Text>
                      <Text style={styles.formDetailValue}>{form.reason}</Text>
                    </View>

                    {form.rejectReason && (
                      <View style={styles.formDetail}>
                        <Text style={styles.formDetailLabel}>
                          Lý do từ chối:
                        </Text>
                        <Text
                          style={[styles.formDetailValue, { color: "#F44336" }]}
                        >
                          {form.rejectReason}
                        </Text>
                      </View>
                    )}

                    <View style={styles.formDetail}>
                      <Text style={styles.formDetailLabel}>Người duyệt:</Text>
                      <Text style={styles.formDetailValue}>
                        {form.approver}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.formActionButton}>
                      <Text style={styles.formActionText}>Chi tiết</Text>
                    </TouchableOpacity>

                    {form.status === "Chờ duyệt" && (
                      <TouchableOpacity
                        style={[
                          styles.formActionButton,
                          { backgroundColor: "#FFEBEE" },
                        ]}
                      >
                        <Text
                          style={[styles.formActionText, { color: "#F44336" }]}
                        >
                          Hủy đơn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case "dangkykhuonmat":
        return (
          <View style={styles.tabContent}>
            <View style={{ height: 700 }}>
              <FaceRegisterPage />
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.tabContent}>
            <Text>Không có dữ liệu</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ nhân viên</Text>
        <TouchableOpacity style={styles.moreButton}>
          <AntDesign name="ellipsis1" size={24} color="#3674B5" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsOuterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "thongTinChung" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("thongTinChung")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "thongTinChung" && styles.activeTabText,
              ]}
            >
              Thông tin chung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "soYeuLyLich" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("soYeuLyLich")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "soYeuLyLich" && styles.activeTabText,
              ]}
            >
              Sơ yếu lý lịch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "congViec" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("congViec")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "congViec" && styles.activeTabText,
              ]}
            >
              Công việc & lương
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "lichSuDon" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("lichSuDon")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "lichSuDon" && styles.activeTabText,
              ]}
            >
              Lịch sử đơn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "dangkykhuonmat" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("dangkykhuonmat")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "dangkykhuonmat" && styles.activeTabText,
              ]}
            >
              Đăng ký khuôn mặt
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.container}>
        {renderTabContent()}
        {/* Bottom space */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 8,
  },
  tabsOuterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabsScrollContainer: {
    flexDirection: "row",
    minWidth: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: width / 4, // Ensure each tab has at least 1/4 of screen width
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3674B5",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#3674B5",
    fontWeight: "600",
  },
  tabContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
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
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  profileDepartment: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  infoSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
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
  statsItem: {
    flex: 1,
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  attendanceList: {
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
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendanceLabel: {
    fontSize: 15,
    color: "#333",
  },
  attendanceValueContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  salaryGradientCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  salaryOverviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  salaryOverviewTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  salaryTotalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  salaryStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  salaryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  salaryStatusText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  salaryQuickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  salaryQuickInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  salaryQuickInfoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  salaryQuickInfoLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  salaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 10,
  },
  salaryDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  salaryDetailCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  salaryDetailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  salaryDetailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  salaryDetailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  salaryHistoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  salaryHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  salaryHistoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  salaryHistoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  salaryChartContainer: {
    flexDirection: "row",
    height: 180,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  salaryChartYAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  salaryChartLabel: {
    fontSize: 10,
    color: "#999",
    textAlign: "right",
    paddingRight: 6,
  },
  salaryChartBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  salaryChartBarContainer: {
    alignItems: "center",
    width: 40,
  },
  salaryChartBar: {
    width: 12,
    borderRadius: 6,
  },
  salaryChartBarLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 6,
  },
  salaryHistoryList: {
    marginBottom: 20,
  },
  salaryHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  salaryHistoryMonthContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  salaryMonth: {
    fontSize: 15,
    color: "#333",
  },
  salaryAmountContainer: {
    alignItems: "flex-end",
  },
  salaryTrendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  salaryTrendValue: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  salaryAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  downloadSalaryButton: {
    backgroundColor: "#3674B5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadSalaryText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  formStatsContainer: {
    flexDirection: "row",
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
  formStatsItem: {
    flex: 1,
    alignItems: "center",
  },
  formStatsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 4,
  },
  formStatsLabel: {
    fontSize: 12,
    color: "#666",
  },
  formFilterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formFilterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  formFilterText: {
    fontSize: 13,
    color: "#666",
  },
  formList: {
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  formCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  formTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  formTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  formTypeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  formStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  formStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  formDetailsContainer: {
    padding: 12,
  },
  formDetail: {
    flexDirection: "row",
    marginBottom: 8,
  },
  formDetailLabel: {
    fontSize: 13,
    color: "#666",
    width: 100,
  },
  formDetailValue: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  formActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#E3F2FD",
    marginLeft: 8,
  },
  formActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3674B5",
  },
  bottomSpace: {
    height: 80,
  },
});

export default ProfilePage;
