import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const WeeklyTimesheet = () => {
  // State for the current week
  const [currentWeek, setCurrentWeek] = useState(new Date());
  // State for timeSchedule data from AsyncStorage
  const [timeScheduleData, setTimeScheduleData] = useState<any[]>([]);

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

  // Generate week data from timeSchedule data based on current week
  const weekData = useMemo(() => {
    if (!timeScheduleData.length) return [];

    // Calculate start of week (Monday)
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Generate 7 days starting from Monday
    const weekDays = [];
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      const dateString = currentDay.toISOString().split("T")[0];
      const dayData = timeScheduleData.find(
        (item) => new Date(item.date).toISOString().split("T")[0] === dateString
      );

      // Determine status and hours
      let status = "normal";
      let hours = 0;

      if (i >= 5) {
        // Saturday and Sunday
        status = "weekend";
      } else if (dayData) {
        if (
          dayData.statusTimeKeeping === "STARTED" &&
          !dayData.workingHourReal
        ) {
          status = "ongoing";
          hours = 0;
        } else if (dayData.workingHourReal) {
          const workingHours = parseFloat(
            dayData.workingHourReal.split("h")[0]
          );
          hours = workingHours;

          // Check if it's a half day (less than 6 hours)
          if (workingHours > 0 && workingHours < 6) {
            status = "half";
          }
        }
      }

      weekDays.push({
        day: dayNames[i],
        date: `${currentDay.getDate().toString().padStart(2, "0")}/${(
          currentDay.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`,
        hours,
        status,
        fullDate: dateString,
      });
    }

    return weekDays;
  }, [timeScheduleData, currentWeek]);

  // Calculate week summary from actual data
  const weekSummary = useMemo(() => {
    const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
    const requiredHours = 40; // Standard work week
    const overtime = Math.max(0, totalHours - requiredHours);

    return {
      totalHours,
      requiredHours,
      overtime,
    };
  }, [weekData]);

  // Function to navigate to previous week - wrapped in useCallback to avoid recreating on every render
  const navigatePreviousWeek = useCallback(() => {
    setCurrentWeek((prevWeek) => {
      const newDate = new Date(prevWeek);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  // Function to navigate to next week - wrapped in useCallback to avoid recreating on every render
  const navigateNextWeek = useCallback(() => {
    setCurrentWeek((prevWeek) => {
      const newDate = new Date(prevWeek);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  // Function to format week range display - memoize the calculation
  const weekRangeText = useMemo(() => {
    // Fix to ensure Monday is always day 1 regardless of locale
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    // Adjust for Sunday (0) to be transformed to 7, so Monday is 1, etc.
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startDay = startOfWeek.getDate();
    const startMonth = startOfWeek.getMonth() + 1;

    const endDay = endOfWeek.getDate();
    const endMonth = endOfWeek.getMonth() + 1;
    const endYear = endOfWeek.getFullYear();

    return `${startDay}/${startMonth} - ${endDay}/${endMonth}/${endYear}`;
  }, [currentWeek]); // Now properly depends on currentWeek

  // Helper function to get the background color based on day status
  const getDayStatusColor = useCallback((status: string) => {
    switch (status) {
      case "weekend":
        return "#f5f5f5";
      case "half":
        return "#fff9c4";
      case "ongoing":
        return "#fff3cd";
      default:
        return "#ffffff";
    }
  }, []);

  // Helper function to get text color based on day status
  const getDayStatusTextColor = useCallback((status: string) => {
    switch (status) {
      case "weekend":
        return "#9e9e9e";
      case "ongoing":
        return "#f57c00";
      default:
        return "#333333";
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header with week navigator */}
      <View style={styles.weekSelector}>
        <TouchableOpacity
          onPress={navigatePreviousWeek}
          style={styles.weekNavButton}
        >
          <AntDesign name="left" size={20} color="#3674B5" />
        </TouchableOpacity>

        <View style={styles.weekDisplay}>
          <Text style={styles.weekText}>{weekRangeText}</Text>
        </View>

        <TouchableOpacity
          onPress={navigateNextWeek}
          style={styles.weekNavButton}
        >
          <AntDesign name="right" size={20} color="#3674B5" />
        </TouchableOpacity>
      </View>

      {/* Week summary */}
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        style={styles.summaryContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng giờ làm</Text>
            <Text style={styles.summaryValue}>{weekSummary.totalHours}h</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giờ yêu cầu</Text>
            <Text style={styles.summaryValue}>
              {weekSummary.requiredHours}h
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Giờ tăng ca</Text>
            <Text style={styles.summaryValue}>{weekSummary.overtime}h</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Daily data */}
      <View style={styles.dailyDataContainer}>
        {weekData.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayCard,
              { backgroundColor: getDayStatusColor(day.status) },
            ]}
          >
            <View style={styles.dayHeader}>
              <Text
                style={[
                  styles.dayText,
                  { color: getDayStatusTextColor(day.status) },
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  { color: getDayStatusTextColor(day.status) },
                ]}
              >
                {day.date}
              </Text>
            </View>
            <View style={styles.dayContent}>
              <Text
                style={[
                  styles.hoursText,
                  { color: getDayStatusTextColor(day.status) },
                ]}
              >
                {day.status === "ongoing" ? "Đang làm" : `${day.hours}h`}
              </Text>
              {day.status === "weekend" && (
                <Text style={styles.statusText}>Cuối tuần</Text>
              )}
              {day.status === "half" && (
                <Text style={styles.halfDayText}>Nửa ngày</Text>
              )}
              {day.status === "ongoing" && (
                <Text style={styles.ongoingText}>Đang làm việc</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  weekSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  weekDisplay: {
    flex: 1,
    alignItems: "center",
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  summaryContainer: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  separator: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: "80%",
    alignSelf: "center",
  },
  dailyDataContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCard: {
    width: (width - 40) / 2,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
  },
  dayContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  hoursText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#9e9e9e",
    fontStyle: "italic",
  },
  halfDayText: {
    fontSize: 12,
    color: "#ff9800",
    fontStyle: "italic",
  },
  ongoingText: {
    fontSize: 12,
    color: "#f57c00",
    fontStyle: "italic",
  },
});

export default WeeklyTimesheet;
