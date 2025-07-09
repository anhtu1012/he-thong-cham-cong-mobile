import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MonthlyTimesheet from "../../pages/Timesheet/MonthlyTimesheet";
import StatsTimesheet from "../../pages/Timesheet/StatsTimesheet";
import WeeklyTimesheet from "../../pages/Timesheet/WeeklyTimesheet";
import {
  TimesheetBottomTabParamList,
  TimesheetTabParamList,
} from "../../utils/routes";
import CameraPage from "../CameraPage";

const { width } = Dimensions.get("window");

// Memoized components
const MemoizedMonthlyTimesheet = memo(MonthlyTimesheet);
const MemoizedWeeklyTimesheet = memo(WeeklyTimesheet);
const MemoizedStatsTimesheet = memo(StatsTimesheet);

// Tab Navigator cho 3 loại hiển thị công
const TopTab = createMaterialTopTabNavigator<TimesheetTabParamList>();
const BottomTab = createBottomTabNavigator<TimesheetBottomTabParamList>();
const Stack = createNativeStackNavigator();

// Màn hình chính của Timesheet có top tabs
const TimesheetMainScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Tối ưu hóa navigation handler
  const handleGoHome = useCallback(() => {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: "MainAppScreen" }], // Updated name
    });
    navigation.dispatch(resetAction);
  }, [navigation]);

  // Handler cho refresh button
  const handleRefresh = useCallback(() => {
    // Implement refresh logic here
    console.log("Refreshing timesheet data...");
  }, []);

  // Tab icons - memoized
  const renderMonthlyIcon = useCallback(
    ({ color }: { color: string }) => (
      <Feather name="calendar" size={18} color={color} style={styles.tabIcon} />
    ),
    []
  );

  const renderWeeklyIcon = useCallback(
    ({ color }: { color: string }) => (
      <MaterialIcons
        name="view-week"
        size={18}
        color={color}
        style={styles.tabIcon}
      />
    ),
    []
  );

  const renderStatsIcon = useCallback(
    ({ color }: { color: string }) => (
      <Feather
        name="bar-chart-2"
        size={18}
        color={color}
        style={styles.tabIcon}
      />
    ),
    []
  );

  // Tab screen options
  const tabScreenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: "#3674B5",
      tabBarInactiveTintColor: "#666",
      tabBarIndicatorStyle: {
        backgroundColor: "#3674B5",
        height: 3,
      },
      tabBarLabelStyle: {
        fontSize: 14,
        fontWeight: "500" as const,
        textTransform: "none" as const,
      },
      tabBarItemStyle: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
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
    }),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#3674B5", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoHome}>
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bảng chấm công</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <TopTab.Navigator screenOptions={tabScreenOptions}>
        <TopTab.Screen
          name="MonthlyTimesheet"
          component={MemoizedMonthlyTimesheet}
          options={{
            tabBarLabel: "Công tháng",
            tabBarIcon: renderMonthlyIcon,
          }}
        />
        <TopTab.Screen
          name="WeeklyTimesheet"
          component={MemoizedWeeklyTimesheet}
          options={{
            tabBarLabel: "Công tuần",
            tabBarIcon: renderWeeklyIcon,
          }}
        />
        <TopTab.Screen
          name="StatsTimesheet"
          component={MemoizedStatsTimesheet}
          options={{
            tabBarLabel: "Thống kê",
            tabBarIcon: renderStatsIcon,
          }}
        />
      </TopTab.Navigator>
    </View>
  );
});

// Memoized custom tab button component
const ClockInButton = memo(({ onPress, accessibilityState }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityState={accessibilityState}
      style={{
        width: 50,
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
          width: 100,
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
          bottom: 20,
          textAlign: "center",
          width: 100,
        }}
      >
        Chấm công
      </Text>
    </TouchableOpacity>
  );
});

// Bottom Tabs của Timesheet
const TimesheetBottomTabs = memo(() => {
  // Tab screen options
  const tabScreenOptions = useMemo(
    () => ({
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
    }),
    []
  );

  // Memoized tab icons - moved inside component
  const renderAttendanceIcon = useCallback(
    ({ color }: { color: string }) => (
      <AntDesign name="checkcircle" size={22} color={color} />
    ),
    []
  );

  const renderUserProfileIcon = useCallback(
    ({ color }: { color: string }) => (
      <Feather name="user" size={22} color={color} />
    ),
    []
  );

  // Memoize custom tab bar button renderer
  const renderDetailsTabButton = useCallback(
    (props: any) => <ClockInButton {...props} />,
    []
  );

  return (
    <BottomTab.Navigator screenOptions={tabScreenOptions}>
      <BottomTab.Screen
        name="AttendanceTab" // Updated name
        component={TimesheetMainScreen}
        options={{
          tabBarIcon: renderAttendanceIcon,
          tabBarLabel: "Điểm danh",
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
      <BottomTab.Screen
        name="DetailsTab" // Updated name
        component={CameraPage}
        options={{
          tabBarLabel: () => null,
          tabBarButton: renderDetailsTabButton,
        }}
      />
      <BottomTab.Screen
        name="UserProfileTab" // Updated name
        component={TimesheetMainScreen}
        options={{
          tabBarIcon: renderUserProfileIcon,
          tabBarLabel: "Cá nhân",
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
    </BottomTab.Navigator>
  );
});

// Stack Navigator bọc TimesheetScreen
const TimesheetNavigator = () => {
  // Screen options
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
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

export default memo(TimesheetNavigator);
