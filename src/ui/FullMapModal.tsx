import { useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import worldConfig from '../config/world.json';
import { useGameStore } from '../systems/gameStore';

const MAP_PX = 520;
const HALF = worldConfig.worldSize / 2; // 2000

export function FullMapModal() {
  const showFullMap = useGameStore((s) => s.showFullMap);
  const setShowFullMap = useGameStore((s) => s.setShowFullMap);
  const playerPos = useGameStore((s) => s.playerPos);
  const activeJob = useGameStore((s) => s.activeJob);
  const fastTravelUnlocked = useGameStore((s) => s.fastTravelUnlocked);
  const fastTravelTo = useGameStore((s) => s.fastTravelTo);

  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);

  if (!showFullMap) return null;

  const toPx = (wx: number, wz: number): [number, number] => [
    ((wx + HALF) / worldConfig.worldSize) * MAP_PX,
    ((wz + HALF) / worldConfig.worldSize) * MAP_PX,
  ];

  const [px, pz] = toPx(playerPos[0], playerPos[2]);
  const [, canalY] = toPx(0, worldConfig.canalZ);
  const [coastX] = toPx(worldConfig.coastStartX, 0);
  const [, railY] = toPx(0, -196);

  const jobTarget = activeJob ? (activeJob.stage === 'pickup' ? activeJob.pickupPos : activeJob.dropoffPos) : null;
  const jobTargetPx = jobTarget ? toPx(jobTarget[0], jobTarget[2]) : null;

  const viewSize = MAP_PX / zoom;
  const vx = Math.max(0, Math.min(MAP_PX - viewSize, px - viewSize / 2));
  const vy = Math.max(0, Math.min(MAP_PX - viewSize, pz - viewSize / 2));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(2, 6, 23, 0.86)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: expanded ? 8 : 16,
      }}
      data-testid="full-map-modal"
    >
      <div
        className="hud-pill"
        style={{
          padding: 16,
          background: '#0f172a',
          maxWidth: expanded ? '96vw' : 620,
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fde047' }}>Chennai City Full Map (4 km × 4 km)</h3>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {fastTravelUnlocked
                ? 'Tap any landmark pin to Fast-Travel!'
                : 'Climb Chennai Lighthouse (1420, 360) to unlock Fast-Travel'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => setZoom((z) => Math.min(4, z * 1.4))}
              title="Zoom In"
              data-testid="map-zoom-in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => setZoom((z) => Math.max(1, z / 1.4))}
              title="Zoom Out"
              data-testid="map-zoom-out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => setZoom(1)}
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => setExpanded((e) => !e)}
              title={expanded ? 'Compact Map' : 'Expand Map'}
              data-testid="map-expand-btn"
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={() => setShowFullMap(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 4 }}
              aria-label="Close Full Map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <svg
          viewBox={`${zoom === 1 ? 0 : vx} ${zoom === 1 ? 0 : vy} ${viewSize} ${viewSize}`}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: expanded ? '82vh' : '68vh',
            background: '#1e293b',
            borderRadius: 12,
            display: 'block',
          }}
        >
          {/* Bay of Bengal Ocean */}
          <rect x={coastX} y={0} width={MAP_PX - coastX} height={MAP_PX} fill="#0284c7" opacity={0.65} />
          {/* Marina Sand Strip */}
          <rect x={coastX - 12} y={0} width={12} height={MAP_PX} fill="#eab308" opacity={0.55} />
          {/* Cooum Canal */}
          <rect x={0} y={canalY - 4} width={coastX} height={8} fill="#0d9488" opacity={0.75} />
          {/* Railway Line */}
          <line x1={0} y1={railY} x2={coastX} y2={railY} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 3" />

          {/* Active GPS Route */}
          {jobTargetPx && (
            <line
              x1={px}
              y1={pz}
              x2={jobTargetPx[0]}
              y2={jobTargetPx[1]}
              stroke={activeJob?.stage === 'pickup' ? '#f59e0b' : '#22c55e'}
              strokeWidth={2.5 / zoom}
              strokeDasharray="4 3"
            />
          )}

          {/* All Landmarks */}
          {worldConfig.landmarks.map((lm) => {
            const [lx, lz] = toPx(lm.x, lm.z);
            return (
              <g
                key={lm.id}
                style={{ cursor: fastTravelUnlocked ? 'pointer' : 'default' }}
                onClick={() => {
                  if (fastTravelUnlocked) {
                    fastTravelTo(lm.x, lm.z, lm.name);
                    setShowFullMap(false);
                  }
                }}
              >
                <circle cx={lx} cy={lz} r={5 / zoom} fill="#f59e0b" stroke="#0f172a" strokeWidth={1.5 / zoom} />
                <text x={lx + 7 / zoom} y={lz + 3 / zoom} fontSize={9 / zoom} fill="#e2e8f0" fontWeight={600}>
                  {lm.name.split('(')[0].trim().slice(0, 22)}
                </text>
              </g>
            );
          })}

          {/* Player Position */}
          <circle cx={px} cy={pz} r={6 / zoom} fill="#38bdf8" stroke="#ffffff" strokeWidth={2 / zoom} />
        </svg>
      </div>
    </div>
  );
}
