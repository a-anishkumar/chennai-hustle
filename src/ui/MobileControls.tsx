import { useRef, useState } from 'react';
import { Bike, Hand, Smartphone } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';
import { virtualInput } from '../systems/virtualInput';

export function MobileControls() {
  const isStarted = useGameStore((s) => s.isStarted);
  const forceTouchControls = useGameStore((s) => s.forceTouchControls);
  const toggleVehicleCycle = useGameStore((s) => s.toggleVehicleCycle);
  const togglePhone = useGameStore((s) => s.togglePhone);

  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (!isStarted || (!isTouchDevice && !forceTouchControls)) return null;

  const MAX_R = 42;

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

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 30 }} data-testid="mobile-controls">
      {/* Left Virtual Joystick */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          left: 28,
          bottom: 135,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.55)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#f59e0b',
            transform: `translate(${knob.x}px, ${knob.y}px)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
          }}
        />
      </div>

      {/* Right Touch Action Buttons */}
      <div
        style={{
          position: 'absolute',
          right: 24,
          bottom: 110,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'auto',
        }}
      >
        <button
          className="btn-primary"
          style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }))}
          aria-label="Touch Interact"
        >
          <Hand size={20} />
        </button>
        <button
          className="btn-secondary"
          style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => toggleVehicleCycle()}
          aria-label="Touch Vehicle"
        >
          <Bike size={20} />
        </button>
        <button
          className="btn-secondary"
          style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => togglePhone()}
          aria-label="Touch Phone"
        >
          <Smartphone size={20} />
        </button>
      </div>
    </div>
  );
}
