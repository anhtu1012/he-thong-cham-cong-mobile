import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const WeeklyTimesheet = () => {
  // Giả lập dữ liệu chấm công tuần
  const weekData = [
    { day: "T2", date: "01/01", hours: 7, status: "normal" },
    { day: "T3", date: "02/01", hours: 8, status: "normal" },
    { day: "T4", date: "03/01", hours: 7.5, status: "half" },
    { day: "T5", date: "04/01", hours: 7, status: "normal" },
    { day: "T6", date: "05/01", hours: 8, status: "normal" },
    { day: "T7", date: "06/01", hours: 0, status: "weekend" },
    { day: "CN", date: "07/01", hours: 0, status: "weekend" },
  ];

  // Header với tuần selector
  const renderHeader = () => {
    const currentWeek = "Tuần 1 (01/01 - 07/01/2024)";

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.weekButton}>
          <AntDesign name="left" size={18} color="#555" />
        </TouchableOpacity>
        <View style={styles.weekTitleContainer}>
          <Text style={styles.weekTitle}>{currentWeek}</Text>
          <View style={styles.weekIndicator} />
        </View>
        <TouchableOpacity style={styles.weekButton}>
          <AntDesign name="right" size={18} color="#555" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render thông tin tổng kết tuần
  const renderSummary = () => {
    const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
    const normalDays = weekData.filter((day) => day.status === "normal").length;
    const halfDays = weekData.filter((day) => day.status === "half").length;

    return (
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryContainer}
      >
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng giờ</Text>
          <Text style={styles.summaryValue}>{totalHours}h</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ngày công</Text>
          <Text style={styles.summaryValue}>{normalDays + halfDays * 0.5}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Đi muộn</Text>
          <Text style={styles.summaryValue}>0</Text>
        </View>
      </LinearGradient>
    );
  };

  // Render bảng công tuần
  const renderWeekTable = () => {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={styles.tableHeaderContent}>
            <Feather name="calendar" size={18} color="#3674B5" />
            <Text style={styles.tableTitle}>Chi tiết công tuần</Text>
          </View>
        </View>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerCell, { flex: 1 }]}>Ngày</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Giờ vào</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Giờ ra</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Tổng giờ</Text>
        </View>

        {weekData.map((day, index) => (
          <View
            key={`day-${index}`}
            style={[
              styles.tableRow,
              day.status === "weekend" && styles.weekendRow,
              index === weekData.length - 1 && styles.lastRow,
            ]}
          >
            <View style={[styles.dayCell, { flex: 1 }]}>
              <Text
                style={[
                  styles.dayText,
                  day.status === "weekend" && styles.weekendText,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  day.status === "weekend" && styles.weekendText,
                ]}
              >
                {day.date}
              </Text>
            </View>
            <Text
              style={[
                styles.dataCell,
                { flex: 1 },
                day.status === "weekend" && styles.weekendText,
              ]}
            >
              {day.status !== "weekend" ? "08:00" : "-"}
            </Text>
            <Text
              style={[
                styles.dataCell,
                { flex: 1 },
                day.status === "weekend" && styles.weekendText,
              ]}
            >
              {day.status !== "weekend"
                ? day.status === "half"
                  ? "12:00"
                  : "17:00"
                : "-"}
            </Text>
            <View style={[styles.hoursCellContainer, { flex: 1 }]}>
              <Text
                style={[
                  styles.dataCell,
                  day.status === "half" && styles.halfDayText,
                  day.status === "weekend" && styles.weekendText,
                ]}
              >
                {day.hours > 0 ? day.hours : "-"}
              </Text>
              {day.status === "half" && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>½</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {renderHeader()}
      {renderSummary()}
      {renderWeekTable()}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
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
  weekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  weekTitleContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  weekIndicator: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#3674B5",
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 12,
  },
  headerCell: {
    fontWeight: "600",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  weekendRow: {
    backgroundColor: "#f9f9f9",
  },
  dayCell: {
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dataCell: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  halfDayText: {
    color: "#FF9800",
    fontWeight: "500",
  },
  weekendText: {
    color: "#bdbdbd",
  },
  hoursCellContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  statusBadge: {
    backgroundColor: "#FF9800",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  statusBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default WeeklyTimesheet;
