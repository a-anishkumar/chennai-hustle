import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getSignTexture } from '../ProceduralTextures';

const CONTAINER_COLORS = ['#dc2626', '#2563eb', '#f97316', '#16a34a', '#0284c7'];

export function HarbourLandmark() {
  const portSign = useMemo(() => getSignTexture('CHENNAI PORT & HARBOUR', 'Container Terminal & Kasimedu', '#0f172a', '#facc15'), []);

  return (
    <group name="Harbour_Landmark" position={[950, 0, -1350]}>
      <mesh position={[0, 12, 42]}>
        <boxGeometry args={[26, 3.6, 0.4]} />
        <meshStandardMaterial map={portSign} />
      </mesh>
      {/* Docked Cargo Ship */}
      <group position={[-10, 1.8, -82]}>
        <mesh castShadow>
          <boxGeometry args={[42, 4.2, 11]} />
          <meshStandardMaterial color="#991b1b" />
        </mesh>
        <mesh position={[14, 4.2, 0]} castShadow>
          <boxGeometry args={[7, 4.8, 8.5]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      {/* Concrete Pier Apron */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[160, 0.2, 120]} />
        <meshStandardMaterial color="#64748b" roughness={0.95} />
      </mesh>

      {/* Port Gantry Cranes */}
      {[-40, 35].map((cx, i) => (
        <group key={i} position={[cx, 0, -30]}>
          <mesh position={[-4, 12, 0]} castShadow>
            <boxGeometry args={[1.4, 24, 1.4]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[4, 12, 0]} castShadow>
            <boxGeometry args={[1.4, 24, 1.4]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 24, -6]} castShadow>
            <boxGeometry args={[10, 1.6, 28]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      ))}

      {/* Stacked Shipping Containers */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        const level = idx % 2;
        return (
          <RigidBody key={idx} type="fixed" colliders="cuboid">
            <mesh position={[-50 + col * 14, 1.6 + level * 3.1, 15 + row * 9]} castShadow receiveShadow>
              <boxGeometry args={[12, 3.0, 4.2]} />
              <meshStandardMaterial color={CONTAINER_COLORS[idx % CONTAINER_COLORS.length]} roughness={0.7} />
            </mesh>
          </RigidBody>
        );
      })}

      {/* Moored Fishing Boats */}
      {[-35, -10, 15].map((bx, i) => (
        <group key={i} position={[bx, 0.3, -68]}>
          <mesh castShadow>
            <boxGeometry args={[3.4, 1.2, 9.5]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#0284c7' : '#f97316'} />
          </mesh>
          <mesh position={[0, 1.2, -1]} castShadow>
            <boxGeometry args={[2.2, 1.4, 2.8]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}

      {/* Fish Market Stalls */}
      <group position={[45, 0, 25]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[22, 4.4, 12]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.8} />
          </mesh>
        </RigidBody>
      </group>

      {/* Harbour Night Shift Interaction Ring */}
      <mesh position={[12, 0.22, 32]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.6, 24]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}
