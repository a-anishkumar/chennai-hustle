import React, { Component, Suspense, useEffect, useMemo } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

const CESIUM_MAN_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/CesiumMan.glb';

class AnimErrorBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function RiggedWalker({ isMoving, isSprinting }: { isMoving: boolean; isSprinting: boolean }) {
  const { scene, animations } = useGLTF(CESIUM_MAN_URL);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, clone);

  useEffect(() => {
    const firstKey = Object.keys(actions)[0];
    const action = firstKey ? actions[firstKey] : null;
    if (!action) return;
    if (isMoving) {
      action.reset().play();
      action.setEffectiveTimeScale(isSprinting ? 1.55 : 1.05);
    } else {
      action.stop();
    }
  }, [actions, isMoving, isSprinting]);

  return <primitive object={clone} scale={1.05} castShadow receiveShadow />;
}

export function AnimatedPlayerMesh({
  isMoving,
  isSprinting,
  fallback,
}: {
  isMoving: boolean;
  isSprinting: boolean;
  fallback: React.ReactNode;
}) {
  return (
    <AnimErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <RiggedWalker isMoving={isMoving} isSprinting={isSprinting} />
      </Suspense>
    </AnimErrorBoundary>
  );
}
