import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface WorkingSchedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  timeKeepingId: string | null;
  code: string;
  userCode: string;
  userContractCode: string;
  status: string;
  date: string;
  fullName: string;
  shiftCode: string;
  shiftName: string;
  branchName: string;
  branchCode: string;
  addressLine: string;
  startShiftTime: string;
  endShiftTime: string;
  workingHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  statusTimeKeeping: string | null;
  positionName: string;
  managerFullName: string;
}

interface TodayWidgetProps {
  todaySchedule: WorkingSchedule | null;
  loadingSchedule: boolean;
}

const TodayWidget = ({ todaySchedule, loadingSchedule }: TodayWidgetProps) => {
  // Lấy ngày hiện tại theo định dạng chuẩn
  const getCurrentDateString = () => {
    const today = new Date();
    // Trả về ngày hiện tại theo định dạng YYYY-MM-DD
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  // Format date to Thứ X, DD/MM/YYYY
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    console.log("Day of week value:", dayOfWeek, "for date:", dateString);

    // Trong JavaScript, getDay() trả về 0 cho Chủ nhật, 1 cho Thứ 2, ..., 6 cho Thứ 7
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Lấy thứ từ mảng days dựa vào dayOfWeek
    const day = days[dayOfWeek];

    return `${day}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  if (loadingSchedule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3674B5" />
        <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
      </View>
    );
  }

  if (!todaySchedule) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có lịch làm việc cho hôm nay</Text>
      </View>
    );
  }

  const today = new Date();
  console.log("Today's real date:", today);
  console.log("Schedule date from API:", todaySchedule.date);

  // Sử dụng phương thức getCurrentDateString để lấy ngày hiện tại
  const currentDateString = getCurrentDateString();

  const currentTime = today.getHours() * 60 + today.getMinutes();

  // Chuyển đổi startShiftTime và endShiftTime thành phút để so sánh
  const [startHour, startMinute] = todaySchedule.startShiftTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = todaySchedule.endShiftTime
    .split(":")
    .map(Number);
  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  // Xác định trạng thái check-in
  let checkInStatus = "Chưa check-in";
  let checkInButtonText = "Check-in";
  let checkInButtonDisabled = false;
  let checkInButtonColor = "#3674B5";
  let checkInStatusColor = "#4CAF50";
  let checkInTime = null;
  let checkOutTime = null;

  if (todaySchedule.checkInTime) {
    checkInStatus = todaySchedule.checkInTime;
    checkInButtonText = "Đã check-in";
    checkInButtonDisabled = true;
    checkInButtonColor = "#4CAF50";
    checkInStatusColor = "#4CAF50";
    checkInTime = todaySchedule.checkInTime;
  }

  if (todaySchedule.checkOutTime) {
    checkOutTime = todaySchedule.checkOutTime;
  }

  // Tính tổng thời gian làm việc
  let totalWorkingHours = "00:00p";
  let totalHoursDisplay = "0";

  if (checkInTime && checkOutTime) {
    // Nếu có cả check-in và check-out, hiển thị tổng thời gian thực tế
    totalWorkingHours = `${todaySchedule.workingHours}:00p`;
    totalHoursDisplay = "1"; // Hiển thị số 1 lớn như trong hình
  }

  return (
    <View style={styles.todayContainer}>
      <View style={styles.todayHeader}>
        <AntDesign name="calendar" size={24} color="#3674B5" />
        <Text style={styles.todayTitle}>Hôm nay</Text>
      </View>
      <View style={styles.todayContent}>
        <View style={styles.timeInfo}>
          <Text style={styles.currentDate}>
            {formatDateWithDay(currentDateString)}
          </Text>
          <Text style={styles.shiftTime}>
            Ca làm: {todaySchedule.startShiftTime} -{" "}
            {todaySchedule.endShiftTime} ({todaySchedule.shiftName})
          </Text>
        </View>
        <View style={styles.attendanceActions}>
          <TouchableOpacity
            style={[
              styles.checkinButton,
              { backgroundColor: checkInButtonColor },
            ]}
            disabled={checkInButtonDisabled}
          >
            <Text style={styles.checkinText}>{checkInButtonText}</Text>
          </TouchableOpacity>
          <Text style={[styles.checkinStatus, { color: checkInStatusColor }]}>
            {checkInStatus}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceDetails}>
        <View
          style={[
            styles.timeDetailCard,
            checkInTime
              ? styles.timeDetailCardChecked
              : styles.timeDetailCardNotChecked,
          ]}
        >
          <View style={styles.timeDetailCardHeader}>
            <Text style={styles.timeDetailCardTitle}>Giờ vào</Text>
            <View
              style={[
                styles.timeDetailCardIcon,
                checkInTime
                  ? styles.timeDetailCardIconSuccess
                  : styles.timeDetailCardIconWarning,
              ]}
            >
              {checkInTime ? (
                <AntDesign name="check" size={16} color="#4CAF50" />
              ) : (
                <AntDesign
                  name="exclamationcircleo"
                  size={16}
                  color="#F44336"
                />
              )}
            </View>
          </View>
          {checkInTime ? (
            <Text
              style={[
                styles.timeDetailCardValue,
                styles.timeDetailCardValueSuccess,
              ]}
            >
              {checkInTime}
            </Text>
          ) : (
            <Text
              style={[
                styles.timeDetailCardDashes,
                styles.timeDetailCardValueWarning,
              ]}
            >
              --:--
            </Text>
          )}
          <Text
            style={[
              styles.timeDetailCardStatus,
              checkInTime
                ? styles.timeDetailCardStatusSuccess
                : styles.timeDetailCardStatusWarning,
            ]}
          >
            {checkInTime ? "Đã check-in" : "Chưa check-in"}
          </Text>
        </View>

        <View
          style={[
            styles.timeDetailCard,
            checkOutTime
              ? styles.timeDetailCardChecked
              : styles.timeDetailCardNotCheckedOut,
          ]}
        >
          <View style={styles.timeDetailCardHeader}>
            <Text style={styles.timeDetailCardTitle}>Giờ về</Text>
            <View
              style={[
                styles.timeDetailCardIcon,
                checkOutTime
                  ? styles.timeDetailCardIconSuccess
                  : styles.timeDetailCardIconPending,
              ]}
            >
              {checkOutTime ? (
                <AntDesign name="check" size={16} color="#4CAF50" />
              ) : (
                <AntDesign name="clockcircleo" size={16} color="#FFC107" />
              )}
            </View>
          </View>
          {checkOutTime ? (
            <Text
              style={[
                styles.timeDetailCardValue,
                styles.timeDetailCardValueSuccess,
              ]}
            >
              {checkOutTime}
            </Text>
          ) : (
            <Text
              style={[
                styles.timeDetailCardDashes,
                styles.timeDetailCardValuePending,
              ]}
            >
              --:--
            </Text>
          )}
          <Text
            style={[
              styles.timeDetailCardStatus,
              checkOutTime
                ? styles.timeDetailCardStatusSuccess
                : styles.timeDetailCardStatusPending,
            ]}
          >
            {checkOutTime ? "Đã check-out" : "Chưa đến giờ"}
          </Text>
        </View>

        <View style={styles.timeCardTotal}>
          <Text style={styles.timeCardTotalNumber}>{totalHoursDisplay}</Text>
          <Text style={styles.timeCardTotalHours}>{totalWorkingHours}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  todayContainer: {
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
  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  todayContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flex: 1,
  },
  currentDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  shiftTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  attendanceActions: {
    alignItems: "center",
  },
  checkinButton: {
    backgroundColor: "#3674B5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  checkinText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkinStatus: {
    fontSize: 12,
    color: "#F57C00",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  attendanceDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeDetailCard: {
    borderRadius: 8,
    padding: 12,
    width: "30%",
  },
  timeDetailCardNotChecked: {
    backgroundColor: "#FFEBEE",
  },
  timeDetailCardNotCheckedOut: {
    backgroundColor: "#FFF8E1",
  },
  timeDetailCardChecked: {
    backgroundColor: "#E8F5E9",
  },
  timeDetailCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeDetailCardTitle: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  timeDetailCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timeDetailCardIconWarning: {
    backgroundColor: "#FFEBEE",
  },
  timeDetailCardIconPending: {
    backgroundColor: "#FFF8E1",
  },
  timeDetailCardIconSuccess: {
    backgroundColor: "#E8F5E9",
  },
  timeDetailCardValue: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
    paddingBottom: 10,
  },
  timeDetailCardDashes: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
    paddingBottom: 10,
  },
  timeDetailCardValueWarning: {
    color: "#F44336",
  },
  timeDetailCardValuePending: {
    color: "#FFC107",
  },
  timeDetailCardValueSuccess: {
    color: "#4CAF50",
  },
  timeDetailCardStatus: {
    fontSize: 12,
    textAlign: "left",
    color: "#9E9E9E",
  },
  timeDetailCardStatusWarning: {
    color: "#9E9E9E",
  },
  timeDetailCardStatusPending: {
    color: "#9E9E9E",
  },
  timeDetailCardStatusSuccess: {
    color: "#9E9E9E",
  },
  timeCardTotal: {
    borderRadius: 8,
    padding: 12,
    width: "30%",
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  timeCardTotalNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3674B5",
    textAlign: "center",
  },
  timeCardTotalHours: {
    fontSize: 16,
    color: "#3674B5",
    textAlign: "center",
    marginTop: 4,
  },
});

export default TodayWidget;
