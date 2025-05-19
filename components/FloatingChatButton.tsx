import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Text,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ChatAppPage from "../pages/Chat";

type NavigationProps = {
  navigate: (screen: string) => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function FloatingChatButton() {
  const navigation = useNavigation<NavigationProps>();
  const [showBubble, setShowBubble] = useState(false);
  const [showChatPreview, setShowChatPreview] = useState(false);
  const bubbleAnimation = useRef(new Animated.Value(0)).current;
  const chatPreviewAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showBubble) {
      Animated.sequence([
        Animated.timing(bubbleAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(bubbleAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowBubble(false));
    }
  }, [showBubble, bubbleAnimation]);

  useEffect(() => {
    if (showChatPreview) {
      Animated.spring(chatPreviewAnimation, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(chatPreviewAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showChatPreview, chatPreviewAnimation]);

  const handlePress = useCallback(() => {
    setShowChatPreview(prevState => !prevState);
  }, []);

  const handleLongPress = useCallback(() => {
    setShowBubble(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowChatPreview(false);
  }, []);

  const bubbleScale = bubbleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const bubbleOpacity = bubbleAnimation;

  const previewScale = chatPreviewAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const previewOpacity = chatPreviewAnimation;

  // Render bọc ChatAppPage khi hiển thị trong modal - memoized để tránh re-render không cần thiết
  const renderChatAppWrapper = useCallback(() => {
    // Không có gì để render nếu không hiển thị
    if (!showChatPreview) return null;

    return (
      <View style={styles.chatAppWrapper}>
        <ChatAppMiniWrapper onClose={handleClosePreview} />
      </View>
    );
  }, [showChatPreview, handleClosePreview]);

  // Chỉ render modal khi showChatPreview thực sự thay đổi
  const chatModal = useMemo(() => {
    if (!showChatPreview) return null;
    
    return (
      <Modal
        transparent={true}
        visible={showChatPreview}
        animationType="none"
        onRequestClose={handleClosePreview}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={handleClosePreview}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.chatPreviewContainer,
                  {
                    transform: [{ scale: previewScale }],
                    opacity: previewOpacity,
                  },
                ]}
              >
                {renderChatAppWrapper()}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [showChatPreview, handleClosePreview, previewScale, previewOpacity, renderChatAppWrapper]);

  // Chỉ render container khi không có modal hiển thị
  // Giới hạn kích thước của button và hit area
  return (
    <View
      style={[
        styles.container,
        { pointerEvents: "box-none" },
      ]}
    >
      {/* Tooltip bubble that appears on long press */}
      {showBubble && (
        <Animated.View
          style={[
            styles.bubble,
            {
              transform: [{ scale: bubbleScale }],
              opacity: bubbleOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.bubbleText}>Mở trợ lý AI</Text>
          <View style={styles.bubbleTriangle} />
        </Animated.View>
      )}

      {chatModal}

      {/* Main Floating Button - limit the touchable area */}
      <TouchableOpacity
        style={[styles.button, showChatPreview && styles.buttonActive]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="chat" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

// Component bọc ChatAppPage để tùy chỉnh giao diện - memoized để tránh re-render không cần thiết
const ChatAppMiniWrapper = memo(({ onClose }: { onClose: () => void }) => {
  return (
    <View style={styles.chatAppMiniContainer}>
      <View style={styles.chatAppTopBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.chatAppOverride}>
        <ChatAppPage onClose={onClose} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    right: 25,
    alignItems: "flex-end",
    width: 60, // Limit the width
    height: 60, // Limit the height
    zIndex: 50, // Lower the zIndex to avoid blocking other interactions
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#3674B5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: "#FF9800",
  },
  bubble: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    maxWidth: 150,
    position: "relative",
  },
  bubbleText: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
  },
  bubbleTriangle: {
    position: "absolute",
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(0, 0, 0, 0.7)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatPreviewContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chatAppWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  chatAppMiniContainer: {
    flex: 1,
    position: "relative",
  },
  chatAppTopBar: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 10,
    paddingRight: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatAppOverride: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default FloatingChatButton;
