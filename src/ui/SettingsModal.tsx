import { X } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';
import type { QualityLevel } from '../systems/SaveSystem';

export function SettingsModal() {
  const showSettings = useGameStore((s) => s.showSettings);
  const setShowSettings = useGameStore((s) => s.setShowSettings);
  const quality = useGameStore((s) => s.quality);
  const setQuality = useGameStore((s) => s.setQuality);
  const subtitles = useGameStore((s) => s.subtitles);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const colorBlind = useGameStore((s) => s.colorBlind);
  const forceTouchControls = useGameStore((s) => s.forceTouchControls);
  const toggleAccessibility = useGameStore((s) => s.toggleAccessibility);

  if (!showSettings) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      data-testid="settings-modal"
    >
      <div className="hud-pill" style={{ maxWidth: 400, width: '100%', padding: 20, background: '#0f172a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc' }}>Settings &amp; Accessibility</h3>
          <button
            onClick={() => setShowSettings(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>Graphics Quality</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityLevel)}
              className="btn-secondary"
              style={{ fontSize: 12 }}
            >
              <option value="low">Low (Max FPS)</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {[
            { key: 'subtitles' as const, label: 'Audio Subtitles', val: subtitles },
            { key: 'reducedMotion' as const, label: 'Reduced Motion', val: reducedMotion },
            { key: 'colorBlind' as const, label: 'Color-Blind High-Contrast', val: colorBlind },
            { key: 'forceTouchControls' as const, label: 'On-Screen Touch Joystick', val: forceTouchControls },
          ].map((item) => (
            <label
              key={item.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, cursor: 'pointer' }}
            >
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={item.val}
                onChange={() => toggleAccessibility(item.key)}
                data-testid={`toggle-${item.key}`}
                style={{ width: 18, height: 18, accentColor: '#f59e0b' }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
