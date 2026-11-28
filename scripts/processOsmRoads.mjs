/**
 * OSM Road Data Processor for Chennai Hustle
 * 
 * Converts raw Overpass API JSON into simplified road segments
 * in game coordinates (metres from GIS origin).
 *
 * Run: node scripts/processOsmRoads.mjs
 * Output: src/config/besant_nagar_road_segments.json
 *
 * Sources: OpenStreetMap contributors, ODbL licence
 * © OpenStreetMap contributors — https://www.openstreetmap.org/copyright
 */

import { readFileSync, writeFileSync } from 'fs';

// GIS origin (matches src/config/gis.ts)
const ORIGIN_LAT = 13.0005;
const ORIGIN_LON = 80.2700;
const METERS_PER_DEG_LAT = 111320;
const METERS_PER_DEG_LON = 111320 * Math.cos((ORIGIN_LAT * Math.PI) / 180);

function latLonToGame(lat, lon) {
  return [
    (lon - ORIGIN_LON) * METERS_PER_DEG_LON,
    -(lat - ORIGIN_LAT) * METERS_PER_DEG_LAT,
  ];
}

function roadWidth(highway) {
  switch (highway) {
    case 'motorway': case 'trunk': return 24;
    case 'primary': case 'primary_link': return 16;
    case 'secondary': case 'secondary_link': return 13;
    case 'tertiary': case 'tertiary_link': return 10;
    case 'residential': return 7;
    case 'living_street': return 5;
    case 'service': return 4;
    case 'footway': case 'path': case 'pedestrian': return 3;
    default: return 6;
  }
}

// Strip BOM if present
let rawText = readFileSync('src/config/besant_nagar_roads.json', 'utf8');
if (rawText.charCodeAt(0) === 0xFEFF) rawText = rawText.slice(1);
const raw = JSON.parse(rawText);

// Build node lookup
const nodes = new Map();
for (const el of raw.elements) {
  if (el.type === 'node') nodes.set(el.id, { lat: el.lat, lon: el.lon });
}

const segments = [];

for (const el of raw.elements) {
  if (el.type !== 'way' || !el.tags?.highway) continue;
  const hw = el.tags.highway;
  // Skip construction & tracks
  if (hw === 'construction' || hw === 'track') continue;

  const pts = el.nodes
    .map(id => nodes.get(id))
    .filter(Boolean)
    .map(n => latLonToGame(n.lat, n.lon));

  if (pts.length < 2) continue;

  // Split way into individual segments
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.5 || len > 800) continue; // skip tiny or huge segments

    const cx = (ax + bx) / 2;
    const cz = (az + bz) / 2;
    const angle = Math.atan2(dx, dz); // rotY for Three.js

    segments.push({
      x: Math.round(cx * 10) / 10,
      z: Math.round(cz * 10) / 10,
      len: Math.round(len * 10) / 10,
      rot: Math.round(angle * 10000) / 10000,
      w: roadWidth(hw),
      hw,
      name: el.tags.name || '',
    });
  }
}

console.log(`Generated ${segments.length} road segments from ${raw.elements.length} OSM elements`);

// Output compact JSON
writeFileSync(
  'src/config/besant_nagar_road_segments.json',
  JSON.stringify(segments, null, 2),
);
console.log('Written: src/config/besant_nagar_road_segments.json');
