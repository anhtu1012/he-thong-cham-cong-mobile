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

// Collection of vibrant colors for default case
const vibrantColors = {
  backgrounds: [
    "#FFF5F5", // Light red
    "#F3F0FF", // Light purple
    "#E6FFFA", // Light teal
    "#FFFBEB", // Light yellow
    "#F0FFF4", // Light green
    "#EBF8FF", // Light blue
    "#FFF5F7", // Light pink
    "#FFFAF0", // Light orange
  ],
  icons: [
    "#FF6B6B", // Coral red
    "#6A5ACD", // Slate blue
    "#4ECDC4", // Turquoise
    "#FFD166", // Amber yellow
    "#06D6A0", // Mint green
    "#118AB2", // Ocean blue
    "#FF9F1C", // Orange
    "#FF85A2", // Pink
  ],
};

// AntDesign icons for default case
const antdIcons = [
  "star",
  "heart",
  "checkcircleo",
  "clockcircleo",
  "calendar",
  "appstore1",
  "tags",
  "notification",
  "gift",
  "like2",
  "flag",
  "layout",
];

// Helper function to get a random element from an array
const getRandomElement = <T,>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

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
      case "Đơn vắng mặt":
        return {
          icon: <Feather name="user-x" size={24} color="#06b6d4" />,
          color: "#ecfeff",
        };
      case "Đơn tăng ca":
        return {
          icon: <MaterialIcons name="access-time" size={24} color="#3b82f6" />,
          color: "#eff6ff",
        };
      case "Đơn Quên chấm công":
        return {
          icon: <MaterialIcons name="schedule" size={24} color="#eab308" />,
          color: "#fefce8",
        };
      case "Đơn xác thực khuôn mặt":
        return {
          icon: <MaterialIcons name="face" size={24} color="#ec4899" />,
          color: "#fdf2f8",
        };
      case "Đơn khác":
        return {
          icon: <MaterialIcons name="description" size={24} color="#22c55e" />,
          color: "#f0fdf4",
        };

      case "Đơn thôi việc":
        return {
          icon: <MaterialIcons name="exit-to-app" size={24} color="#ef4444" />,
          color: "#fee2e2",
        };
      default:
        // Generate a random style for forms without specific mapping
        const randomIconName = getRandomElement(antdIcons);
        const randomColor = getRandomElement(vibrantColors.backgrounds);
        const randomIconColor = getRandomElement(vibrantColors.icons);

        return {
          icon: (
            <AntDesign
              name={randomIconName as any}
              size={24}
              color={randomIconColor}
            />
          ),
          color: randomColor,
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
