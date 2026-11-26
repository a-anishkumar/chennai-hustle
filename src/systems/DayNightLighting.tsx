import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { audioManager } from '../audio/AudioManager';

const SKY_VERT = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SKY_FRAG = `
  uniform vec3 uTopColor;
  uniform vec3 uHorizonColor;
  varying vec3 vWorldPos;
  void main() {
    float h = clamp(normalize(vWorldPos).y, 0.0, 1.0);
    vec3 col = mix(uHorizonColor, uTopColor, pow(h, 0.55));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const SKY_NIGHT = new THREE.Color('#091124');
const SKY_DAWN = new THREE.Color('#f97316');
const SKY_DAY = new THREE.Color('#60a5fa');
const SKY_DUSK = new THREE.Color('#e11d48');
const SKY_MONSOON = new THREE.Color('#334155');
const SKY_HUMID = new THREE.Color('#94a3b8');

const SUN_DAY = new THREE.Color('#fff7ed');
const SUN_GOLDEN = new THREE.Color('#fb923c');
const SUN_NIGHT = new THREE.Color('#93c5fd');
const _skyCol = new THREE.Color();

export function DayNightLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Color>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const skyMatRef = useRef<THREE.ShaderMaterial>(null);
  const skyUniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color('#2563eb') },
      uHorizonColor: { value: new THREE.Color('#93c5fd') },
    }),
    []
  );
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

    const skyCol = _skyCol;
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
    if (skyMatRef.current) {
      skyMatRef.current.uniforms.uHorizonColor.value.copy(skyCol);
      skyMatRef.current.uniforms.uTopColor.value.copy(skyCol).multiplyScalar(0.58);
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
    audioManager.updateSpatialAmbience(px, pz);

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

    if (sunMeshRef.current) {
      const isDay = sunY > -0.1;
      sunMeshRef.current.position.set(
        px + (isDay ? sunX : -sunX) * 420,
        Math.max(24, (isDay ? sunY : 0.4) * 320),
        pz - 180
      );
      const mat = sunMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(isDay ? '#fef08a' : '#e2e8f0');
    }

    if (cloudsRef.current) {
      const drift = (performance.now() * 0.004) % 600;
      cloudsRef.current.position.set(px - 300 + drift, 95, pz);
    }
  });

  return (
    <>
      <color ref={bgRef} attach="background" args={['#60a5fa']} />
      <fogExp2 ref={fogRef} attach="fog" args={['#60a5fa', 0.0022]} />
      <hemisphereLight ref={hemiLightRef} args={['#93c5fd', '#78350f', 0.75]} />
      {/* Procedural Atmospheric Sky Gradient Dome */}
      <mesh>
        <sphereGeometry args={[760, 24, 16]} />
        <shaderMaterial ref={skyMatRef} vertexShader={SKY_VERT} fragmentShader={SKY_FRAG} uniforms={skyUniforms} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Visible Sun / Moon Disc */}
      <mesh ref={sunMeshRef}>
        <sphereGeometry args={[18, 16, 16]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Drifting Volumetric-Style Cloud Clusters */}
      <group ref={cloudsRef}>
        {[-240, -100, 40, 180, 320].map((cx, i) => (
          <group key={i} position={[cx, (i % 2) * 14, ((i * 97) % 240) - 120]}>
            <mesh position={[0, 0, 0]} scale={[1.6, 0.7, 1.1]}>
              <sphereGeometry args={[10, 12, 10]} />
              <meshStandardMaterial color="#f8fafc" roughness={1} transparent opacity={0.92} />
            </mesh>
            <mesh position={[10, 2, 2]} scale={[1.2, 0.65, 1.0]}>
              <sphereGeometry args={[8, 10, 8]} />
              <meshStandardMaterial color="#f1f5f9" roughness={1} transparent opacity={0.88} />
            </mesh>
            <mesh position={[-9, 1.5, -2]} scale={[1.1, 0.6, 0.9]}>
              <sphereGeometry args={[8, 10, 8]} />
              <meshStandardMaterial color="#e2e8f0" roughness={1} transparent opacity={0.88} />
            </mesh>
          </group>
        ))}
      </group>
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
