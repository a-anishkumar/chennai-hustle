import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function part(geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (rx || ry || rz) {
    g.rotateX(rx);
    g.rotateY(ry);
    g.rotateZ(rz);
  }
  g.translate(x, y, z);
  return g;
}

/**
 * Sculpted Chennai low-rise building (unit 1x1x1 base scaled per instance):
 * includes main block, rooftop parapet, stair headroom, and window chajja sunshades.
 */
export function createChennaiBuildingGeos() {
  const body = mergeGeometries([
    // Main structure (centered y = 0.5)
    part(new THREE.BoxGeometry(1, 1, 1), 0, 0.5, 0),
    // Rooftop parapet rim
    part(new THREE.BoxGeometry(1.04, 0.08, 1.04), 0, 1.02, 0),
    // Rooftop stair headroom (motta maadi)
    part(new THREE.BoxGeometry(0.28, 0.22, 0.28), -0.22, 1.12, -0.2),
    // Tropical window chajja sunshades (front & back)
    part(new THREE.BoxGeometry(0.86, 0.04, 0.1), 0, 0.68, 0.53),
    part(new THREE.BoxGeometry(0.86, 0.04, 0.1), 0, 0.36, 0.53),
    part(new THREE.BoxGeometry(0.86, 0.04, 0.1), 0, 0.68, -0.53),
  ])!;

  const details = mergeGeometries([
    // Dark window bands on front/back
    part(new THREE.BoxGeometry(0.22, 0.18, 0.04), -0.26, 0.58, 0.51),
    part(new THREE.BoxGeometry(0.22, 0.18, 0.04), 0.26, 0.58, 0.51),
    part(new THREE.BoxGeometry(0.22, 0.18, 0.04), -0.26, 0.26, 0.51),
    part(new THREE.BoxGeometry(0.22, 0.18, 0.04), 0.26, 0.26, 0.51),
    // Rooftop Sintex-style water tank
    part(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 8), 0.25, 1.12, 0.2),
    // Ground-floor shop awning
    part(new THREE.BoxGeometry(0.9, 0.04, 0.22), 0, 0.14, 0.58, 0.35, 0, 0),
  ])!;

  return { body, details };
}

export function createPalmCrownGeo(): THREE.BufferGeometry {
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

export function createUtilityPoleGeo(): THREE.BufferGeometry {
  return mergeGeometries([
    part(new THREE.CylinderGeometry(0.1, 0.14, 6.2, 6), 0, 3.1, 0),
    part(new THREE.BoxGeometry(1.4, 0.1, 0.1), 0, 5.8, 0),
  ])!;
}
