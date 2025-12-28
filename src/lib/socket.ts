import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useLocationStore from "../../store/locationStore";
import {
  NearbyUser,
  LocationData,
  SocketLocationUpdate,
} from "../types/location";

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
socket.on("location_updated", (data: SocketLocationUpdate) => {
  console.log("📍 Location update received:", data);

  // Get current user ID to filter out own updates
  const getCurrentUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        // We could decode the token or make a quick API call, but for now let's use a simpler approach
        // The user ID should be available in the auth store
        const useAuthStore = (await import("../../store/authStore")).default;
        return useAuthStore.getState().user?.id;
      }
    } catch (error) {
      console.error("Error getting current user ID:", error);
    }
    return null;
  };

  getCurrentUserId().then((currentUserId) => {
    // Filter out current user's own location from nearby users
    const filteredNearby = data.nearby.filter(
      (user) => user.user_id !== currentUserId
    );

    // Transform the data to use 'id' instead of 'user_id'
    const transformedNearby = filteredNearby.map((user) => ({
      id: user.user_id,
      email: user.email,
      dogName: user.dogName,
      dogBreed: user.dogBreed,
      dogAge: user.dogAge,
      lat: user.lat,
      lng: user.lng,
      distance: user.distance,
      avatarUrl: user.avatarUrl,
    }));

    // Update nearby users in the store
    useLocationStore.getState().setIsUpdatingFromSocket(true);
    useLocationStore.getState().setNearbyUsers(transformedNearby);

    // Update the current user's location if it's their own update
    if (data.updated && data.updated.user_id === currentUserId) {
      useLocationStore.getState().setCurrentLocation({
        lat: data.updated.lat,
        lng: data.updated.lng,
      });
    } else if (data.updated) {
      // Only update the specific user's location if it's not the current user
      useLocationStore.getState().updateNearbyUser(data.updated.user_id, {
        lat: data.updated.lat,
        lng: data.updated.lng,
      });
    }

    // Reset the flag after a short delay
    setTimeout(() => {
      useLocationStore.getState().setIsUpdatingFromSocket(false);
    }, 100);
  });
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
  // Note: clearLocationData is handled in locationStore when needed
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
