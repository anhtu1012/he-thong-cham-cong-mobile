import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import { loginUser } from "../../service/api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export interface ILoginScreenProps {
  onEyePress?: () => void;
}

export type NavigationProps = {
  navigate: (screen: string) => void;
  reset: (state: { index: number; routes: { name: string }[] }) => void;
};

// Token validation utility
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const LoginPage: React.FC<ILoginScreenProps> = ({ onEyePress }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const handleIsLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("userData");

        if (token && userData) {
          // Check if token is still valid
          if (isTokenValid(token)) {
            // Token is valid, auto login
            navigation.reset({
              index: 0,
              routes: [{ name: "MainAppScreen" }],
            });
          } else {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(["token", "userData"]);
            Toast.show({
              type: "info",
              text1: "Phiên đăng nhập đã hết hạn",
              text1Style: { textAlign: "center", fontSize: 16 },
            });
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        // Clear any corrupted data
        await AsyncStorage.multiRemove(["token", "userData"]);
      }
    };
    handleIsLogin();
  }, []);

  const handleEyePress = () => {
    setPasswordVisible((oldValue) => !oldValue);
    onEyePress?.();
  };

  const handleLogin = async () => {
    try {
      console.log(userName, password);
      // Simulating login
      // In a real app, uncomment this code

      const response = await loginUser({ username: userName, password });

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công!",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
        await AsyncStorage.setItem("token", response.data.accessToken);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(response.data.userProfile)
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "MainAppScreen" }],
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Tài khoản hoặc mật khẩu không đúng!",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      }

      // Demo navigation - remove in production
      navigation.reset({
        index: 0,
        routes: [{ name: "MainAppScreen" }],
      });
    } catch (error: any) {
      if (error.status == 401) {
        Toast.show({
          type: "error",
          text1: "Tài khoản hoặc mật khẩu không đúng!",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập. Vui lòng thử lại sau!",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#3674B5", "#2196F3"]}
          style={styles.gradientContainer}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Logo and Header */}
            <View style={styles.headerContainer}>
              <Image
                source={require("../../assets/Psychologist.png")}
                style={styles.logo}
              />
              <Text style={styles.appTitle}>Attendance System</Text>
              <Text style={styles.appSubtitle}>Employee Portal</Text>
            </View>
          </SafeAreaView>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
              <Text style={styles.loginPrompt}>Đăng nhập để tiếp tục</Text>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Feather name="user" size={20} color="#3674B5" />
                </View>
                <TextInput
                  onChangeText={setUserName}
                  value={userName}
                  placeholder="Tên đăng nhập"
                  placeholderTextColor="#999"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Feather name="lock" size={20} color="#3674B5" />
                </View>
                <TextInput
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#999"
                  style={styles.input}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={handleEyePress}
                >
                  <Feather
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={20}
                    color="#3674B5"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && (
                      <Feather name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#3674B5", "#2196F3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  Chưa có tài khoản?{" "}
                  <TouchableOpacity>
                    <Text style={styles.registerText}>Đăng ký</Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.05,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -height * 0.1,
  },
  formCard: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 8,
  },
  loginPrompt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3674B5",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#3674B5",
  },
  rememberText: {
    fontSize: 14,
    color: "#666",
  },
  forgotText: {
    fontSize: 14,
    color: "#3674B5",
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footerContainer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  registerText: {
    color: "#3674B5",
    fontWeight: "500",
  },
});

export default LoginPage;
