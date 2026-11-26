import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getAwningTexture, getSignTexture } from '../ProceduralTextures';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

export function ChennaiCityStores() {
  const signs = useMemo(
    () => ({
      carShowroom: getSignTexture('சென்னை மோட்டார்ஸ்', 'CAR SHOWROOM • NEW MODELS', '#0f172a', '#38bdf8'),
      supermarket: getSignTexture('நம்ம சூப்பர் மார்க்கெட்', 'NAMMA SUPERMARKET • FRESH & GROCERY', '#1d4ed8', '#facc15'),
      grocery: getSignTexture('அண்ணாச்சி மளிகை கடை', 'ANNACHI GROCERY • RICE • OIL • MASALA', '#15803d', '#fef08a'),
      flower: getSignTexture('மல்லிகை பூ கடை', 'FRESH JASMINE & TEMPLE GARLANDS', '#be185d', '#fce7f3'),
      pcShop: getSignTexture('ரிச்சி ஸ்ட்ரீட் பிசி', 'PC • LAPTOPS • GAMING • REPAIR', '#111827', '#22d3ee'),
      pharmacy: getSignTexture('சென்னை மெடிக்கல்ஸ்', '24x7 PHARMACY & SURGICALS', '#047857', '#ffffff'),
      bakery: getSignTexture('சென்னை பேக்கரி & ஸ்வீட்ஸ்', 'FRESH PUFFS • CAKES • SWEETS', '#991b1b', '#fde047'),
      awningRed: getAwningTexture('#dc2626', '#fef08a'),
      awningGreen: getAwningTexture('#16a34a', '#ffffff'),
      awningPink: getAwningTexture('#db2777', '#fef9c3'),
    }),
    []
  );

  return (
    <group name="Chennai_City_Stores">
      {/* 1. Car Showroom (220, 0, -148) */}
      <group position={[220, 0, -148]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.2, -2]} castShadow receiveShadow>
            <boxGeometry args={[18, 6.4, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
        </RigidBody>
        {/* Glass Showroom Front */}
        <mesh position={[0, 2.5, 3.05]}>
          <planeGeometry args={[16, 4.4]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.65} roughness={0.1} transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, 5.7, 3.1]}>
          <boxGeometry args={[17, 1.5, 0.25]} />
          <meshStandardMaterial map={signs.carShowroom} />
        </mesh>
        {/* Display Cars on Raised Plinths */}
        {[
          { x: -4.2, color: '#dc2626' },
          { x: 4.2, color: '#e2e8f0' },
        ].map((car, idx) => (
          <group key={idx} position={[car.x, 0, 1.2]}>
            <mesh position={[0, 0.15, 0]} receiveShadow>
              <cylinderGeometry args={[2.6, 2.8, 0.3, 18]} />
              <meshStandardMaterial color="#334155" metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[1.9, 0.75, 4.1]} />
              <meshStandardMaterial color={car.color} metalness={0.7} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.25, -0.2]} castShadow>
              <boxGeometry args={[1.6, 0.55, 2.0]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.15} />
            </mesh>
          </group>
        ))}
        <pointLight position={[0, 4.8, 2.0]} color="#e0f2fe" intensity={10} distance={18} />
        <group position={[0, 0, 4.4]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="agree" tintColor="#e2e8f0" prop="phone" seed={51} />
        </group>
      </group>

      {/* 2. Namma Supermarket (-14, 0, 28) */}
      <group position={[-14, 0, 28]} rotation={[0, -Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[12, 5.2, 8]} />
            <meshStandardMaterial color="#eff6ff" roughness={0.75} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.4, 4.1]}>
          <boxGeometry args={[11.6, 1.45, 0.22]} />
          <meshStandardMaterial map={signs.supermarket} />
        </mesh>
        {/* Glass Storefront + Visible Stocked Aisles */}
        <mesh position={[0, 1.9, 4.03]}>
          <planeGeometry args={[9.5, 3.2]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.38} metalness={0.5} roughness={0.15} />
        </mesh>
        {[-3.2, 0, 3.2].map((sx, idx) => (
          <mesh key={idx} position={[sx, 1.3, 3.4]}>
            <boxGeometry args={[1.8, 2.0, 0.5]} />
            <meshStandardMaterial color={idx === 0 ? '#facc15' : idx === 1 ? '#ef4444' : '#22c55e'} />
          </mesh>
        ))}
        {/* Shopping Carts & Shoppers */}
        <mesh position={[-4.5, 0.55, 4.8]} castShadow>
          <boxGeometry args={[0.9, 0.85, 0.65]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <group position={[1.8, 0, 5.0]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="walk" tintColor="#ec4899" prop="shopping_bag" seed={52} />
        </group>
        <group position={[-1.6, 0, 5.2]}>
          <AnimatedHumanNpc anim="idle" tintColor="#38bdf8" prop="shopping_bag" seed={53} />
        </group>
      </group>

      {/* 3. Annachi Grocery Store (-158, 0, 108) */}
      <group position={[-158, 0, 108]} rotation={[0, Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.4, 3.4, 4.8]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 3.6, 2.45]}>
          <boxGeometry args={[6.2, 1.15, 0.2]} />
          <meshStandardMaterial map={signs.grocery} />
        </mesh>
        <mesh position={[0, 2.6, 3.05]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[6.3, 0.1, 1.7]} />
          <meshStandardMaterial map={signs.awningGreen} />
        </mesh>
        {/* Rice & Dal Sacks Outside */}
        {[-1.8, -1.0, -0.2].map((sx, idx) => (
          <mesh key={idx} position={[sx, 0.42, 2.75]} castShadow>
            <cylinderGeometry args={[0.34, 0.38, 0.82, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#d6b37c' : '#f8fafc'} roughness={0.95} />
          </mesh>
        ))}
        <group position={[1.4, 0, 3.1]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#f8fafc" prop="shopping_bag" seed={54} />
        </group>
      </group>

      {/* 4. Small Flower Shops (-54, 0, 118 and Mylapore 598, 0, 498) */}
      {[
        { x: -54, z: 118, rotY: Math.PI },
        { x: 598, z: 498, rotY: Math.PI / 2 },
      ].map((fl, fi) => (
        <group key={`flower_${fi}`} position={[fl.x, 0, fl.z]} rotation={[0, fl.rotY, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[3.4, 1.1, 1.8]} />
              <meshStandardMaterial color="#78350f" roughness={0.85} />
            </mesh>
          </RigidBody>
          <mesh position={[0, 2.35, 0.35]} rotation={[-0.25, 0, 0]} castShadow>
            <boxGeometry args={[3.6, 0.1, 2.2]} />
            <meshStandardMaterial map={signs.awningPink} />
          </mesh>
          <mesh position={[0, 2.85, -0.5]}>
            <boxGeometry args={[3.4, 0.85, 0.15]} />
            <meshStandardMaterial map={signs.flower} />
          </mesh>
          {/* Colorful Jasmine, Rose & Marigold Garlands */}
          {[-1.1, -0.35, 0.4, 1.1].map((fx, gi) => (
            <mesh key={gi} position={[fx, 1.55, 0.72]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.85, 8]} />
              <meshStandardMaterial color={['#f8fafc', '#f97316', '#ec4899', '#facc15'][gi]} />
            </mesh>
          ))}
          <group position={[0, 0, -1.2]}>
            <AnimatedHumanNpc anim="idle" tintColor="#ec4899" seed={55 + fi} />
          </group>
        </group>
      ))}

      {/* 5. Ritchie Street PC & Gaming Shop (62, 0, 118) */}
      <group position={[62, 0, 118]} rotation={[0, Math.PI, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[7.4, 4.0, 5.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.2, 2.65]}>
          <boxGeometry args={[7.2, 1.25, 0.2]} />
          <meshStandardMaterial map={signs.pcShop} />
        </mesh>
        <mesh position={[0, 1.75, 2.62]}>
          <planeGeometry args={[5.8, 2.5]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.35} metalness={0.6} />
        </mesh>
        {/* Glowing RGB PC Towers & Monitors in Display Window */}
        {[-1.8, 0, 1.8].map((px, pi) => (
          <group key={pi} position={[px, 1.25, 2.2]}>
            <mesh>
              <boxGeometry args={[0.65, 0.48, 0.12]} />
              <meshStandardMaterial color="#1e293b" emissive="#22d3ee" emissiveIntensity={1.1} />
            </mesh>
            <mesh position={[0.5, -0.05, 0]}>
              <boxGeometry args={[0.26, 0.55, 0.45]} />
              <meshStandardMaterial color="#111827" emissive="#a855f7" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
        <group position={[1.2, 0, 3.4]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#22d3ee" prop="bag" seed={58} />
        </group>
      </group>

      {/* 6. Chennai 24x7 Pharmacy (232, 0, 108) */}
      <group position={[232, 0, 108]} rotation={[0, Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[6.2, 3.6, 4.6]} />
            <meshStandardMaterial color="#ecfdf5" roughness={0.7} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 3.8, 2.35]}>
          <boxGeometry args={[6.0, 1.15, 0.2]} />
          <meshStandardMaterial map={signs.pharmacy} />
        </mesh>
        <mesh position={[2.4, 2.7, 2.4]}>
          <boxGeometry args={[0.3, 0.9, 0.15]} />
          <meshStandardMaterial color="#16a34a" emissive="#22c55e" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[2.4, 2.7, 2.4]}>
          <boxGeometry args={[0.9, 0.3, 0.15]} />
          <meshStandardMaterial color="#16a34a" emissive="#22c55e" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* 7. Chennai Bakery & Sweets (-172, 0, -58) */}
      <group position={[-172, 0, -58]} rotation={[0, Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.75, 0]} castShadow>
            <boxGeometry args={[6.0, 3.5, 4.5]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.8} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 3.7, 2.3]}>
          <boxGeometry args={[5.8, 1.15, 0.2]} />
          <meshStandardMaterial map={signs.bakery} />
        </mesh>
        <mesh position={[0, 2.55, 2.9]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[5.9, 0.1, 1.7]} />
          <meshStandardMaterial map={signs.awningRed} />
        </mesh>
        <mesh position={[0, 0.9, 2.45]}>
          <boxGeometry args={[4.2, 0.95, 0.85]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.3} transparent opacity={0.75} />
        </mesh>
      </group>
    </group>
  );
}
