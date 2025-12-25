import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserLocation {
  user_id: string;
  lat: number;
  lng: number;
  distance?: number;
  lastSeen?: number;
  isNew?: boolean;
}

export const locationKeys = {
  nearbyUsers: (userId: string) => ["nearbyUsers", userId] as const,
};

export const useNearbyUsers = (userId: string) => {
  return useQuery({
    queryKey: locationKeys.nearbyUsers(userId),
    queryFn: async (): Promise<UserLocation[]> => [],
    staleTime: Infinity,
  });
};

export const updateNearbyUsers = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  data: { updated: any; nearby: UserLocation[] },
  myLocation: { lat: number; lng: number },
  searchRadius: number
) => {
  const currentNearby =
    queryClient.getQueryData(locationKeys.nearbyUsers(userId)) || [];

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const newNearbyMap = new Map<string, UserLocation>();

  // Keep existing users if they are within radius
  (currentNearby as UserLocation[]).forEach((u) => {
    const distance = calculateDistance(
      myLocation.lat,
      myLocation.lng,
      u.lat,
      u.lng
    );
    if (distance <= searchRadius) {
      newNearbyMap.set(u.user_id, { ...u, isNew: false });
    }
  });

  // Merge new data from server
  data.nearby.forEach((u) => {
    if (u.user_id === userId) return; // Don't add myself

    const distance = calculateDistance(
      myLocation.lat,
      myLocation.lng,
      u.lat,
      u.lng
    );
    if (distance <= searchRadius) {
      const isNew = !newNearbyMap.has(u.user_id);
      newNearbyMap.set(u.user_id, {
        ...u,
        isNew: isNew,
      });
    }
  });

  queryClient.setQueryData(
    locationKeys.nearbyUsers(userId),
    Array.from(newNearbyMap.values())
  );
};
