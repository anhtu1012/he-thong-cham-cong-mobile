import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign, MaterialIcons, Entypo, Feather } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import MonthlyTimesheet from "../../pages/Timesheet/MonthlyTimesheet";
import WeeklyTimesheet from "../../pages/Timesheet/WeeklyTimesheet";
import StatsTimesheet from "../../pages/Timesheet/StatsTimesheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  TimesheetTabParamList,
  TimesheetBottomTabParamList,
} from "../../utils/routes";

const { width } = Dimensions.get("window");

// Tab Navigator cho 3 loại hiển thị công
const TopTab = createMaterialTopTabNavigator<TimesheetTabParamList>();
const BottomTab = createBottomTabNavigator<TimesheetBottomTabParamList>();
const Stack = createNativeStackNavigator();

// Màn hình chính của Timesheet có top tabs
const TimesheetMainScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bảng chấm công</Text>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#3674B5",
          tabBarInactiveTintColor: "#666",
          tabBarIndicatorStyle: {
            backgroundColor: "#3674B5",
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "500",
            textTransform: "none",
          },
          tabBarItemStyle: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            height: 50,
          },
        }}
      >
        <TopTab.Screen
          name="MonthlyTimesheet"
          component={MonthlyTimesheet}
          options={{
            tabBarLabel: "Công tháng",
            tabBarIcon: ({ color }) => (
              <Feather
                name="calendar"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
            ),
          }}
        />
        <TopTab.Screen
          name="WeeklyTimesheet"
          component={WeeklyTimesheet}
          options={{
            tabBarLabel: "Công tuần",
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                name="view-week"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
            ),
          }}
        />
        <TopTab.Screen
          name="StatsTimesheet"
          component={StatsTimesheet}
          options={{
            tabBarLabel: "Thống kê",
            tabBarIcon: ({ color }) => (
              <Feather
                name="bar-chart-2"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
            ),
          }}
        />
      </TopTab.Navigator>
    </View>
  );
};

// Bottom Tabs của Timesheet
const TimesheetBottomTabs = () => {
  const navigation = useNavigation();

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3674B5",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          height: 60,
          paddingBottom: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <BottomTab.Screen
        name="Attendance"
        component={TimesheetMainScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="checkcircle" size={22} color={color} />
          ),
          tabBarLabel: "Điểm danh",
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
      <BottomTab.Screen
        name="Details"
        component={TimesheetMainScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => {
            const { onPress, accessibilityState } = props;
            return (
              <TouchableOpacity
                onPress={onPress}
                accessibilityState={accessibilityState}
                style={{
                  width: 70,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 40,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 30,
                    width: 70,
                    backgroundColor: "#fff",
                  }}
                />
                <LinearGradient
                  colors={["#3674B5", "#2196F3"]}
                  style={{
                    bottom: 25,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 4,
                    borderColor: "#fff",
                    elevation: 6,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.27,
                    shadowRadius: 4.65,
                  }}
                >
                  <Feather name="clock" size={22} color="#fff" />
                </LinearGradient>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#3674B5",
                    fontWeight: "500",
                    bottom: 8,
                  }}
                >
                  Chấm công
                </Text>
              </TouchableOpacity>
            );
          },
        }}
      />
      <BottomTab.Screen
        name="UserProfile"
        component={TimesheetMainScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
          tabBarLabel: "Cá nhân",
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
    </BottomTab.Navigator>
  );
};

// Stack Navigator bọc TimesheetScreen
const TimesheetNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TimesheetBottomTabs"
        component={TimesheetBottomTabs}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerGradient: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  tabIcon: {
    marginRight: 6,
  },
});

export default TimesheetNavigator;
