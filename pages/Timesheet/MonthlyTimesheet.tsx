import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getTimeSchedule } from "../../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getCurrentDateRes } from "../../utils/dateUtils";
import TimeScheduleModal from "../../components/TimeScheduleModal";
import { DayStatus } from "../../models/timekeeping";

const { width } = Dimensions.get("window");

const MonthlyTimesheet = () => {
  const [daysInMonth, setDaysInMonth] = useState<DayStatus[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dataWorkingSchedule, setDataWorkingSchedule] = useState<DayStatus[]>(
    []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [choosenDate, setChoosenDate] = useState<DayStatus>();

  useFocusEffect(
    useCallback(() => {
      handleGetTimeSchedule();
    }, [currentDate])
  );

  const handleGetTimeSchedule = async () => {
    const userData = await AsyncStorage.getItem("userData");
    const user = JSON.parse(userData!);
    const userCode = user.code;
    let fromDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
    const toDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      99
    );
    let days: DayStatus[] = Array.from({ length: toDate.getDate() }, (_, i) => {
      const currentDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i + 1
      ).getDay();

      return {
        day: i + 1,
        value: "N",
        status: "normal",
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
          .toISOString()
          .split("T")[0],
        checkInTime: undefined,
        checkOutTime: undefined,
        workingHourReal: undefined,
        workingHours: undefined,
        startShiftTime: undefined,
        endShiftTime: undefined,
        statusTimeKeeping: undefined,
      };
    });

    const timeScheduleRes = await getTimeSchedule(fromDate, toDate, userCode);
    let timeSchedule = timeScheduleRes.data.data;
    setDataWorkingSchedule(timeSchedule);

    // save to local storage
    await AsyncStorage.setItem(
      "timeScheduleDate",
      JSON.stringify(timeSchedule)
    );

    // get current day & store to asyncStorage
    for (const time of timeSchedule) {
      try {
        const today = new Date(getCurrentDateRes());
        const timeDate = new Date(time.date);

        if (timeDate.getDate() === today.getDate()) {
          await AsyncStorage.setItem(
            "currentTimeScheduleDate",
            JSON.stringify(time)
          );
        }
      } catch (err) {
        console.error("Error processing timeSchedule item:", err);
      }
    }

    // Process timeSchedule data
    for (const date of timeSchedule) {
      const currentDateObj = new Date(date.date);
      const day = days[currentDateObj.getDate() - 1];

      // Store additional data
      day.checkInTime = date.checkInTime;
      day.checkOutTime = date.checkOutTime;
      day.workingHourReal = date.workingHourReal;
      day.workingHours = date.workingHours;
      day.startShiftTime = date.startShiftTime;
      day.endShiftTime = date.endShiftTime;
      day.statusTimeKeeping = date.statusTimeKeeping;

      // Set status and value based on statusTimeKeeping
      if (date.status === "NOTSTARTED") {
        day.status = "NOTSTARTED";
        day.value = 0;
      } else if (date.status === "ACTIVE") {
        day.status = "ACTIVE";
        day.value = "D";
      } else if (
        (date.status === "END" || date.status === "FORGET") &&
        date.statusTimeKeeping !== "LATE"
      ) {
        day.status = "END";
        day.value = date.workingHours || 0;
      } else if (date.statusTimeKeeping === "LATE") {
        day.status = "END";
        day.value = date.workingHourReal || 0;
      } else {
        day.status = "NOTWORK";
        day.value = "A";
      }
    }

    setDaysInMonth(days);
  };

  const handleChangeMonth = (isForward: boolean) => {
    if (isForward) {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
      );
    } else {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Render weekday headers
  const renderWeekdays = () => {
    const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    return weekdays.map((day, index) => (
      <View key={`weekday-${index}`} style={styles.weekdayCell}>
        <Text style={[styles.weekdayText, index > 4 && styles.weekendText]}>
          {day}
        </Text>
      </View>
    ));
  };

  // Prepare grid data with useMemo to avoid recalculation on every render
  const gridData = useMemo(() => {
    if (!daysInMonth.length) return [];

    // Create a copy of daysInMonth to avoid mutating state
    let days = [...daysInMonth];

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      days[0].day
    ).getDay();

    // Add placeholder days for the beginning of the month
    if (firstDay !== 0) {
      for (let i = 0; i < firstDay - 1; i++) {
        days.unshift({
          day: 0,
          status: "NOTSTARTED",
          value: 0,
        });
      }
    } else {
      for (let i = 0; i < 6; i++) {
        days.unshift({
          day: 0,
          status: "NOTSTARTED",
          value: 0,
        });
      }
    }

    // Add placeholder days to complete the grid (make it divisible by 7)
    while (days.length % 7 !== 0) {
      days.push({
        day: 0,
        status: "NOTSTARTED",
        value: 0,
      });
    }

    // Split into weeks
    const chunks = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }

    return chunks;
  }, [daysInMonth, currentDate]);

  // Render calendar grid
  const renderGrid = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    return gridData.map((week, weekIndex) => (
      <View key={`week-${weekIndex}`} style={styles.weekRow}>
        {week.map((day, dayIndex) => {
          // Check if this day is in the future
          const dayDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day.day
          );
          const isFutureDate = dayDate > today && day.day !== 0;

          // Check if this day is the current date
          const isCurrentDate =
            dayDate.getTime() === today.getTime() && day.day !== 0;

          return (
            <TouchableOpacity
              key={`day-${dayIndex}`}
              style={[
                styles.dayCell,
                day.status === "weekend" && styles.weekendCell,
                day.status === "ACTIVE" && styles.activeDayCell,
                day.status === "END" && styles.endDayCell,
                day.status === "NOTWORK" && styles.notWorkDayCell,
                day.status === "NOTSTARTED" && styles.notStartedDayCell,
                isCurrentDate &&
                  day.status === "NOTSTARTED" &&
                  styles.currentDateNotStartedCell,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                if (day.day !== 0) {
                  setChoosenDate(day);
                  setIsModalVisible(true);
                }
              }}
            >
              <Text
                style={[
                  styles.dayNumber,
                  day.status === "weekend" && styles.weekendText,
                  day.day < 10 && styles.singleDigitDay,
                ]}
              >
                {day.day == 0 ? " " : day.day}
              </Text>

              {day.day !== 0 && (
                <View
                  style={[
                    styles.valueContainer,
                    day.status === "ACTIVE" && styles.activeValueContainer,
                    day.status === "END" && styles.endValueContainer,
                    day.status === "NOTWORK" && styles.notWorkValueContainer,
                    day.status === "weekend" && styles.weekendValueContainer,
                    day.status === "NOTSTARTED" &&
                      styles.notStartedValueContainer,
                    isCurrentDate &&
                      day.status === "NOTSTARTED" &&
                      styles.currentDateNotStartedValueContainer,
                    isFutureDate && styles.futureDateValueContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusValue,
                      day.status === "ACTIVE" && styles.activeValue,
                      day.status === "END" && styles.endValue,
                      day.status === "NOTWORK" && styles.notWorkValue,
                      day.status === "weekend" && styles.weekendValue,
                      day.status === "NOTSTARTED" && styles.notStartedValue,
                      isCurrentDate &&
                        day.status === "NOTSTARTED" &&
                        styles.currentDateNotStartedValue,
                      isFutureDate && styles.futureDateValue,
                    ]}
                  >
                    {day.value}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  }, [gridData, setChoosenDate, setIsModalVisible, currentDate]);

  // Header with month selector
  const renderHeader = () => {
    const month = currentDate.getMonth() + 1; // Tháng hiện tại
    const year = currentDate.getFullYear(); // Năm hiện tại

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => handleChangeMonth(false)}
        >
          <AntDesign name="left" size={18} color="#555" />
        </TouchableOpacity>
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitle}>{`Tháng ${month}/${year}`}</Text>
          <View style={styles.monthIndicator} />
        </View>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => handleChangeMonth(true)}
        >
          <AntDesign name="right" size={18} color="#555" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render summary and legend
  const renderSummaryAndLegend = () => {
    const presentDays = daysInMonth.filter(
      (day) => day.status === "END" || day.status === "ACTIVE"
    ).length;

    return (
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryContainer}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ngày làm việc</Text>
            <Text style={styles.summaryValue}>
              {dataWorkingSchedule.length}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Đã chấm công</Text>
            <Text style={styles.summaryValue}>{presentDays}</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendBadge, { backgroundColor: "#4CAF50" }]}
            />
            <Text style={styles.legendText}>Hoàn thành</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[styles.legendBadge, { backgroundColor: "#FFC107" }]}
            />
            <Text style={styles.legendText}>Đang làm</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[styles.legendBadge, { backgroundColor: "#9E9E9E" }]}
            />
            <Text style={styles.legendText}>Chưa làm</Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[styles.legendBadge, { backgroundColor: "#F23542" }]}
            />
            <Text style={styles.legendText}>Nghỉ Phép</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <>
      <TimeScheduleModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        selectedDate={choosenDate}
        currentDate={currentDate}
      />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}
          {renderSummaryAndLegend()}

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Feather name="calendar" size={18} color="#3674B5" />
              <Text style={styles.calendarTitle}>Bảng chấm công tháng</Text>
            </View>

            <View style={styles.weekdayRow}>{renderWeekdays()}</View>
            <View style={styles.gridContainer}>{renderGrid()}</View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 12,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitleContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  monthIndicator: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#3674B5",
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  normalLegend: {
    backgroundColor: "#fff",
  },
  halfLegend: {
    backgroundColor: "#FF9800",
  },
  ongoingLegend: {
    backgroundColor: "#FFC107",
  },
  weekendLegend: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  legendText: {
    fontSize: 12,
    color: "#fff",
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  weekdayRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  weekdayCell: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  weekendText: {
    color: "#FF5252",
  },
  gridContainer: {
    paddingBottom: 10,
  },
  weekRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayCell: {
    flex: 1,
    minHeight: 70,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
    position: "relative",
  },
  weekendCell: {
    backgroundColor: "#f9f9f9",
  },
  halfDayCell: {
    backgroundColor: "rgba(255, 152, 0, 0.05)",
  },
  absentDayCell: {
    backgroundColor: "rgba(244, 67, 54, 0.05)",
  },
  ongoingDayCell: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    position: "absolute",
    top: 6,
    left: 6,
  },
  singleDigitDay: {
    left: 8,
  },
  valueContainer: {
    marginTop: 25,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  specialValueContainer: {
    backgroundColor: "#BBDEFB",
  },
  halfDayValueContainer: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
  },
  ongoingDayValueContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.3)",
  },
  futureDateValueContainer: {
    backgroundColor: "#E0E0E0",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3674B5",
  },
  halfDay: {
    color: "#FF9800",
  },
  absentDay: {
    color: "#F44336",
  },
  weekendDay: {
    color: "#9E9E9E",
  },
  ongoingDay: {
    color: "#F57C00",
  },
  specialValue: {
    fontWeight: "bold",
  },
  futureDateValue: {
    color: "#BDBDBD",
  },
  halfDayIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 15,
    borderTopWidth: 15,
    borderRightColor: "transparent",
    borderTopColor: "#FF9800",
  },
  activeDayCell: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  endDayCell: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  notWorkDayCell: {
    backgroundColor: "rgba(224, 26, 26, 0.1)",
  },
  notStartedDayCell: {
    backgroundColor: "rgba(189, 189, 189, 0.1)",
  },
  activeValueContainer: {
    backgroundColor: "#FFC107", // Yellow for ACTIVE
  },
  endValueContainer: {
    backgroundColor: "#4CAF50", // Green for END
  },
  notWorkValueContainer: {
    backgroundColor: "#e10909ff", // Gray for NOTWORK
  },
  weekendValueContainer: {
    backgroundColor: "#E0E0E0", // Light gray for weekend
  },
  notStartedValueContainer: {
    backgroundColor: "#BDBDBD", // Light gray for NOTSTARTED
  },
  activeValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  endValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  notWorkValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  weekendValue: {
    color: "#757575",
    fontWeight: "bold",
  },
  notStartedValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  currentDateNotStartedCell: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  currentDateNotStartedValueContainer: {
    backgroundColor: "#FF9800", // Orange for current date with NOTSTARTED status
  },
  currentDateNotStartedValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default MonthlyTimesheet;
