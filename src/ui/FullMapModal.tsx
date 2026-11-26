import { useMemo, useRef, useState } from 'react';
import { Crosshair, Maximize2, Minimize2, Navigation, RotateCcw, Search, X, ZoomIn, ZoomOut } from 'lucide-react';
import worldConfig from '../config/world.json';
import { useGameStore } from '../systems/gameStore';

const MAP_PX = 520;
const HALF = worldConfig.worldSize / 2; // 2000

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'transit', label: 'Transit' },
  { id: 'civic', label: 'Civic' },
  { id: 'shop', label: 'Shops & Food' },
  { id: 'fun', label: 'Beach & Fun' },
] as const;

function matchesCategory(type: string, cat: string): boolean {
  if (cat === 'all') return true;
  if (cat === 'transit') return type === 'transit' || type === 'harbour';
  if (cat === 'civic') return type === 'civic' || type === 'temple';
  if (cat === 'shop') return type === 'shop' || type === 'mall' || type === 'teashop' || type === 'hotel';
  if (cat === 'fun') return type === 'beach' || type === 'lighthouse' || type === 'park' || type === 'entertainment' || type === 'cinema' || type === 'fanhouse';
  return true;
}

export function FullMapModal() {
  const showFullMap = useGameStore((s) => s.showFullMap);
  const setShowFullMap = useGameStore((s) => s.setShowFullMap);
  const playerPos = useGameStore((s) => s.playerPos);
  const activeJob = useGameStore((s) => s.activeJob);
  const waypoint = useGameStore((s) => s.waypoint);
  const setWaypoint = useGameStore((s) => s.setWaypoint);
  const fastTravelUnlocked = useGameStore((s) => s.fastTravelUnlocked);
  const fastTravelTo = useGameStore((s) => s.fastTravelTo);

  const [zoom, setZoom] = useState(1.6);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number; moved: boolean }>({
    active: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
    moved: false,
  });
  const svgRef = useRef<SVGSVGElement>(null);

  const toPx = (wx: number, wz: number): [number, number] => [
    ((wx + HALF) / worldConfig.worldSize) * MAP_PX,
    ((wz + HALF) / worldConfig.worldSize) * MAP_PX,
  ];

  const [px, pz] = toPx(playerPos[0], playerPos[2]);
  const [, canalY] = toPx(0, worldConfig.canalZ);
  const [coastX] = toPx(worldConfig.coastStartX, 0);
  const [, railY] = toPx(0, -196);

  const filteredLandmarks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return worldConfig.landmarks
      .filter((lm) => matchesCategory(lm.type, category) && (!q || lm.name.toLowerCase().includes(q)))
      .map((lm) => ({
        ...lm,
        dist: Math.round(Math.hypot(lm.x - playerPos[0], lm.z - playerPos[2])),
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [search, category, playerPos]);

  if (!showFullMap) return null;

  const jobTarget = activeJob ? (activeJob.stage === 'pickup' ? activeJob.pickupPos : activeJob.dropoffPos) : null;
  const jobTargetPx = jobTarget ? toPx(jobTarget[0], jobTarget[2]) : null;
  const wpPx = waypoint ? toPx(waypoint.x, waypoint.z) : null;

  const viewSize = MAP_PX / zoom;
  const vx = Math.max(0, Math.min(MAP_PX - viewSize, px + panOffset.x - viewSize / 2));
  const vy = Math.max(0, Math.min(MAP_PX - viewSize, pz + panOffset.y - viewSize / 2));

  const focusOnWorld = (wx: number, wz: number, targetZoom = 2.8) => {
    const [tx, tz] = toPx(wx, wz);
    setZoom(targetZoom);
    setPanOffset({ x: tx - px, y: tz - pz });
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragRef.current.moved || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    const mapX = (zoom === 1 ? 0 : vx) + rx * viewSize;
    const mapY = (zoom === 1 ? 0 : vy) + ry * viewSize;
    const wx = Math.round((mapX / MAP_PX) * worldConfig.worldSize - HALF);
    const wz = Math.round((mapY / MAP_PX) * worldConfig.worldSize - HALF);
    setWaypoint({ x: wx, z: wz, label: `Custom Pin (${wx}, ${wz})` });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(2, 6, 23, 0.88)',
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
          padding: 14,
          background: '#0f172a',
          maxWidth: expanded ? '96vw' : 920,
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fde047' }}>Chennai Interactive City Map (4 km × 4 km)</h3>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Drag to pan • Scroll to zoom • Click any place or empty spot to set GPS Waypoint
              {fastTravelUnlocked ? ' • Fast-Travel Unlocked!' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => setZoom((z) => Math.min(6, z * 1.4))}
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
              style={{ padding: '4px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => {
                setPanOffset({ x: 0, y: 0 });
                setZoom(2.2);
              }}
              title="Center on Player"
            >
              <Crosshair size={14} /> Me
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: 12 }}
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              title="Full City Overview"
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

        {/* Main Split: Searchable Places List + Interactive SVG Map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 270px) 1fr', gap: 12, minHeight: 0, flex: 1 }}>
          {/* Left Directory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 9, top: 9, color: '#94a3b8' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Chennai places..."
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  borderRadius: 8,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 999,
                    border: 'none',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: category === c.id ? '#facc15' : '#1e293b',
                    color: category === c.id ? '#0f172a' : '#cbd5e1',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {waypoint && (
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.14)',
                  border: '1px solid rgba(34, 211, 238, 0.5)',
                  borderRadius: 8,
                  padding: '6px 8px',
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ color: '#67e8f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📍 {waypoint.label} ({Math.round(Math.hypot(waypoint.x - playerPos[0], waypoint.z - playerPos[2]))}m)
                </span>
                <button
                  onClick={() => setWaypoint(null)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >
                  Clear
                </button>
              </div>
            )}

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5, maxHeight: expanded ? '66vh' : '50vh', paddingRight: 4 }}>
              {filteredLandmarks.map((lm) => {
                const isSel = selectedId === lm.id;
                return (
                  <div
                    key={lm.id}
                    onClick={() => {
                      setSelectedId(lm.id);
                      focusOnWorld(lm.x, lm.z);
                      setWaypoint({ x: lm.x, z: lm.z, label: lm.name });
                    }}
                    style={{
                      padding: '7px 8px',
                      borderRadius: 8,
                      background: isSel ? 'rgba(250, 204, 21, 0.14)' : '#1e293b',
                      border: isSel ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#f8fafc' }}>{lm.name}</span>
                      <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {lm.dist >= 1000 ? `${(lm.dist / 1000).toFixed(1)}km` : `${lm.dist}m`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Navigation size={10} /> Set GPS
                      </span>
                      {fastTravelUnlocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fastTravelTo(lm.x, lm.z, lm.name);
                            setShowFullMap(false);
                          }}
                          style={{
                            marginLeft: 'auto',
                            background: '#22c55e',
                            color: '#052e16',
                            border: 'none',
                            borderRadius: 4,
                            padding: '1px 6px',
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Fast Travel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Interactive Map */}
          <svg
            ref={svgRef}
            viewBox={`${zoom === 1 ? 0 : vx} ${zoom === 1 ? 0 : vy} ${viewSize} ${viewSize}`}
            onWheel={(e) => {
              e.preventDefault();
              setZoom((z) => Math.max(1, Math.min(6, e.deltaY < 0 ? z * 1.2 : z / 1.2)));
            }}
            onPointerDown={(e) => {
              dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, ox: panOffset.x, oy: panOffset.y, moved: false };
            }}
            onPointerMove={(e) => {
              if (!dragRef.current.active || !svgRef.current) return;
              const dx = e.clientX - dragRef.current.sx;
              const dy = e.clientY - dragRef.current.sy;
              if (Math.hypot(dx, dy) > 4) dragRef.current.moved = true;
              const rect = svgRef.current.getBoundingClientRect();
              const scale = viewSize / rect.width;
              setPanOffset({ x: dragRef.current.ox - dx * scale, y: dragRef.current.oy - dy * scale });
            }}
            onPointerUp={() => {
              dragRef.current.active = false;
            }}
            onClick={handleMapClick}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: expanded ? '80vh' : '64vh',
              background: '#1e293b',
              borderRadius: 12,
              display: 'block',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            {/* Bay of Bengal Ocean */}
            <rect x={coastX} y={0} width={MAP_PX - coastX} height={MAP_PX} fill="#0284c7" opacity={0.65} />
            {/* Marina Sand Strip */}
            <rect x={coastX - 12} y={0} width={12} height={MAP_PX} fill="#eab308" opacity={0.55} />
            {/* Cooum Canal */}
            <rect x={0} y={canalY - 4} width={coastX} height={8} fill="#0d9488" opacity={0.75} />
            {/* Railway Line */}
            <line x1={0} y1={railY} x2={coastX} y2={railY} stroke="#94a3b8" strokeWidth={2 / zoom} strokeDasharray="5 3" />

            {/* Major Chennai Roads & 4 Canal Bridges */}
            {[
              [-190, -120, -190, 260],
              [40, -120, 40, 860],
              [-480, -120, 1420, -120],
              [-190, 140, 40, 140],
              [480, -1350, 480, -120],
              [480, -1350, 950, -1350],
              [-850, 260, -190, 260],
              [40, 520, 1180, 520],
              [1420, -120, 1420, 360],
              [920, -120, 920, 200],
            ].map(([x1, z1, x2, z2], ri) => {
              const [mx1, mz1] = toPx(x1, z1);
              const [mx2, mz2] = toPx(x2, z2);
              return <line key={ri} x1={mx1} y1={mz1} x2={mx2} y2={mz2} stroke="#475569" strokeWidth={3.2 / zoom} strokeLinecap="round" />;
            })}

            {/* Active Job GPS Route */}
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

            {/* Custom GPS Waypoint Route */}
            {wpPx && (
              <>
                <line
                  x1={px}
                  y1={pz}
                  x2={wpPx[0]}
                  y2={wpPx[1]}
                  stroke="#22d3ee"
                  strokeWidth={2.6 / zoom}
                  strokeDasharray="4 3"
                />
                <circle cx={wpPx[0]} cy={wpPx[1]} r={5 / zoom} fill="#22d3ee" stroke="#0f172a" strokeWidth={1.2 / zoom} />
              </>
            )}

            {/* All Landmarks */}
            {worldConfig.landmarks.map((lm) => {
              const [lx, lz] = toPx(lm.x, lm.z);
              const isSelected = selectedId === lm.id;
              return (
                <g
                  key={lm.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(lm.id);
                    setWaypoint({ x: lm.x, z: lm.z, label: lm.name });
                    if (fastTravelUnlocked) {
                      fastTravelTo(lm.x, lm.z, lm.name);
                      setShowFullMap(false);
                    }
                  }}
                >
                  <circle
                    cx={lx}
                    cy={lz}
                    r={(isSelected ? 6.5 : 4.5) / zoom}
                    fill={lm.type === 'teashop' ? '#f97316' : lm.type === 'lighthouse' ? '#fde047' : '#38bdf8'}
                    stroke="#0f172a"
                    strokeWidth={1.2 / zoom}
                  />
                  <text
                    x={lx + 6 / zoom}
                    y={lz + 3 / zoom}
                    fontSize={8 / zoom}
                    fill={isSelected ? '#fde047' : '#e2e8f0'}
                    fontWeight={isSelected ? 800 : 600}
                  >
                    {lm.name.split('•')[0].trim()}
                  </text>
                </g>
              );
            })}

            {/* Player Marker */}
            <circle cx={px} cy={pz} r={5.5 / zoom} fill="#22c55e" stroke="#ffffff" strokeWidth={1.5 / zoom} />
          </svg>
        </div>
      </div>
    </div>
  );
}
