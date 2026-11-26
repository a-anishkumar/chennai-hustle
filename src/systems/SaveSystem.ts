export type VehicleType = 'foot' | 'cycle' | 'bike' | 'auto' | 'cab' | 'boat';
export type QualityLevel = 'low' | 'medium' | 'high';
export type WeatherType = 'sunny' | 'humid' | 'monsoon' | 'flood';
export type JobType = 'bikeTaxi' | 'foodDelivery' | 'quickCommerce' | 'autoDriver' | 'taxiCab' | 'floodRelief';
export type MinigameType =
  | 'dash10Pack'
  | 'autoBargain'
  | 'teaMaster'
  | 'harbourCrates'
  | 'cinemaQueue'
  | 'posterPaste';

export interface PastedPoster {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  campaignName: string;
  color: string;
  accent: string;
  slogan: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  time: string;
}

export interface PhoneMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export interface SaveData {
  version: number;
  savedAt: string;
  money: number;
  stamina: number;
  hunger: number;
  mood: number;
  fuel: number;
  reputation: number;
  dayCount: number;
  timeOfDay: number;
  weather?: WeatherType;
  waterLevel?: number;
  floodAidCount?: number;
  floodSurgeCount?: number;
  currentVehicle: VehicleType;
  unlockedVehicles: VehicleType[];
  fastTravelUnlocked?: boolean;
  pastedPosters?: PastedPoster[];
  playerPos: [number, number, number];
  playerRotY: number;
  quality: QualityLevel;
  ratings?: { bikeTaxi: number; foodDelivery: number; completedCount: number };
  transactions?: Transaction[];
}

const SAVE_KEY = 'chennai_hustle_save_v1';

function hasApiBackend(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || Boolean(import.meta.env.VITE_API_URL);
}

export function writeSaveData(data: SaveData): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    // Best-effort sync to Node.js + Express backend when running locally or configured
    if (hasApiBackend()) {
      fetch('/api/save/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
    return true;
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
    return false;
  }
}

export function readSaveData(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed && parsed.version === 1) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to read save from localStorage:', err);
    return null;
  }
}

export function clearSaveData(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function hasSaveData(): boolean {
  return readSaveData() !== null;
}

export async function syncCloudSaveToLocal(): Promise<SaveData | null> {
  if (!hasApiBackend()) return null;
  try {
    const res = await fetch('/api/save/default');
    if (!res.ok) return null;
    const json = (await res.json()) as { save?: SaveData | null };
    if (json.save && json.save.version === 1) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(json.save));
      return json.save;
    }
  } catch {
    // Offline fallback
  }
  return null;
}

export function syncPosterToServer(poster: PastedPoster): void {
  if (!hasApiBackend()) return;
  fetch('/api/posters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poster),
  }).catch(() => {});
}
