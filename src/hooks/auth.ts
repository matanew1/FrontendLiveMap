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
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  User,
} from "../api/auth";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

// Query keys
export const authKeys = {
  user: ["user"] as const,
  profile: ["profile"] as const,
};

// Authentication hooks
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
      return await apiSignIn(email, password);
    },
    onSuccess: async (data) => {
      // Store tokens
      AsyncStorage.setItem("accessToken", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);

      // Get the user profile data instead of using the auth user
      try {
        const profileData = await getUserProfile(data.accessToken);
        useAuthStore.getState().setUser(profileData);
        queryClient.setQueryData(authKeys.user, profileData);
        queryClient.setQueryData(authKeys.profile, profileData);
      } catch (error) {
        console.error("Failed to fetch profile after sign in:", error);
        // Fallback to basic user data if profile fetch fails
        useAuthStore.getState().setUser(data.user);
        queryClient.setQueryData(authKeys.user, data.user);
      }

      // Connect socket
      connectSocket();
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
      return await apiSignUp(email, password);
    },
    onSuccess: async (data) => {
      // Store tokens
      AsyncStorage.setItem("accessToken", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);

      // Get the user profile data instead of using the auth user
      try {
        const profileData = await getUserProfile(data.accessToken);
        useAuthStore.getState().setUser(profileData);
        queryClient.setQueryData(authKeys.user, profileData);
        queryClient.setQueryData(authKeys.profile, profileData);
      } catch (error) {
        console.error("Failed to fetch profile after sign up:", error);
        // Fallback to basic user data if profile fetch fails
        useAuthStore.getState().setUser(data.user);
        queryClient.setQueryData(authKeys.user, data.user);
      }

      // Connect socket
      connectSocket();
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        await apiSignOut(token);
      }
    },
    onSuccess: () => {
      // Clear tokens and disconnect
      AsyncStorage.removeItem("accessToken");
      AsyncStorage.removeItem("refreshToken");

      // Clear store and disconnect socket
      useAuthStore.getState().setUser(null);
      disconnectSocket();

      // Clear query cache
      queryClient.clear();
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token");

      return await getUserInfo(token);
    },
    enabled: false, // Only run when explicitly called
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token");

      return await getUserProfile(token);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token");

      const result = await updateUserProfile(token, profileData);
      return result;
    },
    onSuccess: (updatedUser) => {
      // Backend now returns the complete updated user data
      useAuthStore.getState().setUser(updatedUser);

      // Update query cache
      queryClient.setQueryData(authKeys.user, updatedUser);
      queryClient.setQueryData(authKeys.profile, updatedUser);
    },
    onError: (error) => {
      console.error("❌ useUpdateProfile: onError called with:", error);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token");

      await updateUserRole(token, userId, role);
      return { userId, role };
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

// Token refresh hook
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      return await refreshAccessToken(refreshToken);
    },
    onSuccess: async (data) => {
      // Update tokens
      AsyncStorage.setItem("accessToken", data.accessToken);
      AsyncStorage.setItem("refreshToken", data.refreshToken);

      // Get the user profile data instead of using the auth user
      try {
        const profileData = await getUserProfile(data.accessToken);
        useAuthStore.getState().setUser(profileData);
        queryClient.setQueryData(authKeys.user, profileData);
        queryClient.setQueryData(authKeys.profile, profileData);
      } catch (error) {
        console.error("Failed to fetch profile after token refresh:", error);
        // Fallback to basic user data if profile fetch fails
        useAuthStore.getState().setUser(data.user);
        queryClient.setQueryData(authKeys.user, data.user);
      }
    },
  });
};
