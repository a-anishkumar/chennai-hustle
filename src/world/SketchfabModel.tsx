import React, { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { getSketchfabModelRelPath, SKETCHFAB_BY_ID } from '../config/sketchfabCatalog';
import sketchfabManifest from '../config/sketchfabManifest.json';
import { useGameStore } from '../systems/gameStore';

const BASE = import.meta.env.BASE_URL;
const availableMap = (sketchfabManifest as { available: Record<string, boolean> }).available;

// Preload all locally available Sketchfab GLBs/glTFs at startup without risking 404s on missing assets
Object.keys(availableMap).forEach((id) => {
  const rel = getSketchfabModelRelPath(id);
  if (rel) {
    useGLTF.preload(`${BASE}${rel}`);
  }
});

class SketchfabErrorBoundary extends Component<
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

function LoadedSketchfabMesh({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animName,
  timeScale = 1,
  maxDist = 180,
}: {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animName?: string;
  timeScale?: number;
  maxDist?: number;
}) {
  const { scene, animations } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const worldVecRef = useRef(new THREE.Vector3());

  const clone = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
        mats.forEach((m) => {
          if (m.map) m.map.anisotropy = 4;
        });
      }
    });
    return cloned;
  }, [scene]);

  const { actions, names } = useAnimations(animations, clone);

  useEffect(() => {
    if (!names.length || !animName) return;
    const lower = animName.toLowerCase();
    const match = names.find((n) => n.toLowerCase().includes(lower)) || names[0];
    const action = match ? actions[match] : null;
    if (!action) return;
    Object.values(actions).forEach((a) => {
      if (a && a !== action && a.isRunning()) a.fadeOut(0.2);
    });
    action.reset().fadeIn(0.2).play();
    action.setEffectiveTimeScale(timeScale);
  }, [actions, names, animName, timeScale]);

  const maxDist2 = maxDist * maxDist;
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.getWorldPosition(worldVecRef.current);
    const [px, , pz] = useGameStore.getState().playerPos;
    const dx = worldVecRef.current.x - px;
    const dz = worldVecRef.current.z - pz;
    g.visible = dx * dx + dz * dz < maxDist2;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clone} scale={scale} />
    </group>
  );
}

/**
 * Drop-in Sketchfab model replacement slot:
 * Renders the downloaded local Sketchfab GLB (with SkeletonUtils cloning,
 * AnimationMixer, PBR shadows, and distance-LOD visibility) when available in
 * public/assets/sketchfab/, and seamlessly preserves fallback gameplay geometry
 * until the model is downloaded.
 */
export function SketchfabSlot({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scaleMultiplier = 1,
  animName,
  timeScale = 1,
  maxDist = 180,
  fallback,
}: {
  id: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scaleMultiplier?: number;
  animName?: string;
  timeScale?: number;
  maxDist?: number;
  fallback: React.ReactNode;
}) {
  const entry = SKETCHFAB_BY_ID[id];
  const relPath = getSketchfabModelRelPath(id);
  if (!entry || !relPath) {
    return <>{fallback}</>;
  }

  const url = `${BASE}${relPath}`;
  const finalPos: [number, number, number] = [
    position[0],
    position[1] + (entry.yOffset ?? 0),
    position[2],
  ];
  const finalRot: [number, number, number] = [
    rotation[0],
    rotation[1] + (entry.defaultRotY ?? 0),
    rotation[2],
  ];
  const finalScale = entry.defaultScale * scaleMultiplier;

  return (
    <SketchfabErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedSketchfabMesh
          url={url}
          position={finalPos}
          rotation={finalRot}
          scale={finalScale}
          animName={animName}
          timeScale={timeScale}
          maxDist={maxDist}
        />
      </Suspense>
    </SketchfabErrorBoundary>
  );
}
