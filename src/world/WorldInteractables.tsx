import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';
import { audioManager } from '../audio/AudioManager';

const COLLECTIBLE_SPOTS: { id: string; x: number; z: number; label: string }[] = [
  { id: 'tnhb_token', x: -112, z: 60, label: 'TNHB Heritage Coin' },
  { id: 'tea_token', x: -62, z: -30, label: 'Filter Kaapi Token' },
  { id: 'marina_token', x: 1508, z: 120, label: 'Marina Shell Token' },
  { id: 'chepauk_token', x: 920, z: 162, label: 'CSK Whistle Token' },
  { id: 'ripon_token', x: -245, z: -195, label: 'Ripon Heritage Coin' },
  { id: 'temple_token', x: 620, z: 492, label: 'Mylapore Bell Token' },
  { id: 'concert_token', x: 160, z: 38, label: 'Concert VIP Pass' },
  { id: 'park_token', x: -20, z: 76, label: 'Anna Nagar Tower Coin' },
];

const INTERACT_HINTS: { x: number; z: number; r: number; label: string }[] = [
  { x: -133, z: 42, r: 6, label: '[E] Rest at Home (TNHB Block A)' },
  { x: -68, z: -31, r: 6, label: '[E] Order Hot Tea & Bajji (₹25)' },
  { x: -120, z: 24, r: 7, label: '[E] Order Food Truck Shawarma (₹25)' },
  { x: 1492, z: 92, r: 7, label: '[E] Order Marina Beach Bites (₹25)' },
  { x: -215, z: -85, r: 8, label: '[E] Refuel Vehicle (₹20)' },
  { x: -140, z: -95, r: 7, label: '[E] Fast Charge EV Bike (Free)' },
  { x: -155, z: -35, r: 7, label: '[E] Tune & Service at TTF Mechanic' },
  { x: -138, z: 62, r: 4.5, label: '[E] Sit on Bench & Recover Stamina' },
  { x: -16, z: 68, r: 4.5, label: '[E] Sit on Park Bench' },
];

export function WorldInteractables() {
  const [collected, setCollected] = useState<Record<string, boolean>>({});
  const [activeHint, setActiveHint] = useState<{ x: number; z: number; label: string } | null>(null);
  const tokenRefs = useRef<(THREE.Mesh | null)[]>([]);
  const timerRef = useRef(0);

  useFrame(({ clock }, delta) => {
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused) return;
    const t = clock.getElapsedTime();
    const [px, , pz] = state.playerPos;

    for (let i = 0; i < COLLECTIBLE_SPOTS.length; i++) {
      const mesh = tokenRefs.current[i];
      if (!mesh || collected[COLLECTIBLE_SPOTS[i].id]) continue;
      mesh.rotation.y = t * 2.4 + i;
      mesh.position.y = 1.1 + Math.sin(t * 3 + i) * 0.18;

      const c = COLLECTIBLE_SPOTS[i];
      const d2 = (px - c.x) ** 2 + (pz - c.z) ** 2;
      if (d2 < 6.25) {
        setCollected((prev) => ({ ...prev, [c.id]: true }));
        state.modifyStats({ money: 150, reputation: 10, mood: 8 });
        audioManager.playCash();
        state.showToast(`Collected ${c.label}! +₹150 & +10 Rep`);
      }
    }

    timerRef.current += delta;
    if (timerRef.current > 0.25) {
      timerRef.current = 0;
      const hit = INTERACT_HINTS.find((h) => (px - h.x) ** 2 + (pz - h.z) ** 2 < h.r * h.r);
      setActiveHint(hit ? { x: hit.x, z: hit.z, label: hit.label } : null);
    }
  });

  return (
    <group name="World_Interactables">
      {COLLECTIBLE_SPOTS.map((c, i) =>
        collected[c.id] ? null : (
          <mesh
            key={c.id}
            ref={(el) => {
              tokenRefs.current[i] = el;
            }}
            position={[c.x, 1.1, c.z]}
            castShadow
          >
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={1.2} metalness={0.7} roughness={0.2} />
          </mesh>
        )
      )}

      {activeHint && (
        <Html position={[activeHint.x, 2.5, activeHint.z]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#fde047',
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(250, 204, 21, 0.7)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            {activeHint.label}
          </div>
        </Html>
      )}
    </group>
  );
}
