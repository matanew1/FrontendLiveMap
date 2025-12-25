import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { socket, disconnectSocket } from "../src/lib/socket";
import useAuthStore from "./authStore";

interface LocationState {
  myLocation: { lat: number; lng: number };
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => {
      let locationSubscription: Location.LocationSubscription | null = null;

      return {
        myLocation: { lat: 32.0853, lng: 34.7818 },
        searchRadius: 500,

        setSearchRadius: (radius: number) => {
          set({ searchRadius: radius });
        },

        startTracking: async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted")
            throw new Error("Location permission denied");

          const user = useAuthStore.getState().user;
          if (!user) return;

          // Start GPS Watcher (Optimistic UI)
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              distanceInterval: 1,
              timeInterval: 2000,
            },
            (location) => {
              const { latitude, longitude } = location.coords;
              // Move my dot immediately
              set({ myLocation: { lat: latitude, lng: longitude } });
              // Notify others
              socket.emit("update_location", {
                userId: user.id,
                lat: latitude,
                lng: longitude,
              });
            }
          );
        },

        stopTracking: () => {
          locationSubscription?.remove();
        },
      };
    },
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ searchRadius: state.searchRadius }), // Only persist searchRadius
    }
  )
);

export default useLocationStore;
