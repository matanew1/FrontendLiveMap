import { api } from "../services/api";

export interface StatsData {
  globalTreats: number;
  dogOfTheDay: {
    name: string;
    breed: string;
    imageUrl: string;
    bio: string;
  };
  dailyFact: string;
  trendingBreeds: {
    breed: string;
    count: number;
    trend: "up" | "down" | "stable";
  }[];
  topParks: { name: string; visitors: number; rating: number }[];
}

export const fetchStats = async (): Promise<StatsData> => {
  // In a real app, this would be:
  // const { data } = await api.get("/stats/dashboard");
  // return data;

  // Mock data for now to demonstrate the UI
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        globalTreats: 12450,
        dogOfTheDay: {
          name: "Barnaby",
          breed: "Corgi Mix",
          imageUrl:
            "https://images.unsplash.com/photo-1612536050356-608799d89c40?q=80&w=1000&auto=format&fit=crop",
          bio: "Professional napper and sock thief. Loves belly rubs!",
        },
        dailyFact: "Dogs' sense of smell is at least 40x better than ours!",
        trendingBreeds: [
          { breed: "Golden Retriever", count: 145, trend: "up" },
          { breed: "French Bulldog", count: 120, trend: "up" },
          { breed: "Border Collie", count: 98, trend: "stable" },
          { breed: "Shiba Inu", count: 85, trend: "down" },
        ],
        topParks: [
          { name: "Central Bark", visitors: 340, rating: 4.8 },
          { name: "Sunny Paws Park", visitors: 210, rating: 4.5 },
          { name: "Riverside Run", visitors: 180, rating: 4.2 },
        ],
      });
    }, 1000);
  });
};
