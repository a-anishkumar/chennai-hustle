import React, { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';

export type AnimalSpecies = 'cow' | 'bull' | 'shiba' | 'husky' | 'fox' | 'parrot' | 'stork';

export const ANIMAL_MODEL_URLS: Record<AnimalSpecies, string> = {
  cow: '/models/animals/Cow.glb',
  bull: '/models/animals/Bull.glb',
  shiba: '/models/animals/ShibaInu.glb',
  husky: '/models/animals/Husky.glb',
  fox: '/models/animals/Fox.glb',
  parrot: '/models/animals/Parrot.glb',
  stork: '/models/animals/Stork.glb',
};

const DEFAULT_SCALES: Record<AnimalSpecies, number> = {
  cow: 0.62,
  bull: 0.65,
  shiba: 0.48,
  husky: 0.5,
  fox: 0.36,
  parrot: 0.016,
  stork: 0.012,
};

Object.values(ANIMAL_MODEL_URLS).forEach((url) => useGLTF.preload(url));

class AnimalErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function RiggedAnimalMesh({
  species,
  animName,
  timeScale = 1,
  scale,
}: {
  species: AnimalSpecies;
  animName: string;
  timeScale?: number;
  scale?: number;
}) {
  const url = ANIMAL_MODEL_URLS[species];
  const { scene, animations } = useGLTF(url);

  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  const { actions, names } = useAnimations(animations, clone);

  useEffect(() => {
    if (!names.length) return;
    const match =
      names.find((n) => n === animName) ||
      names.find((n) => n.toLowerCase().includes(animName.toLowerCase())) ||
      names[0];
    const action = match ? actions[match] : null;
    if (!action) return;

    Object.values(actions).forEach((a) => {
      if (a && a !== action && a.isRunning()) a.fadeOut(0.25);
    });
    action.reset().fadeIn(0.25).play();
    action.setEffectiveTimeScale(timeScale);
  }, [actions, names, animName, timeScale]);

  const finalScale = scale ?? DEFAULT_SCALES[species];
  return <primitive object={clone} scale={finalScale} />;
}

export function RoamingAnimal({
  species,
  home,
  initialRotY = 0,
  roamRadius = 4.5,
  speed = 0.8,
  phase = 0,
  scale,
}: {
  species: AnimalSpecies;
  home: [number, number];
  initialRotY?: number;
  roamRadius?: number;
  speed?: number;
  phase?: number;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [animState, setAnimState] = React.useState<'walk' | 'idle' | 'eat'>('idle');
  const animRef = useRef<'walk' | 'idle' | 'eat'>('idle');

  useFrame(({ clock }) => {
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused || !groupRef.current) return;

    const t = clock.getElapsedTime() + phase * 3.7;
    const cycle = t % 14;
    const nextMode: 'walk' | 'idle' | 'eat' =
      cycle < 7.5 ? 'walk' : cycle < 11.2 ? 'eat' : 'idle';

    if (nextMode !== animRef.current) {
      animRef.current = nextMode;
      setAnimState(nextMode);
    }

    if (nextMode === 'walk') {
      const ang = (t * speed * 0.25) + initialRotY;
      const nx = home[0] + Math.cos(ang) * roamRadius;
      const nz = home[1] + Math.sin(ang * 0.85) * (roamRadius * 0.75);
      const dx = nx - groupRef.current.position.x;
      const dz = nz - groupRef.current.position.z;
      groupRef.current.position.set(nx, 0, nz);
      if (Math.abs(dx) + Math.abs(dz) > 0.001) {
        groupRef.current.rotation.y = Math.atan2(dx, dz);
      }
    }
  });

  const clipName =
    animState === 'walk'
      ? 'AnimalArmature|Walk'
      : animState === 'eat'
        ? 'AnimalArmature|Eating'
        : 'AnimalArmature|Idle';

  const fallbackBox = (
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[0.45, 0.55, 0.9]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  );

  return (
    <group ref={groupRef} position={[home[0], 0, home[1]]} rotation={[0, initialRotY, 0]}>
      <AnimalErrorBoundary fallback={fallbackBox}>
        <Suspense fallback={fallbackBox}>
          <RiggedAnimalMesh
            species={species}
            animName={clipName}
            timeScale={animState === 'walk' ? 0.95 + (phase % 3) * 0.1 : 1}
            scale={scale}
          />
        </Suspense>
      </AnimalErrorBoundary>
    </group>
  );
}

export function FlyingBird({
  species,
  center,
  radius,
  altitude,
  speed,
  phase,
}: {
  species: 'parrot' | 'stork';
  center: [number, number];
  radius: number;
  altitude: number;
  speed: number;
  phase: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused || !groupRef.current) return;

    const t = clock.getElapsedTime();
    const ang = t * speed + phase;
    const bx = center[0] + Math.cos(ang) * radius;
    const bz = center[1] + Math.sin(ang) * radius;
    const by = altitude + Math.sin(t * 1.4 + phase) * 1.1;

    groupRef.current.position.set(bx, by, bz);
    groupRef.current.rotation.set(0, -ang, Math.sin(t * 2 + phase) * 0.12);
  });

  const clipName = species === 'parrot' ? 'parrot_A_' : 'storkFly_B_';

  const fallbackBird = (
    <mesh>
      <boxGeometry args={[0.8, 0.1, 0.3]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
  );

  return (
    <group ref={groupRef} position={[center[0] + radius, altitude, center[1]]}>
      <AnimalErrorBoundary fallback={fallbackBird}>
        <Suspense fallback={fallbackBird}>
          <RiggedAnimalMesh species={species} animName={clipName} timeScale={1.15} />
        </Suspense>
      </AnimalErrorBoundary>
    </group>
  );
}
