import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Post,
  CreatePostData,
  UpdatePostData,
  LikeResponseDto,
} from "../types/posts";
import { ApiResponse } from "../types/auth";

// API Base URL - should match your backend server
const API_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://10.0.0.7:3000";

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("accessToken");
};

// Get all posts (feed)
export const getPosts = async (): Promise<Post[]> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: ApiResponse<Post[]> = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn("Posts API not available yet:", error);
    return [];
  }
};

// Get posts by user
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: ApiResponse<Post[]> = await response.json();
    return json.data || [];
  } catch (error) {
    console.warn(`User posts API not available yet for user ${userId}:`, error);
    return [];
  }
};

// Get single post
export const getPost = async (postId: string): Promise<Post> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: ApiResponse<Post> = await response.json();
  return json.data;
};

// Create new post
export const createPost = async (postData: CreatePostData): Promise<Post> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: ApiResponse<Post> = await response.json();
  return json.data;
};

// Update post (PATCH)
export const updatePost = async (
  postId: string,
  updateData: UpdatePostData
): Promise<Post> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: ApiResponse<Post> = await response.json();
  return json.data;
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Response data is null, so we just return void
};

// Like/unlike post
export const toggleLikePost = async (
  postId: string
): Promise<LikeResponseDto> => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: ApiResponse<LikeResponseDto> = await response.json();
  return json.data;
};
