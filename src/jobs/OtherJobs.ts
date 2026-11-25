import jobsConfig from '../config/jobs.json';
import type { ActiveJob } from '../systems/gameStore';

export interface GenericJobOffer {
  id: string;
  title: string;
  pickupName: string;
  pickupPos: [number, number, number];
  dropoffName: string;
  dropoffPos: [number, number, number];
  estimatedPay: number;
  timeLimitSec?: number;
  surgeMultiplier: number;
}

export function generateDash10Offer(seed: number): GenericJobOffer {
  const drops: { name: string; pos: [number, number, number] }[] = [
    { name: 'TNHB Block A', pos: [-133, 0, 42] },
    { name: 'Mylapore Kovil Gate', pos: [600, 0, 520] },
    { name: 'Marina Promenade', pos: [1450, 0, 120] },
  ];
  const d = drops[seed % drops.length];
  return {
    id: `dash10_${seed}`,
    title: 'Dash10: 10-Min Grocery Pack',
    pickupName: 'Bayfront Dash10 Dark Store',
    pickupPos: [516, 0, -254],
    dropoffName: d.name,
    dropoffPos: d.pos,
    estimatedPay: jobsConfig.jobs.quickCommerce.basePay + 35,
    timeLimitSec: jobsConfig.jobs.quickCommerce.timeLimitSec,
    surgeMultiplier: 1.0,
  };
}

export function generateAutoOffer(seed: number): GenericJobOffer {
  const routes: { pName: string; pPos: [number, number, number]; dName: string; dPos: [number, number, number] }[] = [
    { pName: 'Central Bus Hub', pPos: [0, 0, -180], dName: 'Marina Beach', dPos: [1450, 0, 120] },
    { pName: 'Kaveri Theatre', pPos: [-480, 0, -300], dName: 'Bayfront Mall', dPos: [480, 0, -230] },
  ];
  const r = routes[seed % routes.length];
  return {
    id: `auto_${seed}`,
    title: `MeterPlus: ${r.pName} → ${r.dName}`,
    pickupName: r.pName,
    pickupPos: r.pPos,
    dropoffName: r.dName,
    dropoffPos: r.dPos,
    estimatedPay: jobsConfig.jobs.autoDriver.basePay + 80,
    surgeMultiplier: 1.0,
  };
}

export function generateCabOffer(hour: number): GenericJobOffer {
  const isNight = hour >= 20 || hour < 5;
  const mult = isNight ? jobsConfig.jobs.taxiCab.nightBonusMultiplier ?? 1.35 : 1.0;
  return {
    id: `cab_${Math.floor(hour)}`,
    title: isNight ? 'CityCab: Night Harbour Express' : 'CityCab: Central → Lighthouse',
    pickupName: 'Bayfront Mall Gate',
    pickupPos: [480, 0, -230],
    dropoffName: isNight ? 'North Harbour Gate' : 'Chennai Lighthouse',
    dropoffPos: isNight ? [950, 0, -1320] : [1410, 0, 360],
    estimatedPay: Math.round((jobsConfig.jobs.taxiCab.basePay + 120) * mult),
    surgeMultiplier: mult,
  };
}

export function toActiveGenericJob(
  jobType: 'quickCommerce' | 'autoDriver' | 'taxiCab',
  offer: GenericJobOffer,
  bonusPay = 0
): ActiveJob {
  return {
    id: offer.id,
    jobType,
    title: offer.title,
    stage: 'pickup',
    pickupPos: offer.pickupPos,
    pickupName: offer.pickupName,
    dropoffPos: offer.dropoffPos,
    dropoffName: offer.dropoffName,
    elapsedSec: 0,
    timeLimitSec: offer.timeLimitSec,
    tempScore: 100,
    basePayout: offer.estimatedPay + bonusPay,
    surgeMultiplier: offer.surgeMultiplier,
  };
}
