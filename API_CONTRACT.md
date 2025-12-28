# CyDog App - Posts API Contract

## Overview
This document outlines the API contract for the Posts functionality in the CyDog mobile application. Use this specification to build the backend that connects to the React Native frontend.

## 🔐 Authentication
All post endpoints require **Bearer token authentication** in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## 📋 API Endpoints

### 1. Get All Posts (Feed)
**GET** `/posts`

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "user": "string", // username/display name
    "breed": "string",
    "age": 3,
    "location": "string",
    "content": "string",
    "time": "string", // e.g., "2h ago"
    "likes": 42,
    "imageUrl": "string", // optional
    "createdAt": "2025-12-28T10:00:00Z",
    "updatedAt": "2025-12-28T10:00:00Z"
  }
]
```

### 2. Get Posts by User
**GET** `/posts/user/{userId}`

**Parameters:**
- `userId` (path): User ID string

**Response:** Same as above, filtered by user

### 3. Get Single Post
**GET** `/posts/{postId}`

**Parameters:**
- `postId` (path): Post ID string

**Response:** Single post object (same structure as above)

### 4. Create New Post
**POST** `/posts`

**Request Body:**
```json
{
  "content": "string", // required
  "location": "string" // optional
}
```

**Response:** Created post object (same structure as above)

### 5. Update Post
**PATCH** `/posts/{postId}`

**Parameters:**
- `postId` (path): Post ID string

**Request Body:**
```json
{
  "content": "string", // optional
  "location": "string" // optional
}
```

**Response:** Updated post object

### 6. Delete Post
**DELETE** `/posts/{postId}`

**Parameters:**
- `postId` (path): Post ID string

**Response:** `204 No Content`

### 7. Toggle Like on Post
**POST** `/posts/{postId}/like`

**Parameters:**
- `postId` (path): Post ID string

**Request Body:** Empty `{}`

**Response:**
```json
{
  "likes": 43 // updated like count
}
```

## 📸 Image Upload for Posts

If posts support images, you'll need a file upload endpoint:

**POST/PATCH** `/upload/post-image`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Image file
- `postId`: (for updates)

**Response:**
```json
{
  "data": {
    "imageUrl": "https://your-storage-url/image.jpg"
  }
}
```

## 🗄️ Database Schema Suggestions

### Posts Table
```sql
CREATE TABLE posts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  location VARCHAR(255),
  image_url VARCHAR(500),
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Post Likes Table
```sql
CREATE TABLE post_likes (
  id VARCHAR(255) PRIMARY KEY,
  post_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_user_like (post_id, user_id)
);
```

## 🔧 Implementation Notes

1. **User Data Population**: When returning posts, include user information (username, breed, age) from the users table
2. **Time Formatting**: The `time` field should be human-readable (e.g., "2h ago", "1d ago")
3. **Like Toggle Logic**:
   - If user hasn't liked the post → add like, increment count
   - If user already liked → remove like, decrement count
4. **Authorization**: Ensure users can only update/delete their own posts
5. **Image Storage**: Use cloud storage (AWS S3, Supabase Storage, etc.) for post images
6. **Pagination**: Consider adding pagination for the feed endpoint as it grows

## 🚀 Error Responses

Use consistent error format:
```json
{
  "message": "Error description",
  "statusCode": 400
}
```

## 📱 Frontend Integration

The frontend uses:
- **React Query** for caching and optimistic updates
- **Automatic token refresh** for authentication
- **Real-time updates** via WebSocket for likes and new posts

Ensure your API responses are consistent with the expected data structures!</content>
<parameter name="filePath">C:\Users\מתן\Desktop\CyDogApp\API_CONTRACT.md