import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import TimeScheduleModal from "../../components/TimeScheduleModal";
import { UserProfile, WorkingSchedule } from "../../models/timekeeping";
import { getTimeSchedule } from "../../service/api";

// Kích hoạt plugin UTC cho dayjs
dayjs.extend(utc);

const WeeklyTimesheet = () => {
  const [weeklyData, setWeeklyData] = useState<WorkingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchWeeklyData();
    }
  }, [userProfile, currentWeek]);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        setUserProfile(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const fetchWeeklyData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(currentWeek);

      const response = await getTimeSchedule(
        weekStart,
        weekEnd,
        userProfile.code
      );

      if (response.data && response.data.data) {
        // Sort data by date (ascending order)
        const sortedData = response.data.data.sort(
          (a: WorkingSchedule, b: WorkingSchedule) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );
        setWeeklyData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching weekly data:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải dữ liệu tuần",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "--:--";
    try {
      // Use dayjs with UTC to preserve original time from database
      const utcTime = dayjs(timeString);
      return utcTime.format("HH:mm");
    } catch (error) {
      return "--:--";
    }
  };

  const getStatusColor = (
    status: string | null,
    statusTimeKeeping: string | null
  ) => {
    if (statusTimeKeeping === "END") return "#4CAF50";
    if (statusTimeKeeping === "LATE") return "#F23542";
    if (statusTimeKeeping === "NOCHECKOUT") return "#F44336";
    if (status === "ACTIVE") return "#FFC107";
    if (status === "FORGET") return "#FF9800";
    if (status === "NOTWORK") return "#be1515ff";
    return "#9E9E9E";
  };

  const getStatusText = (
    status: string | null,
    statusTimeKeeping: string | null,
    checkIn: string | null,
    checkOut: string | null
  ) => {
    if (checkIn && checkOut && statusTimeKeeping === "END") return "Hoàn thành";
    if (checkIn && !checkOut) return "Chưa checkout";
    if (statusTimeKeeping === "LATE") return "Đi muộn";
    if (status === "ACTIVE") return "Đang làm";
    if (status === "FORGET") return "Hoàn thành (QCC)";
    if (status === "NOTWORK") return "Vắng mặt";
    return "Chưa checkin";
  };

  const calculateOvertimeHours = (item: WorkingSchedule) => {
    if (!item.checkInTime || !item.checkOutTime) return 0;

    const standardHours = item.workingHours;
    const actualHours = item.workingHourReal
      ? parseFloat(item.workingHourReal)
      : 0;

    return Math.max(0, actualHours - standardHours);
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchWeeklyData();
    } catch (error) {
      console.error("Error refreshing weekly data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getTotalStats = () => {
    const completedDays = weeklyData.filter(
      (d) => d.checkInTime && d.checkOutTime
    );
    const totalHours = completedDays.reduce((sum, d) => {
      const hours = d.workingHours;
      return sum + (hours || 0);
    }, 0);
    const overtimeHours = completedDays.reduce(
      (sum, d) => sum + calculateOvertimeHours(d),
      0
    );
    const lateDays = weeklyData.filter(
      (d) => d.statusTimeKeeping === "LATE"
    ).length;

    return {
      workDays: weeklyData.length,
      completedDays: completedDays.length,
      totalHours: Math.round(totalHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      lateDays,
    };
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getWeekRange = () => {
    const start = getWeekStart(currentWeek);
    const end = getWeekEnd(currentWeek);
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${
      end.getMonth() + 1
    }`;
  };

  const handleDayPress = (item: WorkingSchedule) => {
    let value;
    if (!item.checkInTime || !item.checkOutTime) {
      value = "--:--";
    } else if (item.status === "NOTWORK") {
      value = "A";
    } else if (item.startShiftTime === "LATE") {
      value = item.workingHourReal;
    } else {
      value = item.workingHours;
    }
    const dayData = {
      day: new Date(item.date).getDate(),
      status: item.status as any,
      value: value || 0,
      date: item.date,
      checkInTime: item.checkInTime,
      checkOutTime: item.checkOutTime,
      workingHourReal: item.workingHourReal,
      workingHours: item.workingHours,
      startShiftTime: item.startShiftTime,
      endShiftTime: item.endShiftTime,
    };
    setSelectedDayData(dayData);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3674B5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu tuần...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        style={styles.headerGradient}
      >
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateWeek("prev")}
          >
            <MaterialIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.weekTitleContainer}>
            <Text style={styles.weekTitle}>Tuần {getWeekRange()}</Text>
                              <Text style={styles.weekSubtitle}>
                    {`Tháng ${currentWeek.getMonth() + 1}, ${currentWeek.getFullYear()}`}
                  </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateWeek("next")}
          >
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{getTotalStats().workDays}</Text>
            <Text style={styles.summaryLabel}>Ngày làm</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {getTotalStats().completedDays}
            </Text>
            <Text style={styles.summaryLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {`${getTotalStats().totalHours}h`}
            </Text>
            <Text style={styles.summaryLabel}>Tổng công</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {`${getTotalStats().overtimeHours}h`}
            </Text>
            <Text style={styles.summaryLabel}>Tăng ca</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {weeklyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>Không có dữ liệu cho tuần này</Text>
          </View>
        ) : (
          weeklyData.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dayCard}
              onPress={() => handleDayPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dateSection}>
                  <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.dayName}>
                    {new Date(item.date).toLocaleDateString("vi-VN", {
                      weekday: "short",
                    })}
                  </Text>
                </View>

                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftName}>{item.shiftName}</Text>
                  <Text style={styles.shiftTime}>
                    {`${item.startShiftTime} - ${item.endShiftTime}`}
                  </Text>
                  {item.departmentName && (
                    <Text style={styles.departmentName}>
                      {item.departmentName}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(
                        item.status,
                        item.statusTimeKeeping
                      ),
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(
                      item.status,
                      item.statusTimeKeeping,
                      item.checkInTime,
                      item.checkOutTime
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.timeDetails}>
                <View style={styles.timeItem}>
                  <View style={styles.timeIcon}>
                    <Feather name="log-in" size={16} color="#4CAF50" />
                  </View>
                  <View style={styles.timeContent}>
                    <Text style={styles.timeLabel}>Vào</Text>
                    <Text style={styles.timeValue}>
                      {formatTime(item.checkInTime)}
                    </Text>
                    {item.lateMinutes && item.lateMinutes > 0 && (
                      <Text style={styles.lateText}>
                        {`Trễ ${item.lateMinutes}p`}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.timeDivider} />

                <View style={styles.timeItem}>
                  <View style={styles.timeIcon}>
                    <Feather name="log-out" size={16} color="#FF9800" />
                  </View>
                  <View style={styles.timeContent}>
                    <Text style={styles.timeLabel}>Ra</Text>
                    <Text style={styles.timeValue}>
                      {formatTime(item.checkOutTime)}
                    </Text>
                    {item.earlyLeaveMinutes && item.earlyLeaveMinutes > 0 && (
                      <Text style={styles.earlyText}>
                        {`Sớm ${item.earlyLeaveMinutes}p`}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.timeDivider} />

                <View style={styles.timeItem}>
                  <View style={styles.timeIcon}>
                    <Feather name="clock" size={16} color="#2196F3" />
                  </View>
                  <View style={styles.timeContent}>
                    <Text style={styles.timeLabel}>Công</Text>
                    <Text style={styles.timeValue}>
                      {!item.checkInTime || !item.checkOutTime
                        ? "--:--"
                        : item.checkInTime &&
                          item.checkOutTime &&
                          item.startShiftTime === "LATE"
                        ? item.workingHourReal
                        : item.workingHours}
                    </Text>
                    {calculateOvertimeHours(item) > 0 && (
                                          <Text style={styles.overtimeText}>
                      {`+${calculateOvertimeHours(item)}h OT`}
                    </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Additional info section */}
              {(item.workLocation || item.notes) && (
                <View style={styles.additionalInfo}>
                  {item.workLocation && (
                    <View style={styles.infoRow}>
                      <Feather name="map-pin" size={12} color="#666" />
                      <Text style={styles.infoText}>
                        {item.workLocation === "OFFICE"
                          ? "Văn phòng"
                          : item.workLocation === "REMOTE"
                          ? "Làm từ xa"
                          : "Tại khách hàng"}
                      </Text>
                    </View>
                  )}
                  {item.notes && (
                    <View style={styles.infoRow}>
                      <Feather name="message-circle" size={12} color="#666" />
                      <Text style={styles.infoText}>{item.notes}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <TimeScheduleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDayData}
        currentDate={currentWeek}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  headerGradient: {
    paddingTop: 15,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  weekTitleContainer: {
    alignItems: "center",
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  dayCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateSection: {
    alignItems: "center",
    marginRight: 16,
  },
  dayDate: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dayName: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  shiftInfo: {
    flex: 1,
    marginRight: 16,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  shiftTime: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  timeDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
  },
  timeItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  bottomSpace: {
    height: 80,
  },
  departmentName: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },
  lateText: {
    fontSize: 10,
    color: "#F44336",
    marginTop: 1,
  },
  earlyText: {
    fontSize: 10,
    color: "#FF9800",
    marginTop: 1,
  },
  overtimeText: {
    fontSize: 10,
    color: "#4CAF50",
    marginTop: 1,
  },
  additionalInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
});

export default WeeklyTimesheet;
