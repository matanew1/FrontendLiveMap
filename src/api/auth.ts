const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

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

export const signOut = async (accessToken: string): Promise<void> => {
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

  const data: AuthResponse = await response.json();
  return data.data.user;
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

export const getUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get user profile");
  }

  const data: ProfileResponse = await response.json();
  return data.data;
};

export const updateUserProfile = async (
  token: string,
  profileData: Partial<User>
): Promise<User> => {
  const response = await fetch(`${BACKEND_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }

  const data: ProfileResponse = await response.json();
  return data.data;
};

export const updateUserRole = async (
  token: string,
  userId: string,
  role: string
): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}/auth/role/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user role");
  }
};
