import jobsConfig from '../config/jobs.json';
import type { ActiveJob } from '../systems/gameStore';

export interface FoodOrderOffer {
  id: string;
  restaurant: string;
  item: string;
  pickupPos: [number, number, number];
  dropoffName: string;
  dropoffPos: [number, number, number];
  estimatedPay: number;
}

const RESTAURANTS: { name: string; item: string; pos: [number, number, number] }[] = [
  { name: 'Anbu Tea & Snacks', item: 'Hot Masala Vadai & Filter Coffee', pos: [-40, 0, -35] },
  { name: 'Madras Biryani Corner', item: 'Chicken Dum Biryani Pack', pos: [-185, 0, -60] },
  { name: 'Saravana Tiffin Stall', item: 'Ghee Roast & Sambar', pos: [40, 0, -40] },
];

const DROPOFFS: { name: string; pos: [number, number, number] }[] = [
  { name: 'TNHB Block B Gate', pos: [-133, 0, 78] },
  { name: 'Nethaji Nagar Bus Stop', pos: [-180, 0, 18] },
  { name: 'Canal Bridge North', pos: [40, 0, 125] },
  { name: 'TNHB Block D', pos: [-107, 0, 78] },
];

export function generateFoodOffers(seed: number): FoodOrderOffer[] {
  const spec = jobsConfig.jobs.foodDelivery;
  return [0, 1].map((idx) => {
    const r = RESTAURANTS[(seed + idx) % RESTAURANTS.length];
    const d = DROPOFFS[(seed + idx * 2) % DROPOFFS.length];
    const distKm = Math.hypot(r.pos[0] - d.pos[0], r.pos[2] - d.pos[2]) / 1000;
    const est = Math.round(spec.basePay + distKm * spec.perKmPay * 5);
    return {
      id: `food_${seed}_${idx}`,
      restaurant: r.name,
      item: r.item,
      pickupPos: r.pos,
      dropoffName: d.name,
      dropoffPos: d.pos,
      estimatedPay: est,
    };
  });
}

export function toActiveFoodJob(offer: FoodOrderOffer): ActiveJob {
  return {
    id: offer.id,
    jobType: 'foodDelivery',
    title: `FoodZip: ${offer.item}`,
    stage: 'pickup',
    pickupPos: offer.pickupPos,
    pickupName: offer.restaurant,
    dropoffPos: offer.dropoffPos,
    dropoffName: offer.dropoffName,
    elapsedSec: 0,
    tempScore: 100,
    basePayout: offer.estimatedPay,
    surgeMultiplier: 1.0,
  };
}
