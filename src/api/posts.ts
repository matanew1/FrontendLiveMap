import { apiClient } from "../services/api";
import { Post, CreatePostData, UpdatePostData } from "../types/posts";

// Get all posts (feed)
export const getPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get("/posts");
  return response.data;
};

// Get posts by user
export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await apiClient.get(`/posts/user/${userId}`);
  return response.data;
};

// Get single post
export const getPost = async (postId: string): Promise<Post> => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
};

// Create new post
export const createPost = async (postData: CreatePostData): Promise<Post> => {
  const response = await apiClient.post("/posts", postData);
  return response.data;
};

// Update post (PATCH)
export const updatePost = async (
  postId: string,
  updateData: UpdatePostData
): Promise<Post> => {
  const response = await apiClient.patch(`/posts/${postId}`, updateData);
  return response.data;
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};

// Like/unlike post
export const toggleLikePost = async (
  postId: string
): Promise<{ likes: number }> => {
  const response = await apiClient.post(`/posts/${postId}/like`, {});
  return response.data;
};
