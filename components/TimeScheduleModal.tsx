import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatTime as formatTimeUtil } from "../utils/dateUtils";
import { DayStatus } from "../models/timekeeping";

const TimeScheduleModal = ({
  visible,
  onClose,
  selectedDate,
  currentDate,
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate?: DayStatus;
  currentDate?: Date;
}) => {
  // Format date for display
  const formatDate = (date?: Date, day?: number) => {
    if (!date || !day || day === 0) return "Thông tin chấm công";
    return `${day.toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return "--:--";
    const formattedTime = formatTimeUtil(timeString);
    return formattedTime || "--:--";
  };

  // Calculate late time in minutes
  const calculateLateTime = (checkInTime?: string, startShiftTime?: string) => {
    if (!checkInTime || !startShiftTime) return 0;

    const parseTime = (timeString: string) => {
      let timeOnly = timeString;

      // If it's an ISO format, extract just the time part
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        // Get hours and minutes in local time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return hours * 60 + minutes;
      }

      // Handle regular "HH:MM" format
      const [hours, minutes] = timeOnly.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const checkInMinutes = parseTime(checkInTime);
    const startShiftMinutes = parseTime(startShiftTime);

    return checkInMinutes > startShiftMinutes
      ? checkInMinutes - startShiftMinutes
      : 0;
  };

  // Format late time display
  const formatLateTime = (lateMinutes: number) => {
    if (lateMinutes === 0) return null;
    const hours = Math.floor(lateMinutes / 60);
    const minutes = lateMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get status text
  const getStatusText = (
    status?: string,
    checkInTime?: string,
    checkOutTime?: string
  ) => {
    if (
      !checkInTime &&
      !checkOutTime &&
      (status === "END" || status === "FORGET")
    )
      return "Hoàn thành (Quên chấm công)";
    if (!checkInTime && !checkOutTime) return "Chưa chấm công";
    if (checkInTime && !checkOutTime) return "Đang làm việc";
    if (checkInTime && checkOutTime) return "Hoàn thành";
    return "Chưa chấm công";
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
            <Text style={styles.dateTitle}>
              Chấm công, ngày {formatDate(currentDate, selectedDate?.day)}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
          >
            <View style={styles.timeBoxContainer}>
              <View style={[styles.timeBox, styles.checkInBox]}>
                <View style={styles.timeBoxHeader}>
                  <View style={styles.timeIconContainer}>
                    <Ionicons name="enter-outline" size={20} color="#10B981" />
                  </View>
                  {selectedDate?.checkInTime && (
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.timeText}>
                  {formatTime(selectedDate?.checkInTime)}
                </Text>
                <Text style={styles.timeStatus}>
                  {selectedDate?.checkInTime ? "Giờ vào" : "Chưa vào"}
                </Text>
                {/* Late time indicator */}
                {/* {(() => {
                  const lateTime = calculateLateTime(
                    selectedDate?.checkInTime,
                    selectedDate?.startShiftTime
                  );
                  const lateDisplay = formatLateTime(lateTime);
                  if (lateDisplay) {
                    return (
                      <View style={styles.lateIndicator}>
                        <Ionicons name="time" size={12} color="#EF4444" />
                        <Text style={styles.lateText}>Trễ {lateDisplay}</Text>
                      </View>
                    );
                  }
                  return null;
                })()} */}
              </View>

              <View style={[styles.timeBox, styles.checkOutBox]}>
                <View style={styles.timeBoxHeader}>
                  <View style={styles.timeIconContainer}>
                    <Ionicons name="exit-outline" size={20} color="#F59E0B" />
                  </View>
                  {selectedDate?.checkOutTime && (
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={styles.timeText}>
                  {formatTime(selectedDate?.checkOutTime)}
                </Text>
                <Text style={styles.timeStatus}>
                  {selectedDate?.checkOutTime ? "Giờ ra" : "Chưa ra"}
                </Text>
              </View>

              <View style={[styles.timeBox, styles.workHoursBox]}>
                <View style={styles.timeBoxHeader}>
                  <View style={styles.timeIconContainer}>
                    <MaterialIcons
                      name="access-time"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.statusBadge}>
                    <MaterialIcons name="work" size={12} color="#fff" />
                  </View>
                </View>
                <Text style={styles.timeText}>
                  {selectedDate?.value || "0"}
                </Text>
                <Text style={styles.timeStatus}>Công làm</Text>
              </View>
            </View>

            {/* <View style={styles.workSummaryCard}>
              <View style={styles.workSummaryHeader}>
                <View style={styles.workIconContainer}>
                  <MaterialIcons name="analytics" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.workSummaryTitle}>Thống kê chi tiết</Text>
              </View>
              <View style={styles.workStatsContainer}>
                <View style={styles.workStat}>
                  <Text style={styles.workStatValue}>
                    {selectedDate?.workingHours || 0}h
                  </Text>
                  <Text style={styles.workStatLabel}>Thời gian làm</Text>
                </View>
                <View style={styles.workStatDivider} />
                <View style={styles.workStat}>
                  <Text style={styles.workStatValue}>
                    {selectedDate?.workingHourReal || "0h"}
                  </Text>
                  <Text style={styles.workStatLabel}>Giờ thực tế</Text>
                </View>
              </View>
            </View> */}

            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.sectionLabel}>Thông tin chi tiết</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {formatDate(currentDate, selectedDate?.day)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Ca làm: {selectedDate?.startShiftTime} -{" "}
                  {selectedDate?.endShiftTime}
                </Text>
              </View>

              {(() => {
                const lateTime = calculateLateTime(
                  selectedDate?.checkInTime,
                  selectedDate?.startShiftTime
                );
                const lateDisplay = formatLateTime(lateTime);
                if (lateDisplay) {
                  return (
                    <View style={styles.detailRow}>
                      <Ionicons name="alert-circle" size={16} color="#EF4444" />
                      <Text style={[styles.detailText, styles.lateDetailText]}>
                        Đi trễ: {lateDisplay}
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}

              <View style={styles.detailRow}>
                <Ionicons name="hourglass" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  Tổng công làm:{" "}
                  {selectedDate?.workingHourReal ||
                    `${
                      selectedDate?.status === "END" ||
                      selectedDate?.status === "FORGET"
                        ? selectedDate?.workingHours
                        : 0
                    }h`}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.detailText}>
                  Trạng thái:{" "}
                  {getStatusText(
                    selectedDate?.status,
                    selectedDate?.checkInTime,
                    selectedDate?.checkOutTime
                  )}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 24,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  timeBoxContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  timeBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
  },
  checkInBox: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  checkOutBox: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  workHoursBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  timeBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  timeStatus: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  workSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  workSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  workIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workSummaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  workStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  workStat: {
    flex: 1,
    alignItems: "center",
  },
  workStatValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3B82F6",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  workStatLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  workStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 24,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailText: {
    fontSize: 15,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 24,
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  lateIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  lateText: {
    fontSize: 9,
    color: "#EF4444",
    marginLeft: 4,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  lateDetailText: {
    color: "#EF4444",
    fontWeight: "700",
  },
});
