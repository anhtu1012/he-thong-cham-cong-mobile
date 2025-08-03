import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
import { NavigationContainer } from "@react-navigation/native";
import LoginPage from "./pages/Login";
import AppNavigation from "./components/navigation/app.navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { View, Text, LogBox, Platform, AppState, Alert } from "react-native";
import FloatingChatButton from "./components/FloatingChatButton";
import { enableScreens } from "react-native-screens";
import { RootStackParamList } from "./utils/routes";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { NotificationProvider } from "./contexts/NotificationContext";

// Ignore specific warnings that might clutter logs
LogBox.ignoreLogs([
  "ViewPropTypes will be removed from React Native",
  "AsyncStorage has been extracted from react-native",
  // Ignore any warnings about the packages identified by expo-doctor
  "react-native-chart-kit",
  // Ignore Metro bundler connectivity issues during development
  "No apps connected",
  'Sending "reload" to all React Native apps failed',
]);

// Enable screens for better navigation performance
enableScreens();

// Log version info in development and production
console.log(`
  App Version: ${Constants.expoConfig?.version || "1.0.0"}
  Expo SDK: ${Constants.expoConfig?.sdkVersion || "unknown"}
  Platform: ${Platform.OS} ${Platform.Version}
  Hermes: ${(global as any).HermesInternal ? "Enabled" : "Disabled"}
`);

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: any;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("Navigation error:", error);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "Unknown error";
      const errorStack = this.state.errorInfo?.componentStack || "";

      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#fff",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
              color: "#e74c3c",
            }}
          >
            Có lỗi xảy ra trong ứng dụng
          </Text>
          <Text
            style={{ textAlign: "center", marginBottom: 20, color: "#2c3e50" }}
          >
            Vui lòng khởi động lại ứng dụng hoặc liên hệ hỗ trợ
          </Text>
          <Text
            style={{
              color: "#666",
              fontSize: 12,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {errorMessage}
          </Text>
          {__DEV__ && (
            <Text style={{ color: "#999", fontSize: 10, textAlign: "center" }}>
              {errorStack}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

// Tối ưu hiển thị FloatingChatButton
const FloatingChatButtonMemo = React.memo(FloatingChatButton);

export default function App() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const [isReady, setIsReady] = useState(false);
  // Use ref instead of state to avoid re-renders when tracking routes
  const currentRouteRef = useRef<string>("Login");
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef(null);
  const shouldShowChatButtonRef = useRef(false);

  // Add a small delay to ensure navigation is initialized properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Monitor app state to detect when app goes to background/foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
        // Attempt to reconnect to Metro when app comes to foreground
        if (__DEV__) {
          try {
            // This is a no-op but helps "wake up" the Metro connection
            console.log("Attempting to reconnect to Metro...");
          } catch (e) {
            console.error("Metro reconnection error:", e);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  // Tối ưu hóa handleNavigationStateChange để giảm re-renders
  const handleNavigationStateChange = useCallback((state: any) => {
    try {
      if (!state) return;

      const routes = state.routes;
      const index = state.index ?? 0;

      if (routes?.length > 0 && index >= 0 && index < routes.length) {
        const routeName = routes[index]?.name;
        if (routeName && currentRouteRef.current !== routeName) {
          currentRouteRef.current = routeName;
          shouldShowChatButtonRef.current = routeName !== "Login";
          console.log("Navigation state updated:", routeName);
        }
      }
    } catch (error) {
      console.error("Navigation state tracking error:", error);
    }
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NotificationProvider>
          <NavigationContainer
            ref={navigationRef}
            fallback={<Text>Đang tải...</Text>}
            onStateChange={handleNavigationStateChange}
            onUnhandledAction={(action) => {
              console.warn("Unhandled navigation action:", action);
            }}
          >
            <View style={{ flex: 1 }}>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  animationDuration: 200,
                }}
                initialRouteName="Login"
              >
                <Stack.Screen
                  name="Login"
                  component={LoginPage}
                  options={{
                    gestureEnabled: false,
                    animationTypeForReplace: "push",
                  }}
                />
                <Stack.Screen
                  name="MainAppScreen"
                  component={AppNavigation}
                  options={{
                    gestureEnabled: false,
                    animationTypeForReplace: "push",
                  }}
                />
              </Stack.Navigator>
              <Toast
                config={{
                  SUCCESS: (props) => (
                    <View
                      style={{
                        backgroundColor: '#4CAF50',
                        padding: 15,
                        borderRadius: 8,
                        marginHorizontal: 16,
                        marginTop: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                        {String(props.text1 || '')}
                      </Text>
                      {props.text2 && (
                        <Text style={{ fontSize: 14, color: '#fff', marginTop: 4 }}>
                          {String(props.text2)}
                        </Text>
                      )}
                    </View>
                  ),
                  NOTSUCCESS: (props) => (
                    <View
                      style={{
                        backgroundColor: '#F44336',
                        padding: 15,
                        borderRadius: 8,
                        marginHorizontal: 16,
                        marginTop: 60,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                        {String(props.text1 || '')}
                      </Text>
                      {props.text2 && (
                        <Text style={{ fontSize: 14, color: '#fff', marginTop: 4 }}>
                          {String(props.text2)}
                        </Text>
                      )}
                    </View>
                  ),
                }}
              />
              {currentRouteRef.current !== "Login" && (
                <FloatingChatButtonMemo />
              )}
            </View>
          </NavigationContainer>
        </NotificationProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
