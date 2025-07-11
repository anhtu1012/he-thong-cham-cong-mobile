import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../utils/routes";
import { cancelForm } from "../service/api";
import Toast from "react-native-toast-message";

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
}

interface FormItemCardProps {
  form: FormDescription;
  formatDate: (dateString: string) => string;
  onFormUpdate?: () => void;
}

const FormItemCard = ({
  form,
  formatDate,
  onFormUpdate,
}: FormItemCardProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [canceling, setCanceling] = useState(false);

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

  const handleCancelForm = async () => {
    try {
      setCanceling(true);
      await cancelForm(form.id);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã hủy đơn từ thành công",
      });

      // Refresh the form list
      if (onFormUpdate) {
        onFormUpdate();
      }
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

  return (
    <TouchableOpacity style={styles.formItem}>
      <View
        style={[
          styles.formLeftBorder,
          { backgroundColor: getStatusColor(form.status) },
        ]}
      />
      <View style={styles.formItemContent}>
        <View style={styles.formHeader}>
          <View style={styles.formTitleContainer}>
            <Text style={styles.formType}>{form.formTitle}</Text>
            <View
              style={[
                styles.formBadge,
                { backgroundColor: getStatusColor(form.status) },
              ]}
            >
              <Text style={styles.formBadgeText}>
                {getFormStatusText(form.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.formIconButton}>
            <Feather name="more-vertical" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={styles.formDescription}>
          Lý do:{" "}
          {form.reason.length > 50
            ? `${form.reason.substring(0, 50)}...`
            : form.reason}
        </Text>

        <View style={styles.formDetailSection}>
          <View style={styles.formDetailRow}>
            <View style={styles.formDetailIcon}>
              <Feather name="calendar" size={14} color="#3674B5" />
            </View>
            <Text style={styles.formDetailText}>
              Ngày tạo: {formatDate(form.createdAt)}
            </Text>
          </View>

          {form.status !== "PENDING" && form.status !== "CANCELED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="user" size={14} color="#3674B5" />
              </View>
              <Text style={styles.formDetailText}>
                Người duyệt: {form.approvedBy || "Không xác định"}
              </Text>
            </View>
          )}

          {form.status === "APPROVED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="check-circle" size={14} color="#4CAF50" />
              </View>
              <Text style={styles.formDetailText}>
                Thời gian duyệt:{" "}
                {formatDate(form.approvedTime || form.updatedAt)}
              </Text>
            </View>
          )}

          {form.status === "REJECTED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="x-circle" size={14} color="#FF5252" />
              </View>
              <Text style={styles.formDetailText}>
                Thời gian từ chối:{" "}
                {formatDate(form.approvedTime || form.updatedAt)}
              </Text>
            </View>
          )}

          {form.status === "CANCELED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="slash" size={14} color="#9E9E9E" />
              </View>
              <Text style={styles.formDetailText}>
                Thời gian hủy: {formatDate(form.approvedTime || form.updatedAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formFooter}>
          <TouchableOpacity
            style={styles.formButton}
            onPress={() => {
              navigation.navigate("FormDetailView" as any, {
                formId: form.id,
              });
            }}
          >
            <Text style={styles.formButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          {form.status === "PENDING" && (
            <TouchableOpacity
              style={[
                styles.formButton,
                { backgroundColor: "#ffebee" },
                canceling && styles.formButtonDisabled,
              ]}
              onPress={handleCancelForm}
              disabled={canceling}
            >
              <Text style={[styles.formButtonText, { color: "#FF5252" }]}>
                {canceling ? "Đang hủy..." : "Hủy đơn"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  formItem: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  formLeftBorder: {
    width: 4,
    height: "100%",
  },
  formItemContent: {
    flex: 1,
    padding: 12,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  formTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  formType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  formBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  formBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  formIconButton: {
    padding: 4,
  },
  formDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  formDetailSection: {
    marginBottom: 12,
  },
  formDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  formDetailIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  formDetailText: {
    fontSize: 13,
    color: "#666",
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  formButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
    marginLeft: 8,
  },
  formButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3674B5",
  },
  formButtonDisabled: {
    opacity: 0.6,
  },
});

export default FormItemCard;
