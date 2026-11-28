import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import worldConfig from '../config/world.json';
import { getTerrainHeight, seededRandom } from './TerrainHeight';
import { createChennaiBuildingGeos, createPalmCrownGeo, createUtilityPoleGeo } from './ChennaiArchitecture';
import {
  getAsphaltNormalMap,
  getBrickFacadeTexture,
  getChennaiFacadeNormalMap,
  getChennaiFacadeTexture,
  getCommercialFacadeTexture,
  getNightWindowTexture,
  getTerrainDetailTexture,
} from './ProceduralTextures';
import { useGameStore } from '../systems/gameStore';

interface CityChunkProps {
  cx: number;
  cz: number;
  isActiveDetail: boolean;
}

const CHUNK_SIZE = worldConfig.chunkSize; // 250
const HALF_WORLD = worldConfig.worldSize / 2; // 2000
const CHENNAI_PALETTE = ['#fde68a', '#fda4af', '#7dd3fc', '#6ee7b7', '#fdba74', '#fef3c7', '#f9a8d4'];

// Building facade type determines which texture to use
type BuildingType = 'residential' | 'brick' | 'commercial';
const BUILDING_TYPES: BuildingType[] = ['residential', 'residential', 'brick', 'commercial'];

type BuildingInstance = { x: number; y: number; z: number; w: number; h: number; d: number; rotY: number; color: string; bType: BuildingType };

function setBuildingSubList(
  mesh: THREE.InstancedMesh | null,
  list: readonly BuildingInstance[],
  dummy: THREE.Object3D,
  color: THREE.Color,
  scaleMult = 1
) {
  if (!mesh) return;
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    dummy.position.set(b.x, b.y, b.z);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.scale.set(b.w * scaleMult, b.h * (scaleMult > 1 ? 1.001 : 1), b.d * scaleMult);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (mesh.instanceColor) mesh.setColorAt(i, color.set(b.color));
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function NightStreetLight({
  worldX,
  worldZ,
  enablePointLight,
}: {
  worldX: number;
  worldZ: number;
  enablePointLight: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const state = useGameStore.getState();
    const h = state.timeOfDay;
    const isNight = h >= 18.2 || h < 6.2;
    const powerCut = isNight && state.weather === 'flood';
    const lit = isNight && !powerCut;

    if (coneRef.current) {
      coneRef.current.visible = lit;
    }
    if (lightRef.current) {
      if (!lit) {
        lightRef.current.visible = false;
      } else {
        const [px, , pz] = state.playerPos;
        const d2 = (px - worldX) * (px - worldX) + (pz - worldZ) * (pz - worldZ);
        lightRef.current.visible = d2 < 90 * 90;
      }
    }
  });

  return (
    <>
      <mesh ref={coneRef} position={[0, -1.8, 0]} visible={false}>
        <coneGeometry args={[2.6, 3.6, 10, 1, true]} />
        <meshBasicMaterial color="#fb923c" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {enablePointLight && (
        <pointLight ref={lightRef} position={[0, -0.4, 0]} color="#fb923c" intensity={18} distance={26} decay={2} visible={false} />
      )}
    </>
  );
}

function isInsideReservedZone(wx: number, wz: number): boolean {
  // Core civic, commercial & TNHB district
  if (wx > -360 && wx < 300 && wz > -265 && wz < 175) return true;
  // Canal corridor
  if (Math.abs(wz - worldConfig.canalZ) < 40) return true;
  // Railway & Metro corridor
  if (Math.abs(wz + 196) < 28) return true;
  // Airport runway & terminal
  if (wx > -1020 && wx < -680 && wz > 330 && wz < 490) return true;
  // Ocean / Beach coast
  if (wx > worldConfig.coastStartX - 60) return true;
  // Arterial road corridors
  if (Math.abs(wz + 120) < 16 || Math.abs(wx - 480) < 16 || Math.abs(wx - 40) < 16 || Math.abs(wx + 190) < 16) {
    return true;
  }
  // Landmarks (generous 78m clearance)
  for (const lm of worldConfig.landmarks) {
    const dx = wx - lm.x;
    const dz = wz - lm.z;
    if (dx * dx + dz * dz < 78 * 78) return true;
  }
  return false;
}

export function CityChunk({ cx, cz, isActiveDetail }: CityChunkProps) {
  const originX = -HALF_WORLD + (cx + 0.5) * CHUNK_SIZE;
  const originZ = -HALF_WORLD + (cz + 0.5) * CHUNK_SIZE;

  const { terrainGeo, buildings, trees, poles } = useMemo(() => {
    const segs = isActiveDetail ? 20 : 8;
    const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const lx = posAttr.getX(i);
      const lz = posAttr.getZ(i);
      const wx = originX + lx;
      const wz = originZ + lz;
      const h = getTerrainHeight(wx, wz);
      posAttr.setY(i, h);

      if (wx > worldConfig.coastStartX - 50) {
        col.set('#eab308'); // Golden Marina beach sand
      } else if (Math.abs(wz - worldConfig.canalZ) < worldConfig.canalWidth / 2 + 5) {
        col.set('#57534e'); // Canal embankment
      } else if (h > 0.14) {
        col.set('#4d7c0f'); // Tropical neem/park green
      } else {
        col.set('#b8aa96'); // Warm sun-baked Chennai laterite/concrete
      }
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const rand = seededRandom(cx * 73856093 ^ cz * 19349663);
    const bList: { x: number; y: number; z: number; w: number; h: number; d: number; rotY: number; color: string; bType: BuildingType }[] = [];
    const tList: { x: number; y: number; z: number; scale: number }[] = [];
    const pList: { x: number; y: number; z: number }[] = [];

    // Structured 4-quadrant city block layout facing the internal cross-streets (lx=0, lz=0)
    const lotOffsets = [-92, -58, -26, 26, 58, 92];
    for (const lx of lotOffsets) {
      for (const lz of lotOffsets) {
        // Leave inner courtyard parks in center of each quadrant (-58,-58 etc.)
        if (Math.abs(lx) === 58 && Math.abs(lz) === 58) continue;
        // Skip occasional lot for breathing room / variety
        if (rand() < 0.14) continue;

        const wx = originX + lx;
        const wz = originZ + lz;
        if (isInsideReservedZone(wx, wz)) continue;

        const h = 7.5 + rand() * 12;
        const w = 16 + rand() * 5;
        const d = 16 + rand() * 5;
        const ty = getTerrainHeight(wx, wz);

        // Face the nearest street cleanly
        let rotY = 0;
        if (Math.abs(lx) === 26) rotY = lx < 0 ? Math.PI / 2 : -Math.PI / 2;
        else if (Math.abs(lz) === 26) rotY = lz < 0 ? 0 : Math.PI;
        else rotY = lx < 0 ? Math.PI / 2 : -Math.PI / 2;

        bList.push({
          x: lx,
          y: ty,
          z: lz,
          w,
          h,
          d,
          rotY,
          color: CHENNAI_PALETTE[Math.floor(rand() * CHENNAI_PALETTE.length)],
          bType: BUILDING_TYPES[Math.floor(rand() * BUILDING_TYPES.length)],
        });
      }
    }

    // Avenue Coconut Palms planted in neat boulevard rows along the streets & parks
    for (let k = -105; k <= 105; k += 35) {
      for (const side of [-10, 10]) {
        const spots: [number, number][] = [
          [side, k],
          [k, side],
        ];
        for (const [tx, tz] of spots) {
          if (Math.abs(tx) < 12 && Math.abs(tz) < 12) continue;
          const wx = originX + tx;
          const wz = originZ + tz;
          if (Math.abs(wz - worldConfig.canalZ) < 28 || wx > worldConfig.coastStartX + 10) continue;
          if (wx > -185 && wx < -55 && wz > 15 && wz < 115) continue;
          const ty = getTerrainHeight(wx, wz);
          tList.push({ x: tx, y: ty, z: tz, scale: 0.9 + (Math.abs(k) % 3) * 0.12 });
        }
      }
    }

    // Utility poles evenly spaced along street curbs
    if (isActiveDetail && originX < worldConfig.coastStartX - 80) {
      for (let k = -90; k <= 90; k += 45) {
        if (!isInsideReservedZone(originX + 8, originZ + k)) {
          pList.push({ x: 8, y: getTerrainHeight(originX + 8, originZ + k), z: k });
        }
      }
    }

    return { terrainGeo: geo, buildings: bList, trees: tList, poles: pList };
  }, [cx, cz, originX, originZ, isActiveDetail]);

  const bBodyRef = useRef<THREE.InstancedMesh>(null);
  const bTrimRef = useRef<THREE.InstancedMesh>(null);
  const bDetailRef = useRef<THREE.InstancedMesh>(null);
  const bBrickRef = useRef<THREE.InstancedMesh>(null);
  const bCommRef = useRef<THREE.InstancedMesh>(null);
  const bNightRef = useRef<THREE.InstancedMesh>(null);
  const tTrunkRef = useRef<THREE.InstancedMesh>(null);
  const tCrownRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);

  const buildingGeos = useMemo(() => createChennaiBuildingGeos(), []);
  const facadeTex = useMemo(() => getChennaiFacadeTexture(), []);
  const facadeNormal = useMemo(() => getChennaiFacadeNormalMap(), []);
  const brickTex = useMemo(() => getBrickFacadeTexture(), []);
  const commTex = useMemo(() => getCommercialFacadeTexture(), []);
  const nightWinTex = useMemo(() => getNightWindowTexture(), []);
  const terrainTex = useMemo(() => getTerrainDetailTexture(), []);
  const terrainNorm = useMemo(() => {
    const n = getAsphaltNormalMap().clone();
    n.needsUpdate = true;
    n.repeat.set(20, 20);
    return n;
  }, []);
  const palmCrownGeo = useMemo(() => createPalmCrownGeo(), []);
  const poleGeo = useMemo(() => createUtilityPoleGeo(), []);

  useEffect(() => {
    return () => {
      terrainGeo.dispose();
      terrainNorm.dispose();
    };
  }, [terrainGeo, terrainNorm]);

  // Split buildings by type for separate instanced meshes
  const { resBldgs, brickBldgs, commBldgs } = useMemo(() => {
    const resBldgs: typeof buildings = [];
    const brickBldgs: typeof buildings = [];
    const commBldgs: typeof buildings = [];
    buildings.forEach((b) => {
      if (b.bType === 'brick') brickBldgs.push(b);
      else if (b.bType === 'commercial') commBldgs.push(b);
      else resBldgs.push(b);
    });
    return { resBldgs, brickBldgs, commBldgs };
  }, [buildings]);

  // Night window emissive material — intensity driven by time of day
  const nightWinMatRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (!nightWinMatRef.current || !bNightRef.current) return;
    const state = useGameStore.getState();
    const h = state.timeOfDay;
    const isNight = h >= 19.0 || h < 6.0;
    const isDusk = (h >= 17.8 && h < 19.0) || (h >= 6.0 && h < 6.8);
    const powerCut = isNight && state.weather === 'flood';
    const intensity = powerCut ? 0.0 : isNight ? 1.5 : isDusk ? 0.75 : 0.0;
    bNightRef.current.visible = intensity > 0.01;
    nightWinMatRef.current.emissiveIntensity = intensity;
    nightWinMatRef.current.opacity = powerCut ? 0.0 : isNight ? 0.88 : isDusk ? 0.45 : 0.0;
  });

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    setBuildingSubList(bBodyRef.current, resBldgs, dummy, color);
    setBuildingSubList(bTrimRef.current, resBldgs, dummy, color);
    setBuildingSubList(bDetailRef.current, resBldgs, dummy, color);
    setBuildingSubList(bBrickRef.current, brickBldgs, dummy, color);
    setBuildingSubList(bCommRef.current, commBldgs, dummy, color);
    setBuildingSubList(bNightRef.current, buildings, dummy, color, 1.005);

    if (tTrunkRef.current && tCrownRef.current) {
      trees.forEach((t, i) => {
        dummy.rotation.set(0, i * 0.9, 0);
        dummy.position.set(t.x, t.y + 2.2 * t.scale, t.z);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        tTrunkRef.current!.setMatrixAt(i, dummy.matrix);

        dummy.position.set(t.x, t.y + 4.8 * t.scale, t.z);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        tCrownRef.current!.setMatrixAt(i, dummy.matrix);
      });
      tTrunkRef.current.instanceMatrix.needsUpdate = true;
      tCrownRef.current.instanceMatrix.needsUpdate = true;
    }

    if (poleRef.current && poles.length > 0) {
      poles.forEach((p, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        poleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      poleRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings, resBldgs, brickBldgs, commBldgs, trees, poles]);

  const showCrossStreets = isActiveDetail && originX < worldConfig.coastStartX - 80 && !(originX > -220 && originX < 80 && originZ > -160 && originZ < 170);

  // Streetlights at pole tops — capped at 6 per active chunk to protect GPU
  const lightPoles = useMemo(() => (isActiveDetail ? poles.slice(0, 6) : []), [poles, isActiveDetail]);

  return (
    <group position={[originX, 0, originZ]}>
      {isActiveDetail ? (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[CHUNK_SIZE / 2, 1, CHUNK_SIZE / 2]} position={[0, -1, 0]} />
          <mesh geometry={terrainGeo} receiveShadow>
            <meshStandardMaterial vertexColors map={terrainTex} normalMap={terrainNorm} normalScale={new THREE.Vector2(0.35, 0.35)} roughness={0.92} />
          </mesh>
        </RigidBody>
      ) : (
        <mesh geometry={terrainGeo} receiveShadow>
          <meshStandardMaterial vertexColors map={terrainTex} roughness={0.94} />
        </mesh>
      )}

      {/* Neighborhood Asphalt Cross-Streets */}
      {showCrossStreets && (
        <>
          <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, CHUNK_SIZE]} />
            <meshStandardMaterial color="#374151" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[CHUNK_SIZE, 10]} />
            <meshStandardMaterial color="#374151" roughness={0.92} />
          </mesh>
        </>
      )}

      {/* ── Residential buildings (plain facade) ── */}
      {resBldgs.length > 0 && (
        <>
          <instancedMesh ref={bBodyRef} args={[buildingGeos.body, undefined, resBldgs.length]} castShadow={isActiveDetail} receiveShadow>
            <meshStandardMaterial map={facadeTex} normalMap={facadeNormal} roughness={0.78} />
          </instancedMesh>
          <instancedMesh ref={bTrimRef} args={[buildingGeos.trim, undefined, resBldgs.length]} castShadow={isActiveDetail}>
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </instancedMesh>
          <instancedMesh ref={bDetailRef} args={[buildingGeos.details, undefined, resBldgs.length]}>
            <meshStandardMaterial color="#0284c7" roughness={0.45} />
          </instancedMesh>
        </>
      )}

      {/* ── Old brick buildings ── */}
      {brickBldgs.length > 0 && (
        <instancedMesh ref={bBrickRef} args={[buildingGeos.body, undefined, brickBldgs.length]} castShadow={isActiveDetail} receiveShadow>
          <meshStandardMaterial map={brickTex} roughness={0.88} />
        </instancedMesh>
      )}

      {/* ── Commercial glass buildings ── */}
      {commBldgs.length > 0 && (
        <instancedMesh ref={bCommRef} args={[buildingGeos.body, undefined, commBldgs.length]} castShadow={isActiveDetail} receiveShadow>
          <meshStandardMaterial map={commTex} roughness={0.35} metalness={0.4} />
        </instancedMesh>
      )}

      {/* ── Night window emissive overlay on all buildings ── */}
      {buildings.length > 0 && isActiveDetail && (
        <instancedMesh ref={bNightRef} args={[buildingGeos.body, undefined, buildings.length]}>
          <meshStandardMaterial
            ref={nightWinMatRef}
            map={nightWinTex}
            emissive="#fef3c7"
            emissiveMap={nightWinTex}
            emissiveIntensity={0}
            transparent
            opacity={0.0}
            depthWrite={false}
          />
        </instancedMesh>
      )}

      {trees.length > 0 && (
        <>
          <instancedMesh ref={tTrunkRef} args={[undefined, undefined, trees.length]} castShadow={isActiveDetail}>
            <cylinderGeometry args={[0.22, 0.36, 4.4, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </instancedMesh>
          <instancedMesh ref={tCrownRef} args={[palmCrownGeo, undefined, trees.length]} castShadow={isActiveDetail}>
            <meshStandardMaterial color="#15803d" roughness={0.75} />
          </instancedMesh>
        </>
      )}

      {poles.length > 0 && (
        <instancedMesh ref={poleRef} args={[poleGeo, undefined, poles.length]}>
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </instancedMesh>
      )}

      {/* ── Streetlight lamps at pole tops (sodium-orange, night only) ── */}
      {lightPoles.map((p, i) => (
        <group key={`sl_${i}`} position={[p.x, p.y + 6.15, p.z]}>
          {/* Lamp arm & housing */}
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[1.3, 0.14, 0.25]} />
            <meshStandardMaterial color="#374151" roughness={0.6} />
          </mesh>
          <mesh position={[-1.1, -0.08, 0]}>
            <boxGeometry args={[0.5, 0.16, 0.35]} />
            <meshStandardMaterial color="#fde047" emissive="#fb923c" emissiveIntensity={0.6} roughness={0.4} />
          </mesh>
          <NightStreetLight
            worldX={originX + p.x - 1.1}
            worldZ={originZ + p.z}
            enablePointLight={i % 2 === 0}
          />
        </group>
      ))}
    </group>
  );
}
