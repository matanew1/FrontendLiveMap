import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectSocket, disconnectSocket } from "../lib/socket";
import useAuthStore from "../../store/authStore";
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getUserInfo,
  refreshAccessToken,
  User,
} from "../api/auth";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://10.0.0.9:3000";

// Query keys
export const authKeys = {
  user: ["user"] as const,
};

// Mutations
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { accessToken, refreshToken } = await apiSignIn(email, password);

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);

      const userData = await getUserInfo(accessToken);
      return { user: userData, accessToken, refreshToken };
    },
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user);
      connectSocket();
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { accessToken, refreshToken } = await apiSignUp(email, password);

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);

      const userData = await getUserInfo(accessToken);
      return { user: userData, accessToken, refreshToken };
    },
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user);
      connectSocket();
      queryClient.setQueryData(authKeys.user, data.user);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        await apiSignOut(accessToken);
      }
    },
    onSuccess: () => {
      AsyncStorage.removeItem("accessToken");
      AsyncStorage.removeItem("refreshToken");
      useAuthStore.getState().setUser(null);
      disconnectSocket();
      queryClient.removeQueries({ queryKey: authKeys.user });
    },
  });
};

// Query for user
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) throw new Error("No access token");

      try {
        return await getUserInfo(accessToken);
      } catch (error) {
        // Try refresh
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) throw error;

        const newTokens = await refreshAccessToken(refreshToken);
        await AsyncStorage.setItem("accessToken", newTokens.accessToken);
        await AsyncStorage.setItem("refreshToken", newTokens.refreshToken);

        return await getUserInfo(newTokens.accessToken);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};
