import { useMemo, useRef } from 'react';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture, getSignTexture } from '../ProceduralTextures';

const DANCER_COUNT = 22;
const SMOKE_COUNT = 12;

const DANCER_COLORS = ['#ec4899', '#38bdf8', '#facc15', '#a855f7', '#22c55e', '#f97316'];

export function ConcertZone() {
  const discoBallRef = useRef<THREE.Mesh>(null);
  const spot1Ref = useRef<THREE.PointLight>(null);
  const spot2Ref = useRef<THREE.PointLight>(null);
  const dancersRef = useRef<THREE.InstancedMesh>(null);
  const dancerHeadsRef = useRef<THREE.InstancedMesh>(null);
  const smokeRef = useRef<THREE.InstancedMesh>(null);

  const signs = useMemo(
    () => ({
      stage: getSignTexture('SAI ABHYANKAR LIVE', 'DJ Disco Night • Chennai Arena', '#4c1d95', '#facc15'),
      food: getSignTexture('CONCERT FOOD COURT', 'Shawarma • Soda • Popcorn', '#be185d', '#ffffff'),
      awning: getAwningTexture('#db2777', '#fef08a'),
    }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (discoBallRef.current) {
      discoBallRef.current.rotation.y = t * 1.8;
    }

    if (spot1Ref.current) {
      spot1Ref.current.color.setHSL((t * 0.25) % 1, 0.9, 0.55);
    }
    if (spot2Ref.current) {
      spot2Ref.current.color.setHSL(((t * 0.25) + 0.5) % 1, 0.9, 0.55);
    }

    // People dancing & vibing in front of the DJ stage
    if (dancersRef.current && dancerHeadsRef.current) {
      for (let i = 0; i < DANCER_COUNT; i++) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const dx = -9 + col * 3.6 + Math.sin(t * 3 + i) * 0.35;
        const dz = 10 + row * 3.2;
        const jump = Math.abs(Math.sin(t * 6.5 + i * 0.9)) * 0.55;
        const sway = Math.sin(t * 5 + i) * 0.18;

        dummy.position.set(dx, 0.75 + jump, dz);
        dummy.rotation.set(0, Math.PI + sway, sway);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        dancersRef.current.setMatrixAt(i, dummy.matrix);

        dummy.position.set(dx, 1.48 + jump, dz);
        dummy.rotation.set(0, Math.PI, 0);
        dummy.updateMatrix();
        dancerHeadsRef.current.setMatrixAt(i, dummy.matrix);
      }
      dancersRef.current.instanceMatrix.needsUpdate = true;
      dancerHeadsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Rising smoke puffs near smoking corner (x = 18, z = 14 relative)
    if (smokeRef.current) {
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const person = i % 3;
        const cycle = (t * 0.9 + i * 0.35) % 2.4;
        const sx = 16 + person * 2.2 + Math.sin(t * 2 + i) * 0.25;
        const sz = 12 + (person % 2) * 1.5;
        const sy = 1.55 + cycle * 1.1;
        const sc = 0.14 + cycle * 0.14;
        dummy.position.set(sx, sy, sz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        smokeRef.current.setMatrixAt(i, dummy.matrix);
      }
      smokeRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="Sai_Abhyankar_Concert" position={[160, 0, 20]}>
      {/* Concert Ground Pad */}
      <mesh position={[0, 0.03, 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.85} />
      </mesh>

      {/* Main Concert Stage */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.0, -4]} castShadow receiveShadow>
          <boxGeometry args={[24, 2.0, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </RigidBody>

      {/* Stage Backdrop LED Wall */}
      <mesh position={[0, 6.2, -8.5]}>
        <boxGeometry args={[22, 7.5, 0.5]} />
        <meshStandardMaterial map={signs.stage} emissive="#4c1d95" emissiveIntensity={0.45} />
      </mesh>

      {/* Speaker Stacks */}
      {[-10, 10].map((sx, i) => (
        <mesh key={i} position={[sx, 4.2, -3]} castShadow>
          <boxGeometry args={[2.8, 4.6, 2.4]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}

      {/* DJ Booth & Sai Abhyankar Performer on Stage */}
      <mesh position={[0, 2.5, -1.5]} castShadow>
        <boxGeometry args={[4.5, 1.1, 1.6]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>
      <group position={[0, 2.0, -2.5]}>
        <AnimatedHumanNpc variant="michelle" anim="dance" tintColor="#facc15" />
      </group>

      {/* Spinning Disco Ball & Dynamic Neon Lights */}
      <mesh ref={discoBallRef} position={[0, 8.2, 2]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
      </mesh>
      <pointLight ref={spot1Ref} position={[-6, 7.5, 4]} intensity={25} distance={32} />
      <pointLight ref={spot2Ref} position={[6, 7.5, 8]} intensity={25} distance={32} />

      {/* Dancing & Vibing Crowd */}
      <instancedMesh ref={dancersRef} args={[undefined, undefined, DANCER_COUNT]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.5, 1.1, 0.32]} />
        <meshStandardMaterial color="#ec4899" />
      </instancedMesh>
      <instancedMesh ref={dancerHeadsRef} args={[undefined, undefined, DANCER_COUNT]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#8d5524" />
      </instancedMesh>

      {/* Concert Vibe Label */}
      <Html position={[0, 10.2, -4]} center zIndexRange={[1, 8]}>
        <div
          style={{
            background: 'rgba(76, 29, 149, 0.92)',
            color: '#fde047',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            border: '1px solid #ec4899',
            pointerEvents: 'none',
          }}
        >
          🎶 SAI ABHYANKAR LIVE • DJ DISCO VIBES!
        </div>
      </Html>

      {/* Concert Food Court Stalls */}
      <group position={[-16, 0, 10]} rotation={[0, Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[8, 2.8, 4]} />
            <meshStandardMaterial color="#fdf2f8" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 3.3, 2.1]}>
          <boxGeometry args={[7.6, 1.3, 0.2]} />
          <meshStandardMaterial map={signs.food} />
        </mesh>
        <mesh position={[0, 2.4, 2.8]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[7.8, 0.1, 2.0]} />
          <meshStandardMaterial map={signs.awning} />
        </mesh>
      </group>

      {/* Smoking Corner People + Rising Smoke Puffs */}
      {[0, 1, 2].map((i) => (
        <group key={`smoker_${i}`} position={[16 + i * 2.2, 0, 12 + (i % 2) * 1.5]} rotation={[0, -Math.PI / 4, 0]}>
          <AnimatedHumanNpc
            variant={i % 2 === 0 ? 'xbot' : 'soldier'}
            anim="idle"
            tintColor={DANCER_COLORS[(i + 2) % DANCER_COLORS.length]}
          />
        </group>
      ))}
      <instancedMesh ref={smokeRef} args={[undefined, undefined, SMOKE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.45} />
      </instancedMesh>
    </group>
  );
}
