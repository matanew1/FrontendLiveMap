import { useQuery } from "@tanstack/react-query";
import { fetchStats, StatsData } from "../api/stats";

export const useStats = () => {
  return useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
