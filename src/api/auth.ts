const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

import { apiClient } from "../services/api";

export interface User {
  id: string;
  email: string;
  dogName?: string;
  dogBreed?: string;
  dogAge?: number;
  role?: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: User;
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface ProfileResponse {
  statusCode: number;
  message: string;
  data: User;
}

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

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; user: User }> => {
  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data: AuthResponse = await response.json();
  const { user, session } = data.data;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user,
  };
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

export const updateUserRole = async (
  userId: string,
  role: string
): Promise<void> => {
  // The new apiClient handles authentication automatically
  await apiClient.patch(`/auth/role/${userId}`, { role });
};
