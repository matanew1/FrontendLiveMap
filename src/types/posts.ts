export interface PostLocation {
  lat: number;
  lng: number;
}

export interface Post {
  id: string;
  userId: string;
  user: string; // Dog name
  breed: string;
  age: number;
  location: PostLocation | null;
  content: string;
  time: string; // Human-readable time (e.g., "2h ago")
  likes: number;
  imageUrl: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  isLiked?: boolean; // Whether current user has liked this post
}

export interface CreatePostData {
  content: string;
  location?: PostLocation;
}

export interface UpdatePostData {
  content?: string;
  location?: PostLocation;
}

export interface LikeResponseDto {
  likes: number; // Updated number of likes
}
