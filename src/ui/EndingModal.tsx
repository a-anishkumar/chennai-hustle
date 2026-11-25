import { X } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';

export function EndingModal() {
  const showEndingModal = useGameStore((s) => s.showEndingModal);
  const setShowEndingModal = useGameStore((s) => s.setShowEndingModal);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const floodAidCount = useGameStore((s) => s.floodAidCount);
  const floodSurgeCount = useGameStore((s) => s.floodSurgeCount);
  const dayCount = useGameStore((s) => s.dayCount);

  if (!showEndingModal) return null;

  let title = 'Surviving the Storm';
  let desc = 'You weathered the Chennai monsoon and kept your hustle alive in Nethaji Nagar.';
  if (floodAidCount > floodSurgeCount && reputation >= 15) {
    title = 'Namma Chennai Hero';
    desc = 'You ferried relief supplies during the floods and stood by your neighbours. Your reputation shines across the city!';
  } else if (floodSurgeCount > floodAidCount && money >= 500) {
    title = 'Monsoon Surge Mogul';
    desc = 'You capitalized on flood surge pricing and built a hefty ChennaiPay balance, though neighbours remember the steep fares.';
  } else if (money >= 1200) {
    title = 'Rising Entrepreneur';
    desc = 'From ₹0 and a borrowed cycle, you built real momentum across Chennai’s gig economy.';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      data-testid="ending-modal"
    >
      <div className="hud-pill" style={{ maxWidth: 440, width: '100%', padding: 24, background: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Chennai Hustle • Outcome (Day {dayCount})
          </span>
          <button
            onClick={() => setShowEndingModal(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close Outcome"
          >
            <X size={18} />
          </button>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc', marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16 }}>{desc}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div style={{ background: '#1e293b', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Wallet Balance</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>₹{money.toFixed(0)}</div>
          </div>
          <div style={{ background: '#1e293b', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Reputation</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#facc15' }}>{reputation}</div>
          </div>
          <div style={{ background: '#1e293b', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Flood Relief Missions</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>{floodAidCount}</div>
          </div>
          <div style={{ background: '#1e293b', padding: 10, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Flood Surge Rides</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fb923c' }}>{floodSurgeCount}</div>
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowEndingModal(false)}>
          Continue Exploring Chennai
        </button>
      </div>
    </div>
  );
}
