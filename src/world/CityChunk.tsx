import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import worldConfig from '../config/world.json';
import { getTerrainHeight, seededRandom } from './TerrainHeight';
import { createChennaiBuildingGeos, createPalmCrownGeo, createUtilityPoleGeo } from './ChennaiArchitecture';
import {
  getAsphaltNormalMap,
  getChennaiFacadeNormalMap,
  getChennaiFacadeTexture,
  getTerrainDetailTexture,
} from './ProceduralTextures';

interface CityChunkProps {
  cx: number;
  cz: number;
  isActiveDetail: boolean;
}

const CHUNK_SIZE = worldConfig.chunkSize; // 250
const HALF_WORLD = worldConfig.worldSize / 2; // 2000
const CHENNAI_PALETTE = ['#fde68a', '#fda4af', '#7dd3fc', '#6ee7b7', '#fdba74', '#fef3c7', '#f9a8d4'];

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
    const bList: { x: number; y: number; z: number; w: number; h: number; d: number; rotY: number; color: string }[] = [];
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
  const tTrunkRef = useRef<THREE.InstancedMesh>(null);
  const tCrownRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);

  const buildingGeos = useMemo(() => createChennaiBuildingGeos(), []);
  const facadeTex = useMemo(() => getChennaiFacadeTexture(), []);
  const facadeNormal = useMemo(() => getChennaiFacadeNormalMap(), []);
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
