import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getFormDescriptions, cancelForm } from "../service/api";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";

const { width } = Dimensions.get("window");

type FormStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

interface FormDescription {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  reason: string;
  status: FormStatus;
  file: string;
  startTime: string;
  endTime: string;
  approvedTime?: string;
  formTitle: string;
  submittedBy: string;
  approvedBy?: string;
  response?: string;
}

interface RouteParams {
  formId: string;
}

const FormDetailView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore - Bỏ qua lỗi TypeScript
  const { formId } = route.params as RouteParams;

  const [form, setForm] = useState<FormDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchFormDetail();
  }, []);

  const fetchFormDetail = async () => {
    try {
      setLoading(true);
      const response = await getFormDescriptions({});

      if (response.data && response.data.data) {
        // Tìm form với id được truyền vào
        const foundForm = response.data.data.find(
          (item: FormDescription) => item.id === formId
        );

        if (foundForm) {
          setForm(foundForm);
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không tìm thấy thông tin đơn từ",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching form detail:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lấy thông tin đơn từ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = async () => {
    if (!form) return;

    try {
      setCanceling(true);
      await cancelForm(form.id);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã hủy đơn từ thành công",
      });

      // Refresh form data to show updated status
      await fetchFormDetail();
    } catch (error) {
      console.error("Error canceling form:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể hủy đơn từ. Vui lòng thử lại.",
      });
    } finally {
      setCanceling(false);
    }
  };

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format date and time to DD/MM/YYYY HH:MM
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${formatDate(dateString)} ${hours}:${minutes}`;
  };

  // utc to local time
  const utcToLocalTime = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  // Map API status to display string
  const getFormStatusText = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "CANCELED":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Status colors
  const getStatusColor = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "#FFC107";
      case "APPROVED":
        return "#4CAF50";
      case "REJECTED":
        return "#FF5252";
      case "CANCELED":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  // Get status icon
  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case "PENDING":
        return "clock" as const;
      case "APPROVED":
        return "check-circle" as const;
      case "REJECTED":
        return "x-circle" as const;
      case "CANCELED":
        return "slash" as const;
      default:
        return "help-circle" as const;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn từ</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Feather name="more-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3674B5" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : form ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Header Card with Gradient */}
          <LinearGradient
            colors={[
              getStatusColor(form.status),
              getStatusColor(form.status) + "CC",
            ]}
            style={styles.headerCard}
          >
            <View style={styles.headerCardContent}>
              <View style={styles.statusIconContainer}>
                <Feather
                  name={getStatusIcon(form.status)}
                  size={32}
                  color="#fff"
                />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.formCode}>{form.code}</Text>
                <Text style={styles.formTitle}>{form.formTitle}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {getFormStatusText(form.status)}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info" size={20} color="#3674B5" />
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#E3F2FD" }]}>
                  <Feather name="user" size={16} color="#3674B5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Người gửi</Text>
                  <Text style={styles.infoValue}>{form.submittedBy}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#E8F5E8" }]}>
                  <Feather name="calendar" size={16} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày tạo</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(form.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#FFF3E0" }]}>
                  <Feather name="file-text" size={16} color="#FF9800" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Loại đơn</Text>
                  <Text style={styles.infoValue}>{form.formTitle}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Time Period */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="schedule" size={20} color="#3674B5" />
              <Text style={styles.sectionTitle}>Thời gian</Text>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: "#E8F5E8" }]}>
                  <Feather name="play-circle" size={18} color="#4CAF50" />
                </View>
                <View style={styles.timeContent}>
                  <Text style={styles.timeLabel}>Từ</Text>
                  <Text style={styles.timeValue}>
                    {utcToLocalTime(form.startTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.timeDivider} />

              <View style={styles.timeItem}>
                <View style={[styles.timeIcon, { backgroundColor: "#FFEBEE" }]}>
                  <Feather name="stop-circle" size={18} color="#FF5252" />
                </View>
                <View style={styles.timeContent}>
                  <Text style={styles.timeLabel}>Đến</Text>
                  <Text style={styles.timeValue}>
                    {utcToLocalTime(form.endTime)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reason */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={20} color="#3674B5" />
              <Text style={styles.sectionTitle}>Lý do</Text>
            </View>

            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText}>{form.reason}</Text>
            </View>
          </View>

          {/* Image Attachment */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="image" size={20} color="#3674B5" />
              <Text style={styles.sectionTitle}>Hình ảnh đính kèm</Text>
            </View>

            <TouchableOpacity
              style={styles.imageContainer}
              onPress={openImageModal}
            >
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: form.file }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Feather name="eye" size={24} color="#fff" />
                </View>
              </View>
              <View style={styles.imageContent}>
                <Text style={styles.imageName}>Hình ảnh đính kèm</Text>
                <Text style={styles.imageAction}>Nhấn để xem ảnh lớn</Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={openImageModal}
              >
                <Feather name="maximize" size={20} color="#3674B5" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Approval Information */}
          {form.status !== "PENDING" && form.status !== "CANCELED" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name={
                    form.status === "APPROVED"
                      ? "check-circle"
                      : form.status === "REJECTED"
                      ? "cancel"
                      : form.status === "CANCELED"
                      ? "block"
                      : "help-outline"
                  }
                  size={20}
                  color={
                    form.status === "APPROVED"
                      ? "#4CAF50"
                      : form.status === "REJECTED"
                      ? "#FF5252"
                      : form.status === "CANCELED"
                      ? "#9E9E9E"
                      : "#9E9E9E"
                  }
                />
                <Text style={styles.sectionTitle}>
                  Thông tin{" "}
                  {form.status === "APPROVED"
                    ? "duyệt"
                    : form.status === "REJECTED"
                    ? "từ chối"
                    : form.status === "CANCELED"
                    ? "hủy"
                    : "xử lý"}
                </Text>
              </View>

              <View style={styles.approvalInfo}>
                <View style={styles.approvalItem}>
                  <Text style={styles.approvalLabel}>
                    Người{" "}
                    {form.status === "APPROVED"
                      ? "duyệt"
                      : form.status === "REJECTED"
                      ? "từ chối"
                      : form.status === "CANCELED"
                      ? "hủy"
                      : "xử lý"}
                  </Text>
                  <Text style={styles.approvalValue}>
                    {form.approvedBy || "Không xác định"}
                  </Text>
                </View>
                <View style={styles.approvalItem}>
                  <Text style={styles.approvalLabel}>Thời gian</Text>
                  <Text style={styles.approvalValue}>
                    {formatDateTime(form.approvedTime || form.updatedAt)}
                  </Text>
                </View>
                {form.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Phản hồi:</Text>
                    <Text style={styles.responseText}>{form.response}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          {form.status === "PENDING" && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  canceling && styles.cancelButtonDisabled,
                ]}
                onPress={handleCancelForm}
                disabled={canceling}
              >
                <View style={styles.cancelButtonContent}>
                  <View style={styles.cancelIconContainer}>
                    <Feather name="x" size={20} color="#fff" />
                  </View>
                  <Text style={styles.cancelButtonText}>
                    {canceling ? "Đang hủy đơn..." : "Hủy đơn"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy thông tin đơn</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFormDetail}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              onPress={closeImageModal}
              activeOpacity={1}
            />
            <View style={styles.imageModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hình ảnh đính kèm</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeImageModal}
                >
                  <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.imageViewContainer}>
                <Image
                  source={{ uri: form?.file }}
                  style={styles.fullSizeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    color: "#333",
  },
  moreButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: "#3674B5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  formCode: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "48%", // Two items per row
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoContent: {
    //
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  timeContent: {
    //
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  timeDivider: {
    width: 10,
  },
  reasonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reasonText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  approvalInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  approvalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  approvalLabel: {
    fontSize: 14,
    color: "#666",
  },
  approvalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  responseContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  responseLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  responseText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3674B5",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContent: {
    flex: 1,
  },
  imageName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  imageAction: {
    fontSize: 13,
    color: "#666",
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF5252",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: width * 0.6,
    shadowColor: "#FF5252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButtonDisabled: {
    backgroundColor: "#9E9E9E",
    shadowColor: "#9E9E9E",
    shadowOpacity: 0.2,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageModalContent: {
    width: width * 0.95,
    height: "80%",
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  fullSizeImage: {
    width: "100%",
    height: "100%",
  },
});

export default FormDetailView;
