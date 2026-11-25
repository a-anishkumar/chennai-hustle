import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import worldConfig from '../config/world.json';
import { getTerrainHeight, seededRandom } from './TerrainHeight';
import { createChennaiBuildingGeos, createPalmCrownGeo, createUtilityPoleGeo } from './ChennaiArchitecture';
import { getChennaiFacadeNormalMap, getChennaiFacadeTexture } from './ProceduralTextures';

interface CityChunkProps {
  cx: number;
  cz: number;
  isActiveDetail: boolean;
}

const CHUNK_SIZE = worldConfig.chunkSize; // 250
const HALF_WORLD = worldConfig.worldSize / 2; // 2000
const CHENNAI_PALETTE = ['#fde68a', '#fda4af', '#7dd3fc', '#6ee7b7', '#fdba74', '#fef3c7', '#f9a8d4'];

function isInsideReservedZone(wx: number, wz: number): boolean {
  // TNHB Colony + Road Loop area
  if (wx > -215 && wx < 65 && wz > -145 && wz < 160) return true;
  // Canal corridor
  if (Math.abs(wz - worldConfig.canalZ) < 38) return true;
  // Ocean / Beach coast
  if (wx > worldConfig.coastStartX - 60) return true;
  // Arterial road corridors
  if (Math.abs(wz + 120) < 16 || Math.abs(wx - 480) < 16 || Math.abs(wx - 40) < 16) return true;
  // Other landmarks
  for (const lm of worldConfig.landmarks) {
    const dx = wx - lm.x;
    const dz = wz - lm.z;
    if (dx * dx + dz * dz < 68 * 68) return true;
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
    const bList: { x: number; y: number; z: number; w: number; h: number; d: number; rotY: number; color: string }[] = [];
    const tList: { x: number; y: number; z: number; scale: number }[] = [];
    const pList: { x: number; y: number; z: number }[] = [];

    // Align Chennai buildings into neat neighborhood blocks away from internal cross-streets (lx=0, lz=0)
    const bCount = isActiveDetail ? 24 : 10;
    for (let i = 0; i < bCount; i++) {
      const lx = (rand() - 0.5) * (CHUNK_SIZE - 26);
      const lz = (rand() - 0.5) * (CHUNK_SIZE - 26);
      if (Math.abs(lx) < 14 || Math.abs(lz) < 14) continue; // Keep chunk cross-streets clear
      const wx = originX + lx;
      const wz = originZ + lz;
      if (isInsideReservedZone(wx, wz)) continue;
      const h = 6.5 + rand() * 13;
      const w = 9 + rand() * 9;
      const d = 9 + rand() * 9;
      const ty = getTerrainHeight(wx, wz);
      bList.push({
        x: lx,
        y: ty,
        z: lz,
        w,
        h,
        d,
        rotY: (Math.floor(rand() * 4) * Math.PI) / 2,
        color: CHENNAI_PALETTE[Math.floor(rand() * CHENNAI_PALETTE.length)],
      });
    }

    // Coconut palms & avenue trees
    const tCount = isActiveDetail ? 22 : 8;
    for (let i = 0; i < tCount; i++) {
      const lx = (rand() - 0.5) * (CHUNK_SIZE - 14);
      const lz = (rand() - 0.5) * (CHUNK_SIZE - 14);
      const wx = originX + lx;
      const wz = originZ + lz;
      if (Math.abs(wz - worldConfig.canalZ) < 28 || wx > worldConfig.coastStartX + 10) continue;
      if (wx > -175 && wx < -65 && wz > 20 && wz < 105) continue;
      const ty = getTerrainHeight(wx, wz);
      tList.push({ x: lx, y: ty, z: lz, scale: 0.85 + rand() * 0.65 });
    }

    // Utility poles along neighborhood cross-streets
    if (isActiveDetail && originX < worldConfig.coastStartX - 80) {
      for (let k = -90; k <= 90; k += 45) {
        if (!isInsideReservedZone(originX + 7, originZ + k)) {
          pList.push({ x: 7, y: getTerrainHeight(originX + 7, originZ + k), z: k });
        }
      }
    }

    return { terrainGeo: geo, buildings: bList, trees: tList, poles: pList };
  }, [cx, cz, originX, originZ, isActiveDetail]);

  const bBodyRef = useRef<THREE.InstancedMesh>(null);
  const bTrimRef = useRef<THREE.InstancedMesh>(null);
  const bDetailRef = useRef<THREE.InstancedMesh>(null);
  const tTrunkRef = useRef<THREE.InstancedMesh>(null);
  const tCrownRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);

  const buildingGeos = useMemo(() => createChennaiBuildingGeos(), []);
  const facadeTex = useMemo(() => getChennaiFacadeTexture(), []);
  const facadeNormal = useMemo(() => getChennaiFacadeNormalMap(), []);
  const palmCrownGeo = useMemo(() => createPalmCrownGeo(), []);
  const poleGeo = useMemo(() => createUtilityPoleGeo(), []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    if (bBodyRef.current && bTrimRef.current && bDetailRef.current) {
      buildings.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rotY, 0);
        dummy.scale.set(b.w, b.h, b.d);
        dummy.updateMatrix();
        bBodyRef.current!.setMatrixAt(i, dummy.matrix);
        bTrimRef.current!.setMatrixAt(i, dummy.matrix);
        bDetailRef.current!.setMatrixAt(i, dummy.matrix);
        bBodyRef.current!.setColorAt(i, color.set(b.color));
      });
      bBodyRef.current.instanceMatrix.needsUpdate = true;
      bTrimRef.current.instanceMatrix.needsUpdate = true;
      bDetailRef.current.instanceMatrix.needsUpdate = true;
      if (bBodyRef.current.instanceColor) bBodyRef.current.instanceColor.needsUpdate = true;
    }

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
  }, [buildings, trees, poles]);

  const showCrossStreets = isActiveDetail && originX < worldConfig.coastStartX - 80 && !(originX > -220 && originX < 80 && originZ > -160 && originZ < 170);

  return (
    <group position={[originX, 0, originZ]}>
      {isActiveDetail ? (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[CHUNK_SIZE / 2, 1, CHUNK_SIZE / 2]} position={[0, -1, 0]} />
          <mesh geometry={terrainGeo} receiveShadow>
            <meshStandardMaterial vertexColors roughness={0.94} />
          </mesh>
        </RigidBody>
      ) : (
        <mesh geometry={terrainGeo} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.94} />
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

      {buildings.length > 0 && (
        <>
          <instancedMesh
            ref={bBodyRef}
            args={[buildingGeos.body, undefined, buildings.length]}
            castShadow={isActiveDetail}
            receiveShadow
          >
            <meshStandardMaterial map={facadeTex} normalMap={facadeNormal} roughness={0.78} />
          </instancedMesh>
          <instancedMesh ref={bTrimRef} args={[buildingGeos.trim, undefined, buildings.length]} castShadow={isActiveDetail}>
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </instancedMesh>
          <instancedMesh ref={bDetailRef} args={[buildingGeos.details, undefined, buildings.length]}>
            <meshStandardMaterial color="#0284c7" roughness={0.45} />
          </instancedMesh>
        </>
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
    </group>
  );
}
