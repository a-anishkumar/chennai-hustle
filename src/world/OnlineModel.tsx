import React, { Component, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Graceful fallback if offline or CDN unreachable
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function GltfInner({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(url);
  const cloned = React.useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} scale={scale} position={position} rotation={rotation} castShadow receiveShadow />;
}

export function OnlineModel({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fallback = null,
}: {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  fallback?: React.ReactNode;
}) {
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfInner url={url} scale={scale} position={position} rotation={rotation} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
