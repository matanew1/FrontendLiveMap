import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPosts,
  getUserPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
} from "../api/posts";
import { Post, CreatePostData, UpdatePostData } from "../types/posts";

// Query keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  userPosts: (userId: string) => [...postKeys.all, "user", userId] as const,
};

// Get all posts (feed)
export const usePosts = () => {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: getPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get posts by user
export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: postKeys.userPosts(userId),
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

// Get single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Update post (PATCH)
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: UpdatePostData }) =>
      updatePost(postId, data),
    onSuccess: (updatedPost) => {
      // Update the post in cache
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedPostId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(deletedPostId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Toggle like on post
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLikePost,
    onSuccess: (result, postId) => {
      // Update the like count in the post cache
      queryClient.setQueryData<Post | undefined>(
        postKeys.detail(postId),
        (oldPost) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            likes: result.likes,
          };
        }
      );
      // Invalidate lists to update like counts there too
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
