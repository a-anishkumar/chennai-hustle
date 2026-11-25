import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import dialogues from '../config/dialogues.json';
import { useGameStore } from './gameStore';
import { AnimatedPlayerMesh } from '../world/AnimatedPlayerMesh';

type NpcRole = 'office' | 'student' | 'vendor' | 'fan' | 'fisherman' | 'influencer' | 'beggar';
type NpcAction = 'walking' | 'idle_chatting' | 'waving_auto' | 'checking_phone' | 'fleeing_rain';

interface NpcAgent {
  role: NpcRole;
  action: NpcAction;
  actionTimer: number;
  homeX: number;
  homeZ: number;
  x: number;
  z: number;
  rotY: number;
  angle: number;
  speed: number;
  radius: number;
  color: string;
  line: string;
}

const ROLE_COLORS: Record<NpcRole, string> = {
  office: '#e2e8f0',
  student: '#38bdf8',
  vendor: '#f97316',
  fan: '#facc15',
  fisherman: '#14b8a6',
  influencer: '#ec4899',
  beggar: '#78716c',
};

const INFLUENCER_LINES = [
  'Guys! Welcome back to my Chennai street vlog — like & subscribe!',
  'Indha tea kadai aesthetic vera level reels-ku! #ChennaiVibes',
  'GRWM for Marina Beach sunset — outfit link in bio!',
];

const BEGGAR_LINES = [
  'Konjam udhavi pannunga saar, sapda onnum illa.',
  'Thanni irundhaa kudunga thambi, romba veyil.',
];

const ACTION_LABELS: Record<NpcAction, string> = {
  walking: '',
  idle_chatting: '💬 Chatting',
  waving_auto: '✋ Hailing Auto',
  checking_phone: '📱 Checking Phone',
  fleeing_rain: '☔ Running from Rain!',
};

const ROLES: NpcRole[] = ['office', 'student', 'vendor', 'fan', 'fisherman', 'influencer', 'beggar'];
const NPC_COUNT = 49;

export function NpcSystem() {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const heroNpc1Ref = useRef<THREE.Group>(null);
  const heroNpc2Ref = useRef<THREE.Group>(null);
  const [nearbyLine, setNearbyLine] = useState<{ x: number; z: number; text: string } | null>(null);
  const checkTimer = useRef(0);

  const npcsRef = useRef<NpcAgent[] | null>(null);
  if (!npcsRef.current) {
    const list: NpcAgent[] = [];
    const hubs: [number, number][] = [
      [-120, 60],  // TNHB Courtyard
      [-180, 18],  // Bus Stop
      [-40, -35],  // Tea Kadai corner
      [40, 20],    // East Road sidewalk
      [-75, -110], // North Road
      [-75, 130],  // South Road
    ];
    for (let i = 0; i < NPC_COUNT; i++) {
      const hub = hubs[i % hubs.length];
      const role = ROLES[i % ROLES.length];
      const angle = (i * 1.7) % (Math.PI * 2);
      const radius = 5 + (i % 6) * 2.5;
      list.push({
        role,
        action: 'walking',
        actionTimer: 2 + (i % 5),
        homeX: hub[0] + ((i * 13) % 14) - 7,
        homeZ: hub[1] + ((i * 17) % 14) - 7,
        x: hub[0],
        z: hub[1],
        rotY: 0,
        angle,
        speed: role === 'vendor' || role === 'beggar' ? 0.18 : 0.75 + (i % 4) * 0.22,
        radius,
        color: ROLE_COLORS[role],
        line:
          role === 'influencer'
            ? INFLUENCER_LINES[i % INFLUENCER_LINES.length]
            : role === 'beggar'
            ? BEGGAR_LINES[i % BEGGAR_LINES.length]
            : dialogues.streetChatter[i % dialogues.streetChatter.length],
      });
    }
    npcsRef.current = list;
  }

  useEffect(() => {
    if (!bodyRef.current || !npcsRef.current) return;
    const col = new THREE.Color();
    npcsRef.current.forEach((n, i) => bodyRef.current!.setColorAt(i, col.set(n.color)));
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    const npcs = npcsRef.current;
    if (!state.isStarted || state.isPaused || !npcs) return;

    const t = clock.getElapsedTime();
    const isRaining = state.weather === 'monsoon' || state.weather === 'flood';

    // Animate 2 skeletal GLB pedestrians strolling in TNHB & Road Loop
    if (heroNpc1Ref.current) {
      const a1 = t * 0.25;
      heroNpc1Ref.current.position.set(-120 + Math.cos(a1) * 14, 0, 60 + Math.sin(a1) * 14);
      heroNpc1Ref.current.rotation.y = -a1;
    }
    if (heroNpc2Ref.current) {
      const a2 = t * 0.2 + 2.1;
      heroNpc2Ref.current.position.set(-178, 0, 18 + Math.sin(a2) * 16);
      heroNpc2Ref.current.rotation.y = Math.cos(a2) > 0 ? 0 : Math.PI;
    }

    const [px, , pz] = state.playerPos;
    let closestDist2 = 64;
    let closestNpc: NpcAgent | null = null;

    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];

      // Random AI action state machine
      n.actionTimer -= dt;
      if (isRaining && n.role !== 'beggar' && n.role !== 'vendor') {
        n.action = 'fleeing_rain';
      } else if (n.actionTimer <= 0) {
        n.actionTimer = 3 + ((i * 7 + Math.floor(t)) % 5);
        const actions: NpcAction[] = ['walking', 'walking', 'idle_chatting', 'waving_auto', 'checking_phone'];
        n.action = actions[(i + Math.floor(t)) % actions.length];
      }

      const moveMult =
        n.action === 'fleeing_rain'
          ? 1.9
          : n.action === 'walking'
          ? 1.0
          : 0.0;

      n.angle += ((n.speed * moveMult) / n.radius) * dt;
      n.x = n.homeX + Math.cos(n.angle) * n.radius;
      n.z = n.homeZ + Math.sin(n.angle) * n.radius;

      const dx = n.x - px;
      const dz = n.z - pz;
      const d2 = dx * dx + dz * dz;

      // Turn to face player when nearby
      const targetRot = d2 < 36 ? Math.atan2(px - n.x, pz - n.z) : -n.angle;
      n.rotY = targetRot;

      // Subtle bounce when walking or waving
      const bob = moveMult > 0 ? Math.abs(Math.sin(t * 7 + i)) * 0.08 : 0;

      dummy.position.set(n.x, 0.75 + bob, n.z);
      dummy.rotation.set(0, n.rotY, n.action === 'waving_auto' ? Math.sin(t * 8) * 0.08 : 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      if (bodyRef.current) bodyRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(n.x, 1.48 + bob, n.z);
      dummy.rotation.set(0, n.rotY, 0);
      dummy.updateMatrix();
      if (headRef.current) headRef.current.setMatrixAt(i, dummy.matrix);

      if (d2 < closestDist2) {
        closestDist2 = d2;
        closestNpc = n;
      }
    }

    if (bodyRef.current) bodyRef.current.instanceMatrix.needsUpdate = true;
    if (headRef.current) headRef.current.instanceMatrix.needsUpdate = true;

    checkTimer.current += dt;
    if (checkTimer.current > 0.35) {
      checkTimer.current = 0;
      if (closestNpc) {
        const nearPoster = state.pastedPosters.find(
          (p) => (p.x - closestNpc!.x) ** 2 + (p.z - closestNpc!.z) ** 2 < 225
        );
        const actionTag = ACTION_LABELS[closestNpc.action];
        const text = nearPoster
          ? `Adhu ${nearPoster.campaignName} poster thaane? Semma! (${nearPoster.slogan})`
          : actionTag
          ? `[${actionTag}] ${closestNpc.line}`
          : closestNpc.line;
        setNearbyLine({ x: closestNpc.x, z: closestNpc.z, text });
      } else if (nearbyLine) {
        setNearbyLine(null);
      }
    }
  });

  return (
    <group name="NPC_Crowd">
      <instancedMesh ref={bodyRef} args={[undefined, undefined, NPC_COUNT]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.52, 1.15, 0.34]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, NPC_COUNT]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.21, 10, 10]} />
        <meshStandardMaterial color="#8d5524" roughness={0.65} />
      </instancedMesh>

      {/* Skeletal Animated Online GLB Pedestrians */}
      <group ref={heroNpc1Ref}>
        <AnimatedPlayerMesh isMoving isSprinting={false} fallback={null} />
      </group>
      <group ref={heroNpc2Ref}>
        <AnimatedPlayerMesh isMoving isSprinting={false} fallback={null} />
      </group>

      {nearbyLine && (
        <Html position={[nearbyLine.x, 2.25, nearbyLine.z]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#f8fafc',
              padding: '4px 9px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 500,
              maxWidth: 190,
              textAlign: 'center',
              border: '1px solid rgba(251, 191, 36, 0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            “{nearbyLine.text}”
          </div>
        </Html>
      )}
    </group>
  );
}
