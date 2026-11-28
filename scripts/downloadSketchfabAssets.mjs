/**
 * Official Sketchfab Download API v3 Server-Side Asset Downloader
 *
 * Uses official endpoints:
 *   GET https://api.sketchfab.com/v3/models/{uid}
 *   GET https://api.sketchfab.com/v3/models/{uid}/download   (requires SKETCHFAB_API_TOKEN)
 *
 * Credentials:
 *   Set SKETCHFAB_API_TOKEN in environment or in .env.local (never committed to GitHub!).
 *
 * Usage:
 *   npm run sketchfab:download                 # downloads all missing CC-BY / CC0 catalog assets
 *   node scripts/downloadSketchfabAssets.mjs auto_rickshaw mtc_bus
 */

import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'fs';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { syncManifest } from './syncSketchfabManifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvToken() {
  if (process.env.SKETCHFAB_API_TOKEN) return process.env.SKETCHFAB_API_TOKEN.trim();
  for (const envFile of ['.env.local', '.env']) {
    const p = join(ROOT, envFile);
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^\s*SKETCHFAB_API_TOKEN\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, '');
    }
  }
  return '';
}

function parseCatalog() {
  const txt = readFileSync(join(ROOT, 'src', 'config', 'sketchfabCatalog.ts'), 'utf8');
  const items = [];
  const blockRe = /\{\s*id:\s*'([^']+)'[\s\S]*?uid:\s*'([^']+)'[\s\S]*?localPath:\s*'([^']+)'[\s\S]*?\}/g;
  let m;
  while ((m = blockRe.exec(txt)) !== null) {
    items.push({ id: m[1], uid: m[2], localPath: m[3] });
  }
  return items;
}

function findLargestGlb(dir) {
  let best = null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findLargestGlb(full);
      if (nested) best = best || nested;
    } else if (extname(entry.name).toLowerCase() === '.glb') {
      best = full;
    }
  }
  return best;
}

async function main() {
  const token = loadEnvToken();
  if (!token) {
    console.error('Missing SKETCHFAB_API_TOKEN. Create a Personal API Token at https://sketchfab.com/settings/password and add SKETCHFAB_API_TOKEN=... to .env.local');
    process.exit(1);
  }

  const filterIds = process.argv.slice(2);
  const catalog = parseCatalog();
  const targets = filterIds.length ? catalog.filter((c) => filterIds.includes(c.id)) : catalog;

  for (const item of targets) {
    const destPath = join(ROOT, 'public', item.localPath);
    if (existsSync(destPath)) {
      console.log(`[SKIP] ${item.id} already present`);
      continue;
    }

    const metaRes = await fetch(`https://api.sketchfab.com/v3/models/${item.uid}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!metaRes.ok) {
      console.error(`[FAIL] ${item.id} metadata HTTP ${metaRes.status}`);
      continue;
    }
    const meta = await metaRes.json();
    const label = meta.license?.label || '';
    if (!meta.isDownloadable || label.includes('NonCommercial')) {
      console.error(`[REJECT] ${item.id} not downloadable or non-commercial (${label})`);
      continue;
    }

    const dlRes = await fetch(`https://api.sketchfab.com/v3/models/${item.uid}/download`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!dlRes.ok) {
      console.error(`[FAIL] ${item.id} download API HTTP ${dlRes.status}: ${await dlRes.text()}`);
      continue;
    }
    const dlJson = await dlRes.json();
    const archiveUrl = dlJson.glb?.url || dlJson.gltf?.url;
    if (!archiveUrl) {
      console.error(`[FAIL] ${item.id} returned no glb/gltf archive URL`);
      continue;
    }

    const fileRes = await fetch(archiveUrl);
    if (!fileRes.ok) {
      console.error(`[FAIL] ${item.id} archive fetch HTTP ${fileRes.status}`);
      continue;
    }
    const buf = Buffer.from(await fileRes.arrayBuffer());
    mkdirSync(dirname(destPath), { recursive: true });

    if (dlJson.glb?.url && !archiveUrl.includes('.zip')) {
      writeFileSync(destPath, buf);
      console.log(`[OK] Downloaded GLB -> ${item.localPath}`);
    } else {
      const tmpDir = join(ROOT, '.tmp-sketchfab', item.id);
      const tmpZip = join(tmpDir, 'model.zip');
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(tmpZip, buf);
      if (process.platform === 'win32') {
        execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Path '${tmpZip}' -DestinationPath '${tmpDir}' -Force`]);
      } else {
        execFileSync('unzip', ['-o', tmpZip, '-d', tmpDir]);
      }
      const glbFile = findLargestGlb(tmpDir);
      if (glbFile) {
        copyFileSync(glbFile, destPath);
        console.log(`[OK] Extracted GLB -> ${item.localPath}`);
      } else {
        const destGltfDir = destPath.replace(/\.glb$/i, '');
        mkdirSync(destGltfDir, { recursive: true });
        if (process.platform === 'win32') {
          execFileSync('powershell', ['-NoProfile', '-Command', `Copy-Item -Path '${tmpDir}/*' -Destination '${destGltfDir}' -Recurse -Force`]);
        } else {
          execFileSync('cp', ['-r', `${tmpDir}/.`, destGltfDir]);
        }
        rmSync(join(destGltfDir, 'model.zip'), { force: true });
        console.log(`[OK] Extracted glTF archive -> ${item.localPath.replace(/\.glb$/i, '')}/scene.gltf`);
      }
      rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  const tmpRoot = join(ROOT, '.tmp-sketchfab');
  if (existsSync(tmpRoot)) rmSync(tmpRoot, { recursive: true, force: true });
  syncManifest();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
