import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectSocket, disconnectSocket } from "../lib/socket";
import useAuthStore from "../../store/authStore";
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getUserInfo,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../api/auth";
import { User } from "../types/auth";

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
        const profileData = await getUserProfile(); // Token handled automatically by apiClient
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
        const profileData = await getUserProfile(); // Token handled automatically by apiClient
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
      await apiSignOut(); // Token handled automatically by apiClient
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
      return await getUserInfo(); // Token handled automatically by apiClient
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
      return await getUserProfile(); // Token handled automatically by apiClient
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const result = await updateUserProfile(profileData); // Token handled automatically by apiClient
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

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: any) => {
      const currentUser = useAuthStore.getState().user;
      const isUpdate = !!currentUser?.avatarUrl;
      return await uploadAvatar(file, isUpdate);
    },
    onSuccess: (data) => {
      // Update the user in store with the new avatarUrl
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, avatarUrl: data.avatarUrl };
        useAuthStore.getState().setUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: authKeys.profile });
      }
    },
  });
};
