import jobsConfig from '../config/jobs.json';
import type { ActiveJob } from '../systems/gameStore';

export interface BikeTaxiOffer {
  id: string;
  passengerName: string;
  pickupName: string;
  pickupPos: [number, number, number];
  dropoffName: string;
  dropoffPos: [number, number, number];
  surgeMultiplier: number;
  estimatedPay: number;
}

const LOCATIONS: { name: string; pos: [number, number, number] }[] = [
  { name: 'Nethaji Nagar Bus Stop', pos: [-180, 0, 18] },
  { name: 'Anbu Tea Kadai', pos: [-40, 0, -35] },
  { name: 'North Loop Junction', pos: [-75, 0, -120] },
  { name: 'Canal Bridge East', pos: [40, 0, 165] },
  { name: 'TNHB Main Gate', pos: [-120, 0, 105] },
];

const PASSENGERS = ['Priya (IT Park)', 'Arun (College)', 'Suresh (Shopkeeper)', 'Divya (Nurse)'];

export function generateBikeTaxiOffers(hour: number): BikeTaxiOffer[] {
  const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  const surge = isPeak ? 1.35 : 1.0;
  const spec = jobsConfig.jobs.bikeTaxi;

  return [0, 1].map((idx) => {
    const p = LOCATIONS[idx % LOCATIONS.length];
    const d = LOCATIONS[(idx + 2) % LOCATIONS.length];
    const distKm = Math.hypot(p.pos[0] - d.pos[0], p.pos[2] - d.pos[2]) / 1000;
    const est = Math.round((spec.basePay + distKm * spec.perKmPay * 4) * surge);
    return {
      id: `ride_${hour}_${idx}`,
      passengerName: PASSENGERS[(Math.floor(hour) + idx) % PASSENGERS.length],
      pickupName: p.name,
      pickupPos: p.pos,
      dropoffName: d.name,
      dropoffPos: d.pos,
      surgeMultiplier: surge,
      estimatedPay: est,
    };
  });
}

export function toActiveBikeJob(offer: BikeTaxiOffer): ActiveJob {
  return {
    id: offer.id,
    jobType: 'bikeTaxi',
    title: `RideNow: ${offer.passengerName}`,
    stage: 'pickup',
    pickupPos: offer.pickupPos,
    pickupName: offer.pickupName,
    dropoffPos: offer.dropoffPos,
    dropoffName: offer.dropoffName,
    elapsedSec: 0,
    tempScore: 100,
    basePayout: offer.estimatedPay,
    surgeMultiplier: 1.0,
  };
}
