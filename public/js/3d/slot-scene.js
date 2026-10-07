// DocBook 3D Time-Slot Keycaps Engine (slot-scene.js)
// Tactile Raised Surface, Cascade Flip-Up & Press Kinetics

import { isReducedEffects } from '/js/3d/core.js';

export function enhanceSlotsWith3DKeys(container = document) {
  const slotButtons = container.querySelectorAll('.slot-btn');
  if (slotButtons.length === 0) return;

  const reduced = isReducedEffects();

  slotButtons.forEach((btn, idx) => {
    btn.classList.add('slot-key-3d');

    if (!reduced) {
      btn.classList.add('slot-cascade-enter');
      btn.style.animationDelay = `${Math.min(idx * 35, 400)}ms`;
    }

    // Reflect status flags into 3D keycap classes
    if (btn.classList.contains('held') || btn.getAttribute('data-held') === 'true') {
      btn.classList.add('locked');
    }
    if (btn.classList.contains('booked') || btn.hasAttribute('disabled')) {
      btn.classList.add('booked');
    }

    // Pointer feedback
    btn.addEventListener('click', () => {
      if (btn.classList.contains('booked') || btn.hasAttribute('disabled')) return;
      container.querySelectorAll('.slot-key-3d').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}
