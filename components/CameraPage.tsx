import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
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
import { registerFace } from "../service/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [isRegisterd, setIsRegistered] = useState(false);

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

  const handleRegisterFace = async () => {
    if (!uri) return;
    let userDataStr = await AsyncStorage.getItem("userData");

    if (userDataStr !== null) {
      const user = JSON.parse(userDataStr);
      try {
        const formData = new FormData();
        formData.append("key", `${user.userProfile.userName}.jpg`);
        formData.append("userCode", user.userProfile.code);

        if (Platform.OS === "web") {
          // Web: fetch the blob and append it
          const blob = await fetch(uri).then((res) => res.blob());
          formData.append("file", blob, "face.jpg");
        } else {
          // Native (iOS/Android)
          formData.append("file", {
            uri,
            type: "image/jpeg",
            name: "face.jpg",
          } as any);
        }

        const res = await registerFace(formData);
        const data = res.data;

        console.log(data);
      } catch (error) {
        console.log("Upload error:", error);
      }
    }
  };

  const handleFaceRecognition = async () => {
    if (!uri) return;

    try {
      const formData = new FormData();
      formData.append("name", "phuc");

      if (Platform.OS === "web") {
        // Web: fetch the blob and append it
        const blob = await fetch(uri).then((res) => res.blob());
        formData.append("file", blob, "face.jpg");
      } else {
        // Native (iOS/Android)
        formData.append("file", {
          uri,
          type: "image/jpeg",
          name: "face.jpg",
        } as any);
      }

      const res = await axios.post("http://localhost:8000/verify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      setFaceRecognitionResult(data.matched);
    } catch (error) {
      console.log("Upload error:", error);
    }
  };

  const renderRegisterPage = () => {
    return (
      <View>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: 300, aspectRatio: 1 }}
        />
        <Button onPress={() => setUri(null)} title="Chụp lại" />
        <Button onPress={() => handleRegisterFace()} title="Xác nhận" />
      </View>
    );
  };

  const renderPicture = () => {
    return (
      <View>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: 300, aspectRatio: 1 }}
        />
        {faceRecognitionResult != null ? (
          faceRecognitionResult == true ? (
            <Text>Thành công nhận diện khuôn mặt</Text>
          ) : (
            <Text>Lỗi khi nhận diện khuôn mặt</Text>
          )
        ) : (
          <Text></Text>
        )}
        <Button onPress={() => setUri(null)} title="Chụp lại" />
        <Button onPress={() => handleFaceRecognition()} title="Xác nhận" />
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
      {/* {uri ? renderPicture() : renderCamera()} */}
      {uri ? renderRegisterPage() : renderCamera()}
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
});
