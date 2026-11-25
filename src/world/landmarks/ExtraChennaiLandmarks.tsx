import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';

export function ExtraChennaiLandmarks() {
  const ferrisRef = useRef<THREE.Group>(null);
  const metroRef = useRef<THREE.Group>(null);

  const signs = useMemo(
    () => ({
      hospital: getSignTexture('RAJIV GANDHI GOVT HOSPITAL', '24x7 Emergency • Chennai', '#f8fafc', '#dc2626'),
      fire: getSignTexture('FIRE & RESCUE', 'Chennai Fire Station', '#991b1b', '#fde047'),
      amusement: getSignTexture('ECR FUN WORLD', 'Ferris Wheel & Rides', '#7c3aed', '#fde047'),
      mechanic: getSignTexture('TTF VASAN MECHANIC SHOP', 'Superbike & Scooter Service', '#111827', '#f97316'),
      oyo: getSignTexture('OYO ROOMS CHENNAI', 'Budget Stays • AC Rooms', '#dc2626', '#ffffff'),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ferrisRef.current) {
      ferrisRef.current.rotation.z = t * 0.35;
    }
    if (metroRef.current) {
      const mx = ((t * 28) % 480) - 100;
      metroRef.current.position.set(mx, 12.8, -208);
    }
  });

  return (
    <group name="Extra_Chennai_Landmarks">
      {/* 1. Rajiv Gandhi Govt Hospital (260, 0, 120) with Helipad & Ambulance Bay */}
      <group position={[260, 0, 120]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 7, 0]} castShadow receiveShadow>
            <boxGeometry args={[30, 14, 18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Emergency Ambulance Bay Canopy */}
          <mesh position={[0, 3.8, 12]} castShadow>
            <boxGeometry args={[14, 0.6, 7]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </RigidBody>
        {/* Rooftop Helipad */}
        <mesh position={[0, 14.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.5, 4.2, 24]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        {/* Red Medical Cross */}
        <mesh position={[0, 11.2, 9.2]}>
          <boxGeometry args={[4.5, 1.4, 0.2]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 11.2, 9.2]}>
          <boxGeometry args={[1.4, 4.5, 0.2]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 6.2, 9.2]}>
          <boxGeometry args={[20, 2.8, 0.25]} />
          <meshStandardMaterial map={signs.hospital} />
        </mesh>
      </group>

      {/* 2. Fire Station (-260, 0, -140) */}
      <group position={[-260, 0, -140]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4, 0]} castShadow>
            <boxGeometry args={[20, 8, 12]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 6.8, 6.2]}>
          <boxGeometry args={[14, 2.2, 0.25]} />
          <meshStandardMaterial map={signs.fire} />
        </mesh>
        {/* Parked Fire Engine */}
        <mesh position={[0, 1.5, 9]} castShadow>
          <boxGeometry args={[2.4, 2.4, 7.2]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* 3. Amusement Park (1180, 0, 620) */}
      <group position={[1180, 0, 620]}>
        {/* Entrance Arch */}
        <mesh position={[0, 5, 22]} castShadow>
          <boxGeometry args={[18, 3, 1.2]} />
          <meshStandardMaterial map={signs.amusement} />
        </mesh>
        {/* Rotating Giant Ferris Wheel */}
        <mesh position={[-3, 12, 0]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.7, 24, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[3, 12, 0]} rotation={[-0.1, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.7, 24, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <group ref={ferrisRef} position={[0, 22, 0]}>
          <mesh>
            <torusGeometry args={[14, 0.45, 8, 24]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const ang = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(ang) * 14, Math.sin(ang) * 14, 0]}>
                <boxGeometry args={[2.2, 2.2, 2.2]} />
                <meshStandardMaterial color={['#ef4444', '#38bdf8', '#22c55e', '#facc15'][i % 4]} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* 4. TTF Vasan Mechanic Shop (-155, 0, -35) */}
      <group position={[-155, 0, -35]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[11, 4.4, 7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.6, 3.6]}>
          <boxGeometry args={[10.5, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.mechanic} />
        </mesh>
        {/* Display Superbikes outside */}
        {[-2.5, 2.5].map((bx, i) => (
          <mesh key={i} position={[bx, 0.65, 4.5]} castShadow>
            <boxGeometry args={[0.6, 0.9, 1.8]} />
            <meshStandardMaterial color={i === 0 ? '#f97316' : '#ef4444'} />
          </mesh>
        ))}
      </group>

      {/* 5. OYO Rooms (80, 0, -35) */}
      <group position={[80, 0, -35]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 5.5, 0]} castShadow>
            <boxGeometry args={[14, 11, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 9.2, 5.2]}>
          <boxGeometry args={[12, 2.4, 0.25]} />
          <meshStandardMaterial map={signs.oyo} />
        </mesh>
      </group>

      {/* 6. Moving Elevated Chennai Metro Train on Viaduct */}
      <group ref={metroRef} position={[60, 12.8, -208]}>
        <mesh castShadow>
          <boxGeometry args={[36, 2.8, 3.2]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[36.2, 0.6, 3.3]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  );
}
