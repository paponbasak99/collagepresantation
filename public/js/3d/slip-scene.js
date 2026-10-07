// DocBook 3D Appointment Ticket Reveal Engine (slip-scene.js)
// Physical Ticket Dispense Overshoot + Gyroscopic/Pointer Spatial Tilt

import { isReducedEffects } from '/js/3d/core.js';

export function initSlipScene(slipCardEl) {
  if (!slipCardEl || slipCardEl._slip3dBound) return;
  slipCardEl._slip3dBound = true;

  if (isReducedEffects()) return;

  // Add 3D ticket dispense animation class
  slipCardEl.classList.add('slip-3d-reveal');

  const maxTilt = 4.5; // subtle, realistic paper tilt in degrees
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let rafId = null;

  function update() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.1;
    currentTiltY += (targetTiltY - currentTiltY) * 0.1;

    // Apply 3D transform while keeping ticket centered
    slipCardEl.style.transform = `perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(8px)`;

    if (Math.abs(targetTiltX - currentTiltX) > 0.02 || Math.abs(targetTiltY - currentTiltY) > 0.02) {
      rafId = requestAnimationFrame(update);
    } else {
      rafId = null;
    }
  }

  function onPointerMove(e) {
    if (isReducedEffects()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const normX = (e.clientX / w) * 2 - 1;
    const normY = (e.clientY / h) * 2 - 1;

    targetTiltX = -normY * maxTilt;
    targetTiltY = normX * maxTilt;

    if (!rafId) rafId = requestAnimationFrame(update);
  }

  function onPointerLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
    if (!rafId) rafId = requestAnimationFrame(update);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave);

  // Optional mobile gyroscope listener (if permission granted and supported)
  if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (isReducedEffects() || !e.gamma || !e.beta) return;
      targetTiltY = Math.min(Math.max(e.gamma / 12, -maxTilt), maxTilt);
      targetTiltX = Math.min(Math.max((e.beta - 45) / 12, -maxTilt), maxTilt);
      if (!rafId) rafId = requestAnimationFrame(update);
    }, { passive: true });
  }
}
