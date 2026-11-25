import { useEffect, useState } from 'react';
import { Award, Bike, Clock, CloudRain, Footprints, Home, LifeBuoy, MapPin, Navigation, RotateCcw, Save, Settings, Smartphone, Sun, Volume2, VolumeX, XCircle } from 'lucide-react';
import { useGameStore } from '../systems/gameStore';
import type { QualityLevel } from '../systems/SaveSystem';
import { audioManager } from '../audio/AudioManager';
import { useStoryProgression } from '../systems/storyUtils';
import { Minimap } from './Minimap';

function formatClock(hour: number): string {
  const h24 = Math.floor(hour) % 24;
  const mins = Math.floor((hour - Math.floor(hour)) * 60);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 58, color: '#cbd5e1', fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(value)}%`, height: '100%', background: color, transition: 'width 0.2s' }} />
      </div>
    </div>
  );
}

export function HUD() {
  const isStarted = useGameStore((s) => s.isStarted);
  const money = useGameStore((s) => s.money);
  const stamina = useGameStore((s) => s.stamina);
  const hunger = useGameStore((s) => s.hunger);
  const mood = useGameStore((s) => s.mood);
  const dayCount = useGameStore((s) => s.dayCount);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const currentVehicle = useGameStore((s) => s.currentVehicle);
  const nearestLandmark = useGameStore((s) => s.nearestLandmark);
  const currentChunk = useGameStore((s) => s.currentChunk);
  const playerPos = useGameStore((s) => s.playerPos);
  const fps = useGameStore((s) => s.fps);
  const quality = useGameStore((s) => s.quality);
  const toastMessage = useGameStore((s) => s.toastMessage);
  const activeJob = useGameStore((s) => s.activeJob);
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);
  const weather = useGameStore((s) => s.weather);
  const waterLevel = useGameStore((s) => s.waterLevel);

  const setQuality = useGameStore((s) => s.setQuality);
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay);
  const cycleWeather = useGameStore((s) => s.cycleWeather);
  const startFloodReliefMission = useGameStore((s) => s.startFloodReliefMission);
  const setShowEndingModal = useGameStore((s) => s.setShowEndingModal);
  const setShowSettings = useGameStore((s) => s.setShowSettings);
  const subtitles = useGameStore((s) => s.subtitles);
  const toggleVehicleCycle = useGameStore((s) => s.toggleVehicleCycle);
  const togglePhone = useGameStore((s) => s.togglePhone);
  const cancelActiveJob = useGameStore((s) => s.cancelActiveJob);
  const saveGame = useGameStore((s) => s.saveGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const showToast = useGameStore((s) => s.showToast);

  const [muted, setMuted] = useState(false);
  const storyObjective = useStoryProgression();

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => showToast(''), 4000);
    return () => clearTimeout(t);
  }, [toastMessage, showToast]);

  if (!isStarted) return null;

  const near = (tx: number, tz: number, r = 7) => (playerPos[0] - tx) ** 2 + (playerPos[2] - tz) ** 2 < r * r;
  const interactionPrompt = near(-133, 42)
    ? 'Press [E] to Rest & Save at TNHB Home Base'
    : near(1412, 360, 10)
    ? 'Press [E] to Climb Chennai Lighthouse (Unlock Fast-Travel)'
    : near(-40, -31, 8)
    ? 'Press [E] to Work at Anbu Tea Kadai'
    : near(-480, -303, 10)
    ? 'Press [E] to Join Kaveri Theatre FDFS Queue'
    : near(962, -1318, 12)
    ? 'Press [E] for Harbour Night Crate Shift'
    : null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 20, padding: 14 }}>
      {/* Top-Left: Wallet, Time & Location */}
      <div
        className="hud-pill"
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}>₹{money.toFixed(0)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#fde047', fontWeight: 600 }}>
            <Clock size={14} /> Day {dayCount} • {formatClock(timeOfDay)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
          <MapPin size={13} color="#fb923c" />
          <span>{nearestLandmark}</span>
          <span style={{ color: '#64748b' }}>
            [Chunk {currentChunk[0]},{currentChunk[1]}]
          </span>
        </div>
      </div>

      {/* Top-Right: FPS, Quality, Time & Save */}
      <div
        className="hud-pill"
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'auto',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171',
            padding: '2px 7px',
            background: 'rgba(0,0,0,0.35)',
            borderRadius: 6,
          }}
        >
          {fps} FPS
        </span>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as QualityLevel)}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '4px 8px' }}
          aria-label="Graphics Quality"
        >
          <option value="low">Quality: Low</option>
          <option value="medium">Quality: Med</option>
          <option value="high">Quality: High</option>
        </select>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setTimeOfDay(timeOfDay + 3)}
          title="Advance 3 hours"
        >
          <Sun size={13} /> +3h
        </button>
        <button
          className="btn-secondary"
          style={{
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderColor: weather === 'flood' ? '#38bdf8' : undefined,
            color: weather === 'flood' ? '#7dd3fc' : undefined,
          }}
          onClick={() => cycleWeather()}
          title="Cycle Weather (Sunny / Humid / Monsoon / Flood)"
          data-testid="weather-btn"
        >
          <CloudRain size={13} /> {weather.toUpperCase()}
        </button>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            audioManager.setMuted(next);
          }}
          title="Toggle Audio"
          data-testid="audio-btn"
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setShowEndingModal(true)}
          title="View Hustle Outcome"
          data-testid="outcome-btn"
        >
          <Award size={13} />
        </button>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setShowSettings(true)}
          title="Settings & Accessibility"
          data-testid="settings-btn"
        >
          <Settings size={13} />
        </button>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => saveGame()}
          title="Save Game"
        >
          <Save size={13} /> Save
        </button>
        <button
          className="btn-secondary"
          style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => resetGame()}
          title="Reset Save"
        >
          <RotateCcw size={13} />
        </button>
        <button
          className="btn-primary"
          style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={() => togglePhone()}
          data-testid="phone-btn"
        >
          <Smartphone size={14} /> {isPhoneOpen ? 'Close [P]' : 'Phone [P]'}
        </button>
      </div>

      {/* Minimap & Active Mission Tracker (Left below Wallet) */}
      <div
        style={{
          position: 'absolute',
          top: 86,
          left: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <Minimap />
        <div
          className="hud-pill"
          style={{ padding: '6px 10px', maxWidth: 230, fontSize: 11, color: '#e2e8f0', borderColor: 'rgba(56,189,248,0.3)' }}
        >
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Story:</span> {storyObjective}
        </div>
        {weather === 'flood' && !activeJob && (
          <button
            className="btn-primary"
            style={{
              fontSize: 11,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              pointerEvents: 'auto',
              background: 'linear-gradient(135deg, #0284c7, #0d9488)',
            }}
            onClick={() => startFloodReliefMission()}
            data-testid="flood-relief-btn"
          >
            <LifeBuoy size={13} /> Flood Relief Mission (Water: {waterLevel.toFixed(2)}m)
          </button>
        )}
        {activeJob && (() => {
          const tPos = activeJob.stage === 'pickup' ? activeJob.pickupPos : activeJob.dropoffPos;
          const dist = Math.round(Math.hypot(playerPos[0] - tPos[0], playerPos[2] - tPos[2]));
          return (
            <div
              className="hud-pill"
              style={{
                padding: '8px 12px',
                maxWidth: 230,
                pointerEvents: 'auto',
                borderColor: activeJob.stage === 'pickup' ? '#f59e0b' : '#22c55e',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fde047' }}>{activeJob.title}</span>
                <button
                  onClick={() => cancelActiveJob()}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                  title="Cancel Job"
                >
                  <XCircle size={14} />
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#e2e8f0', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Navigation size={12} color="#38bdf8" />
                {activeJob.stage === 'pickup' ? 'Pickup: ' : 'Drop: '}
                <b>{activeJob.stage === 'pickup' ? activeJob.pickupName : activeJob.dropoffName}</b> ({dist}m)
              </div>
              {activeJob.jobType === 'foodDelivery' && (
                <div style={{ fontSize: 11, color: '#fb923c', marginTop: 3 }}>
                  Food Heat: {Math.round(activeJob.tempScore)}%
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Bottom-Left: Vitals & Vehicle */}
      <div
        className="hud-pill"
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          width: 220,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'auto',
        }}
      >
        <StatBar label="Stamina" value={stamina} color="#38bdf8" />
        <StatBar label="Hunger" value={hunger} color="#fb923c" />
        <StatBar label="Mood" value={mood} color="#c084fc" />
        <button
          className="btn-secondary"
          onClick={() => toggleVehicleCycle()}
          style={{
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
          }}
        >
          {currentVehicle === 'cycle' ? <Bike size={14} color="#38bdf8" /> : <Footprints size={14} color="#fbbf24" />}
          {currentVehicle === 'cycle' ? 'Riding Borrowed Cycle [B]' : 'On Foot — Mount Cycle [B]'}
        </button>
      </div>

      {/* Bottom-Right: Controls Hint */}
      <div
        className="hud-pill"
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          padding: '8px 12px',
          fontSize: 11,
          color: '#cbd5e1',
          lineHeight: 1.5,
        }}
      >
        <div>
          <b>WASD</b> Move • <b>Shift</b> Sprint • <b>B</b> Cycle
        </div>
        <div>
          <b>Drag Mouse</b> Orbit • <b>Scroll</b> Zoom • <b>E</b> Rest
        </div>
      </div>

      {/* Landmark Interaction Prompt */}
      {interactionPrompt && (
        <div
          className="hud-pill"
          style={{
            position: 'absolute',
            bottom: 92,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderColor: '#4ade80',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Home size={16} color="#4ade80" />
          {interactionPrompt}
        </div>
      )}

      {/* Toast & Subtitles Banner */}
      {toastMessage && (
        <div
          className="hud-pill"
          style={{
            position: 'absolute',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: '#fef08a',
            borderColor: 'rgba(250, 204, 21, 0.45)',
          }}
        >
          {toastMessage}
        </div>
      )}
      {subtitles && (weather === 'monsoon' || weather === 'flood') && (
        <div
          className="hud-pill"
          style={{
            position: 'absolute',
            bottom: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            fontSize: 11,
            color: '#bae6fd',
          }}
        >
          [SFX: Heavy Monsoon Rain &amp; Distant Thunder]
        </div>
      )}
    </div>
  );
}
