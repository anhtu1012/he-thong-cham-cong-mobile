import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFormDescriptions } from "../service/api";
import Toast from "react-native-toast-message";

interface UserProfile {
  id: string;
  code: string;
  userName: string;
  fullName: string;
}

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

const FormListPage = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forms, setForms] = useState<FormDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchForms();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserProfile(parsedUserData);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await getFormDescriptions({});
      if (response.data && response.data.data) {
        // Lọc đơn từ của người dùng hiện tại
        const userForms = response.data.data.filter(
          (form: FormDescription) => form.submittedBy === userProfile?.fullName
        );

        // Sắp xếp theo thời gian tạo mới nhất
        const sortedForms = userForms.sort(
          (a: FormDescription, b: FormDescription) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setForms(sortedForms);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lấy danh sách đơn từ",
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

  const renderFormItem = ({ item }: { item: FormDescription }) => (
    <TouchableOpacity style={styles.formItem}>
      <View
        style={[
          styles.formLeftBorder,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      />
      <View style={styles.formItemContent}>
        <View style={styles.formHeader}>
          <View style={styles.formTitleContainer}>
            <Text style={styles.formType}>{item.formTitle}</Text>
            <View
              style={[
                styles.formBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.formBadgeText}>
                {getFormStatusText(item.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.formIconButton}>
            <Feather name="more-vertical" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={styles.formDescription}>Lý do: {item.reason}</Text>

        <View style={styles.formDetailSection}>
          <View style={styles.formDetailRow}>
            <View style={styles.formDetailIcon}>
              <Feather name="calendar" size={14} color="#3674B5" />
            </View>
            <Text style={styles.formDetailText}>
              Ngày tạo: {formatDate(item.createdAt)}
            </Text>
          </View>

          {item.status !== "PENDING" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="user" size={14} color="#3674B5" />
              </View>
              <Text style={styles.formDetailText}>
                Người duyệt: {item.approvedBy || "Không xác định"}
              </Text>
            </View>
          )}

          {item.status === "APPROVED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="check-circle" size={14} color="#4CAF50" />
              </View>
              <Text style={styles.formDetailText}>
                Thời gian duyệt:{" "}
                {formatDate(item.approvedTime || item.updatedAt)}
              </Text>
            </View>
          )}

          {item.status === "REJECTED" && (
            <View style={styles.formDetailRow}>
              <View style={styles.formDetailIcon}>
                <Feather name="x-circle" size={14} color="#FF5252" />
              </View>
              <Text style={styles.formDetailText}>
                Thời gian từ chối:{" "}
                {formatDate(item.approvedTime || item.updatedAt)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formFooter}>
          <TouchableOpacity
            style={styles.formButton}
            onPress={() => {
              navigation.navigate("FormDetailView" as any, {
                formId: item.id,
              });
            }}
          >
            <Text style={styles.formButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          {item.status === "PENDING" && (
            <TouchableOpacity
              style={[styles.formButton, { backgroundColor: "#ffebee" }]}
            >
              <Text style={[styles.formButtonText, { color: "#FF5252" }]}>
                Hủy đơn
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách đơn từ</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3674B5" />
          <Text style={styles.loadingText}>Đang tải danh sách đơn từ...</Text>
        </View>
      ) : forms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đơn từ nào</Text>
        </View>
      ) : (
        <FlatList
          data={forms}
          renderItem={renderFormItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
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
});

export default FormListPage;
