import worldConfig from '../config/world.json';

const CANAL_Z = worldConfig.canalZ; // 180
const CANAL_HALF = worldConfig.canalWidth / 2; // 24
const COAST_X = worldConfig.coastStartX; // 1450

/**
 * Deterministic heightmap for the 4km x 4km Chennai world.
 * Used identically by chunk terrain meshes, floodwater shader, and physics.
 */
export function getTerrainHeight(x: number, z: number): number {
  // East coast sloping into Bay of Bengal
  if (x > COAST_X) {
    const t = Math.min(1, (x - COAST_X) / 140);
    return -3.8 * t * t;
  }

  // Central canal (west-to-east)
  const distCanal = Math.abs(z - CANAL_Z);
  if (distCanal < CANAL_HALF) {
    const norm = distCanal / CANAL_HALF; // 0 at center, 1 at bank
    // Steep embankment profile
    return -2.8 * (1 - norm * norm);
  }

  // Keep TNHB colony & main road loop flat at y = 0
  if (x > -400 && x < 400 && z > -400 && z < 400) {
    return 0;
  }

  // Gentle low-lying Chennai coastal plain undulation
  const wave = Math.sin(x * 0.008) * Math.cos(z * 0.008) * 0.35;
  return Math.max(-0.2, wave);
}

/**
 * Deterministic pseudo-random helper for chunk generation.
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
