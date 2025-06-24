import { Entypo } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  DrawerActions,
  NavigationProp,
  ParamListBase,
  useNavigation,
  CommonActions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, memo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ChatAppPage from "../../pages/Chat";
import CreateFormPage from "../../pages/CreateForm";
import FormDetail from "../../pages/CreateForm/FormDetail";
import HomePage from "../../pages/Home";
import ProfilePage from "../../pages/Profile";
import SalaryPage from "../../pages/Salary";
import TimesheetPage from "../../pages/Timesheet";
import { DrawerParamList, TabParamList } from "../../utils/routes";
import TimesheetNavigator from "./timesheet.navigation";
import FormListPage from "../FormListPage";
import FormDetailView from "../FormDetailView";

export type AppStackParamList = {
  Login: undefined;
  MainAppScreen: undefined; // Updated name
};

// Định nghĩa type cho Root Stack
export type RootStackParamList = {
  Login: undefined;
  MainAppScreen: undefined;
  AppNavigationRoot: undefined;
  DrawerHomeScreen: undefined;
  TimesheetNav: undefined;
  FormDetail: { formId: string; formTitle: string };
  FormList: undefined;
  FormDetailView: { formId: string }; // Thêm định nghĩa cho FormDetailView
  HomePage: undefined; // Thêm HomePage vào định nghĩa
};

// Memoized components
const MemoizedHomePage = memo(HomePage);
const MemoizedCreateFormPage = memo(CreateFormPage);
const MemoizedTimesheetPage = memo(TimesheetPage);
const MemoizedSalaryPage = memo(SalaryPage);
const MemoizedChatAppPage = memo(ChatAppPage);
const MemoizedProfilePage = memo(ProfilePage);
const MemoizedFormDetail = memo(FormDetail);
const MemoizedTimesheetNavigator = memo(TimesheetNavigator);

const HomeLayout = memo(() => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator
      initialRouteName="HomePage" // Updated name
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="HomePage" // Updated name
        component={MemoizedHomePage}
        options={{
          title: "Trang chủ",
        }}
      />
    </Stack.Navigator>
  );
});

// Animated Tab Bar Icon component
interface TabBarIconProps {
  focused: boolean;
  name: string;
  color: string;
  size: number;
  iconType?: "AntDesign" | "MaterialIcons" | "Entypo";
}

const TabBarIcon = memo(
  ({ focused, name, color, size, iconType = "AntDesign" }: TabBarIconProps) => {
    const animatedValue = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      if (focused) {
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(animatedValue, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused, animatedValue]);

    const animatedStyle = {
      transform: [{ scale: animatedValue }],
    };

    return (
      <Animated.View style={[animatedStyle, localStyles.iconContainer]}>
        {iconType === "AntDesign" && (
          <AntDesign name={name as any} size={size} color={color} />
        )}
        {iconType === "MaterialIcons" && (
          <MaterialIcons name={name as any} size={size} color={color} />
        )}
        {iconType === "Entypo" && (
          <Entypo name={name as any} size={size} color={color} />
        )}
        {focused && <View style={localStyles.indicator} />}
      </Animated.View>
    );
  }
);

// Custom Tab Bar with background
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar = memo(
  ({ state, descriptors, navigation }: CustomTabBarProps) => {
    // Dùng useCallback cho onPress để tránh tạo hàm mới mỗi lần render
    const getTabPressHandler = useCallback(
      (route: any, isFocused: boolean) => {
        return () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
      },
      [navigation]
    );

    // Handler cho tab Timesheet riêng biệt
    const handleTimesheetTabPress = useCallback(() => {
      const rootNavigation = navigation.getParent()?.getParent();
      if (rootNavigation) {
        const resetAction = CommonActions.reset({
          index: 0,
          routes: [{ name: "TimesheetNav" }],
        });
        rootNavigation.dispatch(resetAction);
      }
    }, [navigation]);

    // Handler cho Menu tab riêng biệt
    const handleMenuTabPress = useCallback(() => {
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.dispatch(DrawerActions.openDrawer());
      }
    }, [navigation]);

    return (
      <View style={localStyles.tabBarContainer}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "#ffffff"]}
          style={localStyles.tabBar}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            // Xử lý các tab đặc biệt
            if (route.name === "TimesheetTab") {
              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={handleTimesheetTabPress}
                  style={localStyles.tabItem}
                >
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? "#3674B5" : "#888",
                    size: 24,
                  })}
                  {options.tabBarLabel({
                    focused: isFocused,
                    color: isFocused ? "#3674B5" : "#888",
                  })}
                </TouchableOpacity>
              );
            }

            if (route.name === "MenuTab") {
              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={handleMenuTabPress}
                  style={localStyles.tabItem}
                >
                  {options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? "#3674B5" : "#888",
                    size: 24,
                  })}
                  <Text
                    style={{
                      color: isFocused ? "#3674B5" : "#888",
                      fontSize: 12,
                      fontWeight: isFocused ? "bold" : "500",
                      marginTop: 3,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={getTabPressHandler(route, isFocused)}
                style={localStyles.tabItem}
              >
                {options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? "#3674B5" : "#888",
                  size: 24,
                })}
                <Text
                  style={{
                    color: isFocused ? "#3674B5" : "#888",
                    fontSize: 12,
                    fontWeight: isFocused ? "bold" : "500",
                    marginTop: 3,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    );
  }
);

const BottomTabNavigation = memo(() => {
  const Tab = createBottomTabNavigator<TabParamList>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3674B5",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          paddingBottom: 5,
          height: 65,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          bottom: 0,
          zIndex: 8,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 3,
          marginBottom: 5,
          fontWeight: "500",
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab" // Updated name
        component={HomeLayout}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="home"
              color={color}
              size={size}
            />
          ),
          title: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="CreateFormTab" // Updated name
        component={MemoizedCreateFormPage}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="form"
              color={color}
              size={size}
            />
          ),
          title: "Tạo đơn",
        }}
      />
      <Tab.Screen
        name="TimesheetTab" // Updated name
        component={MemoizedTimesheetPage}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 30,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 0,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={
                  focused ? ["#3674B5", "#0d47a1"] : ["#e0e0e0", "#bdbdbd"]
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AntDesign name="calendar" size={24} color={"white"} />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? "#3674B5" : "#888",
                fontSize: 12,
                fontWeight: focused ? "bold" : "500",
                marginBottom: 5,
              }}
            >
              Bảng công
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="SalaryTab" // Updated name
        component={MemoizedSalaryPage}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="attach-money"
              color={color}
              size={size}
              iconType="MaterialIcons"
            />
          ),
          title: "Bảng lương",
        }}
      />
      <Tab.Screen
        name="MenuTab" // Updated name
        component={View}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              focused={focused}
              name="menu"
              color={color}
              size={size}
              iconType="Entypo"
            />
          ),
          title: "Menu",
        }}
      />
    </Tab.Navigator>
  );
});

const localStyles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBar: {
    flexDirection: "row",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 25,
  },
  indicator: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3674B5",
  },
});

function AppNavigation() {
  const Drawer = createDrawerNavigator<DrawerParamList>();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // Thêm root stack để quản lý NavigationContainer
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  // Xử lý logout - memoized
  const handleLogout = useCallback(() => {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    navigation.dispatch(resetAction);
  }, [navigation]);

  // Custom drawer content - memoized
  const renderDrawerContent = useCallback(
    (props: any) => {
      return (
        <>
          <Text
            style={{
              padding: 16,
              fontSize: 20,
              fontWeight: "bold",
              color: "#3674B5",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              marginTop: 30,
            }}
          >
            HỆ THỐNG CHẤM CÔNG
          </Text>
          {props.descriptors &&
            Object.entries(props.descriptors).map(
              ([key, descriptor]: [string, any], index: number) => (
                <Pressable
                  key={key}
                  onPress={() =>
                    props.navigation.navigate(descriptor.route.name)
                  }
                  style={({ pressed }) => ({
                    backgroundColor: pressed
                      ? "#f0f0f0"
                      : props.state.index === index
                      ? "#A1E3F9"
                      : "transparent",
                    borderRadius: 8,
                  })}
                >
                  <Text
                    style={{
                      padding: 16,
                      color: props.state.index === index ? "#3674B5" : "#333",
                      fontWeight:
                        props.state.index === index ? "600" : "normal",
                      fontSize: 16,
                    }}
                  >
                    {descriptor.options.title || descriptor.route.name}
                  </Text>
                </Pressable>
              )
            )}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              marginTop: 10,
              padding: 16,
              width: 300,
              backgroundColor: pressed ? "tomato" : "#3674B5",
              borderRadius: 8,
              alignSelf: "center",
            })}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Đăng xuất
            </Text>
          </Pressable>
        </>
      );
    },
    [handleLogout]
  );

  // MainDrawer memoized
  const MainDrawer = useCallback(() => {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerItemStyle: {
            backgroundColor: "#9dd3c8",
            borderColor: "black",
            width: "100%",
            opacity: 0.6,
          },
        }}
        drawerContent={renderDrawerContent}
      >
        <Drawer.Screen
          name="HomeDrawer" // Updated name
          component={BottomTabNavigation}
          options={{
            title: "Trang chủ",
          }}
        />

        <Drawer.Screen
          name="ChatAppDrawer" // Updated name
          component={MemoizedChatAppPage}
          options={{
            title: "Chat App",
          }}
        />

        <Drawer.Screen
          name="ProfileDrawer" // Updated name
          component={MemoizedProfilePage}
          options={{
            title: "Thông tin cá nhân",
          }}
        />
      </Drawer.Navigator>
    );
  }, [renderDrawerContent]);

  // Memoized MainDrawer component
  const MemoizedMainDrawer = useMemo(() => <MainDrawer />, [MainDrawer]);

  // Render RootStack với Drawer và TimesheetNavigator
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // Consistent animation
      }}
      initialRouteName="DrawerHomeScreen" // Renamed to avoid conflicts
    >
      <RootStack.Screen
        name="DrawerHomeScreen" // Renamed from AppNavigationRoot
        component={MainDrawer}
        options={{
          animationTypeForReplace: "pop",
        }}
      />
      <RootStack.Screen
        name="TimesheetNav"
        component={MemoizedTimesheetNavigator}
        options={{
          animation: "slide_from_right",
        }}
      />
      <RootStack.Screen
        name="FormDetail"
        component={MemoizedFormDetail}
        options={{
          animation: "slide_from_right",
        }}
      />
      <RootStack.Screen
        name="FormList"
        component={FormListPage}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="FormDetailView"
        component={FormDetailView}
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </RootStack.Navigator>
  );
}

export default memo(AppNavigation);
