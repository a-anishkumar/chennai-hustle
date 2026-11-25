import { useGameStore } from './gameStore';

export function useStoryProgression(): string {
  const money = useGameStore((s) => s.money);
  const unlockedVehicles = useGameStore((s) => s.unlockedVehicles);
  const fastTravelUnlocked = useGameStore((s) => s.fastTravelUnlocked);
  const floodAidCount = useGameStore((s) => s.floodAidCount);

  if (money < 100) return 'Chapter 1: Earn your first ₹100 via FoodZip or Tea Kadai';
  if (!unlockedVehicles.includes('bike')) return 'Chapter 2: Save ₹1,200 & buy the 125cc Scooter in Garage';
  if (!fastTravelUnlocked) return 'Chapter 3: Climb Chennai Lighthouse (1420, 360) for Fast-Travel';
  if (floodAidCount === 0) return 'Chapter 4: Survive the Monsoon Flood & help neighbours';
  return 'Free Hustle: Explore all 10 landmarks & grow your Chennai empire!';
}
