// DocBook Modern Clinical Toast Notification System — v2.0
// Styled with glassmorphism, Framer-inspired spring entrance, SVG icons & auto-dismiss progress bar.

export function showToast(message, type = 'info', durationMs = 4200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  const iconsSvg = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  toast.innerHTML = `
    <div class="toast-content" style="display: flex; align-items: flex-start; gap: 10px; width: 100%;">
      <span class="toast-icon-wrap" style="flex-shrink: 0; margin-top: 2px;">${iconsSvg[type] || iconsSvg.info}</span>
      <div class="toast-msg" style="flex: 1; font-weight: 500; font-size: 0.875rem; line-height: 1.45; word-break: break-word;">${message}</div>
      <button class="toast-close" aria-label="Close notification" style="background: none; border: none; cursor: pointer; color: inherit; opacity: 0.6; padding: 2px 4px; font-size: 1.1rem; line-height: 1; flex-shrink: 0;">&times;</button>
    </div>
    ${durationMs > 0 ? `<div class="toast-progress-bar" style="position: absolute; bottom: 0; left: 0; height: 3px; width: 100%; border-radius: 0 0 0 6px;"></div>` : ''}
  `;

  const closeBtn = toast.querySelector('.toast-close');
  let isDismissed = false;

  function dismissToast() {
    if (isDismissed) return;
    isDismissed = true;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px) scale(0.95)';
    toast.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 260);
  }

  closeBtn?.addEventListener('click', dismissToast);

  container.appendChild(toast);

  // Animate progress bar if timed
  if (durationMs > 0) {
    const progressEl = toast.querySelector('.toast-progress-bar');
    if (progressEl) {
      progressEl.style.transition = `width ${durationMs}ms linear`;
      progressEl.style.width = '100%';
      // Trigger reflow to start transition
      void progressEl.offsetWidth;
      progressEl.style.width = '0%';
    }

    const timer = setTimeout(dismissToast, durationMs);

    // Pause dismissal on mouse hover
    toast.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      if (progressEl) progressEl.style.transitionPlayState = 'paused';
    });
    toast.addEventListener('mouseleave', () => {
      setTimeout(dismissToast, 1200);
    });
  }

  return toast;
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
