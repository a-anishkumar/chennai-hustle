import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useGameStore } from './gameStore';

export function PostProcessing() {
  const quality = useGameStore((s) => s.quality);
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    if (quality !== 'high') return null;
    try {
      const comp = new EffectComposer(gl);
      comp.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        0.24, // subtle cinematic bloom strength
        0.45, // radius
        0.92  // threshold so only emissive lights/sun glint bloom
      );
      comp.addPass(bloom);
      comp.addPass(new OutputPass());
      return comp;
    } catch {
      return null;
    }
  }, [gl, scene, camera, quality, size.width, size.height]);

  useEffect(() => {
    return () => {
      composer?.dispose();
    };
  }, [composer]);

  useFrame(() => {
    if (composer && quality === 'high') {
      composer.render();
    }
  }, 1);

  return null;
}
