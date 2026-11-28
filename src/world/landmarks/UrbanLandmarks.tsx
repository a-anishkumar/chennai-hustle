import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture, getSignTexture } from '../ProceduralTextures';
import { OnlineModel } from '../OnlineModel';
import { SketchfabSlot } from '../SketchfabModel';

const DUCK_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb';

export function UrbanLandmarks() {
  const teaAwning = useMemo(() => getAwningTexture('#16a34a', '#f8fafc'), []);
  const cinemaBanner = useMemo(() => getAwningTexture('#f59e0b', '#7c2d12'), []);
  const mallSign = useMemo(() => getSignTexture('EXPRESS AVENUE MALL', 'Royapettah • Shopping & Food Court', '#1e293b', '#facc15'), []);
  const saravanaStoresSign = useMemo(() => getSignTexture('SARAVANA STORES', 'T. Nagar Mega Mart', '#b91c1c', '#fde047'), []);
  const hsbSign = useMemo(() => getSignTexture('HOTEL SARAVANA BHAVAN', 'Ghee Roast • Filter Coffee', '#15803d', '#fef08a'), []);
  const buhariSign = useMemo(() => getSignTexture('BUHARI HOTEL', 'Mount Road • Chicken 65 & Biryani', '#991b1b', '#fde047'), []);
  const muruganSign = useMemo(() => getSignTexture('MURUGAN IDLI SHOP', 'Soft Idli • 4 Chutneys', '#ea580c', '#ffffff'), []);
  const templeSign = useMemo(() => getSignTexture('கபாலீஸ்வரர் கோவில் • KAPALEESHWARAR', 'Mylapore • Arulmigu Temple & Tank', '#7c2d12', '#fde047'), []);

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
        {/* Express Avenue Mall Sign */}
        <mesh position={[0, 19.6, 18.2]}>
          <boxGeometry args={[28, 4.2, 0.6]} />
          <meshStandardMaterial map={mallSign} />
        </mesh>
        {/* Saravana Stores Mega Mart Wing */}
        <group position={[-42, 0, 2]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 7.5, 0]} castShadow>
              <boxGeometry args={[26, 15, 24]} />
              <meshStandardMaterial color="#dc2626" roughness={0.5} />
            </mesh>
          </RigidBody>
          <mesh position={[0, 13.5, 12.2]}>
            <boxGeometry args={[22, 3.6, 0.5]} />
            <meshStandardMaterial map={saravanaStoresSign} />
          </mesh>
        </group>
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
        {/* Tiered Gopuram Tower (replaced by Sketchfab South Indian Temple Kit when downloaded) */}
        <SketchfabSlot
          id="hindu_temple"
          position={[0, 0, 12]}
          maxDist={260}
          fallback={
            <>
              {[0, 1, 2, 3, 4].map((tier) => (
                <mesh key={tier} position={[0, 3 + tier * 3.8, 12]} castShadow>
                  <boxGeometry args={[12 - tier * 1.8, 3.8, 7 - tier * 1.0]} />
                  <meshStandardMaterial
                    color={['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#fde047'][tier]}
                    roughness={0.7}
                  />
                </mesh>
              ))}
            </>
          }
        />
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
        {/* Brass Kodimaram (Temple Flagstaff) & Tamil Signboard */}
        <mesh position={[0, 6.0, 5.5]} castShadow>
          <cylinderGeometry args={[0.16, 0.24, 12, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.6, 15.6]}>
          <boxGeometry args={[12.5, 1.8, 0.28]} />
          <meshStandardMaterial map={templeSign} />
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

      {/* 9. Hotel Saravana Bhavan & Tea Kadai Corner (-40, 0, -35) */}
      <group position={[-40, 0, -35]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.4, 0]} castShadow>
            <boxGeometry args={[10, 4.8, 6]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.2, 3.1]}>
          <boxGeometry args={[9.6, 1.8, 0.3]} />
          <meshStandardMaterial map={hsbSign} />
        </mesh>
        <mesh position={[0, 3.0, 3.8]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[9.8, 0.12, 2.2]} />
          <meshStandardMaterial map={teaAwning} />
        </mesh>
        {/* Tea Samovar */}
        <mesh position={[-2.2, 1.5, 3.4]}>
          <cylinderGeometry args={[0.35, 0.4, 0.9, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Tea Helper Ring */}
        <mesh position={[0, 0.08, 5.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2.0, 20]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Iconic Chennai Hotels along Main Road Loop: Buhari Hotel & Murugan Idli Shop */}
      <group position={[-175, 0, -60]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.6, 0]} castShadow>
            <boxGeometry args={[11, 5.2, 7]} />
            <meshStandardMaterial color="#fee2e2" />
          </mesh>
        </RigidBody>
        <mesh position={[5.6, 4.8, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[9, 2.0, 0.3]} />
          <meshStandardMaterial map={buhariSign} />
        </mesh>
      </group>

      <group position={[55, 0, -40]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.4, 0]} castShadow>
            <boxGeometry args={[10, 4.8, 7]} />
            <meshStandardMaterial color="#ffedd5" />
          </mesh>
        </RigidBody>
        <mesh position={[-5.1, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[8.5, 1.8, 0.3]} />
          <meshStandardMaterial map={muruganSign} />
        </mesh>
      </group>

      {/* 10. Central Flyover, Bus Hub & CMRL-Style Elevated Metro Viaduct (0, 0, -180) */}
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

        {/* Elevated Chennai Metro (CMRL-Style) Viaduct & Station */}
        <mesh position={[140, 11.5, -28]} castShadow>
          <boxGeometry args={[480, 1.4, 9]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
        <mesh position={[140, 12.6, -28]}>
          <boxGeometry args={[480, 0.5, 9.4]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Metro Station Canopy */}
        <mesh position={[120, 14.5, -28]} castShadow>
          <boxGeometry args={[44, 2.8, 13]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Metro Viaduct Piers */}
        {[-60, 0, 60, 120, 180, 240, 300, 360].map((mx, i) => (
          <mesh key={i} position={[mx, 5.8, -28]} castShadow>
            <cylinderGeometry args={[1.2, 1.5, 11.4, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
