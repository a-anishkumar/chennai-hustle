import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';

export function JobMarkers() {
  const activeJob = useGameStore((s) => s.activeJob);
  if (!activeJob) return null;
  return <ActiveJobMarkers />;
}

function ActiveJobMarkers() {
  const activeJob = useGameStore((s) => s.activeJob);
  const playerPos = useGameStore((s) => s.playerPos);
  const beaconRef = useRef<THREE.Mesh>(null);
  const triggerCooldown = useRef(0);

  useFrame(({ clock }, delta) => {
    if (triggerCooldown.current > 0) triggerCooldown.current -= delta;
    if (beaconRef.current) {
      beaconRef.current.rotation.y = clock.getElapsedTime() * 1.8;
    }

    const job = useGameStore.getState().activeJob;
    if (!job || triggerCooldown.current > 0) return;

    const [px, , pz] = useGameStore.getState().playerPos;
    const target = job.stage === 'pickup' ? job.pickupPos : job.dropoffPos;
    const dx = px - target[0];
    const dz = pz - target[2];
    if (dx * dx + dz * dz < 42) {
      // Within ~6.5m radius
      triggerCooldown.current = 1.0;
      useGameStore.getState().advanceJobStage();
    }
  });

  if (!activeJob) return null;

  const targetPos = activeJob.stage === 'pickup' ? activeJob.pickupPos : activeJob.dropoffPos;
  const color = activeJob.stage === 'pickup' ? '#f59e0b' : '#22c55e';

  const linePoints: [number, number, number][] = [
    [playerPos[0], 0.35, playerPos[2]],
    [targetPos[0], 0.35, targetPos[2]],
  ];

  return (
    <group name="Job_Markers">
      {/* 3D GPS Route Line */}
      <Line points={linePoints} color={color} lineWidth={3} dashed dashSize={2} gapSize={1.2} />

      {/* Target Beacon Pillar & Ring */}
      <group position={[targetPos[0], 0, targetPos[2]]}>
        <mesh ref={beaconRef} position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.35, 1.1, 7, 12, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.38} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 3.0, 24]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
