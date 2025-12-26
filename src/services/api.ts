// src/services/api.ts
const API_BASE_URL = __DEV__
  ? "http://10.0.0.9:3000"
  : "https://your-production-api.com";

export const apiClient = {
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
