import React, { Component, Suspense, useEffect, useMemo } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

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

export const HUMAN_NPC_URLS: Record<HumanNpcVariant, string> = {
  cesium: '/models/npcs/CesiumMan.glb',
  soldier: '/models/npcs/Soldier.glb',
  xbot: '/models/npcs/Xbot.glb',
  michelle: '/models/npcs/Michelle.glb',
};

const VARIANT_SCALES: Record<HumanNpcVariant, number> = {
  cesium: 1.05,
  soldier: 1.0,
  xbot: 1.05,
  michelle: 1.0,
};

Object.values(HUMAN_NPC_URLS).forEach((url) => useGLTF.preload(url));

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

function resolveClipName(variant: HumanNpcVariant, anim: HumanNpcAnim, names: string[]): string | null {
  if (!names.length) return null;
  if (variant === 'cesium') return names[0];
  if (variant === 'michelle') {
    return names.find((n) => n.toLowerCase().includes('samba')) || names[0];
  }
  if (variant === 'soldier') {
    if (anim === 'run') return names.find((n) => n === 'Run') || names[0];
    if (anim === 'walk') return names.find((n) => n === 'Walk') || names[0];
    return names.find((n) => n === 'Idle') || names[0];
  }
  // xbot
  const want =
    anim === 'run'
      ? 'run'
      : anim === 'walk'
        ? 'walk'
        : anim === 'agree' || anim === 'dance'
          ? 'agree'
          : 'idle';
  return names.find((n) => n.toLowerCase() === want) || names[0];
}

function RiggedHumanInner({
  variant,
  anim,
  timeScale = 1,
  scale,
  tintColor,
}: {
  variant: HumanNpcVariant;
  anim: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
  tintColor?: string;
}) {
  const url = HUMAN_NPC_URLS[variant];
  const { scene, animations } = useGLTF(url);

  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (tintColor && variant === 'xbot' && mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (mesh.name.toLowerCase().includes('surface')) {
            mat.color.set(tintColor);
          }
          mesh.material = mat;
        }
      }
    });
    return cloned;
  }, [scene, tintColor, variant]);

  const { actions, names } = useAnimations(animations, clone);

  useEffect(() => {
    const clip = resolveClipName(variant, anim, names);
    const action = clip ? actions[clip] : null;
    if (!action) return;

    Object.values(actions).forEach((a) => {
      if (a && a !== action && a.isRunning()) a.fadeOut(0.2);
    });

    if (variant === 'cesium' && anim === 'idle') {
      action.reset().play();
      action.paused = true;
      return;
    }

    action.paused = false;
    action.reset().fadeIn(0.2).play();
    const speedMult = anim === 'run' ? 1.35 * timeScale : timeScale;
    action.setEffectiveTimeScale(speedMult);
  }, [actions, names, variant, anim, timeScale]);

  const finalScale = scale ?? VARIANT_SCALES[variant];
  return <primitive object={clone} scale={finalScale} />;
}

export function HumanFallback({ color = '#38bdf8' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.92, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.48, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color="#8d5524" />
      </mesh>
    </group>
  );
}

function NpcHandProp({ prop }: { prop: HumanNpcProp }) {
  if (prop === 'none') return null;

  if (prop === 'bag' || prop === 'school_bag') {
    const isSchool = prop === 'school_bag';
    return (
      <group position={[0, 1.05, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.36, 0.16]} />
          <meshStandardMaterial color={isSchool ? '#1d4ed8' : '#334155'} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.04, -0.09]}>
          <boxGeometry args={[0.24, 0.2, 0.04]} />
          <meshStandardMaterial color={isSchool ? '#facc15' : '#475569'} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (prop === 'shopping_bag') {
    return (
      <group position={[0.32, 0.68, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.14, 0.3, 0.24]} />
          <meshStandardMaterial color="#facc15" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <torusGeometry args={[0.06, 0.012, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    );
  }

  if (prop === 'newspaper') {
    return (
      <group position={[0.22, 0.98, 0.32]} rotation={[-0.45, 0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.26, 0.02]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.08, 0.012]}>
          <boxGeometry args={[0.28, 0.04, 0.005]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, -0.02, 0.012]}>
          <boxGeometry args={[0.26, 0.1, 0.005]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    );
  }

  if (prop === 'phone') {
    return (
      <group position={[0.2, 1.06, 0.3]} rotation={[-0.5, -0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.16, 0.015]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <planeGeometry args={[0.075, 0.135]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.2} />
        </mesh>
      </group>
    );
  }

  if (prop === 'cigarette') {
    return (
      <group position={[0.24, 1.15, 0.26]} rotation={[0.2, 0, -0.3]}>
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
      <group position={[0.3, 0.9, 0.2]} rotation={[0.4, 0, 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.05, 0.38, 0.03]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.14, 0.07, 0.05]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // cricket_bat
  return (
    <group position={[0.3, 0.72, 0.22]} rotation={[0.35, 0, -0.15]}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.022, 0.28, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow>
        <boxGeometry args={[0.12, 0.48, 0.045]} />
        <meshStandardMaterial color="#eab308" roughness={0.65} />
      </mesh>
    </group>
  );
}

export function AnimatedHumanNpc({
  variant = 'xbot',
  anim = 'walk',
  timeScale = 1,
  scale,
  tintColor,
  prop = 'none',
}: {
  variant?: HumanNpcVariant;
  anim?: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
  tintColor?: string;
  prop?: HumanNpcProp;
}) {
  const fb = <HumanFallback color={tintColor} />;
  return (
    <group>
      <HumanErrorBoundary fallback={fb}>
        <Suspense fallback={fb}>
          <RiggedHumanInner
            variant={variant}
            anim={anim}
            timeScale={timeScale}
            scale={scale}
            tintColor={tintColor}
          />
        </Suspense>
      </HumanErrorBoundary>
      <NpcHandProp prop={prop} />
    </group>
  );
}
