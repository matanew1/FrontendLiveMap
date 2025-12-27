export interface User {
  id: string;
  email: string;
  dogName?: string;
  dogBreed?: string;
  dogAge?: number;
  avatarUrl?: string;
  role?: string;
  lastLocation?: {
    lat: number;
    lng: number;
  } | null;
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
