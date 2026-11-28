/**
 * GIS ↔ Three.js coordinate conversion for Chennai Hustle
 *
 * Real-world anchor: Besant Nagar / TNHB area
 *   Origin lat/lon: 13.0005°N, 80.2700°E  →  game (0, 0)
 *
 * Game world: 4000 × 4000 units.  1 game unit ≈ 1 metre.
 * At equatorial scale: 1° lat ≈ 111,320 m, 1° lon ≈ 111,320 × cos(lat) m
 *   cos(13°) ≈ 0.9744  → 1° lon ≈ 108,467 m
 *
 * Conversion:
 *   gameX  =  (lon - originLon) × metersPerDegLon          (East  → +X)
 *   gameZ  = -(lat - originLat) × metersPerDegLat          (North → -Z, since Three.js Z goes south)
 */

export const GIS_ORIGIN_LAT = 13.0005;
export const GIS_ORIGIN_LON = 80.2700;

const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LON = 111320 * Math.cos((GIS_ORIGIN_LAT * Math.PI) / 180);

/** Convert real lat/lon to game-world X/Z */
export function latLonToGame(lat: number, lon: number): [number, number] {
  const gx = (lon - GIS_ORIGIN_LON) * METERS_PER_DEG_LON;
  const gz = -(lat - GIS_ORIGIN_LAT) * METERS_PER_DEG_LAT;
  return [gx, gz];
}

/** Convert game X/Z back to lat/lon (for minimap, debugging) */
export function gameToLatLon(gx: number, gz: number): [number, number] {
  const lat = GIS_ORIGIN_LAT - gz / METERS_PER_DEG_LAT;
  const lon = GIS_ORIGIN_LON + gx / METERS_PER_DEG_LON;
  return [lat, lon];
}

/**
 * Key real-world Chennai landmarks with their lat/lon and
 * the resulting game coordinates (computed with latLonToGame).
 *
 * These are used for verification and to position landmark components.
 *
 * Sources: OpenStreetMap (ODbL licence)
 */
export const REAL_LANDMARKS = {
  // ── Besant Nagar / starting area ──────────────────────────────────────
  besantNagar:        { lat: 13.0005, lon: 80.2700,  gis: 'origin'           },
  elliotsBeach:       { lat: 12.9980, lon: 80.2729,  gx:  314.0, gz:  27.7  },
  besantNagarChurch:  { lat: 13.0012, lon: 80.2704,  gx:   43.3, gz:  -7.8  },
  olcottKuppam:       { lat: 12.9955, lon: 80.2740,  gx:  434.0, gz:  55.3  },

  // ── Marina Beach ──────────────────────────────────────────────────────
  marinaBeach:        { lat: 13.0500, lon: 80.2824,  gx: 1348.5, gz: -551.1 },
  marinaLighthouse:   { lat: 13.0353, lon: 80.2801,  gx: 1115.4, gz: -387.9 },

  // ── Central Chennai ───────────────────────────────────────────────────
  chennaiCentral:     { lat: 13.0827, lon: 80.2707,  gx:   76.0, gz: -914.0 },
  riponBuilding:      { lat: 13.0812, lon: 80.2743,  gx:  470.7, gz: -898.3 },
  madrasHighCourt:    { lat: 13.0824, lon: 80.2787,  gx:  948.0, gz: -911.6 },
  parrysCornner:      { lat: 13.0867, lon: 80.2862,  gx: 1762.3, gz: -960.9 },

  // ── South Chennai ─────────────────────────────────────────────────────
  kapaleeshwarar:     { lat: 13.0334, lon: 80.2695,  gx:  -54.4, gz: -368.2 },
  adyar:              { lat: 13.0063, lon: 80.2567,  gx: -1444.5, gz: -64.2 },
  chepauk:            { lat: 13.0659, lon: 80.2797,  gx: 1070.6, gz: -725.4 },
  tNagar:             { lat: 13.0418, lon: 80.2341,  gx: -3878.6, gz: -461.5 },

  // ── West Chennai ──────────────────────────────────────────────────────
  guindy:             { lat: 13.0067, lon: 80.2206,  gx: -5341.3, gz: -68.6 },
  annaFlyover:        { lat: 13.0099, lon: 80.2199,  gx: -5417.3, gz: -103.9 },
} as const;
