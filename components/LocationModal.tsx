import { View, Text, Modal, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface LocationModalProps {
  visible: boolean;
  place1: string;
  place2: string;
  isInTheSameZone: boolean;
  onContinue?: () => void;
  onGoBack?: () => void;
}

const LocationModal = ({
  visible,
  place1,
  place2,
  isInTheSameZone,
  onContinue,
  onGoBack,
}: LocationModalProps) => {
  const isMatch = isInTheSameZone;

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isMatch ? "checkmark-circle" : "close-circle"}
              size={48}
              color={isMatch ? "#4CAF50" : "#F44336"}
            />
          </View>
          <Text style={styles.title}>
            Địa điểm {isMatch ? "trùng khớp" : "không trùng khớp"}!
          </Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.textBold}>Bạn đang ở: </Text>
              <Text style={styles.text}>{place1}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.textBold}>Địa điểm đúng: </Text>
              <Text style={styles.text}>{place2}</Text>
            </View>
          </View>
          <Text
            style={[styles.statusText, isMatch ? styles.match : styles.noMatch]}
          >
            {isMatch ? "Địa điểm khớp hoàn toàn!" : "Địa điểm không khớp."}
          </Text>
          <Pressable
            style={[
              styles.button,
              isMatch ? styles.continueButton : styles.goBackButton,
            ]}
            onPress={isMatch ? onContinue : onGoBack}
          >
            <Ionicons
              name={isMatch ? "arrow-forward" : "arrow-back"}
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isMatch ? "Tiếp tục" : "Quay lại"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

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
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#1A1A1A",
  },
  infoContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  textBold: {
    fontWeight: "600",
    color: "#333",
  },
  text: {
    fontSize: 14,
    marginLeft: 12,
    color: "#333",
    width: "60%",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  match: {
    color: "#4CAF50",
  },
  noMatch: {
    color: "#F44336",
  },
  button: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
  },
  goBackButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
