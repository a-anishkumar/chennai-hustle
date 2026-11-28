/**
 * BesantNagarRoads — Real OpenStreetMap road network for Besant Nagar / Adyar / Chennai
 *
 * Data source: © OpenStreetMap contributors — https://www.openstreetmap.org/copyright
 * Licence: ODbL 1.0 — https://opendatacommons.org/licenses/odbl/
 *
 * Road segments were processed from raw Overpass API JSON by
 * scripts/processOsmRoads.mjs using the GIS conversion defined in
 * src/config/gis.ts (origin: 13.0005°N 80.2700°E).
 *
 * Performance: rendered as a single InstancedMesh per road width-class with
 * frustumCulled={false} and delta-checked 550m visibility culling inside useFrame
 * (properly restoring full transforms when segments re-enter player range).
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';
import { getAsphaltNormalMap, getAsphaltTexture } from './ProceduralTextures';
import rawSegments from '../config/besant_nagar_road_segments.json';

type Seg = {
  x: number;
  z: number;
  len: number;
  rot: number;
  w: number;
  hw: string;
  name: string;
};

/** Skip segments intersecting core hand-crafted plazas, Cooum Canal water, airport, or Bay of Bengal */
function isExcludedZone(s: Seg): boolean {
  // TNHB courtyard pad (-165..-75, z: 20..100)
  if (s.x > -166 && s.x < -74 && s.z > 20 && s.z < 100) return true;
  // Cooum Canal water channel (z ≈ 180, width 48)
  if (Math.abs(s.z - 180) < 26) return true;
  // Railway track right-of-way (z ≈ -196)
  if (Math.abs(s.z + 196) < 8) return true;
  // Airport runway apron (-1020..-680, z: 330..490)
  if (s.x > -1020 && s.x < -680 && s.z > 330 && s.z < 490) return true;
  // Bay of Bengal coast
  if (s.x > 1425) return true;
  return false;
}

const segments = (rawSegments as Seg[]).filter((s) => !isExcludedZone(s));

const PRIMARY_HW = new Set(['primary', 'primary_link', 'secondary', 'secondary_link', 'trunk', 'motorway']);
const TERTIARY_HW = new Set(['tertiary', 'tertiary_link', 'residential', 'living_street']);

function groupBy(segs: Seg[]) {
  const primary: Seg[] = [];
  const tertiary: Seg[] = [];
  const service: Seg[] = [];
  for (const s of segs) {
    if (PRIMARY_HW.has(s.hw)) primary.push(s);
    else if (TERTIARY_HW.has(s.hw)) tertiary.push(s);
    else service.push(s);
  }
  return { primary, tertiary, service };
}

const GROUP_WIDTH = { primary: 13.5, tertiary: 8.0, service: 4.0 };
const CULL_RADIUS = 560;
const CULL_R2 = CULL_RADIUS * CULL_RADIUS;
const CULL_MOVE_THRESHOLD_2 = 22 * 22;

function setSegmentMatrix(
  mesh: THREE.InstancedMesh,
  index: number,
  s: Seg,
  width: number,
  yOffset: number,
  dummy: THREE.Object3D,
  visible: boolean
) {
  if (visible) {
    dummy.position.set(s.x, yOffset, s.z);
    dummy.rotation.set(-Math.PI / 2, 0, s.rot);
    dummy.scale.set(width, s.len, 1);
  } else {
    dummy.position.set(s.x, -50, s.z);
    dummy.rotation.set(-Math.PI / 2, 0, s.rot);
    dummy.scale.set(0, 0, 0);
  }
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

function RoadGroup({
  segs,
  width,
  yOffset,
  roughness,
  metalness,
  name,
}: {
  segs: Seg[];
  width: number;
  yOffset: number;
  roughness: number;
  metalness: number;
  name: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const visStateRef = useRef<Uint8Array | null>(null);
  const lastCullRef = useRef<[number, number]>([Number.NaN, Number.NaN]);

  const { tex, norm } = useMemo(() => {
    const t = getAsphaltTexture().clone();
    t.needsUpdate = true;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 2);
    const n = getAsphaltNormalMap().clone();
    n.needsUpdate = true;
    n.wrapS = THREE.RepeatWrapping;
    n.wrapT = THREE.RepeatWrapping;
    n.repeat.set(2, 4);
    return { tex: t, norm: n };
  }, []);

  useEffect(() => {
    return () => {
      tex.dispose();
      norm.dispose();
    };
  }, [tex, norm]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || segs.length === 0) return;

    const vis = new Uint8Array(segs.length);
    const [px, , pz] = useGameStore.getState().playerPos;
    lastCullRef.current = [px, pz];

    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const dx = s.x - px;
      const dz = s.z - pz;
      const inRange = dx * dx + dz * dz < CULL_R2;
      vis[i] = inRange ? 1 : 0;
      setSegmentMatrix(mesh, i, s, width, yOffset, dummy, inRange);
    }
    visStateRef.current = vis;
    mesh.instanceMatrix.needsUpdate = true;
  }, [segs, width, yOffset, dummy]);

  useFrame(() => {
    const mesh = meshRef.current;
    const vis = visStateRef.current;
    if (!mesh || !vis || segs.length === 0) return;

    const [px, , pz] = useGameStore.getState().playerPos;
    const [lx, lz] = lastCullRef.current;
    const moved2 = Number.isNaN(lx) ? Number.POSITIVE_INFINITY : (px - lx) * (px - lx) + (pz - lz) * (pz - lz);
    if (moved2 < CULL_MOVE_THRESHOLD_2) return;

    lastCullRef.current = [px, pz];
    let dirty = false;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const dx = s.x - px;
      const dz = s.z - pz;
      const inRange = dx * dx + dz * dz < CULL_R2 ? 1 : 0;
      if (inRange !== vis[i]) {
        vis[i] = inRange;
        setSegmentMatrix(mesh, i, s, width, yOffset, dummy, inRange === 1);
        dirty = true;
      }
    }
    if (dirty) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  if (segs.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, segs.length]}
      frustumCulled={false}
      receiveShadow
      name={`OSMRoads_${name}`}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={tex}
        normalMap={norm}
        roughness={roughness}
        metalness={metalness}
      />
    </instancedMesh>
  );
}

export function BesantNagarRoads() {
  const { primary, tertiary, service } = useMemo(() => groupBy(segments), []);

  const quality = useGameStore((s) => s.quality);
  const weather = useGameStore((s) => s.weather);
  const wet = weather === 'monsoon' || weather === 'flood';
  const baseRoughness = wet ? 0.16 : 0.85;
  const baseMetalness = wet ? 0.42 : 0.04;

  return (
    <group name="BesantNagar_OSM_Roads">
      <RoadGroup segs={primary} width={GROUP_WIDTH.primary} yOffset={0.024} roughness={baseRoughness} metalness={baseMetalness} name="primary" />
      <RoadGroup segs={tertiary} width={GROUP_WIDTH.tertiary} yOffset={0.022} roughness={baseRoughness} metalness={baseMetalness} name="tertiary" />
      {quality !== 'low' && (
        <RoadGroup segs={service} width={GROUP_WIDTH.service} yOffset={0.020} roughness={baseRoughness} metalness={baseMetalness} name="service" />
      )}
    </group>
  );
}
