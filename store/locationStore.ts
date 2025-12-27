import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import useAuthStore from "./authStore";
import {
  NearbyUser,
  LocationFilters,
  LocationData,
} from "../src/types/location";

interface LocationState {
  currentLocation: LocationData | null;
  nearbyUsers: NearbyUser[];
  searchRadius: number;
  filters: LocationFilters;
  isTracking: boolean;
  isUpdatingFromSocket: boolean; // Flag to prevent recursive updates

  // Actions
  setCurrentLocation: (location: LocationData) => void;
  setNearbyUsers: (users: NearbyUser[]) => void;
  updateNearbyUsers: (users: NearbyUser[]) => void;
  updateNearbyUser: (userId: string, updates: Partial<NearbyUser>) => void;
  removeNearbyUser: (userId: string) => void;
  setSearchRadius: (radius: number) => void;
  setFilters: (filters: LocationFilters) => void;
  setIsTracking: (tracking: boolean) => void;
  setIsUpdatingFromSocket: (updating: boolean) => void;
  clearLocationData: () => void;

  // Legacy methods for compatibility
  myLocation: LocationData;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => {
      let locationSubscription: Location.LocationSubscription | null = null;

      return {
        currentLocation: null,
        nearbyUsers: [],
        searchRadius: 100, // Default 100m
        filters: {},
        isTracking: false,
        isUpdatingFromSocket: false,

        // Legacy property for backward compatibility
        myLocation: { lat: 32.0853, lng: 34.7818 },

        setCurrentLocation: (location) =>
          set({
            currentLocation: location,
            myLocation: location, // Keep legacy property in sync
          }),

        setNearbyUsers: (users) => set({ nearbyUsers: users }),

        updateNearbyUsers: (users) => set({ nearbyUsers: users }),

        updateNearbyUser: (userId, updates) =>
          set((state) => ({
            nearbyUsers: state.nearbyUsers.map((user) =>
              user.id === userId ? { ...user, ...updates } : user
            ),
          })),

        removeNearbyUser: (userId) =>
          set((state) => ({
            nearbyUsers: state.nearbyUsers.filter((user) => user.id !== userId),
          })),

        setSearchRadius: (radius) => set({ searchRadius: radius }),

        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } })),

        setIsTracking: (tracking) => set({ isTracking: tracking }),

        setIsUpdatingFromSocket: (updating) =>
          set({ isUpdatingFromSocket: updating }),

        clearLocationData: () =>
          set({
            currentLocation: null,
            nearbyUsers: [],
            isTracking: false,
            myLocation: { lat: 32.0853, lng: 34.7818 }, // Reset to default
          }),

        startTracking: async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted")
            throw new Error("Location permission denied");

          const user = useAuthStore.getState().user;
          if (!user) return;

          // Start GPS Watcher
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              distanceInterval: 1,
              timeInterval: 2000,
            },
            (location) => {
              const { latitude, longitude } = location.coords;
              const locationData = { lat: latitude, lng: longitude };

              // Update local state immediately
              set({
                currentLocation: locationData,
                myLocation: locationData,
                isTracking: true,
              });

              // Notify server with filters (only if not updating from socket)
              const state = get();
              if (!state.isUpdatingFromSocket) {
                // Lazy import to avoid circular dependency
                import("../src/lib/socket").then(({ socket }) => {
                  socket.emit("update_location", {
                    userId: user.id,
                    lat: latitude,
                    lng: longitude,
                    filters: state.filters,
                  });
                });
              }
            }
          );
        },

        stopTracking: () => {
          locationSubscription?.remove();
          set({ isTracking: false });
        },
      };
    },
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        searchRadius: state.searchRadius,
        filters: state.filters,
      }),
    }
  )
);

export default useLocationStore;
