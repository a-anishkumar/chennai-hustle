import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import dialogues from '../config/dialogues.json';
import { useGameStore } from './gameStore';
import {
  AnimatedHumanNpc,
  type HumanNpcAnim,
  type HumanNpcProp,
  type HumanNpcVariant,
} from '../world/AnimatedHumanNpc';

type NpcRole = 'office' | 'student' | 'vendor' | 'fan' | 'fisherman' | 'influencer' | 'beggar';
type NpcAction = 'walking' | 'idle_chatting' | 'waving_auto' | 'checking_phone' | 'fleeing_rain';

interface NpcAgent {
  id: number;
  role: NpcRole;
  variant: HumanNpcVariant;
  prop: HumanNpcProp;
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

const ROLE_VARIANTS: Record<NpcRole, HumanNpcVariant> = {
  office: 'cesium',
  student: 'xbot',
  vendor: 'soldier',
  fan: 'xbot',
  fisherman: 'cesium',
  influencer: 'michelle',
  beggar: 'xbot',
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

const ROLE_PROPS: Record<NpcRole, HumanNpcProp[]> = {
  office: ['bag', 'newspaper', 'phone'],
  student: ['school_bag', 'phone'],
  vendor: ['shopping_bag', 'tools'],
  fan: ['shopping_bag', 'phone'],
  fisherman: ['tools', 'cigarette'],
  influencer: ['phone', 'shopping_bag'],
  beggar: ['none'],
};

const ROLES: NpcRole[] = ['office', 'student', 'vendor', 'fan', 'fisherman', 'influencer', 'beggar'];
const NPC_COUNT = 24;

function mapActionToAnim(action: NpcAction, variant: HumanNpcVariant): HumanNpcAnim {
  if (variant === 'michelle') return 'dance';
  if (action === 'fleeing_rain') return 'run';
  if (action === 'walking') return 'walk';
  if (action === 'waving_auto' || action === 'idle_chatting') return 'agree';
  return 'idle';
}

export function NpcSystem() {
  const quality = useGameStore((s) => s.quality);
  const activeNpcLimit = quality === 'low' ? 12 : quality === 'medium' ? 18 : NPC_COUNT;
  const npcGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const [npcAnims, setNpcAnims] = useState<HumanNpcAnim[]>(() => Array(NPC_COUNT).fill('walk'));
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
      const roleProps = ROLE_PROPS[role];
      list.push({
        id: i,
        role,
        variant: ROLE_VARIANTS[role],
        prop: roleProps[i % roleProps.length],
        action: 'walking',
        actionTimer: 2 + (i % 5),
        homeX: hub[0] + ((i * 13) % 14) - 7,
        homeZ: hub[1] + ((i * 17) % 14) - 7,
        x: hub[0] + Math.cos(angle) * radius,
        z: hub[1] + Math.sin(angle) * radius,
        rotY: 0,
        angle,
        speed: role === 'vendor' || role === 'beggar' ? 0.25 : 0.85 + (i % 4) * 0.2,
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

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    const npcs = npcsRef.current;
    if (!state.isStarted || state.isPaused || !npcs) return;

    const t = clock.getElapsedTime();
    const h = state.timeOfDay;
    const isRushHour = (h >= 8.0 && h <= 10.5) || (h >= 17.0 && h <= 20.5);
    const isLateNight = h >= 23.0 || h < 5.0;
    const isRaining = state.weather === 'monsoon' || state.weather === 'flood';
    const playerInVehicle = state.currentVehicle !== 'foot';
    const [px, , pz] = state.playerPos;
    let closestDist2 = 64;
    let closestNpc: NpcAgent | null = null;
    let animsChanged = false;

    for (let i = 0; i < activeNpcLimit; i++) {
      const n = npcs[i];

      const dx = n.x - px;
      const dz = n.z - pz;
      const d2 = dx * dx + dz * dz;
      const avoidVehicle = playerInVehicle && d2 < 49;

      n.actionTimer -= dt;
      if (isRaining && n.role !== 'beggar' && n.role !== 'vendor') {
        n.action = 'fleeing_rain';
      } else if (avoidVehicle) {
        n.action = 'waving_auto';
      } else if (n.actionTimer <= 0) {
        n.actionTimer = 4 + ((i * 7 + Math.floor(t)) % 5);
        const actions: NpcAction[] = isRushHour
          ? ['walking', 'walking', 'walking', 'waving_auto', 'checking_phone']
          : ['walking', 'walking', 'idle_chatting', 'waving_auto', 'checking_phone'];
        n.action = actions[(i + Math.floor(t)) % actions.length];
      }

      const moveMult =
        n.action === 'fleeing_rain'
          ? 1.9
          : n.action === 'walking'
          ? (isRushHour ? 1.2 : 1.0)
          : 0.0;

      n.angle += ((n.speed * moveMult) / n.radius) * dt;
      n.x = n.homeX + Math.cos(n.angle) * n.radius;
      n.z = n.homeZ + Math.sin(n.angle) * n.radius;

      // Face walking tangent or turn to face player when nearby
      const tangentRot = Math.atan2(-Math.sin(n.angle), Math.cos(n.angle));
      n.rotY = d2 < 36 ? Math.atan2(px - n.x, pz - n.z) : tangentRot;

      const grp = npcGroupRefs.current[i];
      if (grp) {
        const nightHidden = isLateNight && i % 2 === 1;
        grp.visible = !nightHidden && d2 < 22500; // Frustum/distance cull beyond 150m
        if (grp.visible) {
          grp.position.set(n.x, 0, n.z);
          grp.rotation.y = n.rotY;
        }
      }

      const desiredAnim = mapActionToAnim(n.action, n.variant);
      if (npcAnims[i] !== desiredAnim) {
        animsChanged = true;
      }

      if (d2 < closestDist2) {
        closestDist2 = d2;
        closestNpc = n;
      }
    }

    if (animsChanged) {
      setNpcAnims(npcs.map((n) => mapActionToAnim(n.action, n.variant)));
    }

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
      {npcsRef.current.slice(0, activeNpcLimit).map((n, i) => (
        <group
          key={n.id}
          ref={(el) => {
            npcGroupRefs.current[i] = el;
          }}
          position={[n.x, 0, n.z]}
          rotation={[0, n.rotY, 0]}
          scale={[1, 0.96 + (i % 5) * 0.025, 1]}
        >
          <AnimatedHumanNpc
            variant={n.variant}
            anim={npcAnims[i]}
            timeScale={0.9 + (i % 3) * 0.1}
            tintColor={n.color}
            prop={npcAnims[i] === 'idle' && n.action === 'checking_phone' ? 'phone' : n.prop}
            seed={i + 1}
          />
        </group>
      ))}

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
