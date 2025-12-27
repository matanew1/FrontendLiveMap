export interface Post {
  id: string;
  userId: string;
  user: string;
  breed: string;
  age: number;
  location: string;
  content: string;
  time: string;
  likes: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  location?: string;
}

export interface UpdatePostData {
  content?: string;
  location?: string;
}
