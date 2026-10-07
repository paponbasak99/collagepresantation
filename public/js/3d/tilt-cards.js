// DocBook CSS 3D Tilt Cards Engine (tilt-cards.js)
// Real Depth Z-Layer Stacking for Specialties & Doctor Cards

import { isReducedEffects } from '/js/3d/core.js';

export function setupTiltCard(card, options = {}) {
  if (card._tiltInitialized) return;
  card._tiltInitialized = true;

  const maxTilt = options.maxTilt || 8; // degrees

  card.classList.add('tilt-card-3d');

  // Insert specular light plane if missing
  if (!card.querySelector('.tilt-specular-shine')) {
    const shine = document.createElement('div');
    shine.className = 'tilt-specular-shine';
    card.appendChild(shine);
  }

  // Elevate internal child layers for multi-plane depth
  const iconOrAvatar = card.querySelector('.doctor-avatar, .specialty-icon, .card-icon, img');
  if (iconOrAvatar) iconOrAvatar.classList.add('tilt-layer-high');

  const badges = card.querySelectorAll('.badge, .status-pill, .fee-tag');
  badges.forEach(b => b.classList.add('tilt-layer-mid'));

  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let rafId = null;

  function update() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.15;
    currentTiltY += (targetTiltY - currentTiltY) * 0.15;

    card.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateZ(6px)`;

    if (Math.abs(targetTiltX - currentTiltX) > 0.05 || Math.abs(targetTiltY - currentTiltY) > 0.05) {
      rafId = requestAnimationFrame(update);
    } else {
      rafId = null;
    }
  }

  function onPointerMove(e) {
    if (isReducedEffects()) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    targetTiltX = -normY * maxTilt;
    targetTiltY = normX * maxTilt;

    card.style.setProperty('--mouse-x', `${(x / rect.width * 100).toFixed(1)}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height * 100).toFixed(1)}%`);

    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  }

  function onPointerLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  }

  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerleave', onPointerLeave);
}

export function initAllTiltCards(root = document) {
  const cards = root.querySelectorAll('.specialty-card, .doctor-card, [data-tilt]');
  cards.forEach(c => setupTiltCard(c));
}
