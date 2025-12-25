const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

export interface User {
  id: string;
  email: string;
}

export const signIn = async (email: string, password: string) => {
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

  const data = await response.json();
  const responseData = data.data || data;
  let accessToken: string;
  let refreshToken: string;

  if (responseData.session) {
    accessToken = responseData.session.access_token;
    refreshToken = responseData.session.refresh_token;
  } else {
    accessToken = responseData.accessToken || responseData.access_token;
    refreshToken = responseData.refreshToken || responseData.refresh_token;
  }

  if (!accessToken || !refreshToken) {
    throw new Error("Invalid response from server: missing tokens");
  }

  return { accessToken, refreshToken };
};

export const signUp = async (email: string, password: string) => {
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

  const data = await response.json();
  const responseData = data.data || data;
  let accessToken: string;
  let refreshToken: string;

  if (responseData.session) {
    accessToken = responseData.session.access_token;
    refreshToken = responseData.session.refresh_token;
  } else {
    accessToken = responseData.accessToken || responseData.access_token;
    refreshToken = responseData.refreshToken || responseData.refresh_token;
  }

  if (!accessToken || !refreshToken) {
    throw new Error("Invalid response from server: missing tokens");
  }

  return { accessToken, refreshToken };
};

export const signOut = async (accessToken: string) => {
  await fetch(`${BACKEND_URL}/auth/signout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  // Ignore errors for sign out
};

export const getUserInfo = async (token: string): Promise<User> => {
  const response = await fetch(`${BACKEND_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  const responseData = await response.json();
  const userData = responseData.data.user;
  return {
    id: userData.id,
    email: userData.email,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
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

  const data = await response.json();
  let accessToken: string;
  let newRefreshToken: string;

  if (data.session) {
    accessToken = data.session.access_token;
    newRefreshToken = data.session.refresh_token;
  } else {
    accessToken = data.accessToken || data.access_token;
    newRefreshToken = data.refreshToken || data.refresh_token;
  }

  if (!accessToken || !newRefreshToken) {
    throw new Error("Invalid refresh response from server");
  }

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
