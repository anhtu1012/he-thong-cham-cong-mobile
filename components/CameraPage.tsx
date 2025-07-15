import * as Location from "expo-location";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import {
  compareFace,
  getAddress,
  getBranchDetail,
  getUserFaceImg,
  timeKeepingCheckIn,
  timeKeepingCheckOut,
} from "../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkInValues, checkOutValues } from "../models/timekeeping";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../pages/Login";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";
import { getCurrentDateRes } from "../utils/dateUtils";
import LocationModal from "./LocationModal";
import { isTheSameZone } from "../utils/distanceUtils";

export default function CameraPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("front");
  const [recording, setRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationModalProps, setLocationModalProps] = useState<{
    visible: boolean;
    place1: string;
    place2: string;
    isInTheSameZone: boolean;
    onContinue?: () => void;
    onGoBack?: () => void;
  }>({
    visible: false,
    place1: "",
    place2: "",
    isInTheSameZone: false,
    onContinue: undefined,
    onGoBack: undefined,
  });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NavigationProps>();

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

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo!.uri);
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

  const handleTimekeeping = async () => {
    try {
      const currentTimeScheduleDateStr = await AsyncStorage.getItem(
        "currentTimeScheduleDate"
      );

      if (currentTimeScheduleDateStr) {
        const currentTimeScheduleDate = JSON.parse(currentTimeScheduleDateStr);

        await handleFaceRecognition();
        if (currentTimeScheduleDate.status === "NOTSTARTED") {
          await handleCheckIn();
        } else if (currentTimeScheduleDate.status === "ACTIVE") {
          await handleCheckOut();
        }
      }

      Toast.show({
        type: "success",
        text1: "Chấm công thành công",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
      navigation.navigate("DrawerHomeScreen");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: `${error.message}` || "Có lỗi xảy ra khi xử lý dữ liệu!",
        text1Style: { textAlign: "center", fontSize: 16 },
      });
    }
  };

  const handleFaceRecognition = async () => {
    if (!uri) return;

    setIsProcessing(true);
    let userDataStr = await AsyncStorage.getItem("userData");
    if (!userDataStr) {
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      const user = JSON.parse(userDataStr);

      // Binary image response
      const userImgRes = await getUserFaceImg(`${user.userName}.jpg`);
      const binary = userImgRes.data;

      //  Convert binary to base64
      const base64Data = Buffer.from(binary, "binary").toString("base64");

      // Save it to Expo's cache
      const userImgPath = `${FileSystem.cacheDirectory}${user.userName}.jpg`;
      await FileSystem.writeAsStringAsync(userImgPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Attach images to FormData
      formData.append("refImg", {
        uri: userImgPath,
        type: "image/jpeg",
        name: `${user.userName}.jpg`,
      } as any);

      formData.append("comparedImg", {
        uri,
        type: "image/jpeg",
        name: "face.jpg",
      } as any);

      const res = await compareFace(formData);
      const data = res.data;
      if (!data.matched) {
        throw new Error("Khuôn mặt không trùng khớp");
      }
    } catch (err) {
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckAddress = async () => {
    setIsProcessing(true); // Bắt đầu loading
    try {
      // get current date data
      const currentTimeScheduleDateStr = await AsyncStorage.getItem(
        "currentTimeScheduleDate"
      );
      if (currentTimeScheduleDateStr) {
        // get current date's branch code
        const currentTimeScheduleDate = JSON.parse(currentTimeScheduleDateStr);

        try {
          // get branch detail
          const branchDetailRes = await getBranchDetail(
            currentTimeScheduleDate.branchCode
          );
          const branchDetail = branchDetailRes.data.data[0];

          // get lat and long from branch detail
          const { lat: branchLat, long: branchLong } = branchDetail;
          console.log("Branch Location: ", branchLat, branchLong);

          // Request permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            throw new Error("Location permission denied");
          }

          // Get current position
          const location = await Location.getCurrentPositionAsync({});
          const { latitude: currLat, longitude: currLong } = location.coords;
          console.log("Current Location: ", currLat, currLong);

          //------------------------ old code ------------------------
          // get address detail from latitude and longitude
          // const addressRes = await getAddress({
          //   longitude: longitude.toString(),
          //   latitude: latitude.toString(),
          // });
          // const address = addressRes.data;
          // compare address line with current date address line
          // const addressLine = address.results[0].formatted_address;
          //------------------------ old code ------------------------

          // check if current location is within 100m of the branch
          const result = isTheSameZone(
            branchLat,
            branchLong,
            currLat,
            currLong
          );
          console.log("Location check result: ", result);

          const currentDateAddressLine = currentTimeScheduleDate.addressLine;

          // set location modal props
          setLocationModalProps({
            visible: true,
            place1: `${currLat}, ${currLong}`,
            place2: currentDateAddressLine,
            isInTheSameZone: result,
            onContinue: handleTimekeeping,
            onGoBack: () => {
              navigation.navigate("AttendanceTab");
              setLocationModalProps((prev) => ({
                ...prev,
                visible: false,
              }));
            },
          });

          if (!result) {
            throw new Error("Địa chỉ chấm công không khớp");
          } else {
          }
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false); // Kết thúc loading
    }
  };

  const handleCheckIn = async () => {
    console.log("handleCheckIn called");

    const currentTimeScheduleDateStr = await AsyncStorage.getItem(
      "currentTimeScheduleDate"
    );
    const userStr = await AsyncStorage.getItem("userData");

    if (currentTimeScheduleDateStr && userStr) {
      const user = JSON.parse(userStr);
      const currentTimeScheduleDate = JSON.parse(currentTimeScheduleDateStr);

      const payload: checkInValues = {
        userCode: user.code,
        checkInTime: getCurrentDateRes(),
      };

      try {
        const res = await timeKeepingCheckIn(
          currentTimeScheduleDate.id,
          payload
        );
        console.log("Check-in response: ", res.status);

        if (res.status !== 200) {
          throw new Error("Chấm công thất bại");
        }
      } catch (err) {
        throw err;
      }
    }
  };

  const handleCheckOut = async () => {
    console.log("handleCheckOut called");
    const currentTimeScheduleDateStr = await AsyncStorage.getItem(
      "currentTimeScheduleDate"
    );

    if (currentTimeScheduleDateStr) {
      const currentTimeScheduleDate = JSON.parse(currentTimeScheduleDateStr);
      const payload: checkOutValues = {
        workingScheduleCode: currentTimeScheduleDate.code,
        checkOutTime: getCurrentDateRes(),
      };

      try {
        const res = await timeKeepingCheckOut(
          currentTimeScheduleDate.timeKeepingId,
          payload
        );
        if (res.status !== 200) {
          throw new Error("Chấm công thất bại");
        }
      } catch (err) {
        throw err;
      }
    }
  };

  const renderPicture = () => {
    return (
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
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
          <Text style={styles.pictureTitle}>Xác nhận khuôn mặt</Text>
          <Text style={styles.pictureSubtitle}>
            Kiểm tra ảnh và xác nhận để tiếp tục chấm công
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
                  <ActivityIndicator size="large" color="#667eea" />
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
                <AntDesign name="reload1" size={20} color="#667eea" />
                <Text style={styles.retakeButtonText}>Chụp lại</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleCheckAddress()}
            disabled={isProcessing}
          >
            {({ pressed }) => (
              <LinearGradient
                colors={
                  isProcessing ? ["#ccc", "#999"] : ["#667eea", "#764ba2"]
                }
                style={[styles.buttonGradient, pressed && styles.pressed]}
              >
                {isProcessing ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <AntDesign name="check" size={20} color="white" />
                )}
                <Text style={styles.confirmButtonText}>
                  {isProcessing ? "Đang xử lý..." : "Xác nhận"}
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
                Đặt khuôn mặt vào khung hình
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

  return (
    <>
      <LocationModal {...locationModalProps}></LocationModal>
      <View style={styles.container}>
        {uri ? renderPicture() : renderCamera()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    fontSize: 18,
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
    borderColor: "#667eea",
    borderTopLeftRadius: 12,
    shadowColor: "#667eea",
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
    borderColor: "#667eea",
    borderTopRightRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: "#667eea",
    borderBottomLeftRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: "#667eea",
    borderBottomRightRadius: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#667eea",
    opacity: 0.8,
    shadowColor: "#667eea",
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
    paddingTop: 70,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pictureSubtitle: {
    fontSize: 17,
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
    color: "#667eea",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 25,
    paddingBottom: 50,
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
    color: "#667eea",
  },
  confirmButton: {
    shadowColor: "#667eea",
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
