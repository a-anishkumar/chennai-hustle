import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';

const SKY_NIGHT = new THREE.Color('#091124');
const SKY_DAWN = new THREE.Color('#f97316');
const SKY_DAY = new THREE.Color('#60a5fa');
const SKY_DUSK = new THREE.Color('#e11d48');
const SKY_MONSOON = new THREE.Color('#334155');
const SKY_HUMID = new THREE.Color('#94a3b8');

const SUN_DAY = new THREE.Color('#fff7ed');
const SUN_GOLDEN = new THREE.Color('#fb923c');
const SUN_NIGHT = new THREE.Color('#93c5fd');

export function DayNightLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const bgRef = useRef<THREE.Color>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const quality = useGameStore((s) => s.quality);

  const shadowMapSize = quality === 'high' ? 2048 : quality === 'medium' ? 1024 : 512;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = useGameStore.getState();
    state.advanceTime(dt);

    const h = state.timeOfDay;
    const sunAngle = ((h - 6) / 24) * Math.PI * 2;
    const sunY = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle);

    const skyCol = new THREE.Color();
    if (h >= 5.5 && h < 7.5) {
      const t = (h - 5.5) / 2;
      skyCol.lerpColors(SKY_NIGHT, SKY_DAWN, Math.min(1, t * 1.4));
      if (t > 0.5) skyCol.lerp(SKY_DAY, (t - 0.5) * 2);
    } else if (h >= 7.5 && h < 16.5) {
      skyCol.copy(SKY_DAY);
    } else if (h >= 16.5 && h < 19.0) {
      const t = (h - 16.5) / 2.5;
      if (t < 0.5) {
        skyCol.lerpColors(SKY_DAY, SKY_DUSK, t * 2);
      } else {
        skyCol.lerpColors(SKY_DUSK, SKY_NIGHT, (t - 0.5) * 2);
      }
    } else {
      skyCol.copy(SKY_NIGHT);
    }

    if (state.weather === 'monsoon' || state.weather === 'flood') {
      skyCol.lerp(SKY_MONSOON, state.weather === 'flood' ? 0.78 : 0.55);
    } else if (state.weather === 'humid') {
      skyCol.lerp(SKY_HUMID, 0.28);
    }

    if (bgRef.current) {
      bgRef.current.copy(skyCol);
    }
    if (fogRef.current) {
      fogRef.current.color.copy(skyCol);
      fogRef.current.density =
        state.weather === 'flood'
          ? 0.0055
          : state.weather === 'monsoon'
          ? 0.0042
          : state.weather === 'humid'
          ? 0.0028
          : 0.0022;
    }

    const [px, , pz] = state.playerPos;

    if (dirLightRef.current) {
      const dl = dirLightRef.current;
      const isDay = sunY > -0.05;
      const dist = 120;
      if (isDay) {
        dl.position.set(px + sunX * dist, Math.max(15, sunY * dist), pz + 45);
        dl.intensity = THREE.MathUtils.clamp(sunY * 2.2 + 0.4, 0.35, 2.3);
        const golden = 1 - THREE.MathUtils.clamp(sunY * 2.5, 0, 1);
        dl.color.lerpColors(SUN_DAY, SUN_GOLDEN, golden);
      } else {
        dl.position.set(px - sunX * dist, 75, pz - 45);
        dl.intensity = 0.42;
        dl.color.copy(SUN_NIGHT);
      }
      dl.target.position.set(px, 0, pz);
      dl.target.updateMatrixWorld();
    }

    if (hemiLightRef.current) {
      const dayFactor = THREE.MathUtils.clamp((sunY + 0.15) * 1.4, 0.15, 1);
      hemiLightRef.current.intensity = 0.35 + dayFactor * 0.55;
      hemiLightRef.current.color.copy(skyCol).lerp(SUN_DAY, 0.35);
    }
  });

  return (
    <>
      <color ref={bgRef} attach="background" args={['#60a5fa']} />
      <fogExp2 ref={fogRef} attach="fog" args={['#60a5fa', 0.0022]} />
      <hemisphereLight ref={hemiLightRef} args={['#93c5fd', '#78350f', 0.75]} />
      <directionalLight
        ref={dirLightRef}
        castShadow={quality !== 'low'}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={10}
        shadow-camera-far={300}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-bias={-0.0005}
      />
    </>
  );
}
