import { apiClient } from "../services/api";
import { Post, CreatePostData, UpdatePostData } from "../types/posts";

// Get all posts (feed)
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiClient.get("/posts");
    return response.data || [];
  } catch (error) {
    console.warn("Posts API not available yet:", error);
    // Return empty array when backend is not ready
    return [];
  }
};

// Get posts by user
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`/posts/user/${userId}`);
    return response.data || [];
  } catch (error) {
    console.warn(`User posts API not available yet for user ${userId}:`, error);
    return [];
  }
};

// Get single post
export const getPost = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.warn(`Post API not available yet for post ${postId}:`, error);
    throw error; // Re-throw for single post as it's expected to exist
  }
};

// Create new post
export const createPost = async (postData: CreatePostData): Promise<Post> => {
  try {
    const response = await apiClient.post("/posts", postData);
    return response.data;
  } catch (error) {
    console.warn("Create post API not available yet:", error);
    throw error; // Re-throw as this is a user action
  }
};

// Update post (PATCH)
export const updatePost = async (
  postId: string,
  updateData: UpdatePostData
): Promise<Post> => {
  try {
    const response = await apiClient.patch(`/posts/${postId}`, updateData);
    return response.data;
  } catch (error) {
    console.warn(
      `Update post API not available yet for post ${postId}:`,
      error
    );
    throw error; // Re-throw as this is a user action
  }
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await apiClient.delete(`/posts/${postId}`);
  } catch (error) {
    console.warn(
      `Delete post API not available yet for post ${postId}:`,
      error
    );
    throw error; // Re-throw as this is a user action
  }
};

// Like/unlike post
export const toggleLikePost = async (
  postId: string
): Promise<{ likes: number }> => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`, {});
    return response.data;
  } catch (error) {
    console.warn(
      `Toggle like API not available yet for post ${postId}:`,
      error
    );
    throw error; // Re-throw as this is a user action
  }
};
