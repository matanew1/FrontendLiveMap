const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://10.0.0.7:3000";

import { apiClient } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  SigninResponse,
  SignupResponse,
  ApiResponse,
} from "../types/auth";

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

  const json: SigninResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.message || "Sign in failed");
  }

  const { user, accessToken, refreshToken } = json.data;

  return {
    user,
    accessToken,
    refreshToken: refreshToken || "",
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

  const json: SignupResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.message || "Sign up failed");
  }

  // The backend mirrors Supabase signup response.
  // If email confirmation is required, session might be null.
  // We'll handle what we can.
  const { user, session } = json.data;

  const accessToken = session?.access_token || "";
  const refreshToken = session?.refresh_token || "";

  // If no token, we might need to throw or return empty strings
  // For now, we return what we have, but the caller should check.
  // Ideally, the UI should redirect to login if no token.

  return {
    user,
    accessToken,
    refreshToken,
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
