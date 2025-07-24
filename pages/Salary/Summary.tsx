import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons";
import { formatCurrency } from "../../utils/string";
import { Salary } from "../../models/salary";

type SummaryProps = {
  salaryData: Salary;
  chartData: any;
  width: number;
  styles: any;
};

const Summary = ({ salaryData, chartData, width, styles }: SummaryProps) => (
  <>
    {/* Salary Summary */}
    <LinearGradient
      colors={["#3674B5", "#2196F3"]}
      style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}
    >
      <Text style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>
        Tổng thu nhập
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8 }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          {formatCurrency(salaryData.totalSalary)}
        </Text>
      </View>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor:
              salaryData.status === "NOTPAID" ? "#e47105ff" : "#21f360ff",
            marginRight: 6,
          }}
        />
        <Text style={{ fontSize: 12, color: "#fff", opacity: 0.9 }}>
          {salaryData.status === "NOTPAID" ? "Chưa tất toán" : "Đã tất toán"}
          {salaryData.paidDate}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: 12,
          marginTop: 16,
        }}
      >
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
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
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
            Ngày công
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
            {salaryData.workDay} ngày
          </Text>
        </View>
      </View>
    </LinearGradient>
    {/* Main Components */}
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
          marginBottom: 16,
        }}
      >
        Thành phần lương
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#f5f5f5",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Feather name="briefcase" size={20} color="#3674B5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#333",
              marginBottom: 3,
            }}
          >
            Lương cơ bản
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            {salaryData.totalWorkHour} giờ *{" "}
            {formatCurrency(salaryData.baseSalary)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: "#333",
            textAlign: "right",
          }}
        >
          {formatCurrency(salaryData.actualSalary)}
        </Text>
      </View>
      <View style={styles.componentRow}>
        <View style={styles.componentIcon}>
          <Feather name="clock" size={20} color="#FF9800" />
        </View>
        <View style={styles.componentInfo}>
          <Text style={styles.componentLabel}>Lương làm thêm</Text>
          <Text style={styles.componentDescription}>
            {salaryData.overtimeSalary} giờ ×
            {formatCurrency(salaryData.overTimeSalaryPosition)}
          </Text>
        </View>
        <Text style={styles.componentValue}>
          {formatCurrency(
            (salaryData.overTimeSalaryPosition ?? 0) *
              (salaryData.overtimeSalary ?? 0)
          )}
        </Text>
      </View>

      <View style={styles.componentRow}>
        <View style={styles.componentIcon}>
          <Feather name="plus-circle" size={20} color="#4CAF50" />
        </View>
        <View style={styles.componentInfo}>
          <Text style={styles.componentLabel}>Tổng phụ cấp</Text>
          <Text style={styles.componentDescription}>
            Ăn trưa, đi lại, iện thoại, ngày công
          </Text>
        </View>
        <Text style={styles.componentValue}>
          {formatCurrency(salaryData.allowance)}
        </Text>
      </View>

      <View style={styles.componentRow}>
        <View style={styles.componentIcon}>
          <Feather name="clock" size={20} color="#F44336" />
        </View>
        <View style={styles.componentInfo}>
          <Text style={styles.componentLabel}>Tiền phạt</Text>
          <Text style={styles.componentDescription}>
            Đi muộn, quên chấm công ({salaryData.lateTimeCount}) lần ....
          </Text>
        </View>
        <Text style={[styles.componentValue, { color: "#F44336" }]}>
          -
          {formatCurrency(
            (salaryData.lateFine ?? 0) * (salaryData.lateTimeCount ?? 0)
          )}
        </Text>
      </View>
      <View style={styles.componentRow}>
        <View style={styles.componentIcon}>
          <Feather name="minus-circle" size={20} color="#F44336" />
        </View>
        <View style={styles.componentInfo}>
          <Text style={styles.componentLabel}>Khấu trừ</Text>
          <Text style={styles.componentDescription}>
            BHXH, BHYT, BHTN, Thuế TNCN
          </Text>
        </View>
        <Text style={[styles.componentValue, { color: "#F44336" }]}>
          -{formatCurrency(salaryData.deductionFee)}
        </Text>
      </View>

      <View style={styles.netSalaryRow}>
        <Text style={styles.netSalaryLabel}>LƯƠNG THỰC LÃNH</Text>
        <Text style={styles.netSalaryAmount}>
          {formatCurrency(salaryData.totalSalary)}
        </Text>
      </View>
    </View>
    {/* Salary Chart */}
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
          marginBottom: 16,
        }}
      >
        Biểu ồ lương 6 tháng gần nhất
      </Text>
      <LineChart
        data={chartData}
        width={width - 32}
        height={180}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(54, 116, 181, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "4", strokeWidth: "2", stroke: "#3674B5" },
          propsForLabels: { fontSize: 10 },
        }}
        bezier
        style={{ marginTop: 8, borderRadius: 16 }}
      />
    </View>
  </>
);

export default Summary;
