import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import worldConfig from '../config/world.json';
import { getTerrainHeight, seededRandom } from './TerrainHeight';

function createPalmCrownGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const frond = new THREE.BoxGeometry(0.65, 0.14, 2.8);
    frond.translate(0, 0, 1.3);
    frond.rotateX(0.32);
    frond.rotateY(ang);
    parts.push(frond);
  }
  return mergeGeometries(parts)!;
}

interface CityChunkProps {
  cx: number;
  cz: number;
  isActiveDetail: boolean;
}

const CHUNK_SIZE = worldConfig.chunkSize; // 250
const HALF_WORLD = worldConfig.worldSize / 2; // 2000
const BUILDING_PALETTE = ['#fde68a', '#fca5a5', '#93c5fd', '#a7f3d0', '#fdba74', '#e9d5ff'];

function isInsideReservedZone(wx: number, wz: number): boolean {
  // TNHB Colony + Road Loop area
  if (wx > -215 && wx < 65 && wz > -145 && wz < 160) return true;
  // Canal corridor
  if (Math.abs(wz - worldConfig.canalZ) < 38) return true;
  // Ocean / Beach coast
  if (wx > worldConfig.coastStartX - 60) return true;
  // Other landmarks
  for (const lm of worldConfig.landmarks) {
    const dx = wx - lm.x;
    const dz = wz - lm.z;
    if (dx * dx + dz * dz < 65 * 65) return true;
  }
  return false;
}

export function CityChunk({ cx, cz, isActiveDetail }: CityChunkProps) {
  const originX = -HALF_WORLD + (cx + 0.5) * CHUNK_SIZE;
  const originZ = -HALF_WORLD + (cz + 0.5) * CHUNK_SIZE;

  const { terrainGeo, buildings, trees } = useMemo(() => {
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

      if (wx > worldConfig.coastStartX - 40) {
        col.set('#eab308'); // Beach sand
      } else if (Math.abs(wz - worldConfig.canalZ) < worldConfig.canalWidth / 2 + 4) {
        col.set('#475569'); // Canal bank
      } else if (h > 0.12) {
        col.set('#4d7c0f'); // Tropical green
      } else {
        col.set('#a8a29e'); // Warm Chennai urban earth/concrete
      }
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Deterministic procedural buildings & trees
    const rand = seededRandom(cx * 73856093 ^ cz * 19349663);
    const bList: { x: number; y: number; z: number; w: number; h: number; d: number; color: string }[] = [];
    const tList: { x: number; y: number; z: number; scale: number }[] = [];

    const bCount = isActiveDetail ? 16 : 8;
    for (let i = 0; i < bCount; i++) {
      const lx = (rand() - 0.5) * (CHUNK_SIZE - 30);
      const lz = (rand() - 0.5) * (CHUNK_SIZE - 30);
      const wx = originX + lx;
      const wz = originZ + lz;
      if (isInsideReservedZone(wx, wz)) continue;
      const h = 6 + rand() * 14;
      const w = 8 + rand() * 10;
      const d = 8 + rand() * 10;
      const ty = getTerrainHeight(wx, wz);
      bList.push({
        x: lx,
        y: ty + h / 2,
        z: lz,
        w,
        h,
        d,
        color: BUILDING_PALETTE[Math.floor(rand() * BUILDING_PALETTE.length)],
      });
    }

    const tCount = isActiveDetail ? 18 : 6;
    for (let i = 0; i < tCount; i++) {
      const lx = (rand() - 0.5) * (CHUNK_SIZE - 16);
      const lz = (rand() - 0.5) * (CHUNK_SIZE - 16);
      const wx = originX + lx;
      const wz = originZ + lz;
      if (Math.abs(wz - worldConfig.canalZ) < 28 || wx > worldConfig.coastStartX + 10) continue;
      if (wx > -175 && wx < -65 && wz > 20 && wz < 105) continue; // Keep TNHB courtyard clear
      const ty = getTerrainHeight(wx, wz);
      tList.push({ x: lx, y: ty, z: lz, scale: 0.8 + rand() * 0.6 });
    }

    return { terrainGeo: geo, buildings: bList, trees: tList };
  }, [cx, cz, originX, originZ, isActiveDetail]);

  const bMeshRef = useRef<THREE.InstancedMesh>(null);
  const tTrunkRef = useRef<THREE.InstancedMesh>(null);
  const tCrownRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    if (bMeshRef.current) {
      buildings.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.scale.set(b.w, b.h, b.d);
        dummy.updateMatrix();
        bMeshRef.current!.setMatrixAt(i, dummy.matrix);
        bMeshRef.current!.setColorAt(i, color.set(b.color));
      });
      bMeshRef.current.instanceMatrix.needsUpdate = true;
      if (bMeshRef.current.instanceColor) bMeshRef.current.instanceColor.needsUpdate = true;
    }

    if (tTrunkRef.current && tCrownRef.current) {
      trees.forEach((t, i) => {
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
  }, [buildings, trees]);

  const palmCrownGeo = useMemo(() => createPalmCrownGeo(), []);

  return (
    <group position={[originX, 0, originZ]}>
      {isActiveDetail ? (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[CHUNK_SIZE / 2, 1, CHUNK_SIZE / 2]} position={[0, -1, 0]} />
          <mesh geometry={terrainGeo} receiveShadow>
            <meshStandardMaterial vertexColors roughness={0.95} />
          </mesh>
        </RigidBody>
      ) : (
        <mesh geometry={terrainGeo} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.95} />
        </mesh>
      )}

      {buildings.length > 0 && (
        <instancedMesh
          ref={bMeshRef}
          args={[undefined, undefined, buildings.length]}
          castShadow={isActiveDetail}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.85} />
        </instancedMesh>
      )}

      {trees.length > 0 && (
        <>
          <instancedMesh ref={tTrunkRef} args={[undefined, undefined, trees.length]} castShadow={isActiveDetail}>
            <cylinderGeometry args={[0.25, 0.4, 4.4, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </instancedMesh>
          <instancedMesh ref={tCrownRef} args={[palmCrownGeo, undefined, trees.length]} castShadow={isActiveDetail}>
            <meshStandardMaterial color="#15803d" roughness={0.75} />
          </instancedMesh>
        </>
      )}
    </group>
  );
}
