import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLocationStore from "../../store/locationStore";

const SERVER_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
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

// Connection events
socket.on("connect", () => {
  console.log("🟢 Satellite link established");
});

socket.on("reconnecting", (attempt) => {
  console.log(`🟡 Re-establishing link... attempt ${attempt}`);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Link severed:", reason);
});

// Location update events
socket.on(
  "location_updated",
  (data: {
    updated: { user_id: string; lat: number; lng: number };
    nearby: Array<{
      user_id: string;
      email: string;
      dogName?: string;
      dogBreed?: string;
      dogAge?: number;
      lat: number;
      lng: number;
      distance: number;
    }>;
  }) => {
    console.log("📍 Location update received:", data);

    // Transform the data to use 'id' instead of 'user_id'
    const transformedNearby = data.nearby.map((user) => ({
      id: user.user_id,
      email: user.email,
      dogName: user.dogName,
      dogBreed: user.dogBreed,
      dogAge: user.dogAge,
      lat: user.lat,
      lng: user.lng,
      distance: user.distance,
    }));

    // Update nearby users in the store
    useLocationStore.getState().setNearbyUsers(transformedNearby);

    // Update the specific user's location if they're in our nearby list
    if (data.updated) {
      useLocationStore.getState().updateNearbyUser(data.updated.user_id, {
        lat: data.updated.lat,
        lng: data.updated.lng,
      });
    }
  }
);

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
  useLocationStore.getState().clearLocationData();
};

// Location-related socket functions
export const updateLocation = (
  userId: string,
  lat: number,
  lng: number,
  filters?: any
) => {
  socket.emit("update_location", {
    userId,
    lat,
    lng,
    filters: filters || {},
  });
};

export const updateSearchRadius = (
  userId: string,
  radius: number,
  filters?: any
) => {
  socket.emit("update_search_radius", {
    userId,
    radius,
    filters: filters || {},
  });
};
