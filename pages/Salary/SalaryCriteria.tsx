import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Định nghĩa kiểu prop
type SalaryCriteriaProps = { salaryCriteriaData: any };

const Card = ({ label, value, iconName, color }: { 
  label: string; 
  value: string | number; 
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <View style={styles.cardContainer}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={iconName} size={20} color={color} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color: color }]}>{value}</Text>
    </View>
  </View>
);

const SalaryCriteria = ({ salaryCriteriaData }: SalaryCriteriaProps) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Ionicons name="calculator" size={24} color="#2563eb" />
        <Text style={styles.title}>Tiêu chí lương</Text>
      </View>
      <Text style={styles.subtitle}>Thông tin chi tiết về cấu trúc lương</Text>
    </View>
    
    <View style={styles.infoSection}>
    
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="briefcase" size={16} color="#3b82f6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Chức vụ</Text>
            <Text style={styles.infoValue}>{salaryCriteriaData.positionName}</Text>
          </View>
        </View>
       
      </View>
    </View>
    
    <View style={styles.cardsGrid}>
      <View style={styles.row}>
        <Card
          label="Lương cơ bản (h)"
          value={salaryCriteriaData.baseSalary.toLocaleString() + " đ"}
          iconName="cash"
          color="#06b6d4"
        />
        <Card
          label="Phụ cấp"
          value={salaryCriteriaData.allowance.toLocaleString() + " đ"}
          iconName="gift"
          color="#10b981"
        />
      </View>
      
      <View style={styles.row}>
        <Card
          label="Lương tăng ca (h)"
          value={salaryCriteriaData.overtimeSalary.toLocaleString() + " đ"}
          iconName="time"
          color="#f59e0b"
        />
        <Card
          label="Phạt đi muộn (l)"
          value={salaryCriteriaData.lateFine.toLocaleString() + " đ"}
          iconName="warning"
          color="#ef4444"
        />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "400",
  },
  infoSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    lineHeight: 20,
  },
  cardsGrid: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  cardContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
});

export default SalaryCriteria;
