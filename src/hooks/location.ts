import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateLocation, updateSearchRadius } from "../lib/socket";
import useLocationStore from "../../store/locationStore";
import useAuthStore from "../../store/authStore";

// Query keys
export const locationKeys = {
  nearbyUsers: ["nearbyUsers"] as const,
};

// Location tracking hooks
export const useStartLocationTracking = () => {
  return useMutation({
    mutationFn: async () => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("User not authenticated");

      await useLocationStore.getState().startTracking();
      return true;
    },
  });
};

export const useStopLocationTracking = () => {
  return useMutation({
    mutationFn: async () => {
      useLocationStore.getState().stopTracking();
      return true;
    },
  });
};

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: async ({
      lat,
      lng,
      filters,
    }: {
      lat: number;
      lng: number;
      filters?: any;
    }) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("User not authenticated");

      updateLocation(user.id, lat, lng, filters);
      return { lat, lng };
    },
  });
};

export const useUpdateSearchRadius = () => {
  return useMutation({
    mutationFn: async ({
      radius,
      filters,
    }: {
      radius: number;
      filters?: any;
    }) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error("User not authenticated");

      updateSearchRadius(user.id, radius, filters);
      return { radius };
    },
  });
};

// Query for nearby users (this would be populated by WebSocket events)
export const useNearbyUsers = () => {
  return useQuery({
    queryKey: locationKeys.nearbyUsers,
    queryFn: async () => {
      // This data comes from WebSocket events, so we return the current store state
      return useLocationStore.getState().nearbyUsers;
    },
    staleTime: 0, // Always fresh since it comes from real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Location filters management
export const useUpdateLocationFilters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filters: any) => {
      useLocationStore.getState().setFilters(filters);
      return filters;
    },
    onSuccess: () => {
      // Invalidate nearby users query to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: locationKeys.nearbyUsers });
    },
  });
};

export const useUpdateSearchRadiusSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (radius: number) => {
      useLocationStore.getState().setSearchRadius(radius);
      return radius;
    },
    onSuccess: () => {
      // Invalidate nearby users query to trigger refetch if needed
      queryClient.invalidateQueries({ queryKey: locationKeys.nearbyUsers });
    },
  });
};
