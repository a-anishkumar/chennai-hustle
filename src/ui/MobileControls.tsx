import { useRef, useState } from 'react';
import { Bike, Hand, Smartphone, Zap } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';
import { virtualInput } from '../systems/virtualInput';

export function MobileControls() {
  const isStarted = useGameStore((s) => s.isStarted);
  const forceTouchControls = useGameStore((s) => s.forceTouchControls);
  const currentVehicle = useGameStore((s) => s.currentVehicle);
  const toggleVehicleCycle = useGameStore((s) => s.toggleVehicleCycle);
  const togglePhone = useGameStore((s) => s.togglePhone);

  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [boosting, setBoosting] = useState(false);
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  const isTouchOrNarrow =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 820);
  if (!isStarted || (!isTouchOrNarrow && !forceTouchControls)) return null;

  const MAX_R = 44;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!centerRef.current) return;
    let dx = e.clientX - centerRef.current.x;
    let dy = e.clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_R) {
      dx = (dx / dist) * MAX_R;
      dy = (dy / dist) * MAX_R;
    }
    setKnob({ x: dx, y: dy });
    virtualInput.moveX = dx / MAX_R;
    virtualInput.moveY = -dy / MAX_R;
  };

  const handlePointerUp = () => {
    centerRef.current = null;
    setKnob({ x: 0, y: 0 });
    virtualInput.moveX = 0;
    virtualInput.moveY = 0;
  };

  const btnStyle: React.CSSProperties = {
    borderRadius: '50%',
    width: 52,
    height: 52,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
    touchAction: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 30 }} data-testid="mobile-controls">
      {/* Left Virtual Thumbstick with Directional Guides */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          left: 22,
          bottom: 146,
          width: 118,
          height: 118,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.78) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ position: 'absolute', top: 6, fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>▲</span>
        <span style={{ position: 'absolute', bottom: 6, fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>▼</span>
        <span style={{ position: 'absolute', left: 8, fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>◀</span>
        <span style={{ position: 'absolute', right: 8, fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>▶</span>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #ea580c)',
            border: '2px solid rgba(255,255,255,0.65)',
            transform: `translate(${knob.x}px, ${knob.y}px)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
          }}
        />
      </div>

      {/* Right Ergonomic Action Cluster */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 72,
          display: 'grid',
          gridTemplateColumns: '52px 52px',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <button
          className="btn-primary"
          style={btnStyle}
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }))}
          aria-label="Touch Interact"
        >
          <Hand size={18} />
          <span style={{ fontSize: 9, fontWeight: 800 }}>ACT</span>
        </button>

        <button
          className="btn-secondary"
          style={{
            ...btnStyle,
            background: boosting ? '#ea580c' : 'rgba(30, 41, 59, 0.88)',
            borderColor: boosting ? '#fde047' : 'rgba(255,255,255,0.2)',
          }}
          onPointerDown={() => {
            virtualInput.sprint = true;
            setBoosting(true);
          }}
          onPointerUp={() => {
            virtualInput.sprint = false;
            setBoosting(false);
          }}
          onPointerCancel={() => {
            virtualInput.sprint = false;
            setBoosting(false);
          }}
          aria-label="Touch Boost"
        >
          <Zap size={18} color="#fde047" />
          <span style={{ fontSize: 9, fontWeight: 800 }}>BOOST</span>
        </button>

        <button
          className="btn-secondary"
          style={btnStyle}
          onClick={() => toggleVehicleCycle()}
          aria-label="Touch Vehicle"
        >
          <Bike size={18} color="#38bdf8" />
          <span style={{ fontSize: 9, fontWeight: 800 }}>{currentVehicle === 'foot' ? 'RIDE' : 'NEXT'}</span>
        </button>

        <button
          className="btn-secondary"
          style={btnStyle}
          onClick={() => togglePhone()}
          aria-label="Touch Phone"
        >
          <Smartphone size={18} color="#4ade80" />
          <span style={{ fontSize: 9, fontWeight: 800 }}>PHONE</span>
        </button>
      </div>
    </div>
  );
}
