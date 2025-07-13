import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { formatCurrency } from "../../utils/string";
import { Salary } from "../../models/salary";

// Định nghĩa kiểu prop
type DetailsProps = {
  salaryData: Salary;
  refreshing: boolean;
  styles: any;
};

const Details = ({ salaryData, refreshing, styles }: DetailsProps) => (
  <>
    {/* Detailed Breakdown */}
    <SafeAreaView style={styles.safeArea}>
      <View style={{ padding: 0 }}>
        {refreshing && (
          <View
            style={{
              padding: 10,
              backgroundColor: "#e3f2fd",
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#3674B5", fontSize: 14 }}>
              Đang cập nhật...
            </Text>
          </View>
        )}
        {/* Summary Card */}
        <LinearGradient
          colors={["#3674B5", "#2196F3"]}
          style={{ borderRadius: 16, padding: 16, marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  opacity: 0.8,
                  marginBottom: 4,
                }}
              >
                Lương cơ bản
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
                {formatCurrency(salaryData.actualSalary)}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: "100%",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  opacity: 0.8,
                  marginBottom: 4,
                }}
              >
                Thực lãnh
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
                {formatCurrency(salaryData.totalSalary)} đ
              </Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.detailSectionCard}>
          <View style={styles.detailSectionHeader}>
            <FontAwesome5 name="money-bill-wave" size={18} color="#3674B5" />
            <Text style={styles.sectionTitle}>Các khoản phụ cấp</Text>
          </View>

          <View style={styles.detailItemCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailItemIconContainer}>
                <Feather name="calendar" size={16} color="#4CAF50" />
              </View>
              <Text style={styles.detailItemLabel}>Phụ cấp ngày công</Text>
              <Text style={styles.detailItemValue}>
                {/* {formatCurrency(salaryData.workingDayAllowance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailItemIconContainer}>
                <Feather name="coffee" size={16} color="#FF9800" />
              </View>
              <Text style={styles.detailItemLabel}>Phụ cấp ăn trưa</Text>
              <Text style={styles.detailItemValue}>
                {/* {formatCurrency(salaryData.mealAllowance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailItemIconContainer}>
                <Feather name="truck" size={16} color="#9C27B0" />
              </View>
              <Text style={styles.detailItemLabel}>Phụ cấp đi lại</Text>
              <Text style={styles.detailItemValue}>
                {/* {formatCurrency(salaryData.transportAllowance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailItemIconContainer}>
                <Feather name="phone" size={16} color="#2196F3" />
              </View>
              <Text style={styles.detailItemLabel}>Phụ cấp điện thoại</Text>
              <Text style={styles.detailItemValue}>
                {/* {formatCurrency(salaryData.phoneAllowance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItemTotal}>
              <Text style={styles.detailItemTotalLabel}>Tổng phụ cấp</Text>
              <Text style={styles.detailItemTotalValue}>
                {/* {formatCurrency(salaryData.totalAllowances)} đ */}
              </Text>
            </View>
          </View>
        </View>

        {/* Deductions Section */}
        <View style={styles.detailSectionCard}>
          <View style={styles.detailSectionHeader}>
            <FontAwesome5 name="hand-holding-usd" size={18} color="#F44336" />
            <Text style={styles.sectionTitle}>Các khoản khấu trừ</Text>
          </View>

          <View style={[styles.detailItemCard, styles.deductionCard]}>
            <View style={styles.detailItem}>
              <View
                style={[
                  styles.detailItemIconContainer,
                  { backgroundColor: "#ffebee" },
                ]}
              >
                <Feather name="shield" size={16} color="#F44336" />
              </View>
              <Text style={styles.detailItemLabel}>Bảo hiểm xã hội (9%)</Text>
              <Text style={[styles.detailItemValue, { color: "#F44336" }]}>
                {/* -{formatCurrency(salaryData.socialInsurance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View
                style={[
                  styles.detailItemIconContainer,
                  { backgroundColor: "#ffebee" },
                ]}
              >
                <Feather name="heart" size={16} color="#F44336" />
              </View>
              <Text style={styles.detailItemLabel}>Bảo hiểm y tế (1.5%)</Text>
              <Text style={[styles.detailItemValue, { color: "#F44336" }]}>
                {/* -{formatCurrency(salaryData.healthInsurance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View
                style={[
                  styles.detailItemIconContainer,
                  { backgroundColor: "#ffebee" },
                ]}
              >
                <Feather name="briefcase" size={16} color="#F44336" />
              </View>
              <Text style={styles.detailItemLabel}>
                Bảo hiểm thất nghiệp (1%)
              </Text>
              <Text style={[styles.detailItemValue, { color: "#F44336" }]}>
                {/* -{formatCurrency(salaryData.unemploymentInsurance)} đ */}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View
                style={[
                  styles.detailItemIconContainer,
                  { backgroundColor: "#ffebee" },
                ]}
              >
                <FontAwesome5
                  name="file-invoice-dollar"
                  size={16}
                  color="#F44336"
                />
              </View>
              <Text style={styles.detailItemLabel}>Thuế thu nhập cá nhân</Text>
              <Text style={[styles.detailItemValue, { color: "#F44336" }]}>
                {/* -{formatCurrency(salaryData.personalIncomeTax)} đ */}
              </Text>
            </View>

            <View style={styles.detailItemTotal}>
              <Text style={styles.detailItemTotalLabel}>Tổng khấu trừ</Text>
              <Text style={[styles.detailItemTotalValue, { color: "#F44336" }]}>
                {/* -{formatCurrency(salaryData.totalDeductions)} đ */}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.netSalaryCard}>
          <Text style={styles.netSalaryCardLabel}>LƯƠNG THỰC LÃNH</Text>
          <Text style={styles.netSalaryCardValue}>
            {formatCurrency(salaryData.totalSalary)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  </>
);

export default Details;
