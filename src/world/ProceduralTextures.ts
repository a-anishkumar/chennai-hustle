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

  for (let i = 0; i < 1800; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#facc15';
  ctx.fillRect(124, 16, 8, 96);
  ctx.fillRect(124, 144, 8, 96);

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

  ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fill();

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

export function getSignTexture(title: string, subtitle = '', bg = '#1e293b', fg = '#fde047'): THREE.CanvasTexture {
  const key = `sign_${title}_${bg}`;
  if (cache[key]) return cache[key];
  const [canvas, ctx] = makeCanvas(512, 128);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = fg;
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.slice(0, 26), 256, subtitle ? 58 : 74);

  if (subtitle) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(subtitle.slice(0, 38), 256, 98);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache[key] = tex;
  return tex;
}

/**
 * High-detail multi-story Chennai architectural facade texture:
 * floor slab bands, framed glass windows with mullions, ground-floor shutters, and weathering.
 */
export function getChennaiFacadeTexture(): THREE.CanvasTexture {
  if (cache.chennaiFacade) return cache.chennaiFacade;
  const [canvas, ctx] = makeCanvas(512, 512);

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 3000; i++) {
    const x = (i * 89) % 512;
    const y = (i * 151) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(x, y, 2, 2);
  }

  for (let floor = 0; floor < 4; floor++) {
    const fy = floor * 128;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, fy, 512, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, fy + 12, 512, 4);

    if (floor === 3) {
      for (let col = 0; col < 3; col++) {
        const sx = 28 + col * 162;
        ctx.fillStyle = '#334155';
        ctx.fillRect(sx, fy + 24, 130, 104);
        ctx.fillStyle = '#475569';
        for (let r = 0; r < 10; r++) {
          ctx.fillRect(sx + 4, fy + 28 + r * 10, 122, 4);
        }
      }
    } else {
      for (let col = 0; col < 3; col++) {
        const wx = 34 + col * 162;
        const wy = fy + 28;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(wx - 4, wy - 4, 118, 76);
        const grad = ctx.createLinearGradient(wx, wy, wx + 110, wy + 68);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e3a5f');
        grad.addColorStop(1, '#334155');
        ctx.fillStyle = grad;
        ctx.fillRect(wx, wy, 110, 68);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(wx + 53, wy, 4, 68);
        ctx.fillRect(wx, wy + 32, 110, 4);
      }
    }
  }

  const wGrad = ctx.createLinearGradient(0, 420, 0, 512);
  wGrad.addColorStop(0, 'rgba(0,0,0,0)');
  wGrad.addColorStop(1, 'rgba(30,25,20,0.22)');
  ctx.fillStyle = wGrad;
  ctx.fillRect(0, 420, 512, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.chennaiFacade = tex;
  return tex;
}

export function getChennaiFacadeNormalMap(): THREE.CanvasTexture {
  if (cache.chennaiFacadeNormal) return cache.chennaiFacadeNormal;
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  for (let floor = 0; floor < 4; floor++) {
    const fy = floor * 64;
    ctx.fillStyle = 'rgb(128, 175, 240)';
    ctx.fillRect(0, fy, 256, 6);
    ctx.fillStyle = 'rgb(128, 85, 240)';
    ctx.fillRect(0, fy + 6, 256, 3);
    for (let col = 0; col < 3; col++) {
      const wx = 17 + col * 81;
      ctx.fillStyle = 'rgb(128, 110, 245)';
      ctx.fillRect(wx, fy + 14, 55, 34);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  cache.chennaiFacadeNormal = tex;
  return tex;
}
