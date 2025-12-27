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
