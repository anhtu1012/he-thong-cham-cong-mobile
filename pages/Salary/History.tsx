import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Salary } from "../../models/salary";

// Định nghĩa kiểu prop
type HistoryProps = {
  salaryHistory: Salary[];
  formatCurrency: (amount: number) => string;
};

const History = ({ salaryHistory, formatCurrency }: HistoryProps) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
    }}
  >
    {/* <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      }}
    >
      <Text style={{ fontSize: 14, color: "#666", marginRight: 10 }}>
        Lọc theo
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 16,
        }}
      >
        <Text style={{ fontSize: 14, color: "#3674B5", marginRight: 8 }}>
          2024
        </Text>
        <AntDesign name="down" size={12} color="#3674B5" />
      </TouchableOpacity>
    </View> */}
    {salaryHistory.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#f5f5f5",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#e3f2fd",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <MaterialIcons name="payments" size={24} color="#3674B5" />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
              Tháng {item.month.split("/")[0]}
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
              {item.month}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333",
              marginRight: 8,
            }}
          >
            {formatCurrency(item.totalSalary)}
          </Text>
          <AntDesign name="right" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

export default History;
