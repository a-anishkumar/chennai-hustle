import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture } from '../ProceduralTextures';
import { OnlineModel } from '../OnlineModel';

const DUCK_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb';

export function UrbanLandmarks() {
  const teaAwning = useMemo(() => getAwningTexture('#16a34a', '#f8fafc'), []);
  const cinemaBanner = useMemo(() => getAwningTexture('#f59e0b', '#7c2d12'), []);

  return (
    <group name="Urban_Landmarks">
      {/* 4. Bayfront City Mall & Dash10 Dark Store (480, 0, -260) */}
      <group position={[480, 0, -260]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 9, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 18, 36]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
          </mesh>
        </RigidBody>
        {/* Glass Atrium Front */}
        <mesh position={[0, 9, 18.2]}>
          <boxGeometry args={[26, 15, 0.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.6} transparent opacity={0.75} />
        </mesh>
        {/* Mall Sign */}
        <mesh position={[0, 19.2, 16]}>
          <boxGeometry args={[22, 2.6, 1]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
        </mesh>
        {/* Interior Escalator Ramp Visual */}
        <mesh position={[0, 4.5, 19.5]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[4, 0.5, 14]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.5} />
        </mesh>

        {/* Dash10 Dark Store Next Door */}
        <group position={[36, 0, 6]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[14, 6, 14]} />
              <meshStandardMaterial color="#7c3aed" roughness={0.6} />
            </mesh>
          </RigidBody>
          <mesh position={[0, 6.6, 6.8]}>
            <boxGeometry args={[10, 1.4, 0.5]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
        </group>
      </group>

      {/* 5. Kaveri Cinema Theatre (FDFS) (-480, 0, -320) */}
      <group position={[-480, 0, -320]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 7, 0]} castShadow receiveShadow>
            <boxGeometry args={[34, 14, 26]} />
            <meshStandardMaterial color="#991b1b" roughness={0.7} />
          </mesh>
        </RigidBody>
        {/* Giant Superstar Flex Banner & Cut-out */}
        <mesh position={[-10, 8, 14.5]} castShadow>
          <boxGeometry args={[8, 13, 0.6]} />
          <meshStandardMaterial map={cinemaBanner} />
        </mesh>
        <mesh position={[10, 7.5, 14.5]} castShadow>
          <boxGeometry args={[6, 12, 0.6]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        {/* Ticket Queue Ring */}
        <mesh position={[0, 0.08, 17]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.6, 24]} />
          <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 6. Mylapore-Style Temple (Gopuram & Tank) (620, 0, 520) */}
      <group position={[620, 0, 520]}>
        {/* Temple Compound Wall */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.5, -18]} castShadow>
            <boxGeometry args={[48, 5, 2]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </RigidBody>
        {/* Tiered Gopuram Tower */}
        {[0, 1, 2, 3, 4].map((tier) => (
          <mesh key={tier} position={[0, 3 + tier * 3.8, 12]} castShadow>
            <boxGeometry args={[12 - tier * 1.8, 3.8, 7 - tier * 1.0]} />
            <meshStandardMaterial
              color={['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#fde047'][tier]}
              roughness={0.7}
            />
          </mesh>
        ))}
        {/* Stepped Temple Tank */}
        <mesh position={[0, 0.06, -4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[24, 20]} />
          <meshStandardMaterial color="#0d9488" roughness={0.2} metalness={0.3} />
        </mesh>
        <OnlineModel url={DUCK_URL} position={[2, 0.1, -4]} scale={0.9} />
        {/* Flower Stall */}
        <mesh position={[18, 1.2, 12]} castShadow>
          <boxGeometry args={[4.5, 2.4, 3.5]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
      </group>

      {/* 7. Superstar Fan House (380, 0, 860) */}
      <group position={[380, 0, 860]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[30, 12, 22]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
        </RigidBody>
        {/* Gold Gate & Fan Arch */}
        <mesh position={[0, 4.5, 16]} castShadow>
          <boxGeometry args={[14, 1.5, 1.2]} />
          <meshStandardMaterial color="#eab308" metalness={0.5} />
        </mesh>
        <mesh position={[-7, 2.5, 16]} castShadow>
          <boxGeometry args={[1.5, 5, 1.5]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
        <mesh position={[7, 2.5, 16]} castShadow>
          <boxGeometry args={[1.5, 5, 1.5]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      {/* 9. Anbu Tea Kadai Corner (-40, 0, -35) */}
      <group position={[-40, 0, -35]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[6.5, 3.2, 4.5]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 2.8, 2.8]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[6.8, 0.12, 2.2]} />
          <meshStandardMaterial map={teaAwning} />
        </mesh>
        {/* Tea Samovar */}
        <mesh position={[-1.8, 1.5, 2.5]}>
          <cylinderGeometry args={[0.35, 0.4, 0.9, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Tea Helper Ring */}
        <mesh position={[0, 0.08, 4.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2.0, 20]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 10. Central Flyover & Bus Hub (0, 0, -180) */}
      <group position={[0, 0, -180]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[160, 1.2, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
        </RigidBody>
        {/* Flyover Pillars */}
        {[-60, -20, 20, 60].map((px, i) => (
          <mesh key={i} position={[px, 2.7, 0]} castShadow>
            <cylinderGeometry args={[1.4, 1.6, 5.4, 10]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
