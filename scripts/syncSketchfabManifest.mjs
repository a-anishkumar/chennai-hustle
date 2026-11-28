/**
 * Syncs src/config/sketchfabManifest.json with whatever permitted Sketchfab GLB/glTF
 * files currently exist inside public/assets/sketchfab/<category>/.
 *
 * Run: npm run sketchfab:sync
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_PATH = join(ROOT, 'src', 'config', 'sketchfabCatalog.ts');
const MANIFEST_PATH = join(ROOT, 'src', 'config', 'sketchfabManifest.json');
const REPORT_PATH = join(ROOT, 'SKETCHFAB_ASSET_REPORT.md');

export function parseCatalogIds() {
  const txt = readFileSync(CATALOG_PATH, 'utf8');
  const entries = [];
  const regex = /id:\s*'([^']+)'[\s\S]*?localPath:\s*'([^']+)'/g;
  let m;
  while ((m = regex.exec(txt)) !== null) {
    entries.push({ id: m[1], localPath: m[2] });
  }
  return entries;
}

export function syncManifest() {
  const entries = parseCatalogIds();
  const available = {};
  const resolvedPaths = {};
  let readyCount = 0;

  for (const e of entries) {
    const absGlb = join(ROOT, 'public', e.localPath);
    const sceneGltfRel = e.localPath.replace(/\.glb$/i, '/scene.gltf');
    const absSceneGltf = join(ROOT, 'public', sceneGltfRel);
    if (existsSync(absGlb)) {
      available[e.id] = true;
      resolvedPaths[e.id] = e.localPath;
      readyCount++;
    } else if (existsSync(absSceneGltf)) {
      available[e.id] = true;
      resolvedPaths[e.id] = sceneGltfRel;
      readyCount++;
    } else {
      available[e.id] = false;
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    available,
    resolvedPaths,
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  if (existsSync(REPORT_PATH)) {
    let report = readFileSync(REPORT_PATH, 'utf8');
    for (const e of entries) {
      const statusText = available[e.id] ? 'Downloaded' : 'Awaiting manual download';
      const rowRe = new RegExp(`(\\|[^\\n]*\\\`${e.id}\\\`[^\\n]*\\|)\\s*(?:Awaiting manual download|Downloaded|Integrated|Tested)\\s*\\|`, 'g');
      report = report.replace(rowRe, `$1 ${statusText} |`);
    }
    writeFileSync(REPORT_PATH, report);
  }

  console.log(`Synced Sketchfab manifest: ${readyCount}/${entries.length} models present locally.`);
  return { entries, available, readyCount };
}

if (process.argv[1] && process.argv[1].endsWith('syncSketchfabManifest.mjs')) {
  syncManifest();
}
