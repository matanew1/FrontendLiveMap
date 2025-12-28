export interface NearbyUser {
  id: string;
  user_id?: string; // For backward compatibility
  email: string;
  dogName?: string;
  dogBreed?: string;
  dogAge?: number;
  lat: number;
  lng: number;
  distance: number;
  avatarUrl?: string;
}

export interface LocationFilters {
  breed?: string;
  age?: number;
  radius?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
}

export interface SocketLocationUpdate {
  updated: {
    user_id: string;
    lat: number;
    lng: number;
  };
  nearby: Array<{
    user_id: string;
    email: string;
    dogName?: string;
    dogBreed?: string;
    dogAge?: number;
    lat: number;
    lng: number;
    distance: number;
    avatarUrl?: string;
  }>;
}
