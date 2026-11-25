import React, { Component, Suspense, useEffect, useMemo } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

export type HumanNpcVariant = 'cesium' | 'soldier' | 'xbot' | 'michelle';
export type HumanNpcAnim = 'walk' | 'run' | 'idle' | 'dance' | 'agree';

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

export function AnimatedHumanNpc({
  variant = 'xbot',
  anim = 'walk',
  timeScale = 1,
  scale,
  tintColor,
}: {
  variant?: HumanNpcVariant;
  anim?: HumanNpcAnim;
  timeScale?: number;
  scale?: number;
  tintColor?: string;
}) {
  const fb = <HumanFallback color={tintColor} />;
  return (
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
  );
}
