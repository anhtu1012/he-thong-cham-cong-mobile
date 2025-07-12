import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../utils/routes";
import FormItemCard from "./FormItemCard";

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

interface FormsStatusWidgetProps {
  forms: FormDescription[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  onFormUpdate?: () => void;
}

const FormsStatusWidget = ({
  forms,
  loading,
  formatDate,
  onFormUpdate,
}: FormsStatusWidgetProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.formsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tình trạng đơn từ</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("FormList" as any)}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
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
        forms.map((form) => (
          <FormItemCard
            key={form.id}
            form={form}
            formatDate={formatDate}
            onFormUpdate={onFormUpdate}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formsContainer: {
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: "#3674B5",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
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
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default FormsStatusWidget;
