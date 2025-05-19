import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SalaryPage = () => {
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState("07/2024");
  const [activeTab, setActiveTab] = useState("summary"); // summary, details, history, dailyLog
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for daily attendance
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  // Generate daily attendance data for the current month
  const dailyAttendanceData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const date = new Date(2024, 6, day); // July 2024
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPast = day <= 22; // Assume current day is 22nd

    if (isWeekend) {
      return {
        day,
        date: `${day}/07/2024`,
        isWeekend: true,
        status: "Cuối tuần",
        checkIn: null,
        checkOut: null,
        hoursWorked: 0,
        isToday: day === currentDay,
      };
    }

    if (!isPast) {
      return {
        day,
        date: `${day}/07/2024`,
        isWeekend: false,
        status: "Chưa đến",
        checkIn: null,
        checkOut: null,
        hoursWorked: 0,
        isToday: day === currentDay,
      };
    }

    // For past weekdays, generate random check-in/out times
    const isPresent = Math.random() > 0.1; // 10% chance of absence

    if (!isPresent) {
      return {
        day,
        date: `${day}/07/2024`,
        isWeekend: false,
        status: "Vắng mặt",
        checkIn: null,
        checkOut: null,
        hoursWorked: 0,
        isToday: day === currentDay,
      };
    }

    // Generate random check-in time between 7:45 and 8:15
    const checkInHour = 7 + (Math.random() > 0.7 ? 1 : 0);
    const checkInMinute =
      Math.floor(Math.random() * 30) + (checkInHour === 7 ? 45 : 0);
    const checkInTime = `${checkInHour
      .toString()
      .padStart(2, "0")}:${checkInMinute.toString().padStart(2, "0")}`;

    // Generate random check-out time between 17:00 and 18:00
    const checkOutHour = 17 + (Math.random() > 0.5 ? 0 : 1);
    const checkOutMinute = Math.floor(Math.random() * 60);
    const checkOutTime = `${checkOutHour
      .toString()
      .padStart(2, "0")}:${checkOutMinute.toString().padStart(2, "0")}`;

    // Calculate hours worked
    const checkInMinutes = checkInHour * 60 + checkInMinute;
    const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
    const hoursWorked = ((checkOutMinutes - checkInMinutes) / 60).toFixed(2);

    // Determine status
    let status = "Đúng giờ";
    if (checkInHour > 8 || (checkInHour === 8 && checkInMinute > 5)) {
      status = "Đi muộn";
    } else if (
      checkOutHour < 17 ||
      (checkOutHour === 17 && checkOutMinute < 0)
    ) {
      status = "Về sớm";
    }

    return {
      day,
      date: `${day}/07/2024`,
      isWeekend: false,
      status,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      hoursWorked,
      isToday: day === currentDay,
    };
  });

  // Calculate attendance summary
  const attendanceSummary = {
    totalWorkDays: dailyAttendanceData.filter((d) => !d.isWeekend).length,
    daysPresent: dailyAttendanceData.filter((d) => d.checkIn !== null).length,
    daysAbsent: dailyAttendanceData.filter(
      (d) => !d.isWeekend && d.checkIn === null && d.status === "Vắng mặt"
    ).length,
    lateDays: dailyAttendanceData.filter((d) => d.status === "Đi muộn").length,
    earlyDays: dailyAttendanceData.filter((d) => d.status === "Về sớm").length,
    totalHours: dailyAttendanceData
      .reduce((total, day) => {
        const hours =
          typeof day.hoursWorked === "string"
            ? parseFloat(day.hoursWorked || "0")
            : day.hoursWorked || 0;
        return total + hours;
      }, 0)
      .toFixed(2),
  };

  // Mock data
  const salaryData = {
    baseSalary: 15000000,
    contractHours: 176, // 22 days x 8 hours
    hourlyRate: 85227, // base salary / contract hours
    actualWorkDays: 22,
    actualHours: 176,
    overtimeHours: 18,
    overtimeRate: 1.5,
    overtimePay: 1500000,
    workingDayAllowance: 1100000,
    mealAllowance: 880000, // 40k per day x 22 days
    transportAllowance: 500000,
    phoneAllowance: 300000,
    otherAllowance: 0,
    totalAllowances: 2780000,
    socialInsurance: 1350000, // 9% of base salary
    healthInsurance: 225000, // 1.5% of base salary
    unemploymentInsurance: 150000, // 1% of base salary
    personalIncomeTax: 800000,
    totalDeductions: 2525000,
    netSalary: 16755000,
    currency: "VND",
    paymentDate: "12/07/2024",
    paymentStatus: "Đã thanh toán",
  };

  const salaryHistory = [
    { month: "02/2024", amount: 16200000 },
    { month: "03/2024", amount: 16300000 },
    { month: "04/2024", amount: 16500000 },
    { month: "05/2024", amount: 16400000 },
    { month: "06/2024", amount: 16600000 },
    { month: "07/2024", amount: 16755000 },
  ];

  const formatCurrency = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const chartData = {
    labels: salaryHistory.map((item) => item.month.split("/")[0]),
    datasets: [
      {
        data: salaryHistory.map((item) => item.amount / 1000000),
        color: (opacity = 1) => `rgba(54, 116, 181, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Function to update attendance data in real-time
  const updateAttendanceData = () => {
    setRefreshing(true);
    // In a real app, you would fetch updated data from an API here
    // For this demo, we'll just simulate a refresh by setting refreshing to true
    // and then false after a delay
    setTimeout(() => {
      setRefreshing(false);
      setIsLoading(false);
    }, 1000);
  };

  // Effect to auto-update data when component mounts
  useEffect(() => {
    updateAttendanceData();

    // Set up a periodic refresh every 5 minutes when in dailyLog tab
    let intervalId: NodeJS.Timeout | undefined;
    if (activeTab === "dailyLog") {
      intervalId = setInterval(updateAttendanceData, 5 * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  // Effect to update when tab changes to dailyLog
  useEffect(() => {
    if (activeTab === "dailyLog") {
      updateAttendanceData();
    }
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
        style={[styles.tabItem, activeTab === "dailyLog" && styles.activeTab]}
        onPress={() => setActiveTab("dailyLog")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "dailyLog" && styles.activeTabText,
          ]}
        >
          Chấm công
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
        <TouchableOpacity style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.selectedMonthContainer}>
          <Text style={styles.selectedMonthText}>{selectedMonth}</Text>
          <AntDesign
            name="caretdown"
            size={12}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </View>
        <TouchableOpacity style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

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
        return (
          <>
            {/* Salary Summary */}
            <LinearGradient
              colors={["#3674B5", "#2196F3"]}
              style={styles.gradientSummaryContainer}
            >
              <Text style={styles.summaryTitle}>Tổng thu nhập</Text>
              <View style={styles.netSalaryContainer}>
                <Text style={styles.netSalaryValue}>
                  {formatCurrency(salaryData.netSalary)}
                </Text>
                <Text style={styles.currencyText}>{salaryData.currency}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>
                  {salaryData.paymentStatus} ({salaryData.paymentDate})
                </Text>
              </View>

              <View style={styles.quickInfoContainer}>
                <View style={styles.quickInfoItem}>
                  <Text style={styles.quickInfoLabel}>Lương cơ bản</Text>
                  <Text style={styles.quickInfoValue}>
                    {formatCurrency(salaryData.baseSalary)} đ
                  </Text>
                </View>
                <View style={styles.quickInfoDivider} />
                <View style={styles.quickInfoItem}>
                  <Text style={styles.quickInfoLabel}>Ngày công</Text>
                  <Text style={styles.quickInfoValue}>
                    {salaryData.actualWorkDays} ngày
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Main Components */}
            <View style={styles.componentsContainer}>
              <Text style={styles.sectionTitle}>Thành phần lương</Text>

              <View style={styles.componentRow}>
                <View style={styles.componentIcon}>
                  <Feather name="briefcase" size={20} color="#3674B5" />
                </View>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentLabel}>Lương cơ bản</Text>
                  <Text style={styles.componentDescription}>
                    {salaryData.actualWorkDays} ngày × 8 giờ ×{" "}
                    {formatCurrency(salaryData.hourlyRate)} đ/giờ
                  </Text>
                </View>
                <Text style={styles.componentValue}>
                  {formatCurrency(salaryData.baseSalary)} đ
                </Text>
              </View>

              <View style={styles.componentRow}>
                <View style={styles.componentIcon}>
                  <Feather name="clock" size={20} color="#FF9800" />
                </View>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentLabel}>Lương làm thêm</Text>
                  <Text style={styles.componentDescription}>
                    {salaryData.overtimeHours} giờ ×{" "}
                    {formatCurrency(
                      Math.round(
                        salaryData.hourlyRate * salaryData.overtimeRate
                      )
                    )}{" "}
                    đ/giờ
                  </Text>
                </View>
                <Text style={styles.componentValue}>
                  {formatCurrency(salaryData.overtimePay)} đ
                </Text>
              </View>

              <View style={styles.componentRow}>
                <View style={styles.componentIcon}>
                  <Feather name="plus-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentLabel}>Tổng phụ cấp</Text>
                  <Text style={styles.componentDescription}>
                    Ăn trưa, đi lại, điện thoại, ngày công
                  </Text>
                </View>
                <Text style={styles.componentValue}>
                  {formatCurrency(salaryData.totalAllowances)} đ
                </Text>
              </View>

              <View style={styles.componentRow}>
                <View style={styles.componentIcon}>
                  <Feather name="minus-circle" size={20} color="#F44336" />
                </View>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentLabel}>Khấu trừ</Text>
                  <Text style={styles.componentDescription}>
                    BHXH, BHYT, BHTN, Thuế TNCN
                  </Text>
                </View>
                <Text style={[styles.componentValue, { color: "#F44336" }]}>
                  -{formatCurrency(salaryData.totalDeductions)} đ
                </Text>
              </View>

              <View style={styles.netSalaryRow}>
                <Text style={styles.netSalaryLabel}>LƯƠNG THỰC LÃNH</Text>
                <Text style={styles.netSalaryAmount}>
                  {formatCurrency(salaryData.netSalary)} đ
                </Text>
              </View>
            </View>

            {/* Salary Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>
                Biểu đồ lương 6 tháng gần nhất
              </Text>
              <LineChart
                data={chartData}
                width={width - 32}
                height={180}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(54, 116, 181, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#3674B5",
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </>
        );

      case "details":
        return (
          <>
            {/* Detailed Breakdown */}
            <View style={styles.detailsContainer}>
              {refreshing && (
                <View style={styles.refreshingIndicator}>
                  <Text style={styles.refreshingText}>Đang cập nhật...</Text>
                </View>
              )}

              {/* Summary Card */}
              <LinearGradient
                colors={["#3674B5", "#2196F3"]}
                style={styles.detailsSummaryCard}
              >
                <View style={styles.detailsSummaryRow}>
                  <View style={styles.detailsSummaryItem}>
                    <Text style={styles.detailsSummaryLabel}>Lương cơ bản</Text>
                    <Text style={styles.detailsSummaryValue}>
                      {formatCurrency(salaryData.baseSalary)} đ
                    </Text>
                  </View>
                  <View style={styles.detailsSummaryDivider} />
                  <View style={styles.detailsSummaryItem}>
                    <Text style={styles.detailsSummaryLabel}>Thực lãnh</Text>
                    <Text style={styles.detailsSummaryValue}>
                      {formatCurrency(salaryData.netSalary)} đ
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Allowances Section */}
              <View style={styles.detailSectionCard}>
                <View style={styles.detailSectionHeader}>
                  <FontAwesome5
                    name="money-bill-wave"
                    size={18}
                    color="#3674B5"
                  />
                  <Text style={styles.sectionTitle}>Các khoản phụ cấp</Text>
                </View>

                <View style={styles.detailItemCard}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="calendar" size={16} color="#4CAF50" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Phụ cấp ngày công
                    </Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.workingDayAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="coffee" size={16} color="#FF9800" />
                    </View>
                    <Text style={styles.detailItemLabel}>Phụ cấp ăn trưa</Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.mealAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="truck" size={16} color="#9C27B0" />
                    </View>
                    <Text style={styles.detailItemLabel}>Phụ cấp đi lại</Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.transportAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="phone" size={16} color="#2196F3" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Phụ cấp điện thoại
                    </Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.phoneAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItemTotal}>
                    <Text style={styles.detailItemTotalLabel}>
                      Tổng phụ cấp
                    </Text>
                    <Text style={styles.detailItemTotalValue}>
                      {formatCurrency(salaryData.totalAllowances)} đ
                    </Text>
                  </View>
                </View>
              </View>

              {/* Deductions Section */}
              <View style={styles.detailSectionCard}>
                <View style={styles.detailSectionHeader}>
                  <FontAwesome5
                    name="hand-holding-usd"
                    size={18}
                    color="#F44336"
                  />
                  <Text style={styles.sectionTitle}>Các khoản khấu trừ</Text>
                </View>

                <View style={[styles.detailItemCard, styles.deductionCard]}>
                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        { backgroundColor: "#ffebee" },
                      ]}
                    >
                      <Feather name="shield" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm xã hội (9%)
                    </Text>
                    <Text
                      style={[styles.detailItemValue, { color: "#F44336" }]}
                    >
                      -{formatCurrency(salaryData.socialInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        { backgroundColor: "#ffebee" },
                      ]}
                    >
                      <Feather name="heart" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm y tế (1.5%)
                    </Text>
                    <Text
                      style={[styles.detailItemValue, { color: "#F44336" }]}
                    >
                      -{formatCurrency(salaryData.healthInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        { backgroundColor: "#ffebee" },
                      ]}
                    >
                      <Feather name="briefcase" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm thất nghiệp (1%)
                    </Text>
                    <Text
                      style={[styles.detailItemValue, { color: "#F44336" }]}
                    >
                      -{formatCurrency(salaryData.unemploymentInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        { backgroundColor: "#ffebee" },
                      ]}
                    >
                      <FontAwesome5
                        name="file-invoice-dollar"
                        size={16}
                        color="#F44336"
                      />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Thuế thu nhập cá nhân
                    </Text>
                    <Text
                      style={[styles.detailItemValue, { color: "#F44336" }]}
                    >
                      -{formatCurrency(salaryData.personalIncomeTax)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItemTotal}>
                    <Text style={styles.detailItemTotalLabel}>
                      Tổng khấu trừ
                    </Text>
                    <Text
                      style={[
                        styles.detailItemTotalValue,
                        { color: "#F44336" },
                      ]}
                    >
                      -{formatCurrency(salaryData.totalDeductions)} đ
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.netSalaryCard}>
                <Text style={styles.netSalaryCardLabel}>LƯƠNG THỰC LÃNH</Text>
                <Text style={styles.netSalaryCardValue}>
                  {formatCurrency(salaryData.netSalary)} đ
                </Text>
              </View>
            </View>
          </>
        );

      case "history":
        return (
          <View style={styles.historyContainer}>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Lọc theo</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>2024</Text>
                <AntDesign name="down" size={12} color="#3674B5" />
              </TouchableOpacity>
            </View>

            {salaryHistory.map((item, index) => (
              <TouchableOpacity key={index} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <View style={styles.historyIconContainer}>
                    <MaterialIcons name="payments" size={24} color="#3674B5" />
                  </View>
                  <View>
                    <Text style={styles.historyMonth}>
                      Tháng {item.month.split("/")[0]}
                    </Text>
                    <Text style={styles.historyDate}>{item.month}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>
                    {formatCurrency(item.amount)} đ
                  </Text>
                  <AntDesign name="right" size={16} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "dailyLog":
        return (
          <View style={styles.dailyLogContainer}>
            <View style={styles.dailyLogSummary}>
              <View style={styles.dailyLogSummaryItem}>
                <Text style={styles.dailyLogSummaryLabel}>Tổng công</Text>
                <Text style={styles.dailyLogSummaryValue}>
                  {attendanceSummary.totalWorkDays}
                </Text>
              </View>
              <View style={styles.dailyLogSummaryItem}>
                <Text style={styles.dailyLogSummaryLabel}>Đi làm</Text>
                <Text style={styles.dailyLogSummaryValue}>
                  {attendanceSummary.daysPresent}
                </Text>
              </View>
              <View style={styles.dailyLogSummaryItem}>
                <Text style={styles.dailyLogSummaryLabel}>Vắng mặt</Text>
                <Text style={styles.dailyLogSummaryValue}>
                  {attendanceSummary.daysAbsent}
                </Text>
              </View>
              <View style={styles.dailyLogSummaryItem}>
                <Text style={styles.dailyLogSummaryLabel}>Đi muộn</Text>
                <Text style={styles.dailyLogSummaryValue}>
                  {attendanceSummary.lateDays}
                </Text>
              </View>
            </View>

            <Text style={styles.dailyLogTitle}>
              Bảng chấm công tháng {selectedMonth}
            </Text>

            {dailyAttendanceData.map((item) => (
              <View key={item.day} style={styles.attendanceItem}>
                <View
                  style={[
                    styles.attendanceDay,
                    item.isWeekend && styles.weekendDay,
                    item.isToday && styles.currentDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.attendanceDayText,
                      item.isWeekend && styles.weekendDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>

                <View style={styles.attendanceContent}>
                  <Text style={styles.attendanceDate}>{item.date}</Text>
                  <View
                    style={[
                      styles.attendanceStatus,
                      item.status === "Đi muộn" && styles.lateStatus,
                      item.status === "Về sớm" && styles.earlyStatus,
                      item.status === "Vắng mặt" && styles.absentStatus,
                      item.status === "Cuối tuần" && styles.weekendStatus,
                    ]}
                  >
                    <Text
                      style={[
                        styles.attendanceStatusText,
                        item.status === "Đi muộn" && styles.lateStatusText,
                        item.status === "Về sớm" && styles.earlyStatusText,
                        item.status === "Vắng mặt" && styles.absentStatusText,
                        item.status === "Cuối tuần" && styles.weekendStatusText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {item.checkIn ? (
                  <View style={styles.attendanceTime}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Vào:</Text>
                      <Text style={styles.timeValue}>{item.checkIn}</Text>
                    </View>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Ra:</Text>
                      <Text style={styles.timeValue}>{item.checkOut}</Text>
                    </View>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>Giờ làm:</Text>
                      <Text style={styles.hoursValue}>{item.hoursWorked}h</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.attendanceTime}>
                    <Text style={styles.noTimeData}>Không có dữ liệu</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );

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
  dailyLogContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dailyLogSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
  },
  dailyLogSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  dailyLogSummaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dailyLogSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  dailyLogTitle: {
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
