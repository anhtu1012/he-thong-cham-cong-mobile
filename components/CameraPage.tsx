import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useCallback } from "react";
import {
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  compareFace,
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

export default function CameraPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [faceRecognitionResult, setFaceRecognitionResult] = useState<
    boolean | null
  >(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("front");
  const [recording, setRecording] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  useFocusEffect(
    useCallback(() => {
      console.log("CameraPage focused", faceRecognitionResult);

      const processFaceRecognition = async () => {
        if (faceRecognitionResult !== null) {
          if (faceRecognitionResult) {
            try {
              const currentTimeScheduleDateStr = await AsyncStorage.getItem(
                "currentTimeScheduleDate"
              );
              console.log(
                "currentTimeScheduleDateStr: ",
                currentTimeScheduleDateStr
              );

              if (currentTimeScheduleDateStr) {
                const currentTimeScheduleDate = JSON.parse(
                  currentTimeScheduleDateStr
                );
                if (currentTimeScheduleDate.status === "NOTSTARTED") {
                  console.log("checkIn");
                  handleCheckIn();
                } else if (currentTimeScheduleDate.status === "ACTIVE")
                  console.log("checkIn");
                handleCheckOut();
              }

              Toast.show({
                type: "success",
                text1: "Chấm công thành công",
                text1Style: { textAlign: "center", fontSize: 16 },
              });
              navigation.navigate("DrawerHomeScreen");
            } catch (error) {
              console.error("Error processing face recognition result:", error);
              Toast.show({
                type: "error",
                text1: "Có lỗi xảy ra khi xử lý dữ liệu!",
                text1Style: { textAlign: "center", fontSize: 16 },
              });
            }
          } else {
            Toast.show({
              type: "error",
              text1: "Khuôn mặt không trùng khớp!",
              text1Style: { textAlign: "center", fontSize: 16 },
            });
          }
        }
      };

      processFaceRecognition();

      // This effect should run whenever faceRecognitionResult changes
      // and the screen is focused
    }, [faceRecognitionResult])
  );

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

  const handleFaceRecognition = async () => {
    if (!uri) return;

    let userDataStr = await AsyncStorage.getItem("userData");
    if (!userDataStr) return;

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
      setFaceRecognitionResult(data.matched);
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  const handleCheckIn = async () => {
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
        if (res.status === 200) {
          Toast.show({
            type: "success",
            text1: "Chấm công thành công!",
            text1Style: { textAlign: "center", fontSize: 16 },
          });
          navigation.navigate("TimesheetNav");
        } else {
          Toast.show({
            type: "error",
            text1: "Chấm công thất bại!",
            text1Style: { textAlign: "center", fontSize: 16 },
          });
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const handleCheckOut = async () => {
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
        if (res.status === 200) {
          Toast.show({
            type: "success",
            text1: "Chấm công thành công!",
            text1Style: { textAlign: "center", fontSize: 16 },
          });
          navigation.navigate("TimesheetNav");
        } else {
          Toast.show({
            type: "error",
            text1: "Chấm công thất bại!",
            text1Style: { textAlign: "center", fontSize: 16 },
          });
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const renderPicture = () => {
    return (
      <View style={styles.pictureContainer}>
        <Text style={styles.pictureTitle}>Xác nhận khuôn mặt</Text>
        <Text style={styles.pictureSubtitle}>
          Kiểm tra ảnh và xác nhận để tiếp tục chấm công
        </Text>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri }}
            contentFit="cover"
            style={styles.capturedImage}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.actionButton, styles.retakeButton]}
            onPress={() => setUri(null)}
          >
            <AntDesign name="reload1" size={20} color="#666" />
            <Text style={styles.retakeButtonText}>Chụp lại</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleFaceRecognition()}
          >
            <AntDesign name="check" size={20} color="white" />
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        mirror={facing === "front"}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={toggleMode}>
            {mode === "picture" ? (
              <AntDesign name="picture" size={32} color="white" />
            ) : (
              <Feather name="video" size={32} color="white" />
            )}
          </Pressable>
          <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: mode === "picture" ? "white" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  // Picture preview styles
  pictureContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  pictureTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  pictureSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  imageWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    backgroundColor: "#fff",
  },
  capturedImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  retakeButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    backgroundColor: "#3674B5",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
