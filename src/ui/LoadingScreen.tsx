import { useEffect, useState } from 'react';
import { useGameStore } from '../systems/gameStore';
import { hasSaveData } from '../systems/SaveSystem';

export function LoadingScreen() {
  const isStarted = useGameStore((s) => s.isStarted);
  const isLoading = useGameStore((s) => s.isLoading);
  const loadProgress = useGameStore((s) => s.loadProgress);
  const startGame = useGameStore((s) => s.startGame);
  const setLoading = useGameStore((s) => s.setLoading);
  const [savedExists] = useState(() => hasSaveData());

  useEffect(() => {
    // Smooth simulated asset/physics readiness ramp
    let p = 10;
    const id = setInterval(() => {
      p = Math.min(100, p + 18);
      setLoading(p < 100, p);
      if (p >= 100) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [setLoading]);

  if (isStarted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #1e293b 0%, #090d16 70%)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 3,
          color: '#fbbf24',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Open-World Life Simulation
      </div>
      <h1
        style={{
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 900,
          letterSpacing: -1,
          background: 'linear-gradient(90deg, #fde047, #f97316, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}
      >
        CHENNAI HUSTLE
      </h1>
      <p style={{ maxWidth: 480, color: '#cbd5e1', fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
        Arrive in Nethaji Nagar with ₹0 and a borrowed cycle. Hustle gig jobs, explore the coast &amp; harbour,
        and survive the monsoon floods.
      </p>

      {isLoading ? (
        <div style={{ width: 300 }}>
          <div
            style={{
              height: 10,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 999,
              overflow: 'hidden',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                transition: 'width 0.12s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Streaming Chennai chunks &amp; physics... {loadProgress}%</div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {savedExists && (
            <button className="btn-primary" onClick={() => startGame(true)} data-testid="continue-btn">
              Continue Hustle
            </button>
          )}
          <button
            className={savedExists ? 'btn-secondary' : 'btn-primary'}
            onClick={() => startGame(false)}
            data-testid="start-btn"
          >
            {savedExists ? 'New Hustle' : 'Start Hustle'}
          </button>
        </div>
      )}
    </div>
  );
}
