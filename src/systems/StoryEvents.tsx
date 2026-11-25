import { useEffect } from 'react';
import { useGameStore } from './gameStore';

export function useStoryProgression() {
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

export function StoryEvents() {
  const isStarted = useGameStore((s) => s.isStarted);

  useEffect(() => {
    if (!isStarted) return;
    const events = [
      { msg: 'Street Event: Helped a commuter find the MTC bus (+₹20, +2 Rep)', money: 20, rep: 2 },
      { msg: 'Street Event: Free hot sundal sample at the corner! (+10 Mood)', money: 0, rep: 1 },
      { msg: 'Street Event: Returned a dropped tiffin box (+₹30, +3 Rep)', money: 30, rep: 3 },
    ];
    const id = setInterval(() => {
      const s = useGameStore.getState();
      if (!s.isStarted || s.isPaused || s.activeJob || s.activeMinigame) return;
      const ev = events[Math.floor(Math.random() * events.length)];
      s.modifyStats({ money: ev.money, reputation: ev.rep, mood: 8 });
      s.showToast(ev.msg);
    }, 45000);
    return () => clearInterval(id);
  }, [isStarted]);

  return null;
}
