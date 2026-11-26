import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import brands from '../config/brands.json';
import dialogues from '../config/dialogues.json';
import { useGameStore } from '../systems/gameStore';
import { generateAutoOffer, generateDash10Offer, toActiveGenericJob } from '../jobs/OtherJobs';

const GROCERY_POOL = ['Filter Coffee', 'Idli Batter', 'Tender Coconut', 'Milk Packet', 'Banana', 'Curry Leaves'];

export function MinigamesModal() {
  const activeMinigame = useGameStore((s) => s.activeMinigame);
  const openMinigame = useGameStore((s) => s.openMinigame);
  const completeMinigameReward = useGameStore((s) => s.completeMinigameReward);
  const startJob = useGameStore((s) => s.startJob);
  const addPastedPoster = useGameStore((s) => s.addPastedPoster);
  const dayCount = useGameStore((s) => s.dayCount);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const playerPos = useGameStore((s) => s.playerPos);
  const playerRotY = useGameStore((s) => s.playerRotY);

  // Tea timing state
  const [teaMeter, setTeaMeter] = useState(0);
  const [teaHits, setTeaHits] = useState(0);

  // Dash10 packing state
  const [packed, setPacked] = useState<string[]>([]);
  const targetGroceries = ['Filter Coffee', 'Idli Batter', 'Milk Packet', 'Tender Coconut'];

  // Harbour crates state
  const [crates, setCrates] = useState(0);
  const [workStamina, setWorkStamina] = useState(100);

  // Poster stealth state
  const [patrolDanger, setPatrolDanger] = useState(false);
  const [postersDone, setPostersDone] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState(0);

  // Tea meter oscillation
  useEffect(() => {
    if (activeMinigame !== 'teaMaster') return;
    const id = setInterval(() => {
      setTeaMeter((m) => (m + 7) % 100);
    }, 50);
    return () => clearInterval(id);
  }, [activeMinigame]);

  // Poster patrol cycle
  useEffect(() => {
    if (activeMinigame !== 'posterPaste') return;
    const id = setInterval(() => {
      setPatrolDanger((d) => !d);
    }, 3800);
    return () => clearInterval(id);
  }, [activeMinigame]);

  if (!activeMinigame) return null;

  const campaigns = [...brands.campaigns.films, ...brands.campaigns.parties];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(2, 6, 23, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      data-testid="minigame-modal"
    >
      <div
        className="hud-pill"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 20,
          background: '#0f172a',
          border: '1px solid rgba(251, 191, 36, 0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fde047' }}>
            {activeMinigame === 'teaMaster' && 'Anbu Tea Kadai — Meter Tea'}
            {activeMinigame === 'dash10Pack' && 'Dash10 Dark Store — Pack Order'}
            {activeMinigame === 'autoBargain' && 'MeterPlus — Passenger Bargaining'}
            {activeMinigame === 'harbourCrates' && 'Harbour Night Shift — Load Crates'}
            {activeMinigame === 'cinemaQueue' && 'Kaveri Theatre — FDFS Ticket Queue'}
            {activeMinigame === 'posterPaste' && 'Night Poster Pasting — Stealth'}
          </h3>
          <button
            onClick={() => openMinigame(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close Minigame"
          >
            <X size={18} />
          </button>
        </div>

        {/* G. Tea Shop Helper */}
        {activeMinigame === 'teaMaster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#cbd5e1' }}>
              Tap <b>Pull Tea!</b> when the indicator is inside the green zone ({teaHits}/3 cups).
            </p>
            <div style={{ height: 22, background: '#1e293b', borderRadius: 999, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '38%', width: '24%', height: '100%', background: '#16a34a' }} />
              <div
                style={{
                  position: 'absolute',
                  left: `${teaMeter}%`,
                  width: 8,
                  height: '100%',
                  background: '#fde047',
                }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                if (teaMeter >= 35 && teaMeter <= 65) {
                  const next = teaHits + 1;
                  if (next >= 3) {
                    completeMinigameReward('Anbu Tea Kadai Shift', 85, 4, 10, 15);
                  } else {
                    setTeaHits(next);
                  }
                }
              }}
            >
              Pull Tea! ({teaHits}/3)
            </button>
          </div>
        )}

        {/* C. Dash10 Packing */}
        {activeMinigame === 'dash10Pack' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#cbd5e1' }}>
              Pack the 4 requested items ({packed.length}/4):{' '}
              <span style={{ color: '#a78bfa' }}>{targetGroceries.join(', ')}</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {GROCERY_POOL.map((item) => {
                const isTarget = targetGroceries.includes(item);
                const isDone = packed.includes(item);
                return (
                  <button
                    key={item}
                    className={isDone ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: 12, padding: '8px 10px' }}
                    onClick={() => {
                      if (isTarget && !isDone) {
                        const next = [...packed, item];
                        setPacked(next);
                        if (next.length === 4) {
                          const offer = generateDash10Offer(dayCount + Math.floor(timeOfDay));
                          openMinigame(null);
                          startJob(toActiveGenericJob('quickCommerce', offer));
                        }
                      }
                    }}
                  >
                    {isDone ? `✓ ${item}` : item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* D. Auto Bargaining */}
        {activeMinigame === 'autoBargain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#1e293b', padding: 12, borderRadius: 10, fontSize: 13, color: '#fde047' }}>
              “{dialogues.autoBargaining.fair}”
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, fontSize: 12 }}
                onClick={() => {
                  const offer = generateAutoOffer(dayCount);
                  openMinigame(null);
                  startJob(toActiveGenericJob('autoDriver', offer, 0));
                }}
              >
                Go by Meter (+₹0)
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, fontSize: 12 }}
                onClick={() => {
                  const offer = generateAutoOffer(dayCount);
                  openMinigame(null);
                  startJob(toActiveGenericJob('autoDriver', offer, 30));
                }}
              >
                Bargain +₹30 Extra
              </button>
            </div>
          </div>
        )}

        {/* H. Harbour Night Shift */}
        {activeMinigame === 'harbourCrates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>
              Crates Loaded: <b>{crates}/5</b> • Shift Stamina: <b>{workStamina}%</b>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={workStamina < 20}
                onClick={() => {
                  const nextC = crates + 1;
                  setWorkStamina((s) => Math.max(0, s - 22));
                  if (nextC >= 5) {
                    completeMinigameReward('Harbour Night Crate Shift', 225, 8, 22, 5);
                  } else {
                    setCrates(nextC);
                  }
                }}
              >
                Load Heavy Crate (-22 Stamina)
              </button>
              <button
                className="btn-secondary"
                onClick={() => setWorkStamina((s) => Math.min(100, s + 35))}
              >
                Catch Breath (+35)
              </button>
            </div>
          </div>
        )}

        {/* Cinema FDFS Ticket Queue */}
        {activeMinigame === 'cinemaQueue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#cbd5e1' }}>
              Kaveri Theatre FDFS! Fans are doing Paal Abhishekam for {brands.landmarks.superstarName}. Cheer to boost mood!
            </p>
            <button
              className="btn-primary"
              onClick={() => completeMinigameReward('FDFS Celebration & Ticket', 50, 5, 5, 30)}
            >
              Whistle &amp; Celebrate! (+Mood, +Rep)
            </button>
          </div>
        )}

        {/* F. Night Poster Pasting */}
        {activeMinigame === 'posterPaste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>Choose Campaign Poster:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {campaigns.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaign(idx)}
                  style={{
                    padding: '5px 8px',
                    fontSize: 11,
                    borderRadius: 6,
                    border: selectedCampaign === idx ? '2px solid #fff' : '1px solid #475569',
                    background: c.color,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: patrolDanger ? '#7f1d1d' : '#064e3b',
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {patrolDanger ? '🚨 POLICE PATROL NEARBY — WAIT!' : '✅ COAST CLEAR — PASTE NOW!'}
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                if (patrolDanger) {
                  openMinigame(null);
                  useGameStore.getState().showToast('Spotted by Police Patrol! Run!');
                  return;
                }
                const c = campaigns[selectedCampaign];
                addPastedPoster({
                  id: `poster_${Date.now()}_${postersDone}`,
                  x: playerPos[0] + Math.sin(playerRotY) * 2.5,
                  y: 1.6,
                  z: playerPos[2] + Math.cos(playerRotY) * 2.5,
                  rotY: playerRotY,
                  campaignName: c.name,
                  color: c.color,
                  accent: c.accent,
                  slogan: c.slogan,
                });
                const next = postersDone + 1;
                if (next >= 3) {
                  completeMinigameReward('Night Poster Campaign (3 Posters)', 225, 6, 15, 5);
                } else {
                  setPostersDone(next);
                }
              }}
            >
              Paste Poster on Wall ({postersDone}/3)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
