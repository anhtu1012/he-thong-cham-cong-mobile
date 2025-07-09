import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { getFormDescriptions } from "../service/api";
import Toast from "react-native-toast-message";

type FormStatus = "PENDING" | "APPROVED" | "REJECTED";

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

  // Map API status to display string
  const getFormStatusText = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  // Status colors
  const getStatusColor = (status: FormStatus): string => {
    switch (status) {
      case "PENDING":
        return "#FFA500";
      case "APPROVED":
        return "#4CAF50";
      case "REJECTED":
        return "#FF5252";
      default:
        return "#007BFF";
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
          {/* Form Title & Status */}
          <View style={styles.titleContainer}>
            <View style={styles.formTitleSection}>
              <Text style={styles.formCode}>{form.code}</Text>
              <Text style={styles.formTitle}>{form.formTitle}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(form.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getFormStatusText(form.status)}
              </Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formSection}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Mã đơn:</Text>
              <Text style={styles.fieldValue}>{form.code}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Loại đơn:</Text>
              <Text style={styles.fieldValue}>{form.formTitle}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Lý do:</Text>
              <Text style={styles.fieldValue}>{form.reason}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Người gửi đơn:</Text>
              <Text style={styles.fieldValue}>{form.submittedBy}</Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Thời gian tạo:</Text>
              <Text style={styles.fieldValue}>
                {formatDateTime(form.createdAt)}
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Từ ngày giờ:</Text>
              <Text style={styles.fieldValue}>
                {formatDateTime(form.startTime)}
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Đến ngày giờ:</Text>
              <Text style={styles.fieldValue}>
                {formatDateTime(form.endTime)}
              </Text>
            </View>

            {form.status !== "PENDING" && (
              <>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Người duyệt:</Text>
                  <Text style={styles.fieldValue}>
                    {form.approvedBy || "Không xác định"}
                  </Text>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>
                    Thời gian {form.status === "APPROVED" ? "duyệt" : "từ chối"}
                    :
                  </Text>
                  <Text style={styles.fieldValue}>
                    {formatDateTime(form.updatedAt)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>File đính kèm:</Text>
              <Text style={styles.fieldValue}>{form.file}</Text>
            </View>
          </View>

          {/* Actions */}
          {form.status === "PENDING" && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Hủy đơn</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy thông tin đơn</Text>
        </View>
      )}
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
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  formTitleSection: {
    flex: 1,
  },
  formCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  formSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },
  cancelButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FormDetailView;
