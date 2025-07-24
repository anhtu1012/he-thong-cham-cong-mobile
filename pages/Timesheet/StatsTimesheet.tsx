import React, { useState, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const StatsTimesheet = () => {
  // State for timeSchedule data from AsyncStorage
  const [timeScheduleData, setTimeScheduleData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Fetch timeSchedule data from AsyncStorage when component focuses
  useFocusEffect(
    useCallback(() => {
      const fetchTimeScheduleData = async () => {
        try {
          const storedData = await AsyncStorage.getItem("timeScheduleDate");
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setTimeScheduleData(parsedData);
          }
        } catch (error) {
          console.error("Error fetching timeSchedule data:", error);
        }
      };

      fetchTimeScheduleData();
    }, [])
  );

  // Calculate monthly statistics from real data
  const monthlyStats = useMemo(() => {
    if (!timeScheduleData.length) {
      return {
        totalDays: 0,
        workedDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalHours: 0,
        overTime: 0,
      };
    }

    // Get current month data
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter data for current month
    const monthData = timeScheduleData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    // Calculate total working days (excluding weekends)
    const totalDays = monthData.filter((item) => {
      const itemDate = new Date(item.date);
      const dayOfWeek = itemDate.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
    }).length;

    // Calculate worked days (days with actual working hours)
    const workedDays = monthData.filter(
      (item) =>
        item.workingHourReal &&
        parseFloat(item.workingHourReal.split("h")[0]) > 0
    ).length;

    // Calculate absent days
    const absentDays = totalDays - workedDays;

    // Calculate late days (this would need additional data from API, for now set to 0)
    const lateDays = 0;

    // Calculate total hours
    const totalHours = monthData.reduce((sum, item) => {
      if (item.workingHourReal) {
        const hours = parseFloat(item.workingHourReal.split("h")[0]);
        return sum + (isNaN(hours) ? 0 : hours);
      }
      return sum;
    }, 0);

    // Calculate overtime (assuming standard 8 hours per day)
    const standardHours = workedDays * 8;
    const overTime = Math.max(0, totalHours - standardHours);

    return {
      totalDays,
      workedDays,
      absentDays,
      lateDays,
      totalHours: Math.round(totalHours),
      overTime: Math.round(overTime),
    };
  }, [timeScheduleData, currentDate]);

  // Calculate weekly data from real timeSchedule data
  const weeklyData = useMemo(() => {
    if (!timeScheduleData.length) return [];

    // Get current month data
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthData = timeScheduleData.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    // Group data by weeks
    const weeks: { [key: number]: any[] } = {};

    monthData.forEach((item) => {
      const itemDate = new Date(item.date);
      // Calculate week number of the month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const weekNumber = Math.ceil(
        (itemDate.getDate() + firstDay.getDay()) / 7
      );

      if (!weeks[weekNumber]) {
        weeks[weekNumber] = [];
      }
      weeks[weekNumber].push(item);
    });

    // Calculate hours for each week
    return Object.keys(weeks)
      .map((weekNum) => {
        const weekData = weeks[parseInt(weekNum)];
        const hours = weekData.reduce((sum, item) => {
          if (item.workingHourReal) {
            const workingHours = parseFloat(item.workingHourReal.split("h")[0]);
            return sum + (isNaN(workingHours) ? 0 : workingHours);
          }
          return sum;
        }, 0);

        return {
          week: `Tuần ${weekNum}`,
          hours: Math.round(hours),
          lateCount: 0, // Would need additional data from API
        };
      })
      .slice(0, 4); // Limit to 4 weeks for display
  }, [timeScheduleData, currentDate]);

  // Render thông tin tổng quan
  const renderOverview = () => {
    return (
      <View style={styles.overviewContainer}>
        <LinearGradient
          colors={["#3674B5", "#2196F3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerCard}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              Tổng quan tháng{" "}
              {(currentDate.getMonth() + 1).toString().padStart(2, "0")}/
              {currentDate.getFullYear()}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <View style={styles.statCircle}>
                <Text style={styles.statCircleValue}>
                  {monthlyStats.workedDays}
                </Text>
                <Text style={styles.statCircleTotal}>
                  /{monthlyStats.totalDays}
                </Text>
              </View>
              <Text style={styles.statLabel}>Ngày công</Text>
            </View>

            <View style={styles.statsItem}>
              <View
                style={[
                  styles.statCircle,
                  { backgroundColor: "rgba(255,255,255,0.15)" },
                ]}
              >
                <Text style={styles.statCircleValue}>
                  {monthlyStats.totalHours}
                </Text>
                <Text style={styles.statCircleUnit}>giờ</Text>
              </View>
              <Text style={styles.statLabel}>Tổng công</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <FontAwesome5 name="clipboard-list" size={18} color="#3674B5" />
            <Text style={styles.detailsTitle}>Chi tiết chấm công</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#3498db" }]}
              >
                <MaterialIcons name="work" size={20} color="#fff" />
              </View>
              <Text style={styles.statItemLabel}>Ngày công</Text>
              <Text style={styles.statValue}>
                {monthlyStats.workedDays}/{monthlyStats.totalDays}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#e74c3c" }]}
              >
                <AntDesign name="close" size={20} color="#fff" />
              </View>
              <Text style={styles.statItemLabel}>Nghỉ phép</Text>
              <Text style={styles.statValue}>{monthlyStats.absentDays}</Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#f39c12" }]}
              >
                <AntDesign name="clockcircle" size={20} color="#fff" />
              </View>
              <Text style={styles.statItemLabel}>Đi muộn</Text>
              <Text style={styles.statValue}>{monthlyStats.lateDays}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.hoursContainer}>
            <View style={styles.hoursItem}>
              <Feather name="clock" size={20} color="#3674B5" />
              <Text style={styles.hoursLabel}>Tổng công làm</Text>
              <Text style={styles.hoursValue}>{monthlyStats.totalHours}h</Text>
            </View>
            <View style={styles.hoursItem}>
              <Feather name="plus-circle" size={20} color="#4CAF50" />
              <Text style={styles.hoursLabel}>Tăng ca</Text>
              <Text style={[styles.hoursValue, { color: "#4CAF50" }]}>
                {monthlyStats.overTime}h
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render biểu đồ từng tuần
  const renderWeeklyChart = () => {
    if (!weeklyData.length) {
      return (
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Feather name="bar-chart-2" size={18} color="#3674B5" />
            <Text style={styles.chartTitle}>Thống kê giờ làm theo tuần</Text>
          </View>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Chưa có dữ liệu chấm công</Text>
          </View>
        </View>
      );
    }

    const maxHours = Math.max(...weeklyData.map((week) => week.hours), 1); // Ensure at least 1 to avoid division by 0

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Feather name="bar-chart-2" size={18} color="#3674B5" />
          <Text style={styles.chartTitle}>Thống kê giờ làm theo tuần</Text>
        </View>

        <View style={styles.chartContent}>
          {weeklyData.map((week, index) => (
            <View key={`week-${index}`} style={styles.chartItem}>
              <View style={styles.barWrap}>
                <View style={styles.barBackground} />
                <View
                  style={[
                    styles.bar,
                    {
                      height: (week.hours / maxHours) * 120,
                      backgroundColor:
                        week.lateCount > 0 ? "#f39c12" : "#3674B5",
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{week.hours}h</Text>
              <Text style={styles.weekLabel}>{week.week}</Text>
              {week.lateCount > 0 && (
                <View style={styles.lateIndicator}>
                  <AntDesign
                    name="exclamationcircle"
                    size={12}
                    color="#e74c3c"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#3674B5" }]}
            />
            <Text style={styles.legendText}>Đúng giờ</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#f39c12" }]}
            />
            <Text style={styles.legendText}>Có đi muộn</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverview()}
      {renderWeeklyChart()}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
  },
  overviewContainer: {
    marginBottom: 16,
  },
  headerCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerRow: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  statsItem: {
    alignItems: "center",
  },
  statCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row",
  },
  statCircleValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statCircleTotal: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  statCircleUnit: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statItemLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  hoursContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  hoursItem: {
    alignItems: "center",
    flexDirection: "column",
  },
  hoursLabel: {
    fontSize: 13,
    color: "#666",
    marginVertical: 6,
  },
  hoursValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  chartContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 170,
    marginBottom: 16,
  },
  chartItem: {
    alignItems: "center",
    width: (width - 80) / 4,
  },
  barWrap: {
    width: 18,
    height: 140,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barBackground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 140,
    backgroundColor: "#f0f0f0",
    borderRadius: 9,
  },
  bar: {
    width: 18,
    minHeight: 20,
    borderRadius: 9,
    position: "relative",
  },
  barValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
  },
  weekLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  lateIndicator: {
    position: "absolute",
    top: 0,
    right: 10,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 170,
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});

export default StatsTimesheet;
