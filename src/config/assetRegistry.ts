/**
 * Chennai Hustle — Asset Registry
 *
 * All 3D models, textures and audio assets used in the game.
 * Includes source, licence, attribution and local path.
 *
 * Licence abbreviations:
 *   CC0   — Creative Commons Zero (public domain, no attribution required)
 *   CC-BY — Creative Commons Attribution (attribution required)
 *   MIT   — MIT licence
 *   PROC  — Procedurally generated in-code (no external source)
 */

export interface AssetEntry {
  id: string;
  name: string;
  category: 'character' | 'vehicle' | 'building' | 'vegetation' | 'street' | 'animal' | 'audio' | 'texture';
  sourceUrl: string;
  creator: string;
  licence: 'CC0' | 'CC-BY' | 'MIT' | 'PROC' | 'CC-BY-SA' | 'ODbL';
  attribution: string;
  localPath: string;
  format: string;
  polyCount?: number;
  animated: boolean;
  status: 'in-use' | 'pending-download' | 'needs-optimization';
  notes: string;
}

export const ASSET_REGISTRY: AssetEntry[] = [
  // ── Characters ────────────────────────────────────────────────────────
  {
    id: 'npc_michelle',
    name: 'Michelle (Female NPC)',
    category: 'character',
    sourceUrl: 'https://www.mixamo.com/#/?page=1&query=michelle',
    creator: 'Adobe / Mixamo',
    licence: 'CC-BY',
    attribution: 'Michelle character by Adobe Mixamo — game/app use permitted per Mixamo TOS',
    localPath: 'public/models/npcs/Michelle.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Primary female NPC and influencer variant',
  },
  {
    id: 'npc_xbot',
    name: 'X Bot (Male NPC)',
    category: 'character',
    sourceUrl: 'https://www.mixamo.com/#/?page=1&query=xbot',
    creator: 'Adobe / Mixamo',
    licence: 'CC-BY',
    attribution: 'XBot character by Adobe Mixamo — game/app use permitted per Mixamo TOS',
    localPath: 'public/models/npcs/Xbot.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Generic male pedestrian',
  },
  {
    id: 'npc_cesium',
    name: 'CesiumMan (Male NPC)',
    category: 'character',
    sourceUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/CesiumMan',
    creator: 'Analytical Graphics, Inc.',
    licence: 'CC-BY',
    attribution: 'CesiumMan by Analytical Graphics Inc — CC-BY 4.0',
    localPath: 'public/models/npcs/CesiumMan.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Office worker / fisherman variant',
  },
  {
    id: 'npc_soldier',
    name: 'Soldier NPC',
    category: 'character',
    sourceUrl: 'https://www.mixamo.com/#/?page=1&query=soldier',
    creator: 'Adobe / Mixamo',
    licence: 'CC-BY',
    attribution: 'Soldier character by Adobe Mixamo',
    localPath: 'public/models/npcs/Soldier.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Used as vendor / shop worker variant',
  },

  // ── Animals ───────────────────────────────────────────────────────────
  {
    id: 'animal_bull',
    name: 'Indian Bull (Jallikattu)',
    category: 'animal',
    sourceUrl: 'https://quaternius.com/packs/animals.html',
    creator: 'Quaternius',
    licence: 'CC0',
    attribution: 'No attribution required (CC0)',
    localPath: 'public/models/animals/Bull.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Authentic Chennai street cattle',
  },
  {
    id: 'animal_cow',
    name: 'Cow',
    category: 'animal',
    sourceUrl: 'https://quaternius.com/packs/animals.html',
    creator: 'Quaternius',
    licence: 'CC0',
    attribution: 'No attribution required (CC0)',
    localPath: 'public/models/animals/Cow.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Chennai street cow',
  },
  {
    id: 'animal_dog',
    name: 'Street Dog (Husky)',
    category: 'animal',
    sourceUrl: 'https://quaternius.com/packs/animals.html',
    creator: 'Quaternius',
    licence: 'CC0',
    attribution: 'No attribution required (CC0)',
    localPath: 'public/models/animals/Husky.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Repurposed as Chennai street dog',
  },
  {
    id: 'animal_parrot',
    name: 'Parrot (Tropical bird)',
    category: 'animal',
    sourceUrl: 'https://quaternius.com/packs/animals.html',
    creator: 'Quaternius',
    licence: 'CC0',
    attribution: 'No attribution required (CC0)',
    localPath: 'public/models/animals/Parrot.glb',
    format: 'GLB',
    animated: true,
    status: 'in-use',
    notes: 'Tropical Chennai bird life',
  },

  // ── Procedural Buildings (in-code, PROC licence) ──────────────────────
  {
    id: 'bldg_chennai_residential',
    name: 'Chennai Residential Building (Procedural)',
    category: 'building',
    sourceUrl: 'src/world/ChennaiArchitecture.ts',
    creator: 'Chennai Hustle team (original)',
    licence: 'PROC',
    attribution: 'N/A — original procedural geometry',
    localPath: 'src/world/ChennaiArchitecture.ts',
    format: 'TypeScript/Three.js geometry',
    animated: false,
    status: 'in-use',
    notes: 'Multi-part geometry with cornice, pillars, water tank, AC units, awning',
  },

  // ── PENDING DOWNLOADS (need manual download) ──────────────────────────
  {
    id: 'vehicle_auto_rickshaw',
    name: 'Indian Auto Rickshaw (Tuk-Tuk)',
    category: 'vehicle',
    sourceUrl: 'https://sketchfab.com/search?q=auto+rickshaw&type=models&downloadable=true',
    creator: 'Various Sketchfab creators',
    licence: 'CC-BY',
    attribution: 'See individual Sketchfab model page — attribution required',
    localPath: 'public/models/vehicles/auto_rickshaw.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — search Sketchfab for "auto rickshaw India" filtered by Downloadable + CC licence. Recommended: search "CNG auto rickshaw" or "Bajaj auto". Convert FBX→GLB via Blender.',
  },
  {
    id: 'vehicle_mtc_bus',
    name: 'MTC Chennai City Bus',
    category: 'vehicle',
    sourceUrl: 'https://sketchfab.com/search?q=india+city+bus&type=models&downloadable=true',
    creator: 'Various Sketchfab creators',
    licence: 'CC-BY',
    attribution: 'See individual Sketchfab model page',
    localPath: 'public/models/vehicles/mtc_bus.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — search Sketchfab for "Indian city bus". Customize with MTC red-cream paint in Blender. Alternatively: https://poly.pizza/ search "bus"',
  },
  {
    id: 'vehicle_motorcycle',
    name: 'Indian Motorcycle (Hero / TVS)',
    category: 'vehicle',
    sourceUrl: 'https://poly.pizza/search?q=motorcycle',
    creator: 'Various',
    licence: 'CC-BY',
    attribution: 'See poly.pizza model page',
    localPath: 'public/models/vehicles/motorcycle.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — download from poly.pizza or Sketchfab. No login required on poly.pizza.',
  },
  {
    id: 'bldg_south_indian_temple',
    name: 'South Indian Temple (Gopuram)',
    category: 'building',
    sourceUrl: 'https://sketchfab.com/search?q=south+indian+temple+gopuram&type=models&downloadable=true',
    creator: 'Various Sketchfab creators',
    licence: 'CC-BY',
    attribution: 'See individual Sketchfab model page',
    localPath: 'public/models/buildings/temple.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — search Sketchfab for "gopuram" or "dravidian temple". Kapaleeshwarar reference at https://en.wikipedia.org/wiki/Kapaleeshwarar_Temple',
  },
  {
    id: 'veg_coconut_palm',
    name: 'Coconut Palm Tree',
    category: 'vegetation',
    sourceUrl: 'https://poly.pizza/search?q=coconut+palm',
    creator: 'Various',
    licence: 'CC-BY',
    attribution: 'See poly.pizza model page',
    localPath: 'public/models/vegetation/coconut_palm.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — poly.pizza coconut palm. High priority for Marina/Besant Nagar.',
  },
  {
    id: 'street_food_cart',
    name: 'Indian Street Food Cart',
    category: 'street',
    sourceUrl: 'https://poly.pizza/search?q=food+cart',
    creator: 'Various',
    licence: 'CC-BY',
    attribution: 'See poly.pizza model page',
    localPath: 'public/models/street/food_cart.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — use as tea kadai / bajji cart base, customize with Tamil signboards.',
  },
  {
    id: 'street_traffic_light',
    name: 'Traffic Signal / Traffic Light',
    category: 'street',
    sourceUrl: 'https://poly.pizza/search?q=traffic+light',
    creator: 'Various',
    licence: 'CC-BY',
    attribution: 'See poly.pizza model page',
    localPath: 'public/models/street/traffic_light.glb',
    format: 'GLB',
    animated: false,
    status: 'pending-download',
    notes: 'MANUAL DOWNLOAD REQUIRED — replace procedural traffic signals with this GLB.',
  },
] as const;

/** Assets ready to use in-game */
export const READY_ASSETS = ASSET_REGISTRY.filter((a) => a.status === 'in-use');

/** Assets requiring manual download */
export const PENDING_ASSETS = ASSET_REGISTRY.filter((a) => a.status === 'pending-download');
