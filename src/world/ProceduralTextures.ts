import * as THREE from 'three';

const cache: Record<string, THREE.CanvasTexture> = {};

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function getAsphaltTexture(): THREE.CanvasTexture {
  if (cache.asphalt) return cache.asphalt;
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#2b2f36';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle aggregate speckles
  for (let i = 0; i < 1800; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Center yellow dashed line
  ctx.fillStyle = '#facc15';
  ctx.fillRect(124, 16, 8, 96);
  ctx.fillRect(124, 144, 8, 96);

  // Side edge lines
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(8, 0, 4, 256);
  ctx.fillRect(244, 0, 4, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.asphalt = tex;
  return tex;
}

export function getKolamTexture(): THREE.CanvasTexture {
  if (cache.kolam) return cache.kolam;
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);

  // Subtle dark wet-stone threshold circle
  ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fill();

  // Traditional pulli kolam dots & loops
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4;
    const cx = 128 + Math.cos(ang) * 56;
    const cy = 128 + Math.sin(ang) * 56;
    ctx.moveTo(cx + 28, cy);
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Center lotus & dots
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  for (let gx = -2; gx <= 2; gx++) {
    for (let gy = -2; gy <= 2; gy++) {
      if (Math.abs(gx) + Math.abs(gy) <= 3) {
        ctx.beginPath();
        ctx.arc(128 + gx * 28, 128 + gy * 28, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.kolam = tex;
  return tex;
}

export function getAwningTexture(primary = '#dc2626', secondary = '#f8fafc'): THREE.CanvasTexture {
  const key = `awning_${primary}_${secondary}`;
  if (cache[key]) return cache[key];
  const [canvas, ctx] = makeCanvas(128, 128);
  const stripes = 8;
  const w = 128 / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? primary : secondary;
    ctx.fillRect(i * w, 0, w, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache[key] = tex;
  return tex;
}

export function getPlasterTexture(hexColor: string): THREE.CanvasTexture {
  const key = `plaster_${hexColor}`;
  if (cache[key]) return cache[key];
  const [canvas, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle monsoon weathering streaks at bottom & top
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.08)');
  grad.addColorStop(0.2, 'rgba(0,0,0,0)');
  grad.addColorStop(0.8, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(20,30,20,0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache[key] = tex;
  return tex;
}

export function getAsphaltNormalMap(): THREE.CanvasTexture {
  if (cache.asphaltNormal) return cache.asphaltNormal;
  const [canvas, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1200; i++) {
    const x = (i * 53) % 128;
    const y = (i * 97) % 128;
    const nx = 110 + ((i * 17) % 36);
    const ny = 110 + ((i * 29) % 36);
    ctx.fillStyle = `rgb(${nx}, ${ny}, 245)`;
    ctx.fillRect(x, y, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cache.asphaltNormal = tex;
  return tex;
}
