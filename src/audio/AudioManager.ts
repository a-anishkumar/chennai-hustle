import { Howl, Howler } from 'howler';

/**
 * Procedural WAV encoder so Howler.js can play 100% original synthesized
 * Chennai ambient loops & SFX with zero external copyrighted assets.
 */
function encodeWavDataUri(samples: Float32Array, sampleRate = 22050): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function makeRainLoop(): Howl {
  const sr = 16000;
  const len = sr * 2;
  const data = new Float32Array(len);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.08 * white) / 1.08;
    data[i] = last * 0.65;
  }
  return new Howl({ src: [encodeWavDataUri(data, sr)], loop: true, volume: 0.0 });
}

function makeHornSfx(): Howl {
  const sr = 22050;
  const len = Math.floor(sr * 0.35);
  const data = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.sin((i / len) * Math.PI);
    data[i] = (Math.sin(2 * Math.PI * 390 * t) + 0.6 * Math.sin(2 * Math.PI * 490 * t)) * 0.25 * env;
  }
  return new Howl({ src: [encodeWavDataUri(data, sr)], volume: 0.35 });
}

function makeCashChime(): Howl {
  const sr = 22050;
  const len = Math.floor(sr * 0.45);
  const data = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = t < 0.16 ? 880 : 1318.5;
    const env = Math.exp(-t * 6);
    data[i] = Math.sin(2 * Math.PI * freq * t) * 0.35 * env;
  }
  return new Howl({ src: [encodeWavDataUri(data, sr)], volume: 0.45 });
}

function makeTempleBell(): Howl {
  const sr = 22050;
  const len = Math.floor(sr * 1.4);
  const data = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 2.5);
    data[i] = (Math.sin(2 * Math.PI * 528 * t) + 0.4 * Math.sin(2 * Math.PI * 1056 * t)) * 0.25 * env;
  }
  return new Howl({ src: [encodeWavDataUri(data, sr)], volume: 0.35 });
}

class ChennaiAudioManager {
  private initialized = false;
  private muted = false;
  private rainLoop: Howl | null = null;
  private hornSfx: Howl | null = null;
  private cashSfx: Howl | null = null;
  private bellSfx: Howl | null = null;

  init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      this.rainLoop = makeRainLoop();
      this.hornSfx = makeHornSfx();
      this.cashSfx = makeCashChime();
      this.bellSfx = makeTempleBell();
      this.rainLoop.play();
    } catch {
      // Ignore audio errors in headless environments
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    Howler.mute(m);
  }

  isMuted(): boolean {
    return this.muted;
  }

  setRainVolume(vol: number) {
    if (this.rainLoop) {
      this.rainLoop.volume(Math.max(0, Math.min(0.45, vol)));
    }
  }

  playHorn() {
    if (this.initialized && !this.muted) this.hornSfx?.play();
  }

  playCash() {
    if (this.initialized && !this.muted) this.cashSfx?.play();
  }

  playBell() {
    if (this.initialized && !this.muted) this.bellSfx?.play();
  }
}

export const audioManager = new ChennaiAudioManager();
