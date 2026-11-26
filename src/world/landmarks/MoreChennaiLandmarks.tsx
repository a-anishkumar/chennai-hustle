import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';
import { OnlineModel } from '../OnlineModel';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

const LEVEL_CROSSING_XS = [-190, 40, 480];

const FOX_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb';

export function MoreChennaiLandmarks() {
  const trainRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const gateNorthRefs = useRef<(THREE.Group | null)[]>([]);
  const gateSouthRefs = useRef<(THREE.Group | null)[]>([]);
  const gateLightRefs = useRef<(THREE.Mesh | null)[]>([]);

  const signs = useMemo(
    () => ({
      shrine: getSignTexture('VINAYAGAR KOVIL', 'Peaceful Shrine', '#d97706', '#fef08a'),
      museum: getSignTexture('GOVERNMENT MUSEUM', 'Egmore • Heritage & Art', '#7f1d1d', '#fde047'),
      airport: getSignTexture('CHENNAI AIRPORT (MAA)', 'Domestic & International', '#0f172a', '#38bdf8'),
      park: getSignTexture('SEMMOZHI PARK', 'Morning Walk & Fountain', '#15803d', '#ffffff'),
      school: getSignTexture('CHENNAI HIGH SCHOOL', 'Education & Sports', '#b45309', '#fef9c3'),
      ripon: getSignTexture('RIPON BUILDING', 'Greater Chennai Corporation', '#f8fafc', '#1e3a8a'),
      lcGate: getSignTexture('RAILWAY GATE • LC', 'STOP WHEN GATE CLOSED', '#facc15', '#dc2626'),
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);
    // Animated Express Train moving along Railway Track (z = -196)
    const tx = ((t * 24) % 1400) - 700;
    if (trainRef.current) {
      trainRef.current.position.set(tx, 0, -196);
    }

    // Automate Railway Level Crossing Gates when Express Train approaches
    const blink = Math.sin(t * 10) > 0;
    LEVEL_CROSSING_XS.forEach((cx, i) => {
      const trainNear = Math.abs(tx - cx) < 105;
      const targetAngle = trainNear ? 0 : Math.PI / 2.25;
      const gn = gateNorthRefs.current[i];
      const gs = gateSouthRefs.current[i];
      if (gn) gn.rotation.z = THREE.MathUtils.lerp(gn.rotation.z, targetAngle, dt * 4);
      if (gs) gs.rotation.z = THREE.MathUtils.lerp(gs.rotation.z, targetAngle, dt * 4);
      const gl = gateLightRefs.current[i];
      if (gl) {
        const mat = gl.material as THREE.MeshStandardMaterial;
        mat.emissive.set(trainNear && blink ? '#ef4444' : '#000000');
        mat.emissiveIntensity = trainNear && blink ? 2.5 : 0;
      }
    });
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

        {/* 3 Automated Indian Railways Level Crossings & Gates */}
        {LEVEL_CROSSING_XS.map((cx, idx) => (
          <group key={`lc_${cx}`} position={[cx, 0, 0]}>
            {/* Paved Road-Rail Crossing Apron & Warning Stripes */}
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[14, 7.2]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.07, 3.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[13.6, 0.45]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
            <mesh position={[0, 0.07, -3.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[13.6, 0.45]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>

            {/* South Gate Post & Animated Striped Boom Arm */}
            <group position={[-6.8, 0, 4.4]}>
              <mesh position={[0, 0.85, 0]} castShadow>
                <boxGeometry args={[0.45, 1.7, 0.45]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
              <group
                ref={(el) => {
                  gateSouthRefs.current[idx] = el;
                }}
                position={[0, 1.25, 0]}
                rotation={[0, 0, Math.PI / 2.25]}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((seg) => (
                  <mesh key={seg} position={[0.85 + seg * 1.55, 0, 0]} castShadow>
                    <boxGeometry args={[1.55, 0.14, 0.14]} />
                    <meshStandardMaterial color={seg % 2 === 0 ? '#facc15' : '#0f172a'} />
                  </mesh>
                ))}
              </group>
            </group>

            {/* North Gate Post & Animated Striped Boom Arm */}
            <group position={[-6.8, 0, -4.4]}>
              <mesh position={[0, 0.85, 0]} castShadow>
                <boxGeometry args={[0.45, 1.7, 0.45]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
              <group
                ref={(el) => {
                  gateNorthRefs.current[idx] = el;
                }}
                position={[0, 1.25, 0]}
                rotation={[0, 0, Math.PI / 2.25]}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((seg) => (
                  <mesh key={seg} position={[0.85 + seg * 1.55, 0, 0]} castShadow>
                    <boxGeometry args={[1.55, 0.14, 0.14]} />
                    <meshStandardMaterial color={seg % 2 === 0 ? '#facc15' : '#0f172a'} />
                  </mesh>
                ))}
              </group>
            </group>

            {/* Railway Warning Signal Post + Flashing Red Beacon */}
            <group position={[7.4, 0, 4.4]}>
              <mesh position={[0, 1.8, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.12, 3.6, 8]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 2.7, 0.12]}>
                <boxGeometry args={[1.6, 0.65, 0.12]} />
                <meshStandardMaterial map={signs.lcGate} />
              </mesh>
              <mesh
                ref={(el) => {
                  gateLightRefs.current[idx] = el;
                }}
                position={[0, 3.65, 0]}
              >
                <sphereGeometry args={[0.26, 8, 8]} />
                <meshStandardMaterial color="#7f1d1d" />
              </mesh>
            </group>

            {/* Gateman Cabin & Railway Gateman */}
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[9.8, 1.4, -4.8]} castShadow receiveShadow>
                <boxGeometry args={[3.2, 2.8, 2.8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.75} />
              </mesh>
            </RigidBody>
            <mesh position={[9.8, 2.95, -4.8]} castShadow>
              <boxGeometry args={[3.6, 0.3, 3.2]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
            <group position={[7.8, 0, -4.4]} rotation={[0, -Math.PI / 4, 0]}>
              <AnimatedHumanNpc anim="idle" tintColor="#f8fafc" prop="tools" seed={70 + idx} />
            </group>
          </group>
        ))}
      </group>

      {/* Moving Express Train with Detailed Passenger Compartments */}
      <group ref={trainRef} position={[-200, 0, -196]}>
        {/* Electric Locomotive with Pantograph */}
        <group position={[30, 0, 0]}>
          <mesh position={[0, 1.9, 0]} castShadow>
            <boxGeometry args={[11.5, 3.4, 3.1]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[11.6, 0.4, 3.15]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <mesh position={[0, 3.9, 0]}>
            <boxGeometry args={[1.6, 0.6, 1.4]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} />
          </mesh>
        </group>

        {/* 4 Detailed Passenger Compartments with Windows, Doors & Bogies */}
        {[-28, -14, 0, 14].map((cx, i) => (
          <group key={i} position={[cx, 0, 0]}>
            {/* Compartment Hull */}
            <mesh position={[0, 1.9, 0]} castShadow>
              <boxGeometry args={[12.6, 3.1, 3.0]} />
              <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
            </mesh>
            {/* Yellow Express Stripe */}
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[12.65, 0.35, 3.04]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
            {/* Illuminated Compartment Windows */}
            {[-4.5, -2.5, -0.5, 1.5, 3.5].map((wx, wi) => (
              <mesh key={wi} position={[wx, 2.25, 0]}>
                <boxGeometry args={[1.1, 0.85, 3.06]} />
                <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.6} />
              </mesh>
            ))}
            {/* Compartment Connectors & Bogie Wheels */}
            <mesh position={[6.7, 1.7, 0]}>
              <boxGeometry args={[0.8, 2.2, 2.1]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {[-4.2, 4.2].map((bx, bi) => (
              <mesh key={bi} position={[bx, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 2.8, 10]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Ripon Building (White Indo-Saracenic Corporation Building next to Central Station, -245, -180) */}
      <group position={[-245, 0, -225]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[42, 13, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
        </RigidBody>
        {/* 3 White Indo-Saracenic Domes & Central Clock Tower */}
        <mesh position={[0, 16, 4]} castShadow>
          <boxGeometry args={[7, 10, 7]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
        {[-13, 0, 13].map((dx, i) => (
          <mesh key={i} position={[dx, i === 1 ? 22 : 14.5, i === 1 ? 4 : 0]} castShadow>
            <sphereGeometry args={[i === 1 ? 3.8 : 2.8, 14, 14]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 11.2, 10.2]}>
          <boxGeometry args={[22, 3.0, 0.35]} />
          <meshStandardMaterial map={signs.ripon} />
        </mesh>
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
        {/* Online CC0 Fox Model in Semmozhi Park */}
        <OnlineModel url={FOX_URL} position={[8, 0, -6]} scale={0.03} rotation={[0, 0.8, 0]} />
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
