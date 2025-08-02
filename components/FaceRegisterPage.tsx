import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { checkMultipleFace, registerFace } from "../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../pages/Login";

export default function FaceRegisterPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("front");
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingFace, setIsUpdatingFace] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NavigationProps | any>();

  // Pulse animation for shutter button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Corner animation for face guide
  useEffect(() => {
    const cornerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    cornerAnimation.start();

    return () => cornerAnimation.stop();
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      let userDataStr = await AsyncStorage.getItem("userData");
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setUserProfile(user);
      }
    };
    getUserProfile();
  });

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Cho phép ứng dụng truy cập camera để chụp ảnh.
        </Text>
        <Button onPress={requestPermission} title="Cho phép" />
      </View>
    );
  }

  const handleGoBack = () => {
    // Use CommonActions for more reliable navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "DrawerHomeScreen" }],
      })
    );
  };
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo!.uri);
    if (userProfile.faceImg) {
      setIsUpdatingFace(false);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    console.log({ video });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleRegisterFace = async () => {
    if (!uri) return;

    setIsProcessing(true);
    let userDataStr = await AsyncStorage.getItem("userData");
    if (userDataStr !== null) {
      const user = JSON.parse(userDataStr);
      try {
        // validation face image
        const faceFormData = new FormData();
        faceFormData.append("img", {
          uri: uri,
          type: "image/jpeg",
          name: "face.jpg",
        } as any);

        await checkMultipleFace(faceFormData);

        // store face to minio
        const formData = new FormData();
        formData.append("key", `face/${user.userName}.jpg`);
        formData.append("userCode", user.code);
        formData.append("file", {
          uri: uri,
          type: "image/jpeg",
          name: "face.jpg",
        } as any);

        await registerFace(formData);

        Toast.show({
          type: "success",
          text1: "Đăng ký khuôn mặt thành công!",
          text1Style: { textAlign: "center", fontSize: 16 },
        });
        navigation.navigate("DrawerHomeScreen");
      } catch (error: any) {
        console.log("Upload error:", error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.error,
          text1Style: { textAlign: "center", fontSize: 16 },
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const renderPicture = () => {
    return (
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        style={styles.pictureContainer}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="face-retouching-natural"
              size={40}
              color="#fff"
            />
          </View>
          <Text style={styles.pictureTitle}>Đăng ký khuôn mặt</Text>
          <Text style={styles.pictureSubtitle}>
            Kiểm tra ảnh và xác nhận để hoàn tất đăng ký
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri }}
              contentFit="cover"
              style={styles.capturedImage}
            />
            <View style={styles.imageOverlay} />
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingContent}>
                  <ActivityIndicator size="large" color="#4facfe" />
                  <Text style={styles.processingText}>Đang xử lý...</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.actionButton, styles.retakeButton]}
            onPress={() => setUri(null)}
            disabled={isProcessing}
          >
            {({ pressed }) => (
              <View style={[styles.buttonContent, pressed && styles.pressed]}>
                <AntDesign name="reload1" size={20} color="#4facfe" />
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleRegisterFace()}
            disabled={isProcessing}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={
                  isProcessing ? ["#ccc", "#999"] : ["#4facfe", "#00f2fe"]
                }
                style={[styles.buttonGradient, pressed && styles.pressed]}
              >
                {isProcessing ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <AntDesign name="check" size={20} color="white" />
                )}
                <Text style={styles.confirmButtonText}>
                  {isProcessing ? "Đang xử lý..." : "Đăng ký"}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </LinearGradient>
    );
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
          mirror={facing === "front"}
          responsiveOrientationWhenOrientationLocked
        >
          {/* Face Detection Overlay */}
          <View style={styles.overlay}>
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "transparent"]}
              style={styles.topOverlay}
            >
              <View style={styles.statusContainer}>
                <View style={styles.modernModeIndicator}>
                  <MaterialIcons
                    name={mode === "picture" ? "camera-alt" : "videocam"}
                    size={18}
                    color="white"
                  />
                  <Text style={styles.modeText}>
                    {mode === "picture" ? "Ảnh" : "Video"}
                  </Text>
                </View>
              </View>

              <Text style={styles.modernInstructionText}>
                Đặt khuôn mặt vào khung hình để đăng ký
              </Text>
            </LinearGradient>

            {/* Face Detection Guide */}
            <View style={styles.faceGuideContainer}>
              <View style={styles.faceGuide}>
                <Animated.View
                  style={[
                    styles.cornerTopLeft,
                    {
                      shadowOpacity: cornerAnim,
                      elevation: cornerAnim,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.cornerTopRight,
                    {
                      shadowOpacity: cornerAnim,
                      elevation: cornerAnim,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.cornerBottomLeft,
                    {
                      shadowOpacity: cornerAnim,
                      elevation: cornerAnim,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.cornerBottomRight,
                    {
                      shadowOpacity: cornerAnim,
                      elevation: cornerAnim,
                    },
                  ]}
                />
                <View style={styles.scanLine} />
              </View>
            </View>

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.bottomOverlay}
            />
          </View>

          {/* Camera Controls */}
          <View style={styles.controlsContainer}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <Pressable style={styles.controlButton} onPress={toggleFacing}>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.modernControlButton,
                      pressed && styles.controlPressed,
                    ]}
                  >
                    <FontAwesome6 name="rotate" size={20} color="white" />
                  </View>
                )}
              </Pressable>
            </View>

            {/* Bottom Controls */}
            <View style={styles.shutterContainer}>
              <Pressable style={styles.modeToggle} onPress={toggleMode}>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.modernModeToggle,
                      pressed && styles.controlPressed,
                    ]}
                  >
                    {mode === "picture" ? (
                      <Feather name="video" size={24} color="white" />
                    ) : (
                      <AntDesign name="picture" size={24} color="white" />
                    )}
                    <Text style={styles.modeToggleText}>
                      {mode === "picture" ? "Video" : "Ảnh"}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={mode === "picture" ? takePicture : recordVideo}
              >
                {({ pressed }) => (
                  <Animated.View
                    style={[
                      styles.shutterButtonContainer,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.modernShutterBtn,
                        {
                          transform: [{ scale: pressed ? 0.9 : 1 }],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={
                          mode === "picture"
                            ? ["#fff", "#f0f0f0"]
                            : recording
                            ? ["#ff6b6b", "#ff5252"]
                            : ["#ff6b6b", "#ff5252"]
                        }
                        style={styles.shutterGradient}
                      />
                      {recording && (
                        <View style={styles.modernRecordingIndicator}>
                          <View style={styles.recordingPulse} />
                        </View>
                      )}
                    </View>
                    {recording && (
                      <Text style={styles.modernRecordingText}>REC</Text>
                    )}
                  </Animated.View>
                )}
              </Pressable>

              <View style={styles.placeholder} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  };

  const renderUserImage = () => {
    return (
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        style={styles.pictureContainer}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="face-retouching-natural"
              size={40}
              color="#fff"
            />
          </View>
          <Text style={styles.pictureTitle}>Bạn đã đăng ký khuôn mặt</Text>
          <Text style={styles.pictureSubtitle}>
            Chụp lại để cập nhật khuôn mặt mới
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={uri ? uri : userProfile.faceImg}
              contentFit="cover"
              style={styles.capturedImage}
            />
            <View style={styles.imageOverlay} />
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingContent}>
                  <ActivityIndicator size="large" color="#4facfe" />
                  <Text style={styles.processingText}>Đang xử lý...</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.actionButton, styles.retakeButton]}
            onPress={() => {
              setUri(null);
              setIsUpdatingFace(true);
            }}
            disabled={isProcessing}
          >
            {({ pressed }) => (
              <View style={[styles.buttonContent, pressed && styles.pressed]}>
                <AntDesign name="reload1" size={20} color="#4facfe" />
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleRegisterFace()}
            disabled={isProcessing || !uri}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={
                  isProcessing || !uri
                    ? ["#ccc", "#999"]
                    : ["#4facfe", "#00f2fe"]
                }
                style={[styles.buttonGradient, pressed && styles.pressed]}
              >
                {isProcessing ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <AntDesign name="check" size={20} color="white" />
                )}
                <Text style={styles.confirmButtonText}>
                  {isProcessing ? "Đang xử lý..." : "Cập nhật"}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký khuôn mặt</Text>
        <TouchableOpacity style={styles.moreButton}>
          <AntDesign name="ellipsis1" size={24} color="#3674B5" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {userProfile?.faceImg != null && !isUpdatingFace
          ? renderUserImage()
          : uri
          ? renderPicture()
          : renderCamera()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  moreButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
    width: "100%",
  },

  // Modern overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topOverlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bottomOverlay: {
    flex: 1,
  },

  // Modern status and instructions
  statusContainer: {
    alignItems: "center",
    marginBottom: 30,
    height: 50,
  },
  modernModeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
    backdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  modeText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  modernInstructionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },

  // Enhanced face detection guide
  faceGuideContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  faceGuide: {
    width: 300,
    height: 380,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#4facfe",
    borderTopLeftRadius: 12,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#4facfe",
    borderTopRightRadius: 12,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 50,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#4facfe",
    borderBottomLeftRadius: 12,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 50,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#4facfe",
    borderBottomRightRadius: 12,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4facfe",
    opacity: 0.8,
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 5,
  },

  // Modern controls
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 50,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 25,
  },
  controlButton: {
    marginLeft: 15,
  },
  modernControlButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(20px)",
  },
  controlPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },

  // Modern shutter controls
  shutterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 35,
  },
  modeToggle: {
    alignItems: "center",
  },
  modernModeToggle: {
    backgroundColor: "rgba(255,255,255,0.15)",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(20px)",
    marginBottom: 8,
  },
  modeToggleText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shutterButtonContainer: {
    alignItems: "center",
  },
  modernShutterBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shutterGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
  },
  modernRecordingIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  recordingPulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ff4444",
    shadowColor: "#ff4444",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 6,
  },
  modernRecordingText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 65,
  },

  // Modern picture preview styles
  pictureContainer: {
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  pictureTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pictureSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 25,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 30,
    overflow: "hidden",
  },
  capturedImage: {
    width: 320,
    height: 320,
    borderRadius: 30,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },
  processingContent: {
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  processingText: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "600",
    color: "#4facfe",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 25,
    paddingBottom: 20,
    gap: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    gap: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
    gap: 10,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  retakeButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  retakeButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4facfe",
  },
  confirmButton: {
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
  },
});
