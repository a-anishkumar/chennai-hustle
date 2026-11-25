import { X } from 'lucide-react';
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(2, 6, 23, 0.84)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      data-testid="full-map-modal"
    >
      <div className="hud-pill" style={{ padding: 18, background: '#0f172a', maxWidth: 580, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fde047' }}>Chennai City Full Map (4 km × 4 km)</h3>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {fastTravelUnlocked
                ? 'Tap any landmark pin to Fast-Travel!'
                : 'Climb Chennai Lighthouse (1420, 360) to unlock Fast-Travel'}
            </div>
          </div>
          <button
            onClick={() => setShowFullMap(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close Full Map"
          >
            <X size={18} />
          </button>
        </div>

        <svg
          viewBox={`0 0 ${MAP_PX} ${MAP_PX}`}
          style={{ width: '100%', height: 'auto', maxHeight: '72vh', background: '#1e293b', borderRadius: 12, display: 'block' }}
        >
          {/* Bay of Bengal Ocean */}
          <rect x={coastX} y={0} width={MAP_PX - coastX} height={MAP_PX} fill="#0284c7" opacity={0.65} />
          {/* Marina Sand Strip */}
          <rect x={coastX - 12} y={0} width={12} height={MAP_PX} fill="#eab308" opacity={0.55} />
          {/* Canal */}
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
              strokeWidth={2.5}
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
                <circle cx={lx} cy={lz} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1.5} />
                <text x={lx + 7} y={lz + 3} fontSize={9} fill="#e2e8f0" fontWeight={600}>
                  {lm.name.split('(')[0].trim().slice(0, 22)}
                </text>
              </g>
            );
          })}

          {/* Player Position */}
          <circle cx={px} cy={pz} r={6} fill="#38bdf8" stroke="#ffffff" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}
