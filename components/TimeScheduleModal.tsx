import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { formatDate, formatTime as formatTimeUtil } from "../utils/dateUtils";

type DayData = {
  day: number;
  status: "normal" | "half" | "absent" | "weekend" | "empty" | "ongoing";
  value: string | number;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHourReal?: string;
};

const TimeScheduleModal = ({
  visible,
  onClose,
  selectedDate,
  currentDate,
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate?: DayData;
  currentDate?: Date;
}) => {
  // Format date for display
  const formatDateToTime = (date?: Date, day?: number) => {
    if (!date || !day || day === 0) return "Thông tin chấm công";
    const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
    return `Chấm công, ngày ${day.toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return "--:--";
    const formattedTime = formatTimeUtil(timeString);
    return formattedTime || "--:--";
  };

  // Get status text
  const getStatusText = (checkInTime?: string, checkOutTime?: string) => {
    if (!checkInTime && !checkOutTime) return "Chưa chấm công";
    if (checkInTime && !checkOutTime) return "Đang làm việc";
    if (checkInTime && checkOutTime) return "Hoàn thành";
    return "Chưa chấm công";
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.dateTitle}>
              {formatDateToTime(currentDate, selectedDate?.day)}
            </Text>

            <View style={styles.timeBoxContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>
                  {formatTime(selectedDate?.checkInTime)}
                </Text>
                <Text style={styles.timeStatus}>
                  {selectedDate?.checkInTime ? "Giờ vào" : "Chưa vào"}
                </Text>
                {selectedDate?.checkInTime && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="green"
                    style={styles.checkIcon}
                  />
                )}
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>
                  {formatTime(selectedDate?.checkOutTime)}
                </Text>
                <Text style={styles.timeStatus}>
                  {selectedDate?.checkOutTime ? "Giờ ra" : "Chưa ra"}
                </Text>
                {selectedDate?.checkOutTime && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="green"
                    style={styles.checkIcon}
                  />
                )}
              </View>
              <View style={styles.workBox}>
                <MaterialIcons name="access-time" size={20} color="#555" />
                <Text style={styles.workLabel}>
                  {selectedDate?.workingHourReal || "0h"}
                </Text>
              </View>
            </View>

            <View style={styles.detailsBox}>
              <Text style={styles.sectionLabel}>Thông tin chấm công</Text>
              <Text style={styles.detailText}>
                Ngày: {formatDate(selectedDate?.date) || "N/A"}
              </Text>
              <Text style={styles.detailText}>
                Giờ vào: {formatTime(selectedDate?.checkInTime)}
              </Text>
              <Text style={styles.detailText}>
                Giờ ra: {formatTime(selectedDate?.checkOutTime)}
              </Text>
              <Text style={styles.detailText}>
                Tổng giờ làm: {selectedDate?.workingHourReal || "0h"}
              </Text>
              <Text style={styles.detailText}>
                Trạng thái:{" "}
                {getStatusText(
                  selectedDate?.checkInTime,
                  selectedDate?.checkOutTime
                )}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default TimeScheduleModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  timeBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  timeBox: {
    flex: 1,
    backgroundColor: "#E7FCE7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    position: "relative",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
  },
  timeStatus: {
    marginTop: 4,
    fontSize: 12,
    color: "#333",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  workBox: {
    flex: 1,
    backgroundColor: "#EEE6FA",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  workLabel: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  workValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6C3EB5",
    marginTop: 4,
  },
  detailsBox: {
    marginTop: 20,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 12,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#3674B5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
