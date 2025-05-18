import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../utils/routes";

interface FormType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CreateFormPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const formTypes: FormType[] = [
    {
      id: "leave",
      title: "Đơn xin nghỉ",
      description:
        "Đơn xin nghỉ phát sinh khi bạn muốn nghỉ nhiều ngày làm việc.",
      icon: <Ionicons name="umbrella-outline" size={24} color="#6366f1" />,
      color: "#eff6ff",
    },
    {
      id: "absence",
      title: "Đơn vắng mặt",
      description:
        "Đơn vắng mặt phát sinh khi bạn có nhu cầu vắng mặt 1 khoảng thời gian trong ca làm việc.",
      icon: <AntDesign name="clockcircleo" size={24} color="#06b6d4" />,
      color: "#ecfeff",
    },
    {
      id: "overtime",
      title: "Đơn làm thêm",
      description:
        "Đơn làm thêm phát sinh khi bạn có khoảng thời gian làm thêm không nằm trong ca làm việc.",
      icon: <AntDesign name="staro" size={24} color="#eab308" />,
      color: "#fefce8",
    },
    {
      id: "checkinout",
      title: "Đơn checkin/out",
      description: "Đơn checkin/out phát sinh khi bạn quên chấm công khi đến.",
      icon: <AntDesign name="checkcircleo" size={24} color="#ec4899" />,
      color: "#fdf2f8",
    },
    {
      id: "shiftChange",
      title: "Đơn đổi ca",
      description:
        "Đơn đổi ca phát sinh khi bạn muốn đổi sang một ca làm việc khác với ca đã được phân.",
      icon: <MaterialIcons name="update" size={24} color="#22c55e" />,
      color: "#f0fdf4",
    },
    {
      id: "shiftAdd",
      title: "Đơn tăng ca",
      description:
        "Đơn tăng ca phát sinh khi bạn có nhu cầu thêm một ca làm việc ngoài ca làm việc đã được phân.",
      icon: <MaterialIcons name="assignment" size={24} color="#3b82f6" />,
      color: "#eff6ff",
    },
    {
      id: "businessTrip",
      title: "Đơn công tác",
      description:
        "Đơn công tác phát sinh khi bạn được yêu cầu đi công tác và không thể chấm công trên công ty.",
      icon: <FontAwesome name="truck" size={24} color="#84cc16" />,
      color: "#f7fee7",
    },
    {
      id: "resignation",
      title: "Đơn thôi việc",
      description: "Đơn thôi việc phát sinh khi bạn nghỉ việc.",
      icon: <Feather name="x-circle" size={24} color="#ef4444" />,
      color: "#fee2e2",
    },
  ];

  const handleFormSelect = (formId: string, formTitle: string) => {
    // Điều hướng đến màn hình chi tiết form
    navigation.navigate("FormDetail", { formId, formTitle });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Tạo mới đơn từ</Text>

        <View style={styles.formList}>
          {formTypes.map((form) => (
            <TouchableOpacity
              key={form.id}
              style={[styles.formItem, { backgroundColor: form.color }]}
              onPress={() => handleFormSelect(form.id, form.title)}
            >
              <View style={styles.formContent}>
                <View style={styles.iconContainer}>{form.icon}</View>
                <View style={styles.formTextContainer}>
                  <Text style={styles.formTitle}>{form.title}</Text>
                  <Text style={styles.formDescription}>{form.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#e6f7f2",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  formList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  formItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginRight: 12,
  },
  formTextContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  formDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default CreateFormPage;
