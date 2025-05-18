import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
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

  const renderTab = () => {
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
                      <FontAwesome5 name="bus" size={16} color="#2196F3" />
                    </View>
                    <Text style={styles.detailItemLabel}>Phụ cấp đi lại</Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.transportAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="phone" size={16} color="#9C27B0" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Phụ cấp điện thoại
                    </Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.phoneAllowance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="plus-circle" size={16} color="#607D8B" />
                    </View>
                    <Text style={styles.detailItemLabel}>Phụ cấp khác</Text>
                    <Text style={styles.detailItemValue}>
                      {formatCurrency(salaryData.otherAllowance)} đ
                    </Text>
                  </View>

                  <View style={[styles.detailItem, styles.totalItem]}>
                    <View style={styles.detailItemIconContainer}>
                      <Feather name="check-circle" size={16} color="#3674B5" />
                    </View>
                    <Text style={styles.totalLabel}>Tổng phụ cấp</Text>
                    <Text style={styles.totalValue}>
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
                  <Text style={[styles.sectionTitle, { color: "#F44336" }]}>
                    Các khoản khấu trừ
                  </Text>
                </View>

                <View style={[styles.detailItemCard, styles.deductionCard]}>
                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        styles.deductionIcon,
                      ]}
                    >
                      <Feather name="shield" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm xã hội (9%)
                    </Text>
                    <Text style={styles.detailItemDeduction}>
                      -{formatCurrency(salaryData.socialInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        styles.deductionIcon,
                      ]}
                    >
                      <FontAwesome5 name="hospital" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm y tế (1.5%)
                    </Text>
                    <Text style={styles.detailItemDeduction}>
                      -{formatCurrency(salaryData.healthInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        styles.deductionIcon,
                      ]}
                    >
                      <Feather name="briefcase" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Bảo hiểm thất nghiệp (1%)
                    </Text>
                    <Text style={styles.detailItemDeduction}>
                      -{formatCurrency(salaryData.unemploymentInsurance)} đ
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        styles.deductionIcon,
                      ]}
                    >
                      <FontAwesome5 name="receipt" size={16} color="#F44336" />
                    </View>
                    <Text style={styles.detailItemLabel}>
                      Thuế thu nhập cá nhân
                    </Text>
                    <Text style={styles.detailItemDeduction}>
                      -{formatCurrency(salaryData.personalIncomeTax)} đ
                    </Text>
                  </View>

                  <View style={[styles.detailItem, styles.totalItem]}>
                    <View
                      style={[
                        styles.detailItemIconContainer,
                        styles.deductionIcon,
                      ]}
                    >
                      <Feather name="minus-circle" size={16} color="#F44336" />
                    </View>
                    <Text style={[styles.totalLabel, { color: "#F44336" }]}>
                      Tổng khấu trừ
                    </Text>
                    <Text style={[styles.totalValue, { color: "#F44336" }]}>
                      -{formatCurrency(salaryData.totalDeductions)} đ
                    </Text>
                  </View>
                </View>
              </View>

              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.grandTotalContainer}
              >
                <View style={styles.grandTotalRow}>
                  <View style={styles.grandTotalIconContainer}>
                    <AntDesign name="wallet" size={24} color="#3674B5" />
                  </View>
                  <View style={styles.grandTotalContent}>
                    <Text style={styles.grandTotalLabel}>LƯƠNG THỰC LÃNH</Text>
                    <Text style={styles.grandTotalSubtext}>
                      Chuyển khoản ngày {salaryData.paymentDate}
                    </Text>
                  </View>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(salaryData.netSalary)} đ
                  </Text>
                </View>
              </LinearGradient>

              <TouchableOpacity style={styles.downloadPayslipButton}>
                <AntDesign name="pdffile1" size={20} color="#fff" />
                <Text style={styles.downloadText}>
                  Tải phiếu lương chi tiết
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "history":
        return (
          <>
            <View style={styles.historyContainer}>
              <Text style={styles.sectionTitle}>Lịch sử lương năm 2024</Text>

              {salaryHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.historyItem,
                    selectedMonth === item.month && styles.selectedHistoryItem,
                  ]}
                  onPress={() => setSelectedMonth(item.month)}
                >
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyMonth}>
                      Tháng {item.month.split("/")[0]}
                    </Text>
                    <Text style={styles.historyYear}>
                      {item.month.split("/")[1]}
                    </Text>
                  </View>

                  <View style={styles.historyAmountContainer}>
                    <Text style={styles.historyAmount}>
                      {formatCurrency(item.amount)} đ
                    </Text>
                    {index < salaryHistory.length - 1 && (
                      <View style={styles.historyTrend}>
                        {item.amount > salaryHistory[index + 1].amount ? (
                          <>
                            <AntDesign
                              name="arrowup"
                              size={12}
                              color="#4CAF50"
                            />
                            <Text
                              style={[
                                styles.historyTrendText,
                                { color: "#4CAF50" },
                              ]}
                            >
                              +
                              {formatCurrency(
                                item.amount - salaryHistory[index + 1].amount
                              )}{" "}
                              đ
                            </Text>
                          </>
                        ) : item.amount < salaryHistory[index + 1].amount ? (
                          <>
                            <AntDesign
                              name="arrowdown"
                              size={12}
                              color="#F44336"
                            />
                            <Text
                              style={[
                                styles.historyTrendText,
                                { color: "#F44336" },
                              ]}
                            >
                              -
                              {formatCurrency(
                                salaryHistory[index + 1].amount - item.amount
                              )}{" "}
                              đ
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.historyTrendText}>
                            Không thay đổi
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.downloadButton}>
                <AntDesign name="pdffile1" size={20} color="#fff" />
                <Text style={styles.downloadText}>Tải phiếu lương</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "dailyLog":
        return (
          <>
            <View style={styles.dailyLogContainer}>
              {refreshing && (
                <View style={styles.refreshingIndicator}>
                  <Text style={styles.refreshingText}>Đang cập nhật...</Text>
                </View>
              )}
              <Text style={styles.sectionTitle}>
                Chi tiết công tháng {selectedMonth.split("/")[0]}/
                {selectedMonth.split("/")[1]}
              </Text>

              {/* Attendance Summary */}
              <View style={styles.attendanceSummaryCard}>
                <View style={styles.attendanceSummaryRow}>
                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.totalWorkDays}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Ngày làm</Text>
                  </View>

                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.daysPresent}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Có mặt</Text>
                  </View>

                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.daysAbsent}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Vắng</Text>
                  </View>
                </View>

                <View style={styles.attendanceSummaryRow}>
                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.lateDays}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Đi muộn</Text>
                  </View>

                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.earlyDays}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Về sớm</Text>
                  </View>

                  <View style={styles.attendanceSummaryItem}>
                    <Text style={styles.attendanceSummaryValue}>
                      {attendanceSummary.totalHours}
                    </Text>
                    <Text style={styles.attendanceSummaryLabel}>Tổng giờ</Text>
                  </View>
                </View>
              </View>

              {/* Daily Log Header */}
              <View style={styles.dailyLogHeader}>
                <Text style={[styles.dailyLogHeaderText, { flex: 0.5 }]}>
                  Ngày
                </Text>
                <Text style={[styles.dailyLogHeaderText, { flex: 1 }]}>
                  Trạng thái
                </Text>
                <Text style={[styles.dailyLogHeaderText, { flex: 0.8 }]}>
                  Vào
                </Text>
                <Text style={[styles.dailyLogHeaderText, { flex: 0.8 }]}>
                  Ra
                </Text>
                <Text style={[styles.dailyLogHeaderText, { flex: 0.6 }]}>
                  Giờ
                </Text>
              </View>

              {/* Daily Log Items */}
              {dailyAttendanceData.slice(0, 22).map((day) => (
                <View
                  key={day.day}
                  style={[
                    styles.dailyLogItem,
                    day.isWeekend && styles.weekendLogItem,
                    day.isToday && styles.todayLogItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.dailyLogText,
                      { flex: 0.5 },
                      day.isWeekend && styles.weekendText,
                    ]}
                  >
                    {day.day}
                  </Text>

                  <View style={[styles.dailyStatusContainer, { flex: 1 }]}>
                    {!day.isWeekend && (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              day.status === "Đúng giờ"
                                ? "#E8F5E9"
                                : day.status === "Đi muộn"
                                ? "#FFF3E0"
                                : day.status === "Về sớm"
                                ? "#E3F2FD"
                                : day.status === "Vắng mặt"
                                ? "#FFEBEE"
                                : "#F5F5F5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                day.status === "Đúng giờ"
                                  ? "#4CAF50"
                                  : day.status === "Đi muộn"
                                  ? "#FF9800"
                                  : day.status === "Về sớm"
                                  ? "#2196F3"
                                  : day.status === "Vắng mặt"
                                  ? "#F44336"
                                  : "#757575",
                            },
                          ]}
                        >
                          {day.status}
                        </Text>
                      </View>
                    )}

                    {day.isWeekend && (
                      <Text style={styles.weekendText}>Cuối tuần</Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.dailyLogText,
                      { flex: 0.8 },
                      day.isWeekend && styles.weekendText,
                    ]}
                  >
                    {day.checkIn || "--:--"}
                  </Text>

                  <Text
                    style={[
                      styles.dailyLogText,
                      { flex: 0.8 },
                      day.isWeekend && styles.weekendText,
                    ]}
                  >
                    {day.checkOut || "--:--"}
                  </Text>

                  <Text
                    style={[
                      styles.dailyLogText,
                      { flex: 0.6 },
                      day.isWeekend && styles.weekendText,
                    ]}
                  >
                    {day.hoursWorked || "0"}
                  </Text>
                </View>
              ))}

              <View style={styles.upcomingDaysContainer}>
                <View style={styles.upcomingDaysHeader}>
                  <Feather name="calendar" size={16} color="#3674B5" />
                  <Text style={styles.upcomingDaysTitle}>
                    Ngày làm việc sắp tới
                  </Text>
                </View>

                {dailyAttendanceData.slice(22, 31).map((day) => (
                  <View key={day.day} style={styles.upcomingDayItem}>
                    <Text style={styles.upcomingDayDate}>{day.date}</Text>
                    <Text style={styles.upcomingDayStatus}>
                      {day.isWeekend ? "Cuối tuần" : "Chưa đến"}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.exportButton}>
                <FontAwesome5 name="file-export" size={18} color="#fff" />
                <Text style={styles.exportButtonText}>
                  Xuất báo cáo công tháng
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        {/* Month Selector - now part of the gradient header */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthArrowContainer}
            activeOpacity={0.7}
          >
            <AntDesign name="left" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.monthTextContainer}>
            <Text style={styles.monthText}>{selectedMonth}</Text>
            <View style={styles.monthIndicator} />
          </View>

          <TouchableOpacity
            style={styles.monthArrowContainer}
            activeOpacity={0.7}
          >
            <AntDesign name="right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabOuterContainer}>
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContentContainer}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "summary" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("summary")}
            >
              <Feather
                name="pie-chart"
                size={18}
                color={activeTab === "summary" ? "#3674B5" : "#888"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "summary" && styles.activeTabText,
                ]}
              >
                Tổng quan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "details" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("details")}
            >
              <Feather
                name="list"
                size={18}
                color={activeTab === "details" ? "#3674B5" : "#888"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "details" && styles.activeTabText,
                ]}
              >
                Chi tiết
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "dailyLog" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("dailyLog")}
            >
              <Feather
                name="calendar"
                size={18}
                color={activeTab === "dailyLog" ? "#3674B5" : "#888"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "dailyLog" && styles.activeTabText,
                ]}
              >
                Chi tiết công
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "history" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("history")}
            >
              <Feather
                name="clock"
                size={18}
                color={activeTab === "history" ? "#3674B5" : "#888"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "history" && styles.activeTabText,
                ]}
              >
                Lịch sử
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTab()}
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
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },
  headerGradient: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  monthArrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthTextContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  monthIndicator: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#fff",
  },
  tabOuterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tabContentContainer: {
    flexDirection: "row",
    width: width,
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: "#3674B5",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#3674B5",
    fontWeight: "600",
  },
  gradientSummaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  netSalaryContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  netSalaryValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#fff",
  },
  quickInfoContainer: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: 12,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  quickInfoDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  quickInfoLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  componentsContainer: {
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
  componentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 13,
    color: "#666",
  },
  componentValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    minWidth: 100,
    textAlign: "right",
  },
  netSalaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  netSalaryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  netSalaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  chartContainer: {
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
  chart: {
    marginTop: 8,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  detailsSummaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  detailsSummaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  detailsSummaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  detailsSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  detailSectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  detailSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailItemCard: {
    padding: 12,
  },
  deductionCard: {
    backgroundColor: "#FFF8F8",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailItemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deductionIcon: {
    backgroundColor: "#FFEBEE",
  },
  detailItemLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
  },
  detailItemDeduction: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F44336",
    textAlign: "right",
  },
  totalItem: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#3674B5",
  },
  grandTotalContainer: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  grandTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  grandTotalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  grandTotalContent: {
    flex: 1,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotalSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3674B5",
  },
  downloadPayslipButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  historyContainer: {
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
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedHistoryItem: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  historyYear: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  historyAmountContainer: {
    flex: 2,
    alignItems: "flex-end",
    marginRight: 8,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3674B5",
    marginBottom: 4,
  },
  historyTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyTrendText: {
    fontSize: 12,
    marginLeft: 4,
  },
  downloadButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 16,
  },
  bottomSpace: {
    height: 80,
  },
  dailyLogContainer: {
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
  attendanceSummaryCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  attendanceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  attendanceSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  attendanceSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 4,
  },
  attendanceSummaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  dailyLogHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  dailyLogHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  dailyLogItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  weekendLogItem: {
    backgroundColor: "#f9f9f9",
  },
  todayLogItem: {
    backgroundColor: "#E3F2FD",
  },
  dailyLogText: {
    fontSize: 14,
    color: "#333",
  },
  weekendText: {
    color: "#9e9e9e",
  },
  dailyStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  upcomingDaysContainer: {
    marginTop: 24,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  upcomingDaysHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  upcomingDaysTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3674B5",
    marginLeft: 8,
  },
  upcomingDayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  upcomingDayDate: {
    fontSize: 14,
    color: "#333",
  },
  upcomingDayStatus: {
    fontSize: 14,
    color: "#757575",
  },
  exportButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 20,
  },
  exportButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  refreshingIndicator: {
    backgroundColor: "rgba(54, 116, 181, 0.1)",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    marginHorizontal: 16,
    alignItems: "center",
  },
  refreshingText: {
    color: "#3674B5",
    fontSize: 14,
  },
});

export default SalaryPage;
