import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function part(geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (rx || ry || rz) g.rotateX(rx), g.rotateY(ry), g.rotateZ(rz);
  g.translate(x, y, z);
  return g;
}

function wheel(x: number, y: number, z: number, r = 0.28, w = 0.18): THREE.BufferGeometry {
  return part(new THREE.CylinderGeometry(r, r, w, 12), x, y, z, 0, 0, Math.PI / 2);
}

export function createCarGeometries() {
  const body = mergeGeometries([
    // Lower chassis
    part(new THREE.BoxGeometry(1.78, 0.52, 3.8), 0, 0.52, 0),
    // Upper cabin
    part(new THREE.BoxGeometry(1.48, 0.52, 2.0), 0, 1.02, -0.15),
    // Front bumper
    part(new THREE.BoxGeometry(1.82, 0.2, 0.2), 0, 0.36, 1.92),
  ])!;

  const trim = mergeGeometries([
    wheel(-0.88, 0.28, 1.15),
    wheel(0.88, 0.28, 1.15),
    wheel(-0.88, 0.28, -1.15),
    wheel(0.88, 0.28, -1.15),
    // Windshield & rear glass dark band
    part(new THREE.BoxGeometry(1.5, 0.36, 1.7), 0, 1.04, -0.12),
  ])!;

  return { body, trim };
}

export function createAutoGeometries() {
  const body = mergeGeometries([
    // Main yellow lower body
    part(new THREE.BoxGeometry(1.38, 0.65, 2.15), 0, 0.56, -0.05),
    // Tapered front nose
    part(new THREE.BoxGeometry(0.75, 0.62, 0.55), 0, 0.55, 1.15),
  ])!;

  const trim = mergeGeometries([
    // Black canopy top
    part(new THREE.BoxGeometry(1.36, 0.68, 1.85), 0, 1.22, -0.18),
    // 3 Wheels
    wheel(0, 0.22, 1.05, 0.22, 0.16),
    wheel(-0.68, 0.22, -0.75, 0.22, 0.16),
    wheel(0.68, 0.22, -0.75, 0.22, 0.16),
  ])!;

  return { body, trim };
}

export function createBusGeometries() {
  const body = mergeGeometries([
    // Main MTC bus hull
    part(new THREE.BoxGeometry(2.3, 2.25, 7.6), 0, 1.52, 0),
    // Roof luggage / vent pod
    part(new THREE.BoxGeometry(1.6, 0.22, 5.2), 0, 2.75, -0.2),
  ])!;

  const trim = mergeGeometries([
    // Window dark strip
    part(new THREE.BoxGeometry(2.34, 0.72, 6.8), 0, 1.9, 0.1),
    // 4 Bus wheels
    wheel(-1.12, 0.42, 2.3, 0.42, 0.26),
    wheel(1.12, 0.42, 2.3, 0.42, 0.26),
    wheel(-1.12, 0.42, -2.3, 0.42, 0.26),
    wheel(1.12, 0.42, -2.3, 0.42, 0.26),
  ])!;

  return { body, trim };
}

export function createBikeGeometries() {
  const body = mergeGeometries([
    // Scooter body/seat
    part(new THREE.BoxGeometry(0.42, 0.36, 1.25), 0, 0.56, -0.05),
    // Front shield
    part(new THREE.BoxGeometry(0.32, 0.62, 0.24), 0, 0.88, 0.48, -0.2, 0, 0),
  ])!;

  const trim = mergeGeometries([
    // Handlebars
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 6), 0, 1.18, 0.42, 0, 0, Math.PI / 2),
    // 2 Wheels
    wheel(0, 0.24, 0.56, 0.24, 0.12),
    wheel(0, 0.24, -0.52, 0.24, 0.12),
  ])!;

  return { body, trim };
}
