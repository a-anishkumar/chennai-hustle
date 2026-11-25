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
 * Realistic multi-part Chennai building geometry (unit 1x1x1 base scaled per instance):
 * - body: main block + stepped upper setback + rooftop stair headroom (motta maadi)
 * - trim: concrete cornice slabs, ground-floor pillars, window chajjas, rooftop parapet
 * - details: rooftop Sintex water tank, AC outdoor units, ground-floor shop awning
 */
export function createChennaiBuildingGeos() {
  const body = mergeGeometries([
    // Main structure (y: 0..0.95)
    part(new THREE.BoxGeometry(0.96, 0.95, 0.96), 0, 0.475, 0),
    // Rooftop stair headroom (motta maadi)
    part(new THREE.BoxGeometry(0.28, 0.2, 0.28), -0.22, 1.08, -0.2),
  ])!;

  const trim = mergeGeometries([
    // Ground-floor corner pillars
    part(new THREE.BoxGeometry(0.08, 0.28, 0.08), -0.47, 0.14, 0.47),
    part(new THREE.BoxGeometry(0.08, 0.28, 0.08), 0.47, 0.14, 0.47),
    part(new THREE.BoxGeometry(0.08, 0.28, 0.08), -0.47, 0.14, -0.47),
    part(new THREE.BoxGeometry(0.08, 0.28, 0.08), 0.47, 0.14, -0.47),
    // Mid & top floor concrete cornice ledges
    part(new THREE.BoxGeometry(1.02, 0.035, 1.02), 0, 0.3, 0),
    part(new THREE.BoxGeometry(1.02, 0.035, 1.02), 0, 0.62, 0),
    // Rooftop parapet rim
    part(new THREE.BoxGeometry(1.04, 0.07, 1.04), 0, 0.985, 0),
    // Window chajja sunshades (front & back)
    part(new THREE.BoxGeometry(0.84, 0.025, 0.1), 0, 0.78, 0.51),
    part(new THREE.BoxGeometry(0.84, 0.025, 0.1), 0, 0.48, 0.51),
    part(new THREE.BoxGeometry(0.84, 0.025, 0.1), 0, 0.78, -0.51),
  ])!;

  const details = mergeGeometries([
    // Rooftop Sintex-style water tank
    part(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 10), 0.25, 1.08, 0.2),
    // AC outdoor compressor units
    part(new THREE.BoxGeometry(0.12, 0.1, 0.07), -0.32, 0.54, 0.51),
    part(new THREE.BoxGeometry(0.12, 0.1, 0.07), 0.32, 0.54, 0.51),
    // Ground-floor shop awning
    part(new THREE.BoxGeometry(0.88, 0.03, 0.2), 0, 0.24, 0.55, 0.35, 0, 0),
  ])!;

  return { body, trim, details };
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
