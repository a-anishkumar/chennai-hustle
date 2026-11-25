import { create } from 'zustand';
import worldConfig from '../config/world.json';
import jobsConfig from '../config/jobs.json';
import { audioManager } from '../audio/AudioManager';
import {
  clearSaveData,
  hasSaveData,
  readSaveData,
  writeSaveData,
} from './SaveSystem';
import type {
  JobType,
  MinigameType,
  PastedPoster,
  PhoneMessage,
  QualityLevel,
  SaveData,
  Transaction,
  VehicleType,
  WeatherType,
} from './SaveSystem';

export interface ActiveJob {
  id: string;
  jobType: JobType;
  title: string;
  stage: 'pickup' | 'dropoff';
  pickupPos: [number, number, number];
  pickupName: string;
  dropoffPos: [number, number, number];
  dropoffName: string;
  elapsedSec: number;
  timeLimitSec?: number;
  tempScore: number;
  basePayout: number;
  surgeMultiplier: number;
}

export interface GameState {
  isStarted: boolean;
  isLoading: boolean;
  loadProgress: number;
  isPaused: boolean;
  isPhoneOpen: boolean;
  activeMinigame: MinigameType | null;
  pendingTeleport: [number, number, number] | null;
  quality: QualityLevel;
  fps: number;

  // Player stats
  money: number;
  stamina: number;
  hunger: number;
  mood: number;
  fuel: number;
  reputation: number;

  // World & time
  dayCount: number;
  timeOfDay: number;
  timeScale: number;
  weather: WeatherType;
  rainIntensity: number; // 0..1
  waterLevel: number; // -0.8 (normal) .. +0.85 (flood)
  floodAidCount: number;
  floodSurgeCount: number;
  showEndingModal: boolean;
  showSettings: boolean;
  subtitles: boolean;
  reducedMotion: boolean;
  colorBlind: boolean;
  forceTouchControls: boolean;
  fastTravelUnlocked: boolean;
  pastedPosters: PastedPoster[];

  // Player transform & vehicle
  currentVehicle: VehicleType;
  unlockedVehicles: VehicleType[];
  playerPos: [number, number, number];
  playerRotY: number;
  currentChunk: [number, number];
  nearestLandmark: string;

  // Jobs, Wallet & Phone
  activeJob: ActiveJob | null;
  ratings: { bikeTaxi: number; foodDelivery: number; completedCount: number };
  transactions: Transaction[];
  messages: PhoneMessage[];
  toastMessage: string | null;

  // Actions
  setLoading: (loading: boolean, progress?: number) => void;
  startGame: (loadSaved: boolean) => void;
  setQuality: (quality: QualityLevel) => void;
  setFps: (fps: number) => void;
  setPhoneOpen: (open: boolean) => void;
  togglePhone: () => void;
  openMinigame: (m: MinigameType | null) => void;
  setTimeOfDay: (hour: number) => void;
  cycleWeather: () => void;
  setShowEndingModal: (open: boolean) => void;
  setShowSettings: (open: boolean) => void;
  toggleAccessibility: (key: 'subtitles' | 'reducedMotion' | 'colorBlind' | 'forceTouchControls') => void;
  startFloodReliefMission: () => void;
  advanceTime: (deltaSec: number) => void;
  toggleVehicleCycle: () => void;
  setVehicle: (v: VehicleType) => void;
  buyVehicle: (v: VehicleType) => boolean;
  buySnack: (name: string, cost: number, hungerGain: number, moodGain: number) => boolean;
  unlockFastTravel: () => void;
  fastTravelTo: (x: number, z: number, label: string) => void;
  clearPendingTeleport: () => void;
  addPastedPoster: (poster: PastedPoster) => void;
  updatePlayerTransform: (pos: [number, number, number], rotY: number) => void;
  modifyStats: (delta: Partial<{ money: number; stamina: number; hunger: number; mood: number; fuel: number; reputation: number }>) => void;
  completeMinigameReward: (title: string, moneyEarned: number, repEarned: number, staminaCost: number, moodGain?: number) => void;
  startJob: (job: ActiveJob) => void;
  advanceJobStage: () => void;
  tickActiveJob: (dt: number) => void;
  cancelActiveJob: () => void;
  restAtHome: () => void;
  saveGame: () => boolean;
  resetGame: () => void;
  showToast: (msg: string) => void;
}

const DEFAULT_SPAWN: [number, number, number] = [-108, 1.0, 60];

export function worldToChunk(x: number, z: number): [number, number] {
  const half = worldConfig.worldSize / 2;
  const cx = Math.floor((x + half) / worldConfig.chunkSize);
  const cz = Math.floor((z + half) / worldConfig.chunkSize);
  return [
    Math.max(0, Math.min(worldConfig.gridCount - 1, cx)),
    Math.max(0, Math.min(worldConfig.gridCount - 1, cz)),
  ];
}

function findNearestLandmark(x: number, z: number): string {
  let best = 'Chennai Streets';
  let bestDist = 240 * 240;
  for (const lm of worldConfig.landmarks) {
    const dx = x - lm.x;
    const dz = z - lm.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestDist) {
      bestDist = d2;
      best = lm.name;
    }
  }
  return best;
}

function formatShortTime(hour: number): string {
  const h24 = Math.floor(hour) % 24;
  const mins = Math.floor((hour - Math.floor(hour)) * 60);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const INITIAL_MESSAGES: PhoneMessage[] = [
  {
    id: 'm1',
    sender: 'Karthik (Roommate)',
    text: 'Machi, welcome to Nethaji Nagar! Cycle outside-la irukku. Open FoodZip or Dash10 on your phone!',
    time: '8:30 AM',
  },
  {
    id: 'm2',
    sender: 'Chennai Tourism',
    text: 'Tip: Climb the Chennai Lighthouse on the East Coast to unlock Fast-Travel across all 10 landmarks!',
    time: '8:31 AM',
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  isStarted: false,
  isLoading: true,
  loadProgress: 0,
  isPaused: false,
  isPhoneOpen: false,
  activeMinigame: null,
  pendingTeleport: null,
  quality: 'medium',
  fps: 60,

  money: 0,
  stamina: 100,
  hunger: 100,
  mood: 85,
  fuel: 100,
  reputation: 0,

  dayCount: 1,
  timeOfDay: 8.5,
  timeScale: 0.025,
  weather: 'sunny',
  rainIntensity: 0,
  waterLevel: -0.8,
  floodAidCount: 0,
  floodSurgeCount: 0,
  showEndingModal: false,
  showSettings: false,
  subtitles: true,
  reducedMotion: false,
  colorBlind: false,
  forceTouchControls: false,
  fastTravelUnlocked: false,
  pastedPosters: [],

  currentVehicle: 'foot',
  unlockedVehicles: ['foot', 'cycle'],
  playerPos: DEFAULT_SPAWN,
  playerRotY: 0,
  currentChunk: worldToChunk(DEFAULT_SPAWN[0], DEFAULT_SPAWN[2]),
  nearestLandmark: 'Nethaji Nagar TNHB Colony',

  activeJob: null,
  ratings: { bikeTaxi: 4.8, foodDelivery: 4.9, completedCount: 0 },
  transactions: [],
  messages: INITIAL_MESSAGES,

  toastMessage: null,

  setLoading: (loading, progress) =>
    set((s) => ({
      isLoading: loading,
      loadProgress: progress !== undefined ? progress : s.loadProgress,
    })),

  startGame: (loadSaved) => {
    audioManager.init();
    if (loadSaved && hasSaveData()) {
      const data = readSaveData();
      if (data) {
        set({
          isStarted: true,
          money: data.money,
          stamina: data.stamina,
          hunger: data.hunger,
          mood: data.mood,
          fuel: data.fuel,
          reputation: data.reputation,
          dayCount: data.dayCount,
          timeOfDay: data.timeOfDay,
          weather: data.weather ?? 'sunny',
          waterLevel: data.waterLevel ?? -0.8,
          floodAidCount: data.floodAidCount ?? 0,
          floodSurgeCount: data.floodSurgeCount ?? 0,
          currentVehicle: data.currentVehicle,
          unlockedVehicles: data.unlockedVehicles,
          fastTravelUnlocked: data.fastTravelUnlocked ?? false,
          pastedPosters: data.pastedPosters ?? [],
          playerPos: data.playerPos,
          playerRotY: data.playerRotY,
          quality: data.quality || 'medium',
          ratings: data.ratings || { bikeTaxi: 4.8, foodDelivery: 4.9, completedCount: 0 },
          transactions: data.transactions || [],
          currentChunk: worldToChunk(data.playerPos[0], data.playerPos[2]),
          nearestLandmark: findNearestLandmark(data.playerPos[0], data.playerPos[2]),
          toastMessage: 'Saved hustle loaded! Press P to open your Phone.',
        });
        return;
      }
    }
    set({
      isStarted: true,
      money: 0,
      stamina: 100,
      hunger: 100,
      mood: 85,
      fuel: 100,
      reputation: 0,
      dayCount: 1,
      timeOfDay: 8.5,
      fastTravelUnlocked: false,
      pastedPosters: [],
      currentVehicle: 'foot',
      unlockedVehicles: ['foot', 'cycle'],
      playerPos: DEFAULT_SPAWN,
      playerRotY: 0,
      activeJob: null,
      activeMinigame: null,
      ratings: { bikeTaxi: 4.8, foodDelivery: 4.9, completedCount: 0 },
      transactions: [],
      messages: INITIAL_MESSAGES,
      currentChunk: worldToChunk(DEFAULT_SPAWN[0], DEFAULT_SPAWN[2]),
      nearestLandmark: 'Nethaji Nagar TNHB Colony',
      toastMessage: 'Welcome! Press P for Phone (Jobs & Map), B for Cycle.',
    });
  },

  setQuality: (quality) => set({ quality }),
  setFps: (fps) => set({ fps }),
  setPhoneOpen: (open) => set({ isPhoneOpen: open }),
  togglePhone: () => set((s) => ({ isPhoneOpen: !s.isPhoneOpen })),
  openMinigame: (m) => set({ activeMinigame: m, isPhoneOpen: false }),
  setTimeOfDay: (hour) => set({ timeOfDay: ((hour % 24) + 24) % 24 }),

  cycleWeather: () => {
    const order: WeatherType[] = ['sunny', 'humid', 'monsoon', 'flood'];
    const s = get();
    const next = order[(order.indexOf(s.weather) + 1) % order.length];
    const rain = next === 'monsoon' ? 0.65 : next === 'flood' ? 1.0 : next === 'humid' ? 0.15 : 0;
    const targetWater = next === 'flood' ? 0.65 : next === 'monsoon' ? -0.15 : -0.8;
    const unlocked =
      next === 'flood' && !s.unlockedVehicles.includes('boat')
        ? ([...s.unlockedVehicles, 'boat'] as VehicleType[])
        : s.unlockedVehicles;
    audioManager.setRainVolume(rain * 0.4);
    set({
      weather: next,
      rainIntensity: rain,
      waterLevel: targetWater,
      unlockedVehicles: unlocked,
      toastMessage:
        next === 'flood'
          ? 'FLOOD ALERT! Low-lying roads submerged. Rescue Boat unlocked [B]!'
          : next === 'monsoon'
          ? 'Monsoon Downpour! FoodZip rain bonus (1.45x) active!'
          : `Weather changed to: ${next.toUpperCase()}`,
    });
  },

  setShowEndingModal: (open) => set({ showEndingModal: open }),
  setShowSettings: (open) => set({ showSettings: open }),
  toggleAccessibility: (key) => set((s) => ({ [key]: !s[key] })),

  startFloodReliefMission: () => {
    const s = get();
    set({
      currentVehicle: s.unlockedVehicles.includes('boat') ? 'boat' : s.currentVehicle,
      activeJob: {
        id: `relief_${Date.now()}`,
        jobType: 'floodRelief',
        title: 'Flood Relief: Ferry Food & Water',
        stage: 'pickup',
        pickupPos: [-120, 0, 96],
        pickupName: 'Nethaji Nagar Relief Camp',
        dropoffPos: [40, 0, 165],
        dropoffName: 'Canal Bank Shelter',
        elapsedSec: 0,
        tempScore: 100,
        basePayout: 140,
        surgeMultiplier: 1.0,
      },
      isPhoneOpen: false,
      toastMessage: 'Relief Mission: Pick up supplies at Nethaji Nagar & ferry to Canal Shelter!',
    });
  },

  advanceTime: (deltaSec) => {
    const s = get();
    if (!s.isStarted || s.isPaused) return;
    let nextHour = s.timeOfDay + deltaSec * s.timeScale;
    let nextDay = s.dayCount;
    if (nextHour >= 24) {
      nextHour -= 24;
      nextDay += 1;
    }
    const hungerLoss = deltaSec * 0.1;

    // Progressive weather over days: Day 1 sunny, Day 2 humid, Day 3 monsoon, Day 4+ flood
    let weather = s.weather;
    if (nextDay !== s.dayCount) {
      if (nextDay === 2) weather = 'humid';
      else if (nextDay === 3) weather = 'monsoon';
      else if (nextDay >= 4) weather = 'flood';
    }

    const targetWater = weather === 'flood' ? 0.65 : weather === 'monsoon' ? -0.15 : -0.8;
    const nextWater = s.waterLevel + (targetWater - s.waterLevel) * Math.min(1, deltaSec * 0.25);

    set({
      timeOfDay: nextHour,
      dayCount: nextDay,
      weather,
      waterLevel: nextWater,
      hunger: Math.max(0, s.hunger - hungerLoss),
    });
  },

  toggleVehicleCycle: () => {
    const s = get();
    const list = s.unlockedVehicles;
    const idx = list.indexOf(s.currentVehicle);
    const next = list[(idx + 1) % list.length];
    const label = jobsConfig.vehicles[next]?.name || next;
    set({
      currentVehicle: next,
      toastMessage: `Switched to: ${label}`,
    });
  },

  setVehicle: (v) => set({ currentVehicle: v }),

  buyVehicle: (v) => {
    const s = get();
    if (s.unlockedVehicles.includes(v)) {
      set({ currentVehicle: v, toastMessage: `Equipped ${jobsConfig.vehicles[v].name}` });
      return true;
    }
    const price = jobsConfig.vehicles[v]?.price ?? 99999;
    if (s.money < price) {
      set({ toastMessage: `Need ₹${price} to buy ${jobsConfig.vehicles[v].name}!` });
      return false;
    }
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      title: `Bought ${jobsConfig.vehicles[v].name}`,
      amount: -price,
      time: formatShortTime(s.timeOfDay),
    };
    set({
      money: s.money - price,
      unlockedVehicles: [...s.unlockedVehicles, v],
      currentVehicle: v,
      transactions: [tx, ...s.transactions].slice(0, 20),
      toastMessage: `Purchased ${jobsConfig.vehicles[v].name}!`,
    });
    return true;
  },

  buySnack: (name, cost, hungerGain, moodGain) => {
    const s = get();
    if (s.money < cost) {
      set({ toastMessage: `Not enough ₹ for ${name}!` });
      return false;
    }
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      title: name,
      amount: -cost,
      time: formatShortTime(s.timeOfDay),
    };
    set({
      money: s.money - cost,
      hunger: clamp(s.hunger + hungerGain, 0, 100),
      mood: clamp(s.mood + moodGain, 0, 100),
      transactions: [tx, ...s.transactions].slice(0, 20),
      toastMessage: `Enjoyed ${name}! (+Hunger, +Mood)`,
    });
    return true;
  },

  unlockFastTravel: () => {
    const s = get();
    if (s.fastTravelUnlocked) {
      set({ toastMessage: 'Lighthouse Panoramic View — Fast-Travel already unlocked in NammaMap!' });
      return;
    }
    set({
      fastTravelUnlocked: true,
      reputation: s.reputation + 10,
      mood: clamp(s.mood + 15, 0, 100),
      toastMessage: 'Lighthouse Climbed! Fast-Travel unlocked across all 10 landmarks in NammaMap!',
    });
  },

  fastTravelTo: (x, z, label) => {
    const s = get();
    if (!s.fastTravelUnlocked) {
      set({ toastMessage: 'Climb the Chennai Lighthouse first to unlock Fast-Travel!' });
      return;
    }
    set({
      pendingTeleport: [x, 1.2, z],
      isPhoneOpen: false,
      toastMessage: `Fast-traveled to ${label}!`,
    });
  },

  clearPendingTeleport: () => set({ pendingTeleport: null }),

  addPastedPoster: (poster) =>
    set((s) => ({
      pastedPosters: [...s.pastedPosters, poster].slice(-40),
    })),

  updatePlayerTransform: (pos, rotY) => {
    const [cx, cz] = worldToChunk(pos[0], pos[2]);
    const prev = get().currentChunk;
    const landmark = findNearestLandmark(pos[0], pos[2]);
    if (cx !== prev[0] || cz !== prev[1] || landmark !== get().nearestLandmark) {
      set({ playerPos: pos, playerRotY: rotY, currentChunk: [cx, cz], nearestLandmark: landmark });
    } else {
      set({ playerPos: pos, playerRotY: rotY });
    }
  },

  modifyStats: (delta) =>
    set((s) => ({
      money: delta.money !== undefined ? Math.max(0, s.money + delta.money) : s.money,
      stamina: delta.stamina !== undefined ? clamp(s.stamina + delta.stamina, 0, 100) : s.stamina,
      hunger: delta.hunger !== undefined ? clamp(s.hunger + delta.hunger, 0, 100) : s.hunger,
      mood: delta.mood !== undefined ? clamp(s.mood + delta.mood, 0, 100) : s.mood,
      fuel: delta.fuel !== undefined ? clamp(s.fuel + delta.fuel, 0, 100) : s.fuel,
      reputation: delta.reputation !== undefined ? Math.max(0, s.reputation + delta.reputation) : s.reputation,
    })),

  completeMinigameReward: (title, moneyEarned, repEarned, staminaCost, moodGain = 5) => {
    audioManager.playCash();
    const s = get();
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      title,
      amount: moneyEarned,
      time: formatShortTime(s.timeOfDay),
    };
    set({
      money: s.money + moneyEarned,
      reputation: s.reputation + repEarned,
      stamina: clamp(s.stamina - staminaCost, 0, 100),
      mood: clamp(s.mood + moodGain, 0, 100),
      activeMinigame: null,
      ratings: { ...s.ratings, completedCount: s.ratings.completedCount + 1 },
      transactions: [tx, ...s.transactions].slice(0, 20),
      toastMessage: `${title}: +₹${moneyEarned} (+${repEarned} Rep)`,
    });
  },

  startJob: (job) => {
    set({
      activeJob: job,
      isPhoneOpen: false,
      toastMessage: `Job Accepted: ${job.title} — Head to ${job.pickupName}!`,
    });
  },

  advanceJobStage: () => {
    const s = get();
    const job = s.activeJob;
    if (!job) return;

    if (job.stage === 'pickup') {
      set({
        activeJob: { ...job, stage: 'dropoff' },
        toastMessage:
          job.jobType === 'foodDelivery'
            ? `Order picked up! Deliver hot to ${job.dropoffName}!`
            : job.jobType === 'quickCommerce'
            ? `Packed at Dark Store! Dash to ${job.dropoffName}!`
            : `Passenger on board! Drop at ${job.dropoffName}!`,
      });
    } else {
      const bonusFactor = job.jobType === 'foodDelivery' ? 0.6 + (job.tempScore / 100) * 0.6 : 1.0;
      const rainMult = (s.weather === 'monsoon' || s.weather === 'flood') && job.jobType === 'foodDelivery' ? 1.45 : 1.0;
      const floodSurge = s.weather === 'flood' && job.jobType !== 'floodRelief' ? 1.5 : 1.0;
      const earned = Math.round(job.basePayout * job.surgeMultiplier * bonusFactor * rainMult * floodSurge);
      const repGain =
        job.jobType === 'floodRelief' ? 18 : job.jobType === 'taxiCab' ? 6 : job.jobType === 'autoDriver' ? 5 : 4;
      const staminaCost = job.jobType === 'quickCommerce' ? 14 : 10;

      const nextAid = s.floodAidCount + (job.jobType === 'floodRelief' ? 1 : 0);
      const nextSurge = s.floodSurgeCount + (s.weather === 'flood' && job.jobType !== 'floodRelief' ? 1 : 0);
      audioManager.playCash();

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        title: `${job.title} (${job.dropoffName})`,
        amount: earned,
        time: formatShortTime(s.timeOfDay),
      };

      const msg: PhoneMessage = {
        id: `m_${Date.now()}`,
        sender: job.jobType,
        text: `₹${earned} credited to ChennaiPay! Rating: 5.0 ★`,
        time: formatShortTime(s.timeOfDay),
      };

      set({
        money: s.money + earned,
        reputation: s.reputation + repGain,
        stamina: clamp(s.stamina - staminaCost, 0, 100),
        floodAidCount: nextAid,
        floodSurgeCount: nextSurge,
        activeJob: null,
        ratings: {
          ...s.ratings,
          completedCount: s.ratings.completedCount + 1,
        },
        transactions: [tx, ...s.transactions].slice(0, 20),
        messages: [msg, ...s.messages].slice(0, 20),
        toastMessage: `Job Complete! Earned ₹${earned} (+${repGain} Rep)`,
      });
    }
  },

  tickActiveJob: (dt) => {
    const s = get();
    const job = s.activeJob;
    if (!job || !s.isStarted || s.isPaused) return;
    const nextElapsed = job.elapsedSec + dt;
    if (job.timeLimitSec && nextElapsed >= job.timeLimitSec) {
      set({ activeJob: null, toastMessage: `${job.title} timed out!` });
      return;
    }
    const nextTemp =
      job.jobType === 'foodDelivery' && job.stage === 'dropoff'
        ? Math.max(10, job.tempScore - dt * 0.85)
        : job.tempScore;
    set({
      activeJob: { ...job, elapsedSec: nextElapsed, tempScore: nextTemp },
    });
  },

  cancelActiveJob: () => set({ activeJob: null, toastMessage: 'Active job cancelled.' }),

  restAtHome: () => {
    const s = get();
    let nextHour = s.timeOfDay + 6;
    let nextDay = s.dayCount;
    if (nextHour >= 24) {
      nextHour -= 24;
      nextDay += 1;
    }
    set({
      stamina: 100,
      mood: clamp(s.mood + 20, 0, 100),
      timeOfDay: nextHour,
      dayCount: nextDay,
      toastMessage: 'Rested at TNHB Home Base (+Stamina, +Mood). Game Saved!',
    });
    get().saveGame();
  },

  saveGame: () => {
    const s = get();
    const payload: SaveData = {
      version: 1,
      savedAt: new Date().toISOString(),
      money: s.money,
      stamina: s.stamina,
      hunger: s.hunger,
      mood: s.mood,
      fuel: s.fuel,
      reputation: s.reputation,
      dayCount: s.dayCount,
      timeOfDay: s.timeOfDay,
      weather: s.weather,
      waterLevel: s.waterLevel,
      floodAidCount: s.floodAidCount,
      floodSurgeCount: s.floodSurgeCount,
      currentVehicle: s.currentVehicle,
      unlockedVehicles: s.unlockedVehicles,
      fastTravelUnlocked: s.fastTravelUnlocked,
      pastedPosters: s.pastedPosters,
      playerPos: s.playerPos,
      playerRotY: s.playerRotY,
      quality: s.quality,
      ratings: s.ratings,
      transactions: s.transactions,
    };
    const ok = writeSaveData(payload);
    if (ok) {
      set({ toastMessage: 'Progress saved to localStorage!' });
    }
    return ok;
  },

  resetGame: () => {
    clearSaveData();
    get().startGame(false);
    set({ toastMessage: 'Save reset. Fresh start in Nethaji Nagar!' });
  },

  showToast: (msg) => set({ toastMessage: msg }),
}));
