import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Switch,
  Platform,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import DatePicker from "react-native-date-picker";

interface FormRouteParams {
  formId: string;
  formTitle: string;
}

const FormDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore - Bỏ qua lỗi TypeScript
  const { formId, formTitle } = route.params as FormRouteParams;

  // State cho form
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [halfDay, setHalfDay] = useState(false);
  const [attachmentRequired, setAttachmentRequired] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleSubmitForm = () => {
    // Xử lý gửi đơn
    const formData = {
      formId,
      formTitle,
      reason,
      startDate,
      endDate,
      halfDay,
      attachmentRequired,
    };

    console.log("Submitting form:", formData);
    alert("Đã gửi đơn thành công!");
    navigation.goBack();
  };

  // Render nội dung form dựa trên loại đơn
  const renderFormContent = () => {
    return (
      <View style={styles.formContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Lý do:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Nhập lý do đơn..."
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Thời gian:</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpenStartDate(true)}
            >
              <AntDesign name="calendar" size={20} color="#3674B5" />
              <Text style={styles.dateText}>
                Từ ngày: {formatDate(startDate)}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openStartDate}
              date={startDate}
              onConfirm={(date) => {
                setOpenStartDate(false);
                setStartDate(date);
              }}
              onCancel={() => {
                setOpenStartDate(false);
              }}
              mode="date"
            />
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpenEndDate(true)}
            >
              <AntDesign name="calendar" size={20} color="#3674B5" />
              <Text style={styles.dateText}>
                Đến ngày: {formatDate(endDate)}
              </Text>
            </TouchableOpacity>

            <DatePicker
              modal
              open={openEndDate}
              date={endDate}
              onConfirm={(date) => {
                setOpenEndDate(false);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEndDate(false);
              }}
              mode="date"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Nửa ngày:</Text>
            <Switch
              value={halfDay}
              onValueChange={setHalfDay}
              trackColor={{ false: "#767577", true: "#bce3fb" }}
              thumbColor={halfDay ? "#3674B5" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Yêu cầu đính kèm:</Text>
            <Switch
              value={attachmentRequired}
              onValueChange={setAttachmentRequired}
              trackColor={{ false: "#767577", true: "#bce3fb" }}
              thumbColor={attachmentRequired ? "#3674B5" : "#f4f3f4"}
            />
          </View>
        </View>

        {attachmentRequired && (
          <View style={styles.attachmentSection}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons
                name="document-attach-outline"
                size={24}
                color="#3674B5"
              />
              <Text style={styles.attachButtonText}>Đính kèm tệp</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitForm}
          >
            <Text style={styles.submitButtonText}>Gửi đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>{formTitle || "Chi tiết đơn"}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {renderFormContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
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
  formContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateRow: {
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  attachmentSection: {
    marginBottom: 20,
  },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3674B5",
    borderRadius: 8,
    padding: 16,
  },
  attachButtonText: {
    color: "#3674B5",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  formActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3674B5",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#3674B5",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#3674B5",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    flex: 1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FormDetail;
