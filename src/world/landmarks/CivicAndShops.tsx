import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';

export function CivicAndShops() {
  const barberPoleRef = useRef<THREE.Mesh>(null);
  const policeLightRef = useRef<THREE.Mesh>(null);

  const signs = useMemo(
    () => ({
      tea: getSignTexture('ANBU TEA KADAI', 'Tea • Vadai • Bajji • Bun', '#15803d', '#fef08a'),
      jewellery: getSignTexture('KAVERI JEWELLERY', '22K Gold & Diamonds', '#78350f', '#facc15'),
      barber: getSignTexture('METRO HAIR SALOON', 'AC Barber Shop', '#1e3a8a', '#ffffff'),
      tasmac: getSignTexture('TASMAC RETAIL', 'State Beverages Shop', '#334155', '#fbbf24'),
      bar: getSignTexture('MARINA LOUNGE BAR', 'Open Till 11 PM', '#4c1d95', '#f472b6'),
      hotel: getSignTexture('GRAND CHENNAI HOTEL', 'AC Rooms & Banquet', '#0f172a', '#38bdf8'),
      railway: getSignTexture('CHENNAI CENTRAL', 'Southern Railway Station', '#991b1b', '#fef08a'),
      police: getSignTexture('CHENNAI POLICE', 'B1 Law & Order Station', '#1e293b', '#ef4444'),
      post: getSignTexture('INDIA POST OFFICE', 'Speed Post & Parcels', '#dc2626', '#fde047'),
      court: getSignTexture('HIGH COURT CHENNAI', 'Justice & Law', '#7f1d1d', '#fde047'),
      construction: getSignTexture('UNDER CONSTRUCTION', 'Safety Helmet Zone', '#eab308', '#111827'),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (barberPoleRef.current) {
      barberPoleRef.current.rotation.y = t * 4;
    }
    if (policeLightRef.current) {
      const mat = policeLightRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.set(Math.sin(t * 8) > 0 ? '#ef4444' : '#3b82f6');
    }
  });

  return (
    <group name="Civic_And_Shops">
      {/* 1. Dedicated Tea Shop Corner (-68, 0, -35) */}
      <group position={[-68, 0, -35]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[6, 3.2, 4.5]} />
            <meshStandardMaterial color="#fef9c3" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 3.6, 2.3]}>
          <boxGeometry args={[5.8, 1.2, 0.2]} />
          <meshStandardMaterial map={signs.tea} />
        </mesh>
      </group>

      {/* 2. Jewellery Shop (160, 0, -145) */}
      <group position={[160, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[16, 9, 12]} />
            <meshStandardMaterial color="#fef08a" metalness={0.35} roughness={0.3} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 7.2, 6.2]}>
          <boxGeometry args={[14, 2.4, 0.3]} />
          <meshStandardMaterial map={signs.jewellery} />
        </mesh>
        <mesh position={[0, 2.0, 6.1]}>
          <boxGeometry args={[11, 3.2, 0.2]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.6} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. Barber Shop (-165, 0, -145) */}
      <group position={[-165, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[8, 4.4, 6]} />
            <meshStandardMaterial color="#e0f2fe" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.8, 3.1]}>
          <boxGeometry args={[7.6, 1.4, 0.2]} />
          <meshStandardMaterial map={signs.barber} />
        </mesh>
        {/* Rotating Barber Pole */}
        <mesh ref={barberPoleRef} position={[4.3, 2.0, 3.2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#2563eb" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* 4. TASMAC Shop (-230, 0, 85) & Lounge Bar (120, 0, -145) */}
      <group position={[-230, 0, 85]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.0, 0]} castShadow>
            <boxGeometry args={[9, 4, 6]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </RigidBody>
        <mesh position={[4.6, 3.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.8, 1.4, 0.2]} />
          <meshStandardMaterial map={signs.tasmac} />
        </mesh>
      </group>

      <group position={[120, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[12, 6.4, 9]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.4, 4.6]}>
          <boxGeometry args={[10.5, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.bar} />
        </mesh>
      </group>

      {/* 5. Grand Chennai Residency Hotel (260, 0, -145) */}
      <group position={[260, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 9, 0]} castShadow>
            <boxGeometry args={[20, 18, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 16, 7.2]}>
          <boxGeometry args={[16, 2.8, 0.3]} />
          <meshStandardMaterial map={signs.hotel} />
        </mesh>
      </group>

      {/* 6. Chennai Central Railway Station (-320, 0, -180) */}
      <group position={[-320, 0, -180]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[42, 12, 22]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* Central Clock Tower */}
        <mesh position={[0, 16, 6]} castShadow>
          <boxGeometry args={[8, 12, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 18, 10.1]}>
          <circleGeometry args={[1.6, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 10.5, 11.2]}>
          <boxGeometry args={[24, 3.2, 0.4]} />
          <meshStandardMaterial map={signs.railway} />
        </mesh>
        {/* Express Train at Platform */}
        <mesh position={[0, 1.8, -16]} castShadow>
          <boxGeometry args={[48, 3.4, 3.2]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
      </group>

      {/* 7. Police Station (-240, 0, -240) */}
      <group position={[-240, 0, -240]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[16, 6.4, 11]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.4, 5.6]}>
          <boxGeometry args={[13, 2.0, 0.3]} />
          <meshStandardMaterial map={signs.police} />
        </mesh>
        <mesh ref={policeLightRef} position={[0, 6.8, 4]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* 8. Post Office (-110, 0, -160) */}
      <group position={[-110, 0, -160]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.0, 0]} castShadow>
            <boxGeometry args={[13, 6, 9]} />
            <meshStandardMaterial color="#fecaca" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.0, 4.6]}>
          <boxGeometry args={[11, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.post} />
        </mesh>
        {/* Classic Red Post Box */}
        <mesh position={[7.5, 0.85, 4.5]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.7, 10]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* 9. Madras High Court (220, 0, -360) */}
      <group position={[220, 0, -360]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 8, 0]} castShadow receiveShadow>
            <boxGeometry args={[46, 16, 26]} />
            <meshStandardMaterial color="#991b1b" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* Indo-Saracenic Domes */}
        {[-12, 0, 12].map((dx, i) => (
          <mesh key={i} position={[dx, 18, 0]} castShadow>
            <sphereGeometry args={[i === 1 ? 5.2 : 3.5, 14, 14]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}
        <mesh position={[0, 13, 13.2]}>
          <boxGeometry args={[24, 3.4, 0.4]} />
          <meshStandardMaterial map={signs.court} />
        </mesh>
      </group>

      {/* 10. Construction Buildings (140, 0, 60) & (-260, 0, -40) */}
      {[
        [140, 60],
        [-260, -40],
      ].map(([cx, cz], idx) => (
        <group key={idx} position={[cx, 0, cz]}>
          {/* Exposed Concrete Slabs & Columns */}
          {[0, 4.5, 9, 13.5].map((sy, fi) => (
            <mesh key={fi} position={[0, sy + 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[16, 0.6, 14]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.9} />
            </mesh>
          ))}
          {[
            [-7, -6],
            [7, -6],
            [-7, 6],
            [7, 6],
          ].map(([px, pz], pi) => (
            <mesh key={pi} position={[px, 7, pz]} castShadow>
              <boxGeometry args={[0.9, 14, 0.9]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          ))}
          {/* Yellow Tower Crane */}
          <mesh position={[0, 19, 0]} castShadow>
            <boxGeometry args={[1.2, 11, 1.2]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[6, 24, 0]} castShadow>
            <boxGeometry args={[18, 1.0, 1.0]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 2.5, 7.2]}>
            <boxGeometry args={[10, 2.0, 0.25]} />
            <meshStandardMaterial map={signs.construction} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
