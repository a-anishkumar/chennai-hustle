import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';
import { isNightHour } from '../../systems/timeUtils';

const VERTEX_SHADER = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float w = sin(pos.x * 0.22 + uTime * 2.2) * 0.08 + cos(pos.y * 0.28 + uTime * 1.7) * 0.07;
    pos.z += w;
    vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uFloodFactor;
  uniform float uNightFactor;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vec3 canalDay = vec3(0.05, 0.44, 0.46);
    vec3 floodDay = vec3(0.18, 0.31, 0.30);
    vec3 nightTint = vec3(0.03, 0.09, 0.16);
    vec3 base = mix(canalDay, floodDay, uFloodFactor);
    base = mix(base, nightTint, uNightFactor * 0.72);

    float rippleA = sin(vUv.x * 180.0 + uTime * 3.2) * cos(vUv.y * 180.0 - uTime * 2.5);
    float rippleB = cos(vUv.x * 95.0 - uTime * 2.1) * sin(vUv.y * 110.0 + uTime * 1.8);
    float shimmer = smoothstep(0.03, 0.12, vWave + (rippleA + rippleB) * 0.022);
    vec3 specCol = mix(vec3(0.75, 0.90, 0.96), vec3(0.42, 0.62, 0.92), uNightFactor);
    vec3 finalCol = mix(base, specCol, shimmer * 0.52);
    gl_FragColor = vec4(finalCol, 0.80 + uFloodFactor * 0.12);
  }
`;

export function FloodWater() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFloodFactor: { value: 0 },
      uNightFactor: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uFloodFactor.value = THREE.MathUtils.clamp((s.waterLevel + 0.8) / 1.45, 0, 1);
      const targetNight = isNightHour(s.timeOfDay) ? 1 : 0;
      matRef.current.uniforms.uNightFactor.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uNightFactor.value,
        targetNight,
        Math.min(1, delta * 2)
      );
    }
    if (meshRef.current) {
      meshRef.current.position.y = s.waterLevel;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.8, 180]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[3200, 1800, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
