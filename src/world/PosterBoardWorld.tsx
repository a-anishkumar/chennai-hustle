import { useMemo } from 'react';
import * as THREE from 'three';
import brands from '../config/brands.json';
import { useGameStore } from '../systems/gameStore';

function makeBannerTexture(title: string, slogan: string, bg: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 248, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.slice(0, 20), 128, 52);

  ctx.fillStyle = accent;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(slogan.slice(0, 28), 128, 88);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const FLEX_LOCATIONS: { x: number; z: number; rotY: number; idx: number }[] = [
  { x: -175, z: -105, rotY: 0.4, idx: 0 }, // North-West Road Loop
  { x: 25, z: -105, rotY: -0.4, idx: 1 },  // North-East Road Loop
  { x: -120, z: 112, rotY: 0, idx: 2 },    // TNHB Gate
  { x: -460, z: -295, rotY: 0.2, idx: 0 }, // Kaveri Theatre
  { x: 380, z: 830, rotY: 0, idx: 3 },     // Fan House
];

export function PosterBoardWorld() {
  const pastedPosters = useGameStore((s) => s.pastedPosters);

  const bannerTextures = useMemo(() => {
    const all = [...brands.campaigns.films, ...brands.campaigns.parties];
    return all.map((c) => makeBannerTexture(c.name, c.slogan, c.color, c.accent));
  }, []);

  return (
    <group name="Poster_And_Banner_Culture">
      {/* Procedural Flex Banners & Cut-outs at Junctions */}
      {FLEX_LOCATIONS.map((loc, i) => (
        <group key={i} position={[loc.x, 0, loc.z]} rotation={[0, loc.rotY, 0]}>
          {/* Bamboo/Steel Frame Poles */}
          <mesh position={[-3.2, 3.0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 6, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[3.2, 3.0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 6, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Flex Banner */}
          <mesh position={[0, 4.2, 0]} castShadow>
            <boxGeometry args={[6.2, 3.1, 0.12]} />
            <meshStandardMaterial map={bannerTextures[loc.idx % bannerTextures.length]} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Persistent Player-Pasted Posters */}
      {pastedPosters.map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]} rotation={[0, p.rotY, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 2.2, 0.08]} />
            <meshStandardMaterial color={p.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.4, 0.05]}>
            <boxGeometry args={[1.2, 0.5, 0.04]} />
            <meshStandardMaterial color={p.accent} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
