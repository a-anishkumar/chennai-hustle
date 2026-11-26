import React, { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';

export type HumanNpcVariant = 'cesium' | 'soldier' | 'xbot' | 'michelle';
export type HumanNpcAnim = 'walk' | 'run' | 'idle' | 'dance' | 'agree';
export type HumanNpcProp =
  | 'none'
  | 'cigarette'
  | 'newspaper'
  | 'phone'
  | 'bag'
  | 'school_bag'
  | 'shopping_bag'
  | 'tools'
  | 'cricket_bat';

const MICHELLE_URL = `${import.meta.env.BASE_URL}models/npcs/Michelle.glb`;
useGLTF.preload(MICHELLE_URL);

const SKIN_TONES = ['#8d5524', '#7a4920', '#a1663c', '#6b3e1b'];
const PANTS_COLORS = ['#1e293b', '#1e3a8a', '#334155', '#f8fafc', '#78350f'];

class HumanErrorBoundary extends Component<
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

function MichelleHuman({
  anim,
  timeScale = 1,
  scale = 1,
}: {
  anim: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
}) {
  const { scene, animations } = useGLTF(MICHELLE_URL);

  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  const { actions, names } = useAnimations(animations, clone);

  useEffect(() => {
    const clip = names.find((n) => n.toLowerCase().includes('samba')) || names[0];
    const action = clip ? actions[clip] : null;
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    action.setEffectiveTimeScale(anim === 'dance' ? timeScale : 0.35 * timeScale);
  }, [actions, names, anim, timeScale]);

  return <primitive object={clone} scale={scale} />;
}

function NpcHandProp({ prop }: { prop: HumanNpcProp }) {
  if (prop === 'none' || prop === 'bag' || prop === 'school_bag') return null;

  if (prop === 'shopping_bag') {
    return (
      <group position={[0, -0.58, 0.04]}>
        <mesh castShadow>
          <boxGeometry args={[0.14, 0.28, 0.22]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <torusGeometry args={[0.055, 0.012, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    );
  }

  if (prop === 'newspaper') {
    return (
      <group position={[-0.08, -0.42, 0.2]} rotation={[-0.6, 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.24, 0.02]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.07, 0.012]}>
          <boxGeometry args={[0.26, 0.04, 0.005]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  }

  if (prop === 'phone') {
    return (
      <group position={[-0.04, -0.44, 0.16]} rotation={[-0.75, -0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.085, 0.15, 0.014]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[0.07, 0.125]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.2} />
        </mesh>
      </group>
    );
  }

  if (prop === 'cigarette') {
    return (
      <group position={[0, -0.46, 0.14]} rotation={[0.4, 0, -0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 6]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <sphereGeometry args={[0.011, 6, 6]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[0, 0.09, 0.06]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.45} />
        </mesh>
      </group>
    );
  }

  if (prop === 'tools') {
    return (
      <group position={[0, -0.5, 0.12]} rotation={[0.6, 0, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.045, 0.36, 0.03]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.13, 0.065, 0.045]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // cricket_bat
  return (
    <group position={[0, -0.56, 0.15]} rotation={[0.55, 0, -0.1]}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.022, 0.26, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.09, 0]} castShadow>
        <boxGeometry args={[0.12, 0.46, 0.045]} />
        <meshStandardMaterial color="#eab308" roughness={0.65} />
      </mesh>
    </group>
  );
}

export function ChennaiHumanRig({
  anim = 'idle',
  timeScale = 1,
  scale = 1,
  shirtColor = '#38bdf8',
  pantsColor,
  skinColor,
  prop = 'none',
  sitting = false,
  seed = 0,
}: {
  anim?: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
  shirtColor?: string;
  pantsColor?: string;
  skinColor?: string;
  prop?: HumanNpcProp;
  sitting?: boolean;
  seed?: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const skin = skinColor || SKIN_TONES[seed % SKIN_TONES.length];
  const pants = pantsColor || PANTS_COLORS[seed % PANTS_COLORS.length];
  const hair = seed % 7 === 6 ? '#cbd5e1' : '#111827';
  const hasMustache = seed % 2 === 0;
  const hasGlasses = seed % 4 === 1;

  const worldPosRef = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    if (!rootRef.current) return;
    rootRef.current.getWorldPosition(worldPosRef.current);
    const [px, , pz] = useGameStore.getState().playerPos;
    const d2 = (worldPosRef.current.x - px) ** 2 + (worldPosRef.current.z - pz) ** 2;
    const inRange = d2 < 12100; // Cull NPCs beyond 110m
    rootRef.current.visible = inRange;
    if (!inRange) return;

    const t = clock.getElapsedTime() * timeScale + seed * 1.3;

    if (sitting) {
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.35;
        rightArmRef.current.rotation.x = prop === 'newspaper' || prop === 'phone' ? -0.85 : -0.35;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.7) * 0.12;
        headRef.current.rotation.x = prop === 'phone' || prop === 'newspaper' ? 0.2 : 0;
      }
      return;
    }

    if (anim === 'walk' || anim === 'run') {
      const freq = anim === 'run' ? 9.5 : 5.8;
      const amp = anim === 'run' ? 0.75 : 0.48;
      const swing = Math.sin(t * freq) * amp;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = prop === 'phone' ? -0.7 : swing * 0.8;
      }
      if (torsoRef.current) {
        torsoRef.current.position.y = Math.abs(Math.cos(t * freq)) * 0.045;
        torsoRef.current.rotation.x = anim === 'run' ? 0.14 : 0.04;
      }
    } else if (anim === 'dance') {
      const beat = Math.sin(t * 6.5);
      if (torsoRef.current) {
        torsoRef.current.position.y = Math.abs(beat) * 0.12;
        torsoRef.current.rotation.z = Math.cos(t * 3.25) * 0.08;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -1.1 + beat * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.1 - beat * 0.4;
      if (leftLegRef.current) leftLegRef.current.rotation.x = beat * 0.15;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -beat * 0.15;
    } else if (anim === 'agree') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = -1.2 + Math.sin(t * 5) * 0.25;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.15;
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 4) * 0.12;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    } else {
      // Natural breathing & head look idle
      if (torsoRef.current) {
        torsoRef.current.position.y = Math.sin(t * 1.8) * 0.015;
        torsoRef.current.rotation.x = 0;
        torsoRef.current.rotation.z = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.16;
        headRef.current.rotation.x = prop === 'phone' || prop === 'newspaper' ? 0.22 : 0;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.4) * 0.05;
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x =
          prop === 'phone' || prop === 'newspaper' ? -0.78 : Math.cos(t * 1.4) * 0.05;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const bodyOffsetY = sitting ? -0.35 : 0;

  return (
    <group ref={rootRef} scale={scale} position={[0, bodyOffsetY, 0]}>
      <group ref={torsoRef}>
        {/* Torso / Shirt */}
        <mesh position={[0, 1.08, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.34, 6, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.78} />
        </mesh>
        {/* Shirt Collar */}
        <mesh position={[0, 1.36, 0.04]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 0.07, 10]} />
          <meshStandardMaterial color={shirtColor} roughness={0.8} />
        </mesh>

        {/* Backpack / School Bag */}
        {(prop === 'bag' || prop === 'school_bag') && (
          <group position={[0, 1.1, -0.19]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.35, 0.14]} />
              <meshStandardMaterial color={prop === 'school_bag' ? '#1d4ed8' : '#334155'} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.04, -0.08]}>
              <boxGeometry args={[0.22, 0.18, 0.03]} />
              <meshStandardMaterial color={prop === 'school_bag' ? '#facc15' : '#475569'} />
            </mesh>
          </group>
        )}

        {/* Neck & Head */}
        <group ref={headRef} position={[0, 1.48, 0]}>
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.065, 0.12, 8]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.145, 14, 14]} />
            <meshStandardMaterial color={skin} roughness={0.62} />
          </mesh>
          {/* Hair Cap */}
          <mesh position={[0, 0.12, -0.02]} castShadow>
            <sphereGeometry args={[0.148, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.05, 0.09, 0.13]}>
            <sphereGeometry args={[0.016, 6, 6]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.05, 0.09, 0.13]}>
            <sphereGeometry args={[0.016, 6, 6]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Mustache / Sunglasses */}
          {hasMustache && (
            <mesh position={[0, 0.03, 0.14]}>
              <boxGeometry args={[0.075, 0.018, 0.02]} />
              <meshStandardMaterial color={hair} />
            </mesh>
          )}
          {hasGlasses && (
            <mesh position={[0, 0.09, 0.145]}>
              <boxGeometry args={[0.14, 0.032, 0.015]} />
              <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.2} />
            </mesh>
          )}
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.22, 1.28, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.36, 4, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.48, 0]} castShadow>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
        </group>

        {/* Right Arm + Hand Prop */}
        <group ref={rightArmRef} position={[0.22, 1.28, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.36, 4, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.48, 0]} castShadow>
            <sphereGeometry args={[0.048, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          <NpcHandProp prop={prop} />
        </group>
      </group>

      {/* Left Leg & Shoe */}
      <group ref={leftLegRef} position={[-0.095, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.52, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.71, 0.04]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Leg & Shoe */}
      <group ref={rightLegRef} position={[0.095, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.072, 0.52, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.71, 0.04]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export function HumanFallback({ color = '#38bdf8' }: { color?: string }) {
  return <ChennaiHumanRig shirtColor={color} />;
}

export function AnimatedHumanNpc({
  variant = 'xbot',
  anim = 'walk',
  timeScale = 1,
  scale,
  tintColor,
  prop = 'none',
  sitting = false,
  seed = 0,
}: {
  variant?: HumanNpcVariant;
  anim?: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
  tintColor?: string;
  prop?: HumanNpcProp;
  sitting?: boolean;
  seed?: number;
}) {
  if (variant === 'michelle' && !sitting && prop === 'none') {
    const fb = <ChennaiHumanRig anim={anim} timeScale={timeScale} scale={scale ?? 1} shirtColor={tintColor || '#ec4899'} seed={seed} />;
    return (
      <HumanErrorBoundary fallback={fb}>
        <Suspense fallback={fb}>
          <MichelleHuman anim={anim} timeScale={timeScale} scale={scale ?? 1} />
        </Suspense>
      </HumanErrorBoundary>
    );
  }

  return (
    <ChennaiHumanRig
      anim={anim}
      timeScale={timeScale}
      scale={scale ?? 1}
      shirtColor={tintColor || '#38bdf8'}
      prop={prop}
      sitting={sitting}
      seed={seed}
    />
  );
}
