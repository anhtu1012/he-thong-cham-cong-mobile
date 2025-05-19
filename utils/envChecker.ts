import { Platform } from "react-native";
import Constants from "expo-constants";
import pkg from "../package.json";

/**
 * Thông tin về phiên bản ứng dụng
 */
export const getAppVersionInfo = () => {
  return {
    appName: pkg.name,
    version: pkg.version || "1.0.0",
    expoVersion: Constants.expoConfig?.sdkVersion || "unknown",
    reactNativeVersion: pkg.dependencies["react-native"] || "unknown",
    platform: Platform.OS,
    platformVersion: Platform.Version,
    isHermes: typeof HermesInternal !== "undefined",
    buildNumber: Constants.expoConfig?.android?.versionCode || 1,
  };
};

/**
 * Kiểm tra môi trường thiết bị
 */
export const checkEnvironment = () => {
  const issues = [];
  const apiLevel =
    Platform.OS === "android" ? parseInt(Platform.Version.toString(), 10) : 0;

  if (Platform.OS !== "android") {
    issues.push("Ứng dụng này chỉ hỗ trợ thiết bị Android");
  }

  if (apiLevel < 21) {
    // Android 5.0 Lollipop
    issues.push("Thiết bị có phiên bản Android quá cũ (tối thiểu Android 5.0)");
  }

  return {
    isValid: issues.length === 0,
    issues,
    apiLevel,
  };
};

/**
 * Hướng dẫn khắc phục lỗi build
 */
export const getTroubleshootingSteps = () => {
  return [
    "Kiểm tra phiên bản phụ thuộc: npx expo install --check",
    "Cập nhật các phụ thuộc: npx expo install",
    "Xóa bộ nhớ đệm: npx expo start --clear",
    "Xóa node_modules: rm -rf node_modules && npm install",
    "Kiểm tra sự tương thích: npx expo-doctor",
    "Xây dựng lại native code: npx expo prebuild --clean",
  ];
};
