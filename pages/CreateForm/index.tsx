import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../utils/routes";
import FormListItem from "../../components/FormListItem";
import { getForms } from "../../service/api";
import Toast from "react-native-toast-message";

interface FormType {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  roleCode: string;
}

const CreateFormPage = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await getForms();
      setForms(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Không thể tải danh sách đơn từ. Vui lòng thử lại sau.");
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách đơn từ",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSelect = (formId: string, formTitle: string) => {
    // Điều hướng đến màn hình chi tiết form
    navigation.navigate("FormDetail", { formId, formTitle });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Tạo mới đơn từ</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ade80" />
            <Text style={styles.loadingText}>Đang tải danh sách đơn từ...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.formList}>
            {forms.map((form) => (
              <FormListItem
                key={form.id}
                id={form.id}
                title={form.title}
                description={form.description}
                onPress={handleFormSelect}
              />
            ))}
          </View>
        )}
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fee2e2",
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
    textAlign: "center",
  },
});

export default CreateFormPage;
