import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatTime as formatTimeUtil } from "../utils/dateUtils";
import { DayStatus, WorkingShift } from "../models/timekeeping";

interface TimeScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: DayStatus;
  currentDate?: Date;
}

const TimeScheduleModal: React.FC<TimeScheduleModalProps> = ({
  visible,
  onClose,
  selectedDate,
  currentDate,
}) => {

  // Format selected date for display with proper null checking
  const formatSelectedDate = useMemo(() => {
    if (!selectedDate?.day || !currentDate) return "Thông tin chấm công";
    
    const day = selectedDate.day;
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
  }, [selectedDate?.day, currentDate]);

  // Format time for display with error handling
  const formatTime = (timeString?: string): string => {
    if (!timeString) return "--:--";
    
    try {
      const formattedTime = formatTimeUtil(timeString);
      return formattedTime || "--:--";
    } catch (error) {
      console.warn("Error formatting time:", error);
      return "--:--";
    }
  };

  // Calculate late time in minutes with improved error handling
  const calculateLateTime = (checkInTime?: string | null, startShiftTime?: string | null): number => {
    if (!checkInTime || !startShiftTime) return 0;

    const parseTime = (timeString: string): number => {
      try {
        let timeOnly = timeString;

        // If it's an ISO format, extract just the time part
        if (timeString.includes("T")) {
          const date = new Date(timeString);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid ISO date format");
          }
          // Get hours and minutes in local time
          const hours = date.getHours();
          const minutes = date.getMinutes();
          return hours * 60 + minutes;
        }

        // Handle regular "HH:MM" format
        const timeParts = timeOnly.split(":");
        if (timeParts.length !== 2) {
          throw new Error("Invalid time format");
        }
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          throw new Error("Invalid time values");
        }
        
        return hours * 60 + minutes;
      } catch (error) {
        console.warn("Error parsing time:", error, "Time string:", timeString);
        return 0;
      }
    };

    try {
      const checkInMinutes = parseTime(checkInTime);
      const startShiftMinutes = parseTime(startShiftTime);

      return checkInMinutes > startShiftMinutes
        ? checkInMinutes - startShiftMinutes
        : 0;
    } catch (error) {
      console.warn("Error calculating late time:", error);
      return 0;
    }
  };

  // Format late time display
  const formatLateTime = (lateMinutes: number): string | undefined => {
    if (!lateMinutes || lateMinutes <= 0) return undefined;
    
    try {
      const hours = Math.floor(lateMinutes / 60);
      const minutes = lateMinutes % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      console.warn("Error formatting late time:", error);
      return undefined;
    }
  };

  // Get status text with improved status handling
  const getStatusText = (
    status?: string,
    checkInTime?: string,
    checkOutTime?: string
  ): string => {
    try {
      console.log(checkInTime, checkOutTime, status);
      if (
        !checkInTime &&
        !checkOutTime &&
        (status === "END" || status === "FORGET")
      )
        return "Hoàn thành (Quên chấm công)";
        if (checkInTime && !checkOutTime &&
          (status === "NOTWORK" )) return "Quên check-out";
      if (!checkInTime && !checkOutTime) return "Chưa chấm công";
      if (checkInTime && !checkOutTime) return "Đang làm việc";
      if (checkInTime && checkOutTime) return "Hoàn thành";
      return "Chưa chấm công";
    } catch (error) {
      console.warn("Error getting status text:", error);
      return "Không xác định";
    }
  };

  // Check if day has multiple shifts with proper null checking
  const hasMultipleShifts = useMemo(() => {
    return selectedDate?.shifts && selectedDate.shifts.length > 1;
  }, [selectedDate?.shifts]);

  // Render single shift view (original)
  const renderSingleShiftView = () => {
    if (!selectedDate) return null;
    
    return (
      <View style={styles.timeBoxContainer}>
        <View style={[styles.timeBox, styles.checkInBox]}>
          <View style={styles.timeBoxHeader}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="enter-outline" size={20} color="#10B981" />
            </View>
            {selectedDate.checkInTime && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.timeText}>
            {formatTime(selectedDate.checkInTime)}
          </Text>
          <Text style={styles.timeStatus}>
            {selectedDate.checkInTime ? "Giờ vào" : "Chưa vào"}
          </Text>
        </View>

        <View style={[styles.timeBox, styles.checkOutBox]}>
          <View style={styles.timeBoxHeader}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="exit-outline" size={20} color="#F59E0B" />
            </View>
            {selectedDate.checkOutTime && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.timeText}>
            {formatTime(selectedDate.checkOutTime)}
          </Text>
          <Text style={styles.timeStatus}>
            {selectedDate.checkOutTime ? "Giờ ra" : "Chưa ra"}
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
            {selectedDate.value || "0"}
          </Text>
          <Text style={styles.timeStatus}>Công làm</Text>
        </View>
      </View>
    );
  };

  // Render shift item for FlatList
  const renderShiftItem = ({ item: shift, index }: { item: WorkingShift; index: number }) => {
    const lateTime = calculateLateTime(shift.checkInTime, shift.startShiftTime);
    const lateDisplay = formatLateTime(lateTime);
    
    return (
      <View style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <View style={styles.shiftIconContainer}>
            <MaterialIcons name="schedule" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.shiftTitle}>
            {shift.shiftName || `Ca ${index + 1}`}
          </Text>
          <View style={[
            styles.shiftStatusBadge,
            shift.status === "ACTIVE" && styles.activeStatusBadge,
            shift.status === "END" && styles.endStatusBadge,
            shift.status === "NOTWORK" && styles.notWorkStatusBadge,
            shift.status === "NOTSTARTED" && styles.notStartedStatusBadge,
          ]}>
            <Text style={styles.shiftStatusText}>
              {shift.status === "ACTIVE" && "Đang làm"}
              {shift.status === "END" && "Hoàn thành"}
              {shift.status === "NOTWORK" && "Vắng mặt"}
              {shift.status === "NOTSTARTED" && "Chưa bắt đầu"}
              {!["ACTIVE", "END", "NOTWORK", "NOTSTARTED"].includes(shift.status || "") && "Không xác định"}
            </Text>
          </View>
        </View>

        <View style={styles.shiftTimeContainer}>
          <View style={styles.shiftTimeBox}>
            <Text style={styles.shiftTimeLabel}>Giờ ca:</Text>
            <Text style={styles.shiftTimeValue}>
              {shift.startShiftTime || '--'} - {shift.endShiftTime || '--'}
            </Text>
          </View>
          <View style={styles.shiftTimeBox}>
            <Text style={styles.shiftTimeLabel}>Chấm công:</Text>
            <Text style={styles.shiftTimeValue}>
              {shift.checkInTime ? formatTime(shift.checkInTime) : '--'} - {shift.checkOutTime ? formatTime(shift.checkOutTime) : '--'}
            </Text>
          </View>
        </View>

        <View style={styles.shiftStatsContainer}>
          <View style={styles.shiftStat}>
            <Text style={styles.shiftStatLabel}>Công làm</Text>
            <Text style={styles.shiftStatValue}>
              {shift.workingHours || 0}h
            </Text>
          </View>
          <View style={styles.shiftStat}>
            <Text style={styles.shiftStatLabel}>Thực tế</Text>
            <Text style={styles.shiftStatValue}>
              {shift.workingHourReal || "0h"}
            </Text>
          </View>
          {lateDisplay && (
            <View style={styles.shiftStat}>
              <Text style={styles.shiftStatLabel}>Đi trễ</Text>
              <Text style={[styles.shiftStatValue, styles.lateStatValue]}>
                {lateDisplay}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render multiple shifts view with FlatList
  const renderMultipleShiftsView = () => {
    if (!selectedDate?.shifts || selectedDate.shifts.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Không có dữ liệu ca làm việc</Text>
        </View>
      );
    }

    return (
      <View style={styles.multipleShiftsContainer}>
        <Text style={styles.multipleShiftsTitle}>Thông tin các ca làm việc</Text>
        
        <FlatList
          data={selectedDate.shifts}
          renderItem={renderShiftItem}
          keyExtractor={(item, index) => `shift-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          ListFooterComponent={
            selectedDate.totalWorkingHours ? (
              <View style={styles.totalHoursCard}>
                <View style={styles.totalHoursHeader}>
                  <MaterialIcons name="summarize" size={24} color="#8B5CF6" />
                  <Text style={styles.totalHoursTitle}>Tổng kết ngày</Text>
                </View>
                <View style={styles.totalHoursContent}>
                  <Text style={styles.totalHoursValue}>
                    {selectedDate.totalWorkingHours}h
                  </Text>
                  <Text style={styles.totalHoursLabel}>Tổng công làm</Text>
                </View>
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  // Render details section
  const renderDetailsSection = () => {
    if (!selectedDate) return null;

    const lateTime = calculateLateTime(
      selectedDate.checkInTime,
      selectedDate.startShiftTime
    );
    const lateDisplay = formatLateTime(lateTime);

    return (
      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.sectionLabel}>Thông tin chi tiết</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {formatSelectedDate}
          </Text>
        </View>

        {!hasMultipleShifts && (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Ca làm: {selectedDate.startShiftTime || '--'} -{" "}
                {selectedDate.endShiftTime || '--'}
              </Text>
            </View>

            {lateDisplay && (
              <View style={styles.detailRow}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={[styles.detailText, styles.lateDetailText]}>
                  Đi trễ: {lateDisplay}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="hourglass" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Tổng công làm:{" "}
                {selectedDate.workingHourReal ||
                  `${
                    selectedDate.status === "END" ||
                    selectedDate.status === "FORGET"
                      ? selectedDate.workingHours || 0
                      : 0
                  }h`}
              </Text>
            </View>
          </>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.detailText}>
            Trạng thái:{" "}
            {getStatusText(
              selectedDate.status,
              selectedDate.checkInTime,
              selectedDate.checkOutTime
            )}
          </Text>
        </View>
      </View>
    );
  };

  // Main content to render
  const renderContent = () => {
    if (!selectedDate) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Không có dữ liệu được chọn</Text>
        </View>
      );
    }

    return (
      <>
        {hasMultipleShifts ? renderMultipleShiftsView() : renderSingleShiftView()}
        {renderDetailsSection()}
      </>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
            <Text style={styles.dateTitle}>
              Chấm công, ngày {formatSelectedDate}
            </Text>
          </View>

          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => renderContent()}
            keyExtractor={() => 'content'}
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            ListFooterComponent={
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Text style={styles.closeText}>Đóng</Text>
              </TouchableOpacity>
            }
          />
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
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
  lateDetailText: {
    color: "#EF4444",
    fontWeight: "700",
  },
  multipleShiftsContainer: {
    marginBottom: 24,
  },
  multipleShiftsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  shiftCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shiftIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  shiftStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  activeStatusBadge: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
  },
  endStatusBadge: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
  },
  notWorkStatusBadge: {
    backgroundColor: "#F3E8FF",
    borderColor: "#E9D5FF",
    borderWidth: 1,
  },
  notStartedStatusBadge: {
    backgroundColor: "#F0F9EB",
    borderColor: "#D1FADF",
    borderWidth: 1,
  },
  shiftStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shiftTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  shiftTimeBox: {
    flex: 1,
    marginRight: 10,
  },
  shiftTimeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  shiftTimeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  shiftStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  shiftStat: {
    alignItems: "center",
  },
  shiftStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  shiftStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
  },
  lateStatValue: {
    color: "#EF4444",
  },
  totalHoursCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    alignItems: "center",
  },
  totalHoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  totalHoursTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  totalHoursContent: {
    alignItems: "center",
  },
  totalHoursValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3B82F6",
    marginBottom: 4,
  },
  totalHoursLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
