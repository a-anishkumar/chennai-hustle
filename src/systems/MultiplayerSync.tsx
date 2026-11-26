import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Client, Room } from 'colyseus.js';
import { useGameStore } from './gameStore';
import { ChennaiHumanRig } from '../world/AnimatedHumanNpc';

interface RemotePlayer {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export function MultiplayerSync() {
  const isStarted = useGameStore((s) => s.isStarted);
  const roomRef = useRef<Room | null>(null);
  const [remotes, setRemotes] = useState<Record<string, RemotePlayer>>({});
  const sendTimer = useRef(0);

  useEffect(() => {
    if (!isStarted) return;
    let active = true;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001`;
    const client = new Client(wsUrl);

    client
      .joinOrCreate('chennai_world')
      .then((room) => {
        if (!active) {
          room.leave();
          return;
        }
        roomRef.current = room;
        room.onMessage('playerMove', (msg: RemotePlayer) => {
          setRemotes((prev) => ({ ...prev, [msg.id]: msg }));
        });
      })
      .catch(() => {
        // Offline / single-player fallback when Colyseus server is unreachable
      });

    return () => {
      active = false;
      roomRef.current?.leave();
      roomRef.current = null;
    };
  }, [isStarted]);

  useFrame((_, delta) => {
    const room = roomRef.current;
    if (!room) return;
    sendTimer.current += delta;
    if (sendTimer.current > 0.14) {
      sendTimer.current = 0;
      const s = useGameStore.getState();
      const [x, y, z] = s.playerPos;
      room.send('move', { x, y, z, rotY: s.playerRotY });
    }
  });

  return (
    <group name="Multiplayer_Remote_Players">
      {Object.values(remotes).map((p, i) => (
        <group key={p.id} position={[p.x, p.y, p.z]} rotation={[0, p.rotY, 0]}>
          <ChennaiHumanRig anim="walk" shirtColor="#22d3ee" seed={200 + i} />
          <Html position={[0, 2.0, 0]} center zIndexRange={[1, 8]}>
            <div style={{ background: '#0f172a', color: '#22d3ee', fontSize: 10, padding: '2px 6px', borderRadius: 6 }}>
              Player {p.id.slice(0, 4)}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
