import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Car,
  Coffee,
  Compass,
  FileImage,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import brands from '../config/brands.json';
import jobsConfig from '../config/jobs.json';
import worldConfig from '../config/world.json';
import { useGameStore } from '../systems/gameStore';
import { generateBikeTaxiOffers, toActiveBikeJob } from '../jobs/BikeTaxiJob';
import { generateFoodOffers, toActiveFoodJob } from '../jobs/FoodDeliveryJob';
import { generateCabOffer, toActiveGenericJob } from '../jobs/OtherJobs';
import type { VehicleType } from '../systems/SaveSystem';

type PhoneTab = 'home' | 'food' | 'ride' | 'dash10' | 'auto' | 'cab' | 'map' | 'wallet' | 'garage' | 'messages' | 'ratings';

export function PhoneUI() {
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen);
  const money = useGameStore((s) => s.money);
  const timeHour = useGameStore((s) => Math.floor(s.timeOfDay));
  const dayCount = useGameStore((s) => s.dayCount);
  const unlockedVehicles = useGameStore((s) => s.unlockedVehicles);
  const currentVehicle = useGameStore((s) => s.currentVehicle);
  const activeJob = useGameStore((s) => s.activeJob);
  const fastTravelUnlocked = useGameStore((s) => s.fastTravelUnlocked);
  const ratings = useGameStore((s) => s.ratings);
  const transactions = useGameStore((s) => s.transactions);
  const messages = useGameStore((s) => s.messages);

  const startJob = useGameStore((s) => s.startJob);
  const openMinigame = useGameStore((s) => s.openMinigame);
  const buyVehicle = useGameStore((s) => s.buyVehicle);
  const buySnack = useGameStore((s) => s.buySnack);
  const fastTravelTo = useGameStore((s) => s.fastTravelTo);

  const [tab, setTab] = useState<PhoneTab>('home');

  useEffect(() => {
    if (!isPhoneOpen) setTab('home');
  }, [isPhoneOpen]);

  const foodOffers = useMemo(() => generateFoodOffers(dayCount + timeHour), [dayCount, timeHour]);
  const rideOffers = useMemo(() => generateBikeTaxiOffers(timeHour), [timeHour]);
  const cabOffer = useMemo(() => generateCabOffer(timeHour), [timeHour]);

  if (!isPhoneOpen) return null;

  const hasScooter = unlockedVehicles.includes('bike');
  const hasAuto = unlockedVehicles.includes('auto');
  const hasCab = unlockedVehicles.includes('cab');

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 70,
        width: 326,
        height: 525,
        zIndex: 40,
        background: '#0f172a',
        borderRadius: 28,
        border: '4px solid #334155',
        boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      data-testid="phone-ui"
    >
      {/* Phone Status Bar */}
      <div
        style={{
          padding: '10px 16px',
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {tab !== 'home' && (
            <button
              onClick={() => setTab('home')}
              style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex' }}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
            {tab === 'home' && 'NammaOS'}
            {tab === 'food' && brands.apps.foodDelivery.name}
            {tab === 'ride' && brands.apps.bikeTaxi.name}
            {tab === 'dash10' && brands.apps.quickCommerce.name}
            {tab === 'auto' && brands.apps.autoApp.name}
            {tab === 'cab' && brands.apps.cabApp.name}
            {tab === 'map' && 'NammaMap & Fast-Travel'}
            {tab === 'wallet' && brands.apps.upiWallet.name}
            {tab === 'garage' && 'Vehicle Garage'}
            {tab === 'messages' && 'Messages'}
            {tab === 'ratings' && 'Partner Ratings'}
          </span>
        </div>
        <button
          onClick={() => setPhoneOpen(false)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
          aria-label="Close Phone"
        >
          <X size={16} />
        </button>
      </div>

      {/* Phone Body */}
      <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'home' && (
          <>
            <div
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                borderRadius: 14,
                padding: 12,
                color: '#fff',
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85 }}>{brands.apps.upiWallet.name} Balance</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>₹{money.toFixed(0)}</div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>
                Completed Gigs: {ratings.completedCount} • Avg {ratings.foodDelivery} ★
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
              {[
                { id: 'food', label: brands.apps.foodDelivery.name, color: brands.apps.foodDelivery.color, icon: <ShoppingBag size={18} /> },
                { id: 'ride', label: brands.apps.bikeTaxi.name, color: brands.apps.bikeTaxi.color, icon: <Bike size={18} /> },
                { id: 'dash10', label: brands.apps.quickCommerce.name, color: brands.apps.quickCommerce.color, icon: <Package size={18} /> },
                { id: 'auto', label: brands.apps.autoApp.name, color: brands.apps.autoApp.color, icon: <Car size={18} /> },
                { id: 'cab', label: brands.apps.cabApp.name, color: brands.apps.cabApp.color, icon: <Car size={18} /> },
                { id: 'map', label: 'NammaMap', color: '#06b6d4', icon: <Compass size={18} /> },
                { id: 'wallet', label: brands.apps.upiWallet.name, color: brands.apps.upiWallet.color, icon: <Wallet size={18} /> },
                { id: 'garage', label: 'Garage', color: '#6366f1', icon: <Wrench size={18} /> },
                { id: 'messages', label: 'Messages', color: '#14b8a6', icon: <MessageSquare size={18} /> },
                { id: 'ratings', label: 'Ratings', color: '#eab308', icon: <Star size={18} /> },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setTab(app.id as PhoneTab)}
                  data-testid={`app-${app.id}`}
                  style={{
                    background: 'rgba(30,41,59,0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '10px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    color: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: app.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {app.icon}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{app.label}</span>
                </button>
              ))}
              {/* Night Poster Pasting Quick Launch */}
              <button
                onClick={() => openMinigame('posterPaste')}
                data-testid="app-poster"
                style={{
                  background: 'rgba(30,41,59,0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '10px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  color: '#f8fafc',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <FileImage size={18} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600 }}>Posters</span>
              </button>
            </div>
          </>
        )}

        {tab === 'food' && (
          <>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              {brands.apps.foodDelivery.tagline} • Works on Cycle or Scooter!
            </div>
            {activeJob ? (
              <div style={{ padding: 12, background: '#1e293b', borderRadius: 12, fontSize: 13 }}>
                Finish your active job first!
              </div>
            ) : (
              foodOffers.map((offer, i) => (
                <div
                  key={offer.id}
                  style={{
                    background: '#1e293b',
                    borderRadius: 12,
                    padding: 12,
                    border: '1px solid rgba(239,68,68,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{offer.restaurant}</div>
                  <div style={{ fontSize: 12, color: '#f8fafc' }}>{offer.item}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Drop: {offer.dropoffName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>~₹{offer.estimatedPay}</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => startJob(toActiveFoodJob(offer))}
                      data-testid={`accept-food-${i}`}
                    >
                      Accept Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'ride' && (
          <>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              {brands.apps.bikeTaxi.tagline} • Requires 125cc Scooter
            </div>
            {!hasScooter ? (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, marginBottom: 6 }}>
                  125cc Scooter Required
                </div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 10 }}>
                  Earn ₹1,200 via FoodZip/Dash10 and buy your scooter in Garage!
                </div>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setTab('garage')}>
                  Open Garage
                </button>
              </div>
            ) : activeJob ? (
              <div style={{ padding: 12, background: '#1e293b', borderRadius: 12, fontSize: 13 }}>
                Finish your active job first!
              </div>
            ) : (
              rideOffers.map((offer, i) => (
                <div
                  key={offer.id}
                  style={{
                    background: '#1e293b',
                    borderRadius: 12,
                    padding: 12,
                    border: '1px solid rgba(245,158,11,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fde047' }}>{offer.passengerName}</span>
                    {offer.surgeMultiplier > 1 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fb923c' }}>
                        {offer.surgeMultiplier}x SURGE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>Pickup: {offer.pickupName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Drop: {offer.dropoffName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>₹{offer.estimatedPay}</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => startJob(toActiveBikeJob(offer))}
                      data-testid={`accept-ride-${i}`}
                    >
                      Accept Ride
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'dash10' && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd' }}>{brands.apps.quickCommerce.name} Dark Store</div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              Pack groceries in the dark-store minigame and deliver within the 10-min rush timer!
            </div>
            <button className="btn-primary" onClick={() => openMinigame('dash10Pack')} data-testid="start-dash10">
              Start Packing Minigame (₹90)
            </button>
          </div>
        )}

        {tab === 'auto' && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            {!hasAuto ? (
              <>
                <div style={{ fontSize: 13, color: '#facc15', fontWeight: 700, marginBottom: 6 }}>Namma Auto Required (₹3,500)</div>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setTab('garage')}>
                  Open Garage
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => openMinigame('autoBargain')}>
                Pick Up Passenger (Meter / Bargain)
              </button>
            )}
          </div>
        )}

        {tab === 'cab' && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            {!hasCab ? (
              <>
                <div style={{ fontSize: 13, color: '#38bdf8', fontWeight: 700, marginBottom: 6 }}>City Sedan Cab Required (₹8,500)</div>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setTab('garage')}>
                  Open Garage
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7dd3fc' }}>{cabOffer.title}</div>
                <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                  {cabOffer.pickupName} → {cabOffer.dropoffName}
                </div>
                <button className="btn-primary" onClick={() => startJob(toActiveGenericJob('taxiCab', cabOffer))}>
                  Accept Cab Trip (₹{cabOffer.estimatedPay})
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'map' && (
          <>
            <div style={{ fontSize: 12, color: fastTravelUnlocked ? '#4ade80' : '#fbbf24', fontWeight: 700 }}>
              {fastTravelUnlocked
                ? '✓ Fast-Travel Unlocked! Tap any landmark:'
                : '🔒 Climb Chennai Lighthouse (1420, 360) to unlock Fast-Travel'}
            </div>
            {worldConfig.landmarks.map((lm) => (
              <div
                key={lm.id}
                style={{
                  background: '#1e293b',
                  borderRadius: 10,
                  padding: '8px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{lm.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    ({lm.x}, {lm.z})
                  </div>
                </div>
                <button
                  className={fastTravelUnlocked ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  disabled={!fastTravelUnlocked}
                  onClick={() => fastTravelTo(lm.x, lm.z, lm.name)}
                >
                  Go
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'wallet' && (
          <>
            <div style={{ background: '#064e3b', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#a7f3d0' }}>Available UPI Balance</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>₹{money.toFixed(0)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                onClick={() => buySnack('Filter Tea & Vadai', 15, 15, 18)}
              >
                <Coffee size={13} /> Tea ₹15
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, fontSize: 11 }}
                onClick={() => buySnack('Idli Sambar Plate', 35, 45, 12)}
              >
                Idli ₹35
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>Recent Transactions</div>
            {transactions.length === 0 ? (
              <div style={{ fontSize: 12, color: '#64748b' }}>No UPI transactions yet.</div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div>
                    <div style={{ color: '#e2e8f0' }}>{tx.title}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{tx.time}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: tx.amount >= 0 ? '#4ade80' : '#f87171' }}>
                    {tx.amount >= 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                  </span>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'garage' && (
          <>
            {(['cycle', 'bike', 'auto', 'cab'] as VehicleType[]).map((vk) => {
              const spec = jobsConfig.vehicles[vk];
              const owned = unlockedVehicles.includes(vk);
              const equipped = currentVehicle === vk;
              return (
                <div
                  key={vk}
                  style={{
                    background: '#1e293b',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{spec.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Top Speed: {spec.maxSpeed} m/s</div>
                  </div>
                  <button
                    className={owned ? 'btn-secondary' : 'btn-primary'}
                    style={{ fontSize: 12, padding: '6px 10px' }}
                    onClick={() => buyVehicle(vk)}
                  >
                    {equipped ? 'Equipped' : owned ? 'Equip' : `Buy ₹${spec.price}`}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {tab === 'messages' &&
          messages.map((m) => (
            <div key={m.id} style={{ background: '#1e293b', borderRadius: 12, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
                <span>{m.sender}</span>
                <span style={{ color: '#64748b' }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 4, lineHeight: 1.4 }}>{m.text}</div>
            </div>
          ))}

        {tab === 'ratings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>FoodZip Partner Rating</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#facc15' }}>{ratings.foodDelivery} ★</div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>RideNow Partner Rating</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#facc15' }}>{ratings.bikeTaxi} ★</div>
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>Total Completed Gigs: {ratings.completedCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}
