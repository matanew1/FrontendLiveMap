export interface User {
  id: string;
  email: string;
  dogName?: string;
  dogBreed?: string;
  dogAge?: number;
  avatarUrl?: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken?: string; // Optional as it might not be in all responses
}

export interface SigninResponse extends ApiResponse<AuthData> {}

export interface SignupResponse
  extends ApiResponse<{
    user: User;
    session?: { access_token: string; refresh_token: string };
  }> {}

export interface ProfileResponse extends ApiResponse<User> {}
