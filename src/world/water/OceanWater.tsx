import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../systems/gameStore';
import { isNightHour } from '../../systems/timeUtils';

const OCEAN_VERT = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vCrest;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float swell = sin(pos.x * 0.14 - uTime * 1.6) * 0.24 + cos(pos.y * 0.09 + uTime * 1.1) * 0.14;
    pos.z += swell;
    vCrest = swell;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const OCEAN_FRAG = `
  uniform float uTime;
  uniform float uNight;
  uniform float uMonsoon;
  varying vec2 vUv;
  varying float vCrest;
  void main() {
    vec3 deepCol = mix(vec3(0.015, 0.28, 0.49), vec3(0.03, 0.09, 0.19), uNight * 0.85);
    vec3 shallowCol = mix(vec3(0.08, 0.56, 0.72), vec3(0.05, 0.19, 0.30), uNight * 0.82);
    deepCol = mix(deepCol, vec3(0.09, 0.19, 0.26), uMonsoon * 0.65);

    // Shoreline gradient along western edge (vUv.x == 0 touches beach sand)
    float shore = smoothstep(0.0, 0.16, vUv.x);
    vec3 waterCol = mix(shallowCol, deepCol, shore);

    // Animated surf foam near Marina & Elliot's Beach sand line
    float surfWave = sin(vUv.x * 90.0 - uTime * 2.4 + sin(vUv.y * 120.0) * 0.6);
    float foamBand = (1.0 - smoothstep(0.0, 0.08, vUv.x)) * smoothstep(0.1, 0.9, surfWave);
    float crestSpec = smoothstep(0.18, 0.36, vCrest + sin(vUv.x * 160.0 + uTime * 2.8) * 0.09);

    vec3 foamCol = mix(vec3(0.88, 0.96, 1.0), vec3(0.45, 0.62, 0.82), uNight * 0.75);
    vec3 glintCol = mix(vec3(1.0, 0.96, 0.85), vec3(0.65, 0.80, 1.0), uNight);

    waterCol = mix(waterCol, foamCol, clamp(foamBand * 0.78, 0.0, 0.85));
    waterCol = mix(waterCol, glintCol, clamp(crestSpec * (0.35 - uMonsoon * 0.2), 0.0, 0.45));
    gl_FragColor = vec4(waterCol, 0.94);
  }
`;

export function OceanWater() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNight: { value: 0 },
      uMonsoon: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const s = useGameStore.getState();
    mat.uniforms.uTime.value += delta;
    const targetNight = isNightHour(s.timeOfDay) ? 1 : 0;
    const targetMonsoon = s.weather === 'monsoon' || s.weather === 'flood' ? 1 : 0;
    mat.uniforms.uNight.value = THREE.MathUtils.lerp(mat.uniforms.uNight.value, targetNight, Math.min(1, delta * 2));
    mat.uniforms.uMonsoon.value = THREE.MathUtils.lerp(mat.uniforms.uMonsoon.value, targetMonsoon, Math.min(1, delta * 2));
  });

  return (
    <mesh position={[1780, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[640, 4000, 32, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={OCEAN_VERT}
        fragmentShader={OCEAN_FRAG}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
