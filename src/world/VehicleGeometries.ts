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

function wheel(x: number, y: number, z: number, r = 0.28, w = 0.18): THREE.BufferGeometry {
  return part(new THREE.CylinderGeometry(r, r, w, 14), x, y, z, 0, 0, Math.PI / 2);
}

export function createCarGeometries() {
  const body = mergeGeometries([
    // Lower sculpted sedan hull
    part(new THREE.BoxGeometry(1.8, 0.48, 3.9), 0, 0.5, 0),
    // Hood & trunk taper
    part(new THREE.BoxGeometry(1.72, 0.18, 1.0), 0, 0.78, 1.25, 0.12, 0, 0),
    // Upper cabin
    part(new THREE.BoxGeometry(1.46, 0.52, 1.95), 0, 1.02, -0.15),
    // Front & rear bumpers
    part(new THREE.BoxGeometry(1.84, 0.18, 0.18), 0, 0.34, 1.96),
    part(new THREE.BoxGeometry(1.84, 0.18, 0.18), 0, 0.34, -1.96),
  ])!;

  const trim = mergeGeometries([
    wheel(-0.9, 0.28, 1.2),
    wheel(0.9, 0.28, 1.2),
    wheel(-0.9, 0.28, -1.2),
    wheel(0.9, 0.28, -1.2),
    // Tinted glass cabin band & side mirrors
    part(new THREE.BoxGeometry(1.5, 0.38, 1.72), 0, 1.03, -0.15),
    part(new THREE.BoxGeometry(0.16, 0.1, 0.12), -0.92, 0.86, 0.55),
    part(new THREE.BoxGeometry(0.16, 0.1, 0.12), 0.92, 0.86, 0.55),
  ])!;

  const lights = mergeGeometries([
    // Front headlights
    part(new THREE.BoxGeometry(0.28, 0.14, 0.08), -0.62, 0.54, 1.96),
    part(new THREE.BoxGeometry(0.28, 0.14, 0.08), 0.62, 0.54, 1.96),
  ])!;

  return { body, trim, lights };
}

export function createAutoGeometries() {
  const body = mergeGeometries([
    // Main yellow lower body
    part(new THREE.BoxGeometry(1.38, 0.65, 2.15), 0, 0.56, -0.05),
    // Tapered front nose + mudguard
    part(new THREE.BoxGeometry(0.76, 0.62, 0.58), 0, 0.55, 1.15),
    part(new THREE.BoxGeometry(0.32, 0.14, 0.52), 0, 0.42, 1.18),
  ])!;

  const trim = mergeGeometries([
    // Black canopy top + support pillars
    part(new THREE.BoxGeometry(1.36, 0.68, 1.85), 0, 1.24, -0.18),
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), -0.64, 0.96, 0.72),
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), 0.64, 0.96, 0.72),
    // Windshield frame
    part(new THREE.BoxGeometry(1.0, 0.44, 0.06), 0, 1.05, 0.82, -0.22, 0, 0),
    // 3 Wheels
    wheel(0, 0.22, 1.12, 0.22, 0.16),
    wheel(-0.68, 0.22, -0.75, 0.22, 0.16),
    wheel(0.68, 0.22, -0.75, 0.22, 0.16),
  ])!;

  const lights = mergeGeometries([
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), 0, 0.62, 1.44, Math.PI / 2, 0, 0),
  ])!;

  return { body, trim, lights };
}

export function createBusGeometries() {
  const body = mergeGeometries([
    // Main MTC bus hull
    part(new THREE.BoxGeometry(2.34, 2.28, 7.8), 0, 1.54, 0),
    // Roof luggage / AC pods
    part(new THREE.BoxGeometry(1.5, 0.24, 2.2), 0, 2.78, 1.4),
    part(new THREE.BoxGeometry(1.5, 0.24, 2.2), 0, 2.78, -1.4),
    // Destination board brow
    part(new THREE.BoxGeometry(1.8, 0.28, 0.15), 0, 2.52, 3.88),
  ])!;

  const trim = mergeGeometries([
    // Window dark strip
    part(new THREE.BoxGeometry(2.38, 0.74, 7.0), 0, 1.92, 0.12),
    // Front & rear bumpers
    part(new THREE.BoxGeometry(2.4, 0.26, 0.22), 0, 0.45, 3.92),
    part(new THREE.BoxGeometry(2.4, 0.26, 0.22), 0, 0.45, -3.92),
    // 4 Heavy Bus wheels
    wheel(-1.14, 0.42, 2.35, 0.42, 0.28),
    wheel(1.14, 0.42, 2.35, 0.42, 0.28),
    wheel(-1.14, 0.42, -2.35, 0.42, 0.28),
    wheel(1.14, 0.42, -2.35, 0.42, 0.28),
  ])!;

  const lights = mergeGeometries([
    part(new THREE.BoxGeometry(0.32, 0.18, 0.08), -0.82, 0.72, 3.92),
    part(new THREE.BoxGeometry(0.32, 0.18, 0.08), 0.82, 0.72, 3.92),
  ])!;

  return { body, trim, lights };
}

export function createBikeGeometries() {
  const body = mergeGeometries([
    // Scooter body/seat
    part(new THREE.BoxGeometry(0.42, 0.36, 1.25), 0, 0.56, -0.05),
    // Front shield
    part(new THREE.BoxGeometry(0.34, 0.64, 0.24), 0, 0.88, 0.48, -0.2, 0, 0),
    // Rear grab rail
    part(new THREE.BoxGeometry(0.36, 0.06, 0.22), 0, 0.78, -0.62),
  ])!;

  const trim = mergeGeometries([
    // Seat cushion
    part(new THREE.BoxGeometry(0.36, 0.12, 0.72), 0, 0.78, -0.15),
    // Handlebars + mirrors
    part(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 6), 0, 1.18, 0.42, 0, 0, Math.PI / 2),
    part(new THREE.BoxGeometry(0.1, 0.08, 0.04), -0.32, 1.28, 0.42),
    part(new THREE.BoxGeometry(0.1, 0.08, 0.04), 0.32, 1.28, 0.42),
    // 2 Wheels
    wheel(0, 0.24, 0.58, 0.24, 0.12),
    wheel(0, 0.24, -0.54, 0.24, 0.12),
  ])!;

  const lights = mergeGeometries([
    part(new THREE.SphereGeometry(0.09, 8, 8), 0, 1.02, 0.6),
  ])!;

  return { body, trim, lights };
}
