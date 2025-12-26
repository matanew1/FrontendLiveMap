import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://10.0.0.9:3000";

export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true, // Ensures automatic recovery
  reconnectionAttempts: 10, // Increased for mobile stability
  reconnectionDelay: 2000, // Wait 2s before retry
  auth: async (cb) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      cb({ token: token || null });
    } catch (error) {
      console.error("Socket auth error:", error);
      cb({ token: null });
    }
  },
});

// Link Status Debugging
socket.on("connect", () => {
  console.log("🟢 Satellite link established");
});

socket.on("reconnecting", (attempt) => {
  console.log(`🟡 Re-establishing link... attempt ${attempt}`);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Link severed:", reason);
});

export const connectSocket = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      socket.connect();
    }
  } catch (error) {
    console.error("Error connecting socket:", error);
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};
