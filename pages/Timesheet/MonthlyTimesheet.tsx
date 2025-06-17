import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getTimeSchedule } from "../../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type DayStatus = {
  day: number;
  status: "normal" | "half" | "absent" | "weekend" | "empty";
  value: string | number;
};

const MonthlyTimesheet = () => {
  const [daysInMonth, setDaysInMonth] = useState<DayStatus[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useFocusEffect(() => {
    useCallback(() => {
      handleGetTimeSchedule();
    }, [currentDate]);
  });

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
        value: 0,
        status: currentDay == 0 || currentDay == 6 ? "weekend" : "normal",
      };
    });

    const timeScheduleRes = await getTimeSchedule(fromDate, toDate, userCode);
    let timeSchedule = timeScheduleRes.data.data;

    // get current day & store to asyncStorage
    timeSchedule.map(async (time: any) => {
      const today = new Date();
      if (time.date.getDate() == today.getDate()) {
        await AsyncStorage.setItem("currentTimeScheduleDate", time);
      }
    });

    console.log("timeSchedule", timeSchedule);

    // add status and value to daysInMonth
    timeSchedule = timeSchedule.map((date: any) => {
      const currentDate = new Date(date.date);
      const day = days[currentDate.getDate() - 1];
      if (date.workingHours) {
        day.value = date.workingHours;
      } else {
        day.value = "N";
      }
    });
    console.log("daysInMonth", days);

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

  // Giả lập dữ liệu chấm công tháng hiện tại
  // const daysInMonth: DayStatus[] = [
  //   { day: 1, status: "normal", value: 7 },
  //   { day: 2, status: "normal", value: "N" },
  //   { day: 3, status: "half", value: 7.5 },
  //   { day: 4, status: "normal", value: 7 },
  //   { day: 5, status: "normal", value: 8 },
  //   { day: 6, status: "weekend", value: "N" },
  //   { day: 7, status: "weekend", value: "D" },
  //   { day: 8, status: "normal", value: 7 },
  //   { day: 9, status: "normal", value: "O" },
  //   { day: 10, status: "normal", value: 0 },
  //   { day: 11, status: "normal", value: 0 },
  //   { day: 12, status: "normal", value: 0 },
  //   { day: 13, status: "weekend", value: 0 },
  //   { day: 14, status: "weekend", value: 0 },
  //   { day: 15, status: "normal", value: 0 },
  //   { day: 16, status: "normal", value: 0 },
  //   { day: 17, status: "normal", value: 0 },
  //   { day: 18, status: "normal", value: 0 },
  //   { day: 19, status: "normal", value: 0 },
  //   { day: 20, status: "weekend", value: 0 },
  //   { day: 21, status: "weekend", value: 0 },
  //   { day: 22, status: "normal", value: 0 },
  //   { day: 23, status: "normal", value: 0 },
  //   { day: 24, status: "normal", value: 0 },
  //   { day: 25, status: "normal", value: 0 },
  //   { day: 26, status: "normal", value: 0 },
  //   { day: 27, status: "weekend", value: 0 },
  //   { day: 28, status: "weekend", value: 0 },
  //   { day: 29, status: "normal", value: 0 },
  //   { day: 30, status: "normal", value: 0 },
  //   { day: 31, status: "normal", value: 0 },
  // ];

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

  // Render calendar grid
  const renderGrid = () => {
    if (daysInMonth.length) {
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        daysInMonth[0].day
      ).getDay();

      // render white box for placeholder date
      if (firstDay != 0) {
        for (let i = 0; i < firstDay - 1; i++) {
          daysInMonth.unshift({
            day: 0,
            status: "normal",
            value: 0,
          });
        }
      } else {
        for (let i = 0; i < 6; i++) {
          daysInMonth.unshift({
            day: 0,
            status: "empty",
            value: 0,
          });
        }
      }

      while (daysInMonth.length % 7 != 0) {
        daysInMonth.push({
          day: 0,
          status: "empty",
          value: 0,
        });
      }
    }
    const chunks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      chunks.push(daysInMonth.slice(i, i + 7));
    }

    return chunks.map((week, weekIndex) => (
      <View key={`week-${weekIndex}`} style={styles.weekRow}>
        {week.map((day, dayIndex) => (
          <TouchableOpacity
            key={`day-${dayIndex}`}
            style={[
              styles.dayCell,
              day.status === "weekend" && styles.weekendCell,
              day.status === "half" && styles.halfDayCell,
              day.status === "absent" && styles.absentDayCell,
            ]}
            activeOpacity={0.7}
            disabled={day.value === 0}
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

            {day.value !== 0 && (
              <View
                style={[
                  styles.valueContainer,
                  typeof day.value === "string" && styles.specialValueContainer,
                  day.status === "half" && styles.halfDayValueContainer,
                ]}
              >
                <Text
                  style={[
                    styles.statusValue,
                    day.status === "half" && styles.halfDay,
                    day.status === "absent" && styles.absentDay,
                    day.status === "weekend" && styles.weekendDay,
                    typeof day.value === "string" && styles.specialValue,
                  ]}
                >
                  {day.value}
                </Text>
              </View>
            )}

            {day.status === "half" && <View style={styles.halfDayIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

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
    const workDays = daysInMonth.filter(
      (day) => day.status === "normal"
    ).length;
    const presentDays = daysInMonth.filter(
      (day) => day.value !== 0 && day.status === "normal"
    ).length;
    const halfDays = daysInMonth.filter((day) => day.status === "half").length;

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
            <Text style={styles.summaryValue}>{workDays}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Đã chấm công</Text>
            <Text style={styles.summaryValue}>
              {presentDays + halfDays * 0.5}
            </Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, styles.normalLegend]} />
            <Text style={styles.legendText}>Đủ công</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, styles.halfLegend]} />
            <Text style={styles.legendText}>Nửa ngày</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, styles.weekendLegend]} />
            <Text style={styles.legendText}>Cuối tuần</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
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
  specialValue: {
    fontWeight: "bold",
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
});

export default MonthlyTimesheet;
