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
  // Sử dụng phương thức getCurrentDateString để lấy ngày hiện tại
  const currentDateString = getCurrentDateString();
  // Xác định trạng thái check-in
  let checkInStatus = "Chưa check-in";
  let checkInButtonText = "Check-in";
  let checkInButtonDisabled = false;
  let checkInButtonColor = "#3674B5";
  let checkInStatusColor = "#4CAF50";
  let checkInTime = null;
  let checkOutTime = null;
  if (todaySchedule.checkInTime) {
    //nếu statusTimeKeeping = late thì check-in muộn , nếu end hoàn thành , nết nocheckout thì chưa check-out
    if (todaySchedule.statusTimeKeeping === "LATE") {
      checkInStatus = "Check-in muộn";
      checkInButtonDisabled = true;
      checkInButtonColor = "#F59E0B"; // Màu cam cho check-in muộn
      checkInStatusColor = "#F59E0B"; // Màu cam cho trạng thái check-in muộn
    } else if (todaySchedule.statusTimeKeeping === "END") {
      checkInStatus = "Đã hoàn thành";
      checkInButtonDisabled = true;
      checkInButtonColor = "#4CAF50"; // Màu xanh lá cho đã hoàn thành
      checkInStatusColor = "#4CAF50"; // Màu xanh lá cho trạng
      // thái đã hoàn thành
    } else if (todaySchedule.statusTimeKeeping === "NOCHECKOUT") {
      checkInStatus = "Chưa check-out";
      checkInButtonDisabled = true;
      checkInButtonColor = "#F59E0B"; // Màu cam cho chưa check-out
      checkInStatusColor = "#F59E0B"; // Màu cam cho
    } else {
      checkInStatus = todaySchedule.statusTimeKeeping || "Đã check-in";
      checkInButtonDisabled = true;
      checkInButtonColor = "#4CAF50";
      checkInStatusColor = "#4CAF50";
    }
    //chuyên đổi định dạng giờ check-in từ isotring sang vd 01:30p không hiện pm hiện 16:30
    checkInTime = new Date(todaySchedule.checkInTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (todaySchedule.checkOutTime) {
    checkOutTime = new Date(todaySchedule.checkOutTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
        </View>
      </View>

      <View style={styles.attendanceDetails}>
        <View style={[styles.timeDetailCard, styles.checkInCard]}>
          <View style={styles.timeDetailCardHeader}>
            <Text style={styles.checkInTitle}>Giờ vào</Text>
            <View style={styles.checkInIcon}>
              {checkInTime ? (
                <AntDesign name="check" size={14} color="#10B981" />
              ) : (
                <AntDesign
                  name="exclamationcircleo"
                  size={14}
                  color="#EF4444"
                />
              )}
            </View>
          </View>
          {checkInTime ? (
            <Text style={styles.checkInValue}>{checkInTime}</Text>
          ) : (
            <Text style={styles.checkInDashes}>--:--</Text>
          )}
          <Text style={styles.checkInStatus}>
            {checkInTime ? "Đã check-in" : "Chưa check-in"}
          </Text>
        </View>

        <View style={[styles.timeDetailCard, styles.checkOutCard]}>
          <View style={styles.timeDetailCardHeader}>
            <Text style={styles.checkOutTitle}>Giờ về</Text>
            <View style={styles.checkOutIcon}>
              {checkOutTime ? (
                <AntDesign name="check" size={14} color="#F59E0B" />
              ) : (
                <AntDesign name="clockcircleo" size={14} color="#F59E0B" />
              )}
            </View>
          </View>
          {checkOutTime ? (
            <Text style={styles.checkOutValue}>{checkOutTime}</Text>
          ) : (
            <Text style={styles.checkOutDashes}>--:--</Text>
          )}
          <Text style={styles.checkOutStatus}>
            {checkOutTime ? "Đã check-out" : "Chưa đến giờ"}
          </Text>
        </View>

        <View style={styles.workingHoursCard}>
          <View style={styles.workingHoursHeader}>
            <Text style={styles.workingHoursTitle}>Công làm</Text>
            <View style={styles.workingHoursIcon}>
              {checkInTime && checkOutTime ? (
                <AntDesign name="check" size={16} color="#8B5CF6" />
              ) : checkInTime ? (
                <AntDesign name="clockcircleo" size={16} color="#8B5CF6" />
              ) : (
                <AntDesign
                  name="exclamationcircleo"
                  size={16}
                  color="#8B5CF6"
                />
              )}
            </View>
          </View>
          <View style={styles.workingHoursContent}>
            <Text style={styles.workingHoursNumber}>
              {checkInTime && checkOutTime
                ? todaySchedule.workingHours
                : "--:--"}
            </Text>
          </View>
          <Text style={styles.workingHoursStatus}>
            {checkInTime && checkOutTime
              ? "Hoàn thành"
              : checkInTime
              ? "Đang làm"
              : "Chưa bắt đầu"}
          </Text>
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
  timeDetailCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  timeDetailCard: {
    borderRadius: 16,
    padding: 14,
    flex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Check-in card styles (Green theme)
  checkInCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  checkInTitle: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "600",
  },
  checkInIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  checkInValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
    paddingBottom: 6,
  },
  checkInDashes: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 4,
    paddingBottom: 6,
  },
  checkInStatus: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Check-out card styles (Orange theme)
  checkOutCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FCD34D",
  },
  checkOutTitle: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  checkOutIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOutValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 4,
    paddingBottom: 6,
  },
  checkOutDashes: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 4,
    paddingBottom: 6,
  },
  checkOutStatus: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Working hours card styles (Purple theme)
  workingHoursCard: {
    borderRadius: 16,
    padding: 14,
    flex: 1,
    backgroundColor: "#FAF5FF",
    borderWidth: 1.5,
    borderColor: "#C4B5FD",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workingHoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  workingHoursTitle: {
    fontSize: 12,
    color: "#581C87",
    fontWeight: "600",
  },
  workingHoursIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  workingHoursContent: {
    alignItems: "center",
    marginBottom: 6,
  },
  workingHoursNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8B5CF6",
    textAlign: "center",
    lineHeight: 32,
  },
  workingHoursUnit: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "600",
    marginTop: -2,
  },
  workingHoursStatus: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default TodayWidget;
