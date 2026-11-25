import { useMemo } from 'react';
import worldConfig from '../config/world.json';
import { useGameStore } from '../systems/gameStore';
import { CityChunk } from './CityChunk';

export function ChunkManager() {
  const [pcx, pcz] = useGameStore((s) => s.currentChunk);
  const lodRadius = worldConfig.lodRadius; // 2 => 5x5 grid
  const activeRadius = worldConfig.activeRadius; // 1 => 3x3 grid

  const chunks = useMemo(() => {
    const list: { cx: number; cz: number; isActiveDetail: boolean }[] = [];
    for (let dx = -lodRadius; dx <= lodRadius; dx++) {
      for (let dz = -lodRadius; dz <= lodRadius; dz++) {
        const cx = pcx + dx;
        const cz = pcz + dz;
        if (cx >= 0 && cx < worldConfig.gridCount && cz >= 0 && cz < worldConfig.gridCount) {
          const isActiveDetail = Math.abs(dx) <= activeRadius && Math.abs(dz) <= activeRadius;
          list.push({ cx, cz, isActiveDetail });
        }
      }
    }
    return list;
  }, [pcx, pcz, lodRadius, activeRadius]);

  return (
    <group name="Chunk_Manager">
      {chunks.map((c) => (
        <CityChunk
          key={`${c.cx}_${c.cz}_${c.isActiveDetail ? 'hi' : 'lo'}`}
          cx={c.cx}
          cz={c.cz}
          isActiveDetail={c.isActiveDetail}
        />
      ))}

      {/* Bay of Bengal Ocean Plane (east coast) */}
      <mesh position={[1780, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[640, 4000]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
