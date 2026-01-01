import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    retry: (failureCount, error) => {
      console.log(`Posts query failed (attempt ${failureCount + 1}):`, error);
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("not available")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Get posts by user
export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: postKeys.userPosts(userId),
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("not available")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Get single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("not available")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
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
    onError: (error) => {
      console.error("Failed to update post:", error);
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
    onError: (error) => {
      console.error("Failed to delete post:", error);
    },
  });
};

// Toggle like on post
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }: { postId: string; isCurrentlyLiked: boolean }) =>
      toggleLikePost(postId),
    onMutate: async ({
      postId,
      isCurrentlyLiked,
    }: {
      postId: string;
      isCurrentlyLiked: boolean;
    }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(postKeys.detail(postId));
      const previousPosts = queryClient.getQueryData(postKeys.lists());

      // Optimistically update individual post cache
      queryClient.setQueryData(
        postKeys.detail(postId),
        (old: Post | undefined) => {
          if (!old) return old;
          return {
            ...old,
            likes: old.likes + (isCurrentlyLiked ? -1 : 1), // Decrement if currently liked, increment if not
            isLiked: !isCurrentlyLiked, // Toggle the liked state
          };
        }
      );

      // Optimistically update posts list cache
      queryClient.setQueryData(
        postKeys.lists(),
        (oldPosts: Post[] | undefined) => {
          if (!oldPosts) return oldPosts;
          return oldPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes + (isCurrentlyLiked ? -1 : 1), // Decrement if currently liked, increment if not
                  isLiked: !isCurrentlyLiked,
                }
              : post
          );
        }
      );

      return { previousPost, previousPosts };
    },
    onSuccess: (data, variables) => {
      const { postId } = variables;
      // Update individual post cache with server response
      queryClient.setQueryData(
        postKeys.detail(postId),
        (oldPost: Post | undefined) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            likes: data.likes,
            isLiked: !oldPost.isLiked, // Toggle the liked state
          };
        }
      );

      // Update posts list cache with server response
      queryClient.setQueryData(
        postKeys.lists(),
        (oldPosts: Post[] | undefined) => {
          if (!oldPosts) return oldPosts;
          return oldPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: data.likes,
                  isLiked: !post.isLiked,
                }
              : post
          );
        }
      );
    },
    onError: (err, variables, context) => {
      const { postId } = variables;
      // Revert individual post cache
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }

      // Revert posts list cache
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }

      console.error("Failed to toggle like:", err);
    },
  });
};
