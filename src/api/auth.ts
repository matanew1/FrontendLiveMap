const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

import { apiClient } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, AuthResponse, ProfileResponse } from "../types/auth";

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sign in failed");
  }

  const data: AuthResponse = await response.json();
  const { user, session } = data.data;

  return {
    user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
};

export const signUp = async (
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sign up failed");
  }

  const data: AuthResponse = await response.json();
  const { user, session } = data.data;

  return {
    user,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
};

export const signOut = async (): Promise<void> => {
  // The new apiClient handles authentication automatically
  try {
    await apiClient.post("/auth/signout", {});
  } catch (error) {
    // Ignore errors for sign out
  }
};

export const getUserInfo = async (): Promise<User> => {
  // The new apiClient handles authentication automatically
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const getUserProfile = async (): Promise<User> => {
  // The new apiClient handles authentication automatically
  const response = await apiClient.get("/auth/profile");
  return response.data;
};

export const updateUserProfile = async (
  profileData: Partial<User>
): Promise<User> => {
  // The new apiClient handles authentication automatically
  const response = await apiClient.patch("/auth/profile", profileData);
  return response.data;
};

export const uploadAvatar = async (
  file: any,
  isUpdate: boolean = false
): Promise<{ avatarUrl: string }> => {
  const token = await AsyncStorage.getItem("accessToken");
  const endpoint = "/upload/avatar";
  const method = isUpdate ? "PATCH" : "POST";
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.data;
};
