import { Maximize2 } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';
import worldConfig from '../config/world.json';

const MAP_SIZE = 136;
const VIEW_RANGE = 260; // meters half-width

export function Minimap() {
  const playerPos = useGameStore((s) => s.playerPos);
  const playerRotY = useGameStore((s) => s.playerRotY);
  const activeJob = useGameStore((s) => s.activeJob);
  const waypoint = useGameStore((s) => s.waypoint);
  const toggleFullMap = useGameStore((s) => s.toggleFullMap);

  const [px, , pz] = playerPos;

  const toMap = (wx: number, wz: number): [number, number] => {
    const mx = ((wx - px) / VIEW_RANGE) * (MAP_SIZE / 2) + MAP_SIZE / 2;
    const mz = ((wz - pz) / VIEW_RANGE) * (MAP_SIZE / 2) + MAP_SIZE / 2;
    return [mx, mz];
  };

  const targetPos = activeJob
    ? activeJob.stage === 'pickup'
      ? activeJob.pickupPos
      : activeJob.dropoffPos
    : null;
  const targetMap = targetPos ? toMap(targetPos[0], targetPos[2]) : null;
  const wpMap = waypoint ? toMap(waypoint.x, waypoint.z) : null;

  const [rx1, rz1] = toMap(-190, -120);
  const [rx2, rz2] = toMap(40, 140);
  const [, canalY] = toMap(0, worldConfig.canalZ);
  const [tnhbX, tnhbZ] = toMap(-120, 60);

  return (
    <div
      className="hud-pill"
      style={{
        position: 'relative',
        width: MAP_SIZE + 8,
        height: MAP_SIZE + 8,
        padding: 4,
        borderRadius: 16,
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={() => toggleFullMap()}
        title="Expand Full Map [M]"
        data-testid="expand-minimap-btn"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          color: '#fde047',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Maximize2 size={12} />
      </button>
      <svg width={MAP_SIZE} height={MAP_SIZE} style={{ background: '#0f172a', borderRadius: 12, display: 'block' }}>
        {/* Canal */}
        <rect x={0} y={canalY - 8} width={MAP_SIZE} height={16} fill="#0e7490" opacity={0.7} />

        {/* Road Loop */}
        <rect
          x={rx1}
          y={rz1}
          width={Math.max(1, rx2 - rx1)}
          height={Math.max(1, rz2 - rz1)}
          fill="none"
          stroke="#475569"
          strokeWidth={5}
        />

        {/* TNHB Colony */}
        <rect x={tnhbX - 16} y={tnhbZ - 14} width={32} height={28} rx={3} fill="#d97706" opacity={0.45} />

        {/* Landmarks */}
        {worldConfig.landmarks.map((lm) => {
          const [lx, lz] = toMap(lm.x, lm.z);
          return <circle key={lm.id} cx={lx} cy={lz} r={3} fill="#94a3b8" />;
        })}

        {/* GPS Route Line & Target Pin */}
        {targetMap && (
          <>
            <line
              x1={MAP_SIZE / 2}
              y1={MAP_SIZE / 2}
              x2={targetMap[0]}
              y2={targetMap[1]}
              stroke={activeJob?.stage === 'pickup' ? '#f59e0b' : '#22c55e'}
              strokeWidth={2.5}
              strokeDasharray="4 3"
            />
            <circle
              cx={Math.max(6, Math.min(MAP_SIZE - 6, targetMap[0]))}
              cy={Math.max(6, Math.min(MAP_SIZE - 6, targetMap[1]))}
              r={5}
              fill={activeJob?.stage === 'pickup' ? '#f59e0b' : '#22c55e'}
              stroke="#fff"
              strokeWidth={1.5}
            />
          </>
        )}

        {/* Custom Waypoint GPS Line */}
        {wpMap && (
          <>
            <line
              x1={MAP_SIZE / 2}
              y1={MAP_SIZE / 2}
              x2={wpMap[0]}
              y2={wpMap[1]}
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
            <circle
              cx={Math.max(6, Math.min(MAP_SIZE - 6, wpMap[0]))}
              cy={Math.max(6, Math.min(MAP_SIZE - 6, wpMap[1]))}
              r={4}
              fill="#22d3ee"
              stroke="#fff"
              strokeWidth={1.2}
            />
          </>
        )}

        {/* Player Heading Arrow */}
        <g transform={`translate(${MAP_SIZE / 2}, ${MAP_SIZE / 2}) rotate(${(-playerRotY * 180) / Math.PI + 180})`}>
          <polygon points="0,-7 5,5 0,2 -5,5" fill="#38bdf8" stroke="#fff" strokeWidth={1} />
        </g>
      </svg>
    </div>
  );
}
