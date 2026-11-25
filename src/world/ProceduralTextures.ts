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
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#262a30';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle worn tire tracks along both lanes
  ctx.fillStyle = 'rgba(15, 18, 22, 0.28)';
  ctx.fillRect(80, 0, 64, 512);
  ctx.fillRect(160, 0, 64, 512);
  ctx.fillRect(288, 0, 64, 512);
  ctx.fillRect(368, 0, 64, 512);

  // Aggregate mineral grit
  for (let i = 0; i < 6500; i++) {
    const x = (i * 131) % 512;
    const y = (i * 257) % 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.11)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Weathered tar cracks
  ctx.strokeStyle = 'rgba(10, 12, 15, 0.55)';
  ctx.lineWidth = 1.5;
  for (let c = 0; c < 6; c++) {
    ctx.beginPath();
    let cx = (c * 97 + 40) % 480;
    let cy = (c * 149) % 450;
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += ((c + s) % 2 === 0 ? 18 : -16);
      cy += 16;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Center dashed yellow divider
  ctx.fillStyle = '#facc15';
  ctx.fillRect(250, 20, 12, 196);
  ctx.fillRect(250, 276, 12, 196);

  // Crisp white shoulder lines
  ctx.fillStyle = 'rgba(248, 250, 252, 0.68)';
  ctx.fillRect(14, 0, 7, 512);
  ctx.fillRect(491, 0, 7, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
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
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle stucco grain & monsoon dampness weathering
  for (let i = 0; i < 2400; i++) {
    const x = (i * 67) % 256;
    const y = (i * 113) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)';
    ctx.fillRect(x, y, 2, 2);
  }

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(0,0,0,0.12)');
  grad.addColorStop(0.18, 'rgba(0,0,0,0)');
  grad.addColorStop(0.78, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(22,34,22,0.24)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache[key] = tex;
  return tex;
}

export function getAsphaltNormalMap(): THREE.CanvasTexture {
  if (cache.asphaltNormal) return cache.asphaltNormal;
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const nx = 108 + ((i * 17) % 40);
    const ny = 108 + ((i * 29) % 40);
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

export function getChessboardTexture(): THREE.CanvasTexture {
  if (cache.chessboard) return cache.chessboard;
  const [canvas, ctx] = makeCanvas(256, 256);
  const sq = 32;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#f8fafc' : '#0f172a';
      ctx.fillRect(x * sq, y * sq, sq, sq);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.chessboard = tex;
  return tex;
}
