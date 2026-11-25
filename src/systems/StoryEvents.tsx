import { useEffect } from 'react';
import { useGameStore } from './gameStore';

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
