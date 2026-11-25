import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';

const VERTEX_SHADER = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float w = sin(pos.x * 0.25 + uTime * 2.4) * 0.06 + cos(pos.y * 0.3 + uTime * 1.9) * 0.06;
    pos.z += w;
    vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uFloodFactor;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vec3 canalCol = vec3(0.05, 0.44, 0.43);
    vec3 floodCol = vec3(0.18, 0.32, 0.31);
    vec3 base = mix(canalCol, floodCol, uFloodFactor);
    float ripple = sin(vUv.x * 160.0 + uTime * 3.5) * cos(vUv.y * 160.0 - uTime * 2.8);
    float foam = smoothstep(0.04, 0.11, vWave + ripple * 0.02);
    vec3 finalCol = mix(base, vec3(0.65, 0.82, 0.88), foam * 0.42);
    gl_FragColor = vec4(finalCol, 0.78 + uFloodFactor * 0.1);
  }
`;

export function FloodWater() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFloodFactor: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      matRef.current.uniforms.uFloodFactor.value = THREE.MathUtils.clamp((s.waterLevel + 0.8) / 1.45, 0, 1);
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
