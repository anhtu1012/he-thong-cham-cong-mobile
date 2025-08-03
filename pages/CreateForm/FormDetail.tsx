import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { createForm } from "../../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  // Time states
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  // Format helpers
  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }`;
  };

  // Format date to ISO 8601 for API
  const formatDateTimeForApi = (date: Date, time: Date) => {
    //uct
    const formattedDate = new Date(date);
    formattedDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return formattedDate.toISOString();
  };

  // Change handlers for date/time
  const onChangeStartDate = (event: any, selectedDate?: Date) => {
    setShowStartDate(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event: any, selectedDate?: Date) => {
    setShowEndDate(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onChangeStartTime = (event: any, selectedTime?: Date) => {
    setShowStartTime(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onChangeEndTime = (event: any, selectedTime?: Date) => {
    setShowEndTime(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  // Function để chọn ảnh từ máy
  const pickImageFromGallery = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập",
          "Cần quyền truy cập thư viện ảnh để chọn ảnh.",
          [{ text: "OK" }]
        );
        return;
      }

      // Mở image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã chọn ảnh thành công",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể chọn ảnh. Vui lòng thử lại.",
      });
    }
  };

  // Function để xóa ảnh đã chọn
  const removeSelectedImage = () => {
    setSelectedImage(null);
    Toast.show({
      type: "info",
      text1: "Thông báo",
      text2: "Đã xóa ảnh đã chọn",
    });
  };

  const handleSubmitForm = async () => {
    if (!reason.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập lý do",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Format dates for API
      const startTimeFormatted = formatDateTimeForApi(startDate, startTime);
      const endTimeFormatted = formatDateTimeForApi(endDate, endTime);
      const formData = new FormData();
      formData.append("reason", reason.trim());
      formData.append("status", "PENDING"); // Luôn để PENDING cho form
      formData.append("startTime", startTimeFormatted);
      formData.append("endTime", endTimeFormatted);
      formData.append("formId", formId);
      if (selectedImage) {
        formData.append("file", {
          uri: selectedImage,
          type: "image/jpeg",
          name: "face.jpg",
        } as any);
      }
      console.log("Submitting form data:", formData);

      const response = await createForm(formData);

      if (response.status === 201 || response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã gửi đơn thành công",
        });
        navigation.goBack();
      } else {
        throw new Error("Server responded with an error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể gửi đơn. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
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
        <Text style={styles.headerTitle}>{formTitle || "Chi tiết đơn"}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.formSection}>
          {/* Reason field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Lý do <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Nhập lý do của bạn"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Time section */}
          <View style={styles.timeSection}>
            <TouchableOpacity
              style={styles.closeTimeSection}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="close" size={24} color="#AAAAAA" />
            </TouchableOpacity>

            {/* From date & time */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>
                  Từ giờ <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowStartTime(true)}
                >
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                  <View style={styles.timeIcon}>
                    <AntDesign name="clockcircleo" size={20} color="#AAAAAA" />
                  </View>
                </TouchableOpacity>
                {showStartTime && (
                  <DateTimePicker
                    testID="startTimePicker"
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeStartTime}
                  />
                )}
              </View>

              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>
                  Từ ngày <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowStartDate(true)}
                >
                  <Text style={styles.timeText}>{formatDate(startDate)}</Text>
                  <View style={styles.timeIcon}>
                    <AntDesign name="calendar" size={20} color="#AAAAAA" />
                  </View>
                </TouchableOpacity>
                {showStartDate && (
                  <DateTimePicker
                    testID="startDatePicker"
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onChangeStartDate}
                  />
                )}
              </View>
            </View>

            {/* To date & time */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>
                  Đến giờ <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowEndTime(true)}
                >
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                  <View style={styles.timeIcon}>
                    <AntDesign name="clockcircleo" size={20} color="#AAAAAA" />
                  </View>
                </TouchableOpacity>
                {showEndTime && (
                  <DateTimePicker
                    testID="endTimePicker"
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeEndTime}
                  />
                )}
              </View>

              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>
                  Đến ngày <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setShowEndDate(true)}
                >
                  <Text style={styles.timeText}>{formatDate(endDate)}</Text>
                  <View style={styles.timeIcon}>
                    <AntDesign name="calendar" size={20} color="#AAAAAA" />
                  </View>
                </TouchableOpacity>
                {showEndDate && (
                  <DateTimePicker
                    testID="endDatePicker"
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onChangeEndDate}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Attachment section */}
          <View style={styles.attachmentSection}>
            <Text style={styles.sectionTitle}>Đính kèm</Text>

            {/* Hiển thị ảnh đã chọn */}
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeSelectedImage}
                >
                  <AntDesign name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.attachmentOptions}>
              <View style={styles.attachmentIconWrapper}>
                <AntDesign
                  name="upload"
                  size={24}
                  color="#3674B5"
                  style={styles.uploadIcon}
                />
              </View>

              <View style={styles.attachmentButtons}>
                <TouchableOpacity
                  style={styles.attachmentButtonPrimary}
                  onPress={pickImageFromGallery}
                >
                  <AntDesign name="export" size={18} color="#fff" />
                  <Text style={styles.attachmentButtonPrimaryText}>
                    CHỌN TỪ MÁY
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi đơn</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  formSection: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  requiredMark: {
    color: "red",
  },
  fieldInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reasonInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    minHeight: 150,
  },
  fieldText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#AAAAAA",
  },
  timeSection: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    position: "relative",
  },
  closeTimeSection: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeField: {
    flex: 1,
    marginRight: 12,
  },
  timeField2: {
    flex: 1,
    marginLeft: 12,
  },
  timeInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  timeIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentSection: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  attachmentOptions: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachmentIconWrapper: {
    width: 60,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadIcon: {
    marginRight: 10,
  },
  attachmentButtons: {
    flex: 1,
    justifyContent: "center",
  },
  attachmentButtonPrimary: {
    backgroundColor: "#3674B5",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  attachmentButtonPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  attachmentButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentButtonSecondaryText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
  submitButtonDisabled: {
    backgroundColor: "#94b8db",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FormDetail;
