import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { memo } from "react";
import { Ionicons } from "@expo/vector-icons";

interface LocationModalProps {
  visible: boolean;
  place1: string;
  place2: string;
  isInTheSameZone: boolean;
  loading?: boolean;
  isCheckingIn?: boolean;
  checkInResult?: {
    success: boolean;
    message: string;
  };
  onContinue?: () => void;
  onGoBack?: () => void;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const LocationModal = memo(
  ({
    visible,
    place1,
    place2,
    isInTheSameZone,
    loading = false,
    isCheckingIn = false,
    checkInResult,
    onContinue,
    onGoBack,
    onDismiss,
    onRetry,
  }: LocationModalProps) => {
    const isMatch = isInTheSameZone;

    const handleOverlayPress = () => {
      if (!loading && !isCheckingIn && onDismiss) {
        onDismiss();
      }
    };

    // Determine what to show based on state
    const getModalContent = () => {
      if (checkInResult) {
        // Show check-in result
        return {
          icon: checkInResult.success ? "checkmark-circle" : "close-circle",
          iconColor: checkInResult.success ? "#4CAF50" : "#F44336",
          title: checkInResult.success
            ? "Chấm công thành công!"
            : "Chấm công thất bại!",
          message: checkInResult.message,
          showLocationInfo: false,
          buttonText: checkInResult.success ? "Đóng" : "Thử lại",
          buttonAction: checkInResult.success ? onDismiss : onRetry,
          buttonColor: checkInResult.success ? "#4CAF50" : "#3674B5",
          showSecondButton: !checkInResult.success,
          secondButtonText: "Đóng",
          secondButtonAction: onDismiss,
        };
      } else if (isCheckingIn) {
        // Show checking in state
        return {
          icon: "time",
          iconColor: "#3674B5",
          title: "Đang chấm công...",
          message: "Vui lòng đợi trong giây lát",
          showLocationInfo: false,
          buttonText: null,
          buttonAction: null,
          buttonColor: null,
          showSecondButton: false,
        };
      } else {
        // Show location verification
        return {
          icon: isMatch ? "checkmark-circle" : "close-circle",
          iconColor: isMatch ? "#4CAF50" : "#F44336",
          title: `Địa điểm ${isMatch ? "trùng khớp" : "không trùng khớp"}!`,
          message: isMatch
            ? "Địa điểm khớp hoàn toàn!"
            : "Địa điểm không khớp.",
          showLocationInfo: true,
          buttonText: isMatch ? "Tiếp tục" : "Quay lại",
          buttonAction: isMatch ? onContinue : onGoBack,
          buttonColor: isMatch ? "#28A745" : "#DC3545",
          showSecondButton: false,
        };
      }
    };

    const content = getModalContent();

    const handleModalPress = (event: any) => {
      // Stop event propagation to prevent closing when tapping inside modal
      event.stopPropagation();
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
      >
        <Pressable style={styles.overlay} onPress={handleOverlayPress}>
          <Pressable style={styles.modalContainer} onPress={handleModalPress}>
            <View style={styles.dragIndicator} />

            <View style={styles.iconContainer}>
              <Ionicons
                name={content.icon as any}
                size={48}
                color={content.iconColor}
              />
            </View>

            <Text style={styles.title}>{content.title}</Text>

            {content.showLocationInfo && (
              <>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color="#666" />
                    <View style={styles.textContainer}>
                      <Text style={styles.textBold}>Bạn đang ở:</Text>
                      <Text style={styles.text} numberOfLines={2}>
                        {place1}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={20} color="#666" />
                    <View style={styles.textContainer}>
                      <Text style={styles.textBold}>Địa điểm đúng:</Text>
                      <Text style={styles.text} numberOfLines={2}>
                        {place2}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            <Text
              style={[
                styles.statusText,
                checkInResult?.success
                  ? styles.match
                  : checkInResult?.success === false
                  ? styles.noMatch
                  : isMatch
                  ? styles.match
                  : styles.noMatch,
              ]}
            >
              {content.message}
            </Text>

            {content.buttonText && (
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    { backgroundColor: content.buttonColor },
                    loading || isCheckingIn ? styles.buttonDisabled : null,
                  ]}
                  onPress={content.buttonAction}
                  disabled={loading || isCheckingIn}
                >
                  {(loading || isCheckingIn) && !checkInResult ? (
                    <ActivityIndicator
                      size="small"
                      color="white"
                      style={styles.buttonIcon}
                    />
                  ) : (
                    <Ionicons
                      name={
                        content.buttonText === "Tiếp tục"
                          ? "arrow-forward"
                          : content.buttonText === "Quay lại"
                          ? "arrow-back"
                          : content.buttonText === "Thử lại"
                          ? "refresh"
                          : "close"
                      }
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={styles.buttonText}>{content.buttonText}</Text>
                </Pressable>

                {content.showSecondButton && (
                  <Pressable
                    style={[styles.button, styles.cancelButton]}
                    onPress={content.secondButtonAction}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color="#666"
                      style={styles.buttonIcon}
                    />
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      {content.secondButtonText}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

LocationModal.displayName = "LocationModal";

export default LocationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: "80%",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1A1A1A",
    lineHeight: 30,
  },
  infoContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 44,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  textBold: {
    fontWeight: "600",
    color: "#495057",
    fontSize: 14,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 20,
    flexWrap: "wrap",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  match: {
    color: "#28A745",
  },
  noMatch: {
    color: "#DC3545",
  },
  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: 52,
  },
  continueButton: {
    backgroundColor: "#28A745",
    shadowColor: "#28A745",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  goBackButton: {
    backgroundColor: "#DC3545",
    shadowColor: "#DC3545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#666",
  },
});
