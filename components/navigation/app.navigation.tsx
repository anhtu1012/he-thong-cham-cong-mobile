import { Entypo } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import React, { lazy } from "react";
import {
  Pressable,
  Text,
  View,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ChatAppPage from "../../pages/Chat";
import CreateFormPage from "../../pages/CreateForm";
import FormDetail from "../../pages/CreateForm/FormDetail";
import { NavigationProps } from "../../pages/Login";
import ProfilePage from "../../pages/Profile";
import SalaryPage from "../../pages/Salary";
import TimesheetPage from "../../pages/Timesheet";
import {
  DrawerParamList,
  RootStackParamList,
  TabParamList,
} from "../../utils/routes";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationProp } from "@react-navigation/native";
import HomePage from "../../pages/Home";

export type AppStackParamList = {
  Login: undefined;
  AppNavigation: undefined;
};

const HomeLayout = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="home"
        component={HomePage}
        options={{
          title: "Trang chủ",
        }}
      />
      {/* <Stack.Screen
        name="SurveyDetail"
        component={SurveyDetail}
        options={{ headerShown: false }}
      /> */}
    </Stack.Navigator>
  );
};

const BottomTabNavigation = () => {
  const Tab = createBottomTabNavigator<TabParamList>();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

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
        name="Home"
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
        name="CreateForm"
        component={CreateFormPage}
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
        name="Timesheet"
        component={TimesheetPage}
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(CommonActions.navigate("TimesheetNav"));
          },
        })}
      />
      <Tab.Screen
        name="Salary"
        component={SalaryPage}
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
        name="Menu"
        component={View}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.openDrawer();
          },
        }}
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
};

// Animated Tab Bar Icon component
interface TabBarIconProps {
  focused: boolean;
  name: string;
  color: string;
  size: number;
  iconType?: "AntDesign" | "MaterialIcons" | "Entypo";
}

const TabBarIcon = ({
  focused,
  name,
  color,
  size,
  iconType = "AntDesign",
}: TabBarIconProps) => {
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
  }, [focused]);

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
};

// Custom Tab Bar with background
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) => {
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

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Special case for Timesheet tab
          if (route.name === "Timesheet") {
            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
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

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
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
};

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
  const navigation = useNavigation<NavigationProps>();

  // Thêm root stack để quản lý NavigationContainer
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  const MainDrawer = () => {
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
        drawerContent={(props) => (
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
                ([key, descriptor], index) => (
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
              onPress={() => navigation.navigate("Login")}
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
        )}
      >
        <Drawer.Screen
          name="HomeTabs"
          component={BottomTabNavigation}
          options={{
            title: "Trang chủ",
          }}
        />

        <Drawer.Screen
          name="ChatApp"
          component={ChatAppPage}
          options={{
            title: "Chat App",
          }}
        />

        <Drawer.Screen
          name="Profile"
          component={ProfilePage}
          options={{
            title: "Thông tin cá nhân",
          }}
        />
      </Drawer.Navigator>
    );
  };

  // Render RootStack với Drawer và TimesheetNavigator
  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="AppNavigation"
    >
      <RootStack.Screen name="AppNavigation" component={MainDrawer} />
      <RootStack.Screen name="TimesheetNav" component={TimesheetPage} />
      <RootStack.Screen name="FormDetail" component={FormDetail} />
    </RootStack.Navigator>
  );
}

export default AppNavigation;
