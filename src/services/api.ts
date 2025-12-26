// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "../api/auth";
import useAuthStore from "../../store/authStore";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const refreshTokenIfNeeded = async (): Promise<string | null> => {
  if (isRefreshing) {
    // If refresh is already in progress, wait for it
    if (refreshPromise) {
      await refreshPromise;
    }
    // Return the new token
    return await AsyncStorage.getItem("accessToken");
  }

  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    // No refresh token available, user needs to sign in again
    useAuthStore.getState().setUser(null);
    throw new Error("No refresh token available");
  }

  isRefreshing = true;
  try {
    refreshPromise = refreshAccessToken(refreshToken);

    const data = await refreshPromise;

    // Update stored tokens
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    // Update user in store
    useAuthStore.getState().setUser(data.user);

    return data.accessToken;
  } catch (error) {
    // Refresh failed, sign out user
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    useAuthStore.getState().setUser(null);
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const makeRequest = async (
  method: string,
  endpoint: string,
  data?: any,
  retryCount = 0
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add Authorization header if token exists
  if (authHeaders.Authorization) {
    headers.Authorization = authHeaders.Authorization;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  const result = await response.json();

  // If unauthorized and we haven't retried yet, try to refresh token
  if (response.status === 401 && retryCount === 0) {
    try {
      const newToken = await refreshTokenIfNeeded();

      // Retry the request with new token
      const retryHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      };

      const retryConfig: RequestInit = {
        method,
        headers: retryHeaders,
      };

      if (
        data &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        retryConfig.body = JSON.stringify(data);
      }

      const retryResponse = await fetch(url, retryConfig);
      const retryResult = await retryResponse.json();

      if (!retryResponse.ok) {
        throw new Error(
          retryResult.message || "API request failed after token refresh"
        );
      }

      return retryResult;
    } catch (refreshError) {
      // Token refresh failed, throw the original error
      throw new Error(result.message || "Authentication failed");
    }
  }

  if (!response.ok) {
    throw new Error(result.message || "API request failed");
  }

  return result;
};

export const apiClient = {
  get: (endpoint: string) => makeRequest("GET", endpoint),
  post: (endpoint: string, data: any) => makeRequest("POST", endpoint, data),
  put: (endpoint: string, data: any) => makeRequest("PUT", endpoint, data),
  patch: (endpoint: string, data: any) => makeRequest("PATCH", endpoint, data),
  delete: (endpoint: string) => makeRequest("DELETE", endpoint),
};

// Legacy apiClient for backward compatibility
export const legacyApiClient = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result;
  },
};
