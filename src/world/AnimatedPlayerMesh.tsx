import React from 'react';
import { ChennaiHumanRig } from './AnimatedHumanNpc';

export function AnimatedPlayerMesh({
  isMoving,
  isSprinting,
}: {
  isMoving: boolean;
  isSprinting: boolean;
  fallback?: React.ReactNode;
}) {
  return (
    <ChennaiHumanRig
      anim={isMoving ? (isSprinting ? 'run' : 'walk') : 'idle'}
      timeScale={isSprinting ? 1.15 : 1.0}
      shirtColor="#f97316"
      pantsColor="#1e3a8a"
      skinColor="#8d5524"
      prop="bag"
      seed={2}
    />
  );
}
