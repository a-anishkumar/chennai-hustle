import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../systems/gameStore';
import { virtualInput } from '../systems/virtualInput';
import jobsConfig from '../config/jobs.json';
import { getTerrainHeight } from './TerrainHeight';
import { AnimatedPlayerMesh } from './AnimatedPlayerMesh';
import { AnimatedHumanNpc } from './AnimatedHumanNpc';
import { isNightHour } from '../systems/timeUtils';
import { audioManager } from '../audio/AudioManager';

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _camFinal = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

export function PlayerController() {
  const rbRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const frontWheelRef = useRef<THREE.Mesh>(null);
  const rearWheelRef = useRef<THREE.Mesh>(null);

  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();

  const currentVehicle = useGameStore((s) => s.currentVehicle);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const night = isNightHour(timeOfDay);
  const [initialPos] = useState(() => useGameStore.getState().playerPos);
  const firstPersonRef = useRef(false);
  const cinematicCamRef = useRef(false);
  const isCrouchingRef = useRef(false);
  const stepTimerRef = useRef(0);

  // Input state
  const keys = useRef<Record<string, boolean>>({});
  const camYaw = useRef(0.3);
  const camPitch = useRef(0.32);
  const camDist = useRef(9.5);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const syncTimer = useRef(0);
  const animPhase = useRef(0);
  const [movingAnim, setMovingAnim] = useState(false);
  const [sprintAnim, setSprintAnim] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      keys.current[code] = true;

      if (!useGameStore.getState().isStarted) return;

      if (code === 'KeyB') {
        useGameStore.getState().toggleVehicleCycle();
      } else if (code === 'KeyV') {
        firstPersonRef.current = !firstPersonRef.current;
      } else if (code === 'KeyG') {
        cinematicCamRef.current = !cinematicCamRef.current;
      } else if (code === 'KeyC') {
        isCrouchingRef.current = !isCrouchingRef.current;
      } else if (code === 'KeyP') {
        useGameStore.getState().togglePhone();
      } else if (code === 'KeyM') {
        useGameStore.getState().toggleFullMap();
      } else if (code === 'KeyE') {
        const s = useGameStore.getState();
        const [px, , pz] = s.playerPos;
        const near = (tx: number, tz: number, r = 7) => (px - tx) ** 2 + (pz - tz) ** 2 < r * r;
        if (near(-133, 42)) s.restAtHome();
        else if (near(1412, 360, 10)) s.unlockFastTravel();
        else if (near(-40, -31, 8)) s.openMinigame('teaMaster');
        else if (near(-480, -303, 10)) s.openMinigame('cinemaQueue');
        else if (near(962, -1318, 12)) s.openMinigame('harbourCrates');
        else if (near(-68, -31, 7)) s.buySnack('Anbu Tea & Bajji', 25, 28, 14);
        else if (near(-120, 24, 8) || near(1492, 92, 8) || near(408, -248, 8)) {
          s.buySnack('Chennai Food Truck Shawarma', 25, 32, 16);
        } else if (near(-215, -85, 9)) {
          if (s.money >= 20) {
            s.modifyStats({ money: -20, fuel: 100 });
            audioManager.playCash();
            s.showToast('Refueled 100% at Chennai Petrol Bunk (-₹20)');
          } else {
            s.showToast('Need ₹20 to refuel at Petrol Bunk!');
          }
        } else if (near(-140, -95, 8)) {
          s.modifyStats({ fuel: 100 });
          s.showToast('EV Bike fast-charged to 100%!');
        } else if (near(-155, -35, 8)) {
          s.modifyStats({ mood: 10, reputation: 4 });
          s.showToast('TTF Vasan tuned & serviced your ride!');
        } else if (near(-138, 62, 5) || near(-16, 68, 5) || near(-102, 62, 5) || near(-176, 6, 5)) {
          s.modifyStats({ stamina: 18, mood: 10 });
          s.showToast('Sat on Chennai bench — Stamina & Mood restored!');
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      camYaw.current -= dx * 0.0055;
      camPitch.current = THREE.MathUtils.clamp(camPitch.current + dy * 0.0045, 0.08, 1.15);
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      camDist.current = THREE.MathUtils.clamp(camDist.current + e.deltaY * 0.008, 4.5, 18);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused || !rbRef.current) return;

    const rb = rbRef.current;
    if (state.pendingTeleport) {
      const [tx, ty, tz] = state.pendingTeleport;
      rb.setTranslation({ x: tx, y: ty, z: tz }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      state.clearPendingTeleport();
      return;
    }

    const pos = rb.translation();
    const vel = rb.linvel();

    const groundY = getTerrainHeight(pos.x, pos.z);
    const minSurfaceY = state.currentVehicle === 'boat' ? Math.max(groundY, state.waterLevel - 0.15) : groundY;
    if (pos.y < minSurfaceY - 0.1) {
      rb.setTranslation({ x: pos.x, y: minSurfaceY + 0.05, z: pos.z }, true);
      rb.setLinvel({ x: vel.x, y: 0, z: vel.z }, true);
    }

    // Clamp inside 4km x 4km world bounds
    if (Math.abs(pos.x) > 1950 || Math.abs(pos.z) > 1950) {
      rb.setTranslation(
        {
          x: THREE.MathUtils.clamp(pos.x, -1950, 1950),
          y: pos.y,
          z: THREE.MathUtils.clamp(pos.z, -1950, 1950),
        },
        true
      );
    }

    // Camera-relative movement axes
    _fwd.set(-Math.sin(camYaw.current), 0, -Math.cos(camYaw.current)).normalize();
    _right.set(Math.cos(camYaw.current), 0, -Math.sin(camYaw.current)).normalize();

    let inputF = virtualInput.moveY;
    let inputR = virtualInput.moveX;
    if (keys.current['KeyW'] || keys.current['ArrowUp']) inputF += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) inputF -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) inputR += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) inputR -= 1;

    // Gamepad API polling
    const gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.15) inputR += gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.15) inputF -= gp.axes[1];
      if (Math.abs(gp.axes[2]) > 0.15) camYaw.current -= gp.axes[2] * dt * 2.2;
      if (Math.abs(gp.axes[3]) > 0.15) {
        camPitch.current = THREE.MathUtils.clamp(camPitch.current + gp.axes[3] * dt * 1.6, 0.08, 1.15);
      }
    }

    _move.set(0, 0, 0);
    _move.addScaledVector(_fwd, inputF);
    _move.addScaledVector(_right, inputR);
    const isMoving = _move.lengthSq() > 0.01;
    if (isMoving) _move.normalize();

    const vSpec = jobsConfig.vehicles[state.currentVehicle] || jobsConfig.vehicles.foot;
    const isSprinting = keys.current['ShiftLeft'] || keys.current['ShiftRight'] || virtualInput.sprint;
    const rainPenalty =
      state.currentVehicle !== 'boat' && (state.weather === 'monsoon' || state.weather === 'flood') ? 0.78 : 1.0;
    const crouchMult = state.currentVehicle === 'foot' && isCrouchingRef.current ? 0.55 : 1.0;
    const speedMult = (isSprinting ? 1.32 : 1.0) * rainPenalty * crouchMult;
    const targetSpeed = isMoving ? vSpec.maxSpeed * speedMult : 0;

    // Vehicle-distinct acceleration, braking inertia, turning & banking behavior
    const tractionFactor = state.weather === 'monsoon' || state.weather === 'flood' ? 0.55 : 1.0;
    const decelRate = state.currentVehicle === 'cab' ? 4.5 : state.currentVehicle === 'boat' ? 2.8 : 10;
    const lerpFactor = Math.min(1, dt * (isMoving ? vSpec.accel * 0.45 * tractionFactor : decelRate * tractionFactor));
    const vx = THREE.MathUtils.lerp(vel.x, _move.x * targetSpeed, lerpFactor);
    const vz = THREE.MathUtils.lerp(vel.z, _move.z * targetSpeed, lerpFactor);
    let vy = vel.y;
    if (
      keys.current['Space'] &&
      state.currentVehicle === 'foot' &&
      Math.abs(vel.y) < 0.3 &&
      pos.y <= minSurfaceY + 0.35
    ) {
      vy = 7.2;
    }
    rb.setLinvel({ x: vx, y: vy, z: vz }, true);

    // Distinct turning rate & banking/bobbing per vehicle
    if (meshGroupRef.current) {
      if (isMoving) {
        const targetRot = Math.atan2(_move.x, _move.z);
        let diff = targetRot - meshGroupRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnRate =
          state.currentVehicle === 'foot'
            ? 14
            : state.currentVehicle === 'cab'
            ? 5.5
            : state.currentVehicle === 'boat'
            ? 4.2
            : 9.5;
        meshGroupRef.current.rotation.y += diff * Math.min(1, dt * turnRate);

        const leanFactor =
          state.currentVehicle === 'bike'
            ? 0.35
            : state.currentVehicle === 'cycle'
            ? 0.25
            : state.currentVehicle === 'auto'
            ? -0.1
            : 0;
        meshGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          meshGroupRef.current.rotation.z,
          THREE.MathUtils.clamp(diff * leanFactor, -0.24, 0.24),
          dt * 8
        );
      } else {
        meshGroupRef.current.rotation.z = THREE.MathUtils.lerp(meshGroupRef.current.rotation.z, 0, dt * 8);
      }

      if (state.currentVehicle === 'boat') {
        meshGroupRef.current.rotation.x = Math.sin(animPhase.current * 0.5 + performance.now() * 0.0025) * 0.04;
      } else {
        meshGroupRef.current.rotation.x = 0;
      }
    }

    // Limb, wheel & footstep cadence
    const horizSpeed = Math.hypot(vx, vz);
    if (state.currentVehicle === 'foot' && horizSpeed > 0.8) {
      stepTimerRef.current += dt * (isSprinting ? 2.8 : 1.9);
      if (stepTimerRef.current >= 1) {
        stepTimerRef.current = 0;
        audioManager.playFootstep();
      }
    }
    if (meshGroupRef.current) {
      const targetScaleY = state.currentVehicle === 'foot' && isCrouchingRef.current ? 0.72 : 1.0;
      meshGroupRef.current.scale.y = THREE.MathUtils.lerp(meshGroupRef.current.scale.y, targetScaleY, dt * 10);
    }
    if (horizSpeed > 0.4) {
      animPhase.current += dt * horizSpeed * (state.currentVehicle === 'cycle' ? 1.1 : 1.8);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(animPhase.current) * 0.55;
        rightLegRef.current.rotation.x = -Math.sin(animPhase.current) * 0.55;
      }
      if (frontWheelRef.current && rearWheelRef.current) {
        frontWheelRef.current.rotation.z -= dt * horizSpeed * 1.4;
        rearWheelRef.current.rotation.z -= dt * horizSpeed * 1.4;
      }
    } else if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x *= 0.85;
      rightLegRef.current.rotation.x *= 0.85;
    }

    if (cinematicCamRef.current) {
      camYaw.current += dt * 0.22;
    }

    if (firstPersonRef.current) {
      const eyeY = pos.y + (isCrouchingRef.current ? 1.15 : 1.68);
      _camFinal.set(pos.x, eyeY, pos.z);
      _camTarget.set(
        pos.x - Math.sin(camYaw.current) * 8,
        eyeY - Math.sin(camPitch.current) * 4,
        pos.z - Math.cos(camYaw.current) * 8
      );
      camera.position.lerp(_camFinal, Math.min(1, dt * 18));
      camera.lookAt(_camTarget);
    } else {
      // Third-person camera with Rapier raycast collision
      _camTarget.set(pos.x, pos.y + 1.5, pos.z);
      const cosP = Math.cos(camPitch.current);
      const sinP = Math.sin(camPitch.current);
      _camDesired.set(
        pos.x + Math.sin(camYaw.current) * cosP * camDist.current,
        pos.y + 1.5 + sinP * camDist.current,
        pos.z + Math.cos(camYaw.current) * cosP * camDist.current
      );

      _rayDir.subVectors(_camDesired, _camTarget);
      const rayLen = _rayDir.length();
      _rayDir.normalize();

      let finalDist = rayLen;
      const ray = new rapier.Ray(
        { x: _camTarget.x, y: _camTarget.y, z: _camTarget.z },
        { x: _rayDir.x, y: _rayDir.y, z: _rayDir.z }
      );
      const hit = world.castRay(ray, rayLen, true, undefined, undefined, undefined, rb);
      if (hit && hit.timeOfImpact < rayLen && hit.timeOfImpact > 1.2) {
        finalDist = Math.max(1.8, hit.timeOfImpact - 0.45);
      }

      _camFinal.copy(_camTarget).addScaledVector(_rayDir, finalDist);
      camera.position.lerp(_camFinal, Math.min(1, dt * 14));
      camera.lookAt(_camTarget);
    }

    // Throttled store sync (~8 Hz)
    syncTimer.current += dt;
    if (syncTimer.current > 0.12) {
      const elapsed = syncTimer.current;
      syncTimer.current = 0;
      const rotY = meshGroupRef.current ? meshGroupRef.current.rotation.y : 0;
      state.updatePlayerTransform([pos.x, pos.y, pos.z], rotY);
      setMovingAnim(horizSpeed > 0.6);
      setSprintAnim(Boolean(isSprinting));
      if (state.activeJob) {
        state.tickActiveJob(elapsed);
      }
    }
  });

  const isCycle = currentVehicle === 'cycle';
  const isBike = currentVehicle === 'bike';
  const isAuto = currentVehicle === 'auto';
  const isCab = currentVehicle === 'cab';
  const isBoat = currentVehicle === 'boat';

  return (
    <RigidBody
      ref={rbRef}
      position={initialPos}
      colliders={false}
      mass={1}
      type="dynamic"
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.55, 0.38]} position={[0, 0.95, 0]} />

      <group ref={meshGroupRef}>
        {/* Player Character: Skeletal Animated GLB on foot, or Rider Rig on vehicles */}
        {currentVehicle === 'foot' ? (
          <AnimatedPlayerMesh
            isMoving={movingAnim}
            isSprinting={sprintAnim}
            fallback={
              <group>
                <mesh position={[0, 1.05, 0]} castShadow>
                  <boxGeometry args={[0.52, 0.68, 0.32]} />
                  <meshStandardMaterial color="#f97316" roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.58, 0]} castShadow>
                  <sphereGeometry args={[0.21, 12, 12]} />
                  <meshStandardMaterial color="#8d5524" roughness={0.6} />
                </mesh>
                <mesh ref={leftLegRef} position={[-0.14, 0.42, 0]} castShadow>
                  <boxGeometry args={[0.18, 0.65, 0.2]} />
                  <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
                </mesh>
                <mesh ref={rightLegRef} position={[0.14, 0.42, 0]} castShadow>
                  <boxGeometry args={[0.18, 0.65, 0.2]} />
                  <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
                </mesh>
              </group>
            }
          />
        ) : (
          <group position={[0, isCycle || isBike ? 0.35 : 0.15, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="idle" tintColor="#f97316" prop="bag" />
            {night && (
              <pointLight position={[0, 1.0, 2.2]} color="#fef08a" intensity={10} distance={22} decay={2} />
            )}
          </group>
        )}

        {/* Borrowed Bicycle */}
        {isCycle && (
          <group name="Borrowed_Cycle" position={[0, 0.05, 0]}>
            {/* Frame */}
            <mesh position={[0, 0.55, 0]} rotation={[0.15, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.08, 1.15]} />
              <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Seat post */}
            <mesh position={[0, 0.62, -0.3]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.55, 6]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Handlebars */}
            <mesh position={[0, 0.92, 0.48]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.58, 6]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            {/* Front Wheel */}
            <mesh ref={frontWheelRef} position={[0, 0.34, 0.56]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.3, 0.05, 8, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            {/* Rear Wheel */}
            <mesh ref={rearWheelRef} position={[0, 0.34, -0.56]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.3, 0.05, 8, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* 125cc Scooter */}
        {isBike && (
          <group name="Scooter_125cc" position={[0, 0.05, 0]}>
            <mesh position={[0, 0.52, -0.05]} castShadow>
              <boxGeometry args={[0.42, 0.36, 1.35]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.35} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.92, 0.52]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.28, 0.65, 0.22]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.05, 0.65]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.6} />
            </mesh>
            <mesh position={[0, 1.22, 0.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.68, 6]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[0, 0.28, 0.58]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.24, 0.09, 8, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.28, -0.55]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.24, 0.09, 8, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* Namma Auto-Rickshaw */}
        {isAuto && (
          <group name="Namma_Auto" position={[0, 0.1, 0]}>
            <mesh position={[0, 0.52, 0]} castShadow>
              <boxGeometry args={[1.4, 0.72, 2.3]} />
              <meshStandardMaterial color="#facc15" roughness={0.45} />
            </mesh>
            <mesh position={[0, 1.32, -0.15]} castShadow>
              <boxGeometry args={[1.38, 0.72, 1.85]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>
            {/* Windshield */}
            <mesh position={[0, 1.05, 0.92]} rotation={[-0.25, 0, 0]}>
              <boxGeometry args={[1.1, 0.55, 0.08]} />
              <meshStandardMaterial color="#bae6fd" transparent opacity={0.65} />
            </mesh>
            {/* 3 Wheels */}
            {[
              [0, 0.24, 0.92],
              [-0.68, 0.24, -0.78],
              [0.68, 0.24, -0.78],
            ].map(([wx, wy, wz], idx) => (
              <mesh key={idx} position={[wx, wy, wz]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <torusGeometry args={[0.22, 0.08, 8, 12]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            ))}
            <mesh position={[0, 0.62, 1.18]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
            </mesh>
          </group>
        )}

        {/* City Sedan Cab */}
        {isCab && (
          <group name="City_Cab" position={[0, 0.1, 0]}>
            <mesh position={[0, 0.52, 0]} castShadow>
              <boxGeometry args={[1.8, 0.68, 3.8]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.25} />
            </mesh>
            <mesh position={[0, 1.06, -0.15]} castShadow>
              <boxGeometry args={[1.55, 0.56, 2.0]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.44, 0.1]}>
              <boxGeometry args={[0.6, 0.2, 0.25]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.9} />
            </mesh>
            {/* 4 Wheels */}
            {[
              [-0.9, 0.28, 1.15],
              [0.9, 0.28, 1.15],
              [-0.9, 0.28, -1.15],
              [0.9, 0.28, -1.15],
            ].map(([wx, wy, wz], idx) => (
              <mesh key={idx} position={[wx, wy, wz]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <torusGeometry args={[0.26, 0.09, 8, 12]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            ))}
          </group>
        )}

        {/* Flood Rescue Boat */}
        {isBoat && (
          <group name="Rescue_Boat" position={[0, 0.1, 0]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[1.6, 0.55, 3.4]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.35, 1.95]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <boxGeometry args={[1.15, 0.55, 1.15]} />
              <meshStandardMaterial color="#ea580c" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.68, -0.85]} castShadow>
              <boxGeometry args={[1.2, 0.35, 0.8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
}
