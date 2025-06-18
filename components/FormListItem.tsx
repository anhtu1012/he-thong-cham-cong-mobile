import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  AntDesign,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

interface FormItemProps {
  id: string;
  title: string;
  description: string;
  onPress: (id: string, title: string) => void;
}

const FormListItem: React.FC<FormItemProps> = ({
  id,
  title,
  description,
  onPress,
}) => {
  // Map form titles to their respective icons and colors
  const getFormStyle = (
    title: string
  ): { icon: React.ReactNode; color: string } => {
    switch (title) {
      case "Đơn xin nghỉ":
        return {
          icon: <Ionicons name="umbrella-outline" size={24} color="#6366f1" />,
          color: "#eff6ff",
        };
      case "Đơn vắng mặt":
        return {
          icon: <AntDesign name="clockcircleo" size={24} color="#06b6d4" />,
          color: "#ecfeff",
        };
      case "Đơn làm thêm":
        return {
          icon: <AntDesign name="staro" size={24} color="#eab308" />,
          color: "#fefce8",
        };
      case "Đơn checkin/out":
        return {
          icon: <AntDesign name="checkcircleo" size={24} color="#ec4899" />,
          color: "#fdf2f8",
        };
      case "Đơn đổi ca":
        return {
          icon: <MaterialIcons name="update" size={24} color="#22c55e" />,
          color: "#f0fdf4",
        };
      case "Đơn tăng ca":
        return {
          icon: <MaterialIcons name="assignment" size={24} color="#3b82f6" />,
          color: "#eff6ff",
        };
      case "Đơn công tác":
        return {
          icon: <FontAwesome name="truck" size={24} color="#84cc16" />,
          color: "#f7fee7",
        };
      case "Đơn thôi việc":
        return {
          icon: <Feather name="x-circle" size={24} color="#ef4444" />,
          color: "#fee2e2",
        };
      default:
        return {
          icon: (
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color="#6b7280"
            />
          ),
          color: "#f9fafb",
        };
    }
  };

  const { icon, color } = getFormStyle(title);

  return (
    <TouchableOpacity
      style={[styles.formItem, { backgroundColor: color }]}
      onPress={() => onPress(id, title)}
    >
      <View style={styles.formContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.formTextContainer}>
          <Text style={styles.formTitle}>{title}</Text>
          <Text style={styles.formDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default FormListItem;
