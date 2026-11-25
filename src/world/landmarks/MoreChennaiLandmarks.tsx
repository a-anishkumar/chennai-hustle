import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';

export function MoreChennaiLandmarks() {
  const trainRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);

  const signs = useMemo(
    () => ({
      shrine: getSignTexture('VINAYAGAR KOVIL', 'Peaceful Shrine', '#d97706', '#fef08a'),
      museum: getSignTexture('GOVERNMENT MUSEUM', 'Egmore • Heritage & Art', '#7f1d1d', '#fde047'),
      airport: getSignTexture('CHENNAI AIRPORT (MAA)', 'Domestic & International', '#0f172a', '#38bdf8'),
      park: getSignTexture('SEMMOZHI PARK', 'Morning Walk & Fountain', '#15803d', '#ffffff'),
      school: getSignTexture('CHENNAI HIGH SCHOOL', 'Education & Sports', '#b45309', '#fef9c3'),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Animated Express Train moving along Railway Track (z = -196)
    if (trainRef.current) {
      const tx = ((t * 24) % 1400) - 700;
      trainRef.current.position.set(tx, 0, -196);
    }
    // Animated Aeroplane taking off / circling near Airport (-850, 420)
    if (planeRef.current) {
      const angle = t * 0.22;
      const px = -850 + Math.cos(angle) * 240;
      const pz = 420 + Math.sin(angle) * 140;
      const py = 28 + Math.sin(angle * 2) * 8;
      planeRef.current.position.set(px, py, pz);
      planeRef.current.rotation.y = -angle;
      planeRef.current.rotation.z = 0.16;
    }
  });

  return (
    <group name="More_Chennai_Landmarks">
      {/* 1. Neighborhood Temple Shrine (-80, 0, 118) */}
      <group position={[-80, 0, 118]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[7, 4.4, 7]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </RigidBody>
        {[0, 1, 2].map((tier) => (
          <mesh key={tier} position={[0, 4.9 + tier * 1.4, 0]} castShadow>
            <boxGeometry args={[5 - tier * 1.3, 1.4, 5 - tier * 1.3]} />
            <meshStandardMaterial color={['#f59e0b', '#dc2626', '#fde047'][tier]} />
          </mesh>
        ))}
        <mesh position={[0, 3.8, 3.6]}>
          <boxGeometry args={[5.5, 1.1, 0.2]} />
          <meshStandardMaterial map={signs.shrine} />
        </mesh>
      </group>

      {/* 2. Government Museum (-420, 0, 260) */}
      <group position={[-420, 0, 260]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[38, 13, 22]} />
            <meshStandardMaterial color="#991b1b" roughness={0.75} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 15, 0]} castShadow>
          <sphereGeometry args={[6.5, 16, 16]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        <mesh position={[0, 11.5, 11.2]}>
          <boxGeometry args={[22, 3.2, 0.4]} />
          <meshStandardMaterial map={signs.museum} />
        </mesh>
      </group>

      {/* 3. Chennai Airport with Runway & Aeroplane (-850, 0, 420) */}
      <group position={[-850, 0, 420]}>
        {/* Terminal Building */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 7, -45]} castShadow receiveShadow>
            <boxGeometry args={[70, 14, 24]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.3} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 13, -32.8]}>
          <boxGeometry args={[32, 3.8, 0.4]} />
          <meshStandardMaterial map={signs.airport} />
        </mesh>
        {/* ATC Control Tower */}
        <mesh position={[45, 14, -45]} castShadow>
          <cylinderGeometry args={[2.2, 3.2, 28, 10]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[45, 29, -45]}>
          <cylinderGeometry args={[4.5, 3.2, 4, 10]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
        {/* Airport Runway */}
        <mesh position={[0, 0.05, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[260, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Parked Aeroplane at Gate */}
        <group position={[-25, 2.2, -14]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[1.6, 1.6, 18, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[3.5, 0.3, 19]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[-7.5, 2.2, 0]} castShadow>
            <boxGeometry args={[2.4, 3.4, 0.3]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* Flying Aeroplane Overhead */}
      <group ref={planeRef} position={[-850, 28, 420]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1.5, 1.5, 18, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[3.4, 0.3, 19]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[-7.5, 2.1, 0]} castShadow>
          <boxGeometry args={[2.2, 3.2, 0.3]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* 4. Railway Track & Moving Express Train (z = -196) */}
      <group position={[0, 0, -196]}>
        {/* Gravel Ballast Bed */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1600, 6.5]} />
          <meshStandardMaterial color="#57534e" roughness={1} />
        </mesh>
        {/* Twin Steel Rails */}
        <mesh position={[0, 0.14, -1.1]}>
          <boxGeometry args={[1600, 0.14, 0.16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.14, 1.1]}>
          <boxGeometry args={[1600, 0.14, 0.16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Moving Express Train */}
      <group ref={trainRef} position={[-200, 0, -196]}>
        {/* Engine */}
        <mesh position={[28, 1.9, 0]} castShadow>
          <boxGeometry args={[11, 3.4, 3.1]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* 4 Blue Passenger Coaches */}
        {[-28, -14, 0, 14].map((cx, i) => (
          <mesh key={i} position={[cx, 1.85, 0]} castShadow>
            <boxGeometry args={[12.5, 3.2, 3.0]} />
            <meshStandardMaterial color="#1d4ed8" />
          </mesh>
        ))}
      </group>

      {/* 5. Chennai Public Park (-20, 0, 80) */}
      <group position={[-20, 0, 80]}>
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[48, 42]} />
          <meshStandardMaterial color="#16a34a" roughness={0.95} />
        </mesh>
        {/* Fountain */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[3.5, 4.0, 1.0, 16]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.1, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
        {/* Park Benches */}
        {[-10, 10].map((bx, i) => (
          <mesh key={i} position={[bx, 0.45, 8]} castShadow>
            <boxGeometry args={[3.2, 0.6, 1.1]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        ))}
        <mesh position={[0, 2.2, -19]}>
          <boxGeometry args={[10, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.park} />
        </mesh>
      </group>

      {/* 6. Chennai High School (-260, 0, 140) */}
      <group position={[-260, 0, 140]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[28, 9, 14]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 7.2, 7.2]}>
          <boxGeometry args={[16, 2.4, 0.3]} />
          <meshStandardMaterial map={signs.school} />
        </mesh>
        {/* Flagpole */}
        <mesh position={[0, 4.5, 13]}>
          <cylinderGeometry args={[0.08, 0.1, 9, 6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>
    </group>
  );
}
