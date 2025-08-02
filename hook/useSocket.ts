import { useMemo, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useSocket = (): Socket | null => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (error) {
        console.error("Error getting token from AsyncStorage:", error);
      }
    };
    getToken();
  }, []);

  const socket = useMemo(() => {
    if (!token) return null;

    const s = io(process.env.EXPO_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      query: { provider: "face" },
      auth: {
        token: `Bearer ${token}`,
      },
    });

    s.on("connect", () => {
      console.log("WebSocket connected:", s.id);

      // Join notification room for this user
      s.emit("join_notifications", { token });
    });

    s.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    s.on("disconnect", (reason) => {
      console.warn("WebSocket disconnected:", reason);
    });

    s.on("reconnect_attempt", (attempt) => {
      console.log(`WebSocket reconnect attempt ${attempt}`);
    });

    s.on("reconnect", () => {
      console.log("WebSocket reconnected successfully");
      // Rejoin notification room on reconnect
      s.emit("join_notifications", { token });
    });

    // Global error handler for socket
    s.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return s;
  }, [token]);

  return socket;
};

export default useSocket;
