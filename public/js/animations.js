/**
 * DocBook Modern Motion & Animation Engine (animations.js)
 * Studio Redesign v2.0 — Powered by Framer Motion browser engine,
 * 60fps GPU acceleration, bi-directional scroll reveals, luminous card spotlights,
 * spring modal dialog physics, magnetic buttons, and 3D specular card tilt.
 */

// Dynamically load Motion from ESM CDN with fallback
let motionEngine = null;
export async function loadMotion() {
  if (motionEngine) return motionEngine;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm');
    motionEngine = mod;
    return motionEngine;
  } catch (err) {
    // Fallback to internal CSS / requestAnimationFrame physics if CDN is offline
    return null;
  }
}

// 1. Top Scroll Progress Indicator (Sleek Cyan/Teal Gradient)
export function initScrollProgress() {
  let bar = document.querySelector('.scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.width = '0%';
    bar.style.height = '3px';
    bar.style.background = 'linear-gradient(90deg, #0d7a71 0%, #14b8a6 50%, #38bdf8 100%)';
    bar.style.zIndex = '99999';
    bar.style.pointerEvents = 'none';
    bar.style.transition = 'width 0.1s linear';
    bar.style.boxShadow = '0 0 12px rgba(20, 184, 166, 0.75), 0 0 4px rgba(56, 189, 248, 0.5)';
    document.body.appendChild(bar);
  }

  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) {
      bar.style.width = '0%';
      return;
    }
    const progress = Math.min(100, Math.max(0, (window.scrollY / total) * 100));
    bar.style.width = `${progress}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// 2. Bi-Directional Scroll Reveal with Framer Motion Spring Physics
export async function initScrollReveals() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade, [data-count-to]');

  if (isReducedMotion) {
    targets.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  // Handle stagger delays for child elements
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.children;
    const baseDelay = parseInt(parent.getAttribute('data-stagger') || '80', 10);
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * baseDelay}ms`;
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');

        // Apply Framer Motion spring entrance if loaded
        if (motionEngine && !entry.target.dataset.motionAnimated) {
          entry.target.dataset.motionAnimated = 'true';
          try {
            motionEngine.animate(
              entry.target,
              { opacity: [0, 1], y: [16, 0] },
              { duration: 0.55, easing: [0.16, 1, 0.3, 1] }
            );
          } catch (_) {}
        }

        // Trigger count-up if element has data-count-to
        if (entry.target.hasAttribute('data-count-to') && !entry.target.dataset.counted) {
          animateCountUp(entry.target);
        }
      } else {
        // Bi-directional re-hide when scrolled past view
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          entry.target.classList.remove('is-revealed');
        }
      }
    });
  }, observerOptions);

  targets.forEach(el => revealObserver.observe(el));
}

// 3. Smooth Spring Count-Up Animation
export function animateCountUp(element) {
  element.dataset.counted = 'true';
  const targetStr = element.getAttribute('data-count-to') || '';
  const isDecimal = targetStr.includes('.');
  const targetNum = parseFloat(targetStr);
  const suffix = element.getAttribute('data-count-suffix') || '';
  const prefix = element.getAttribute('data-count-prefix') || '';
  const duration = 1400; // ms
  const startTime = performance.now();

  function updateCount(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Framer ease-out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = progress === 1 ? targetNum : (targetNum * easeOut);

    element.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.textContent = prefix + targetStr + suffix;
    }
  }

  requestAnimationFrame(updateCount);
}

// 4. Smart Sticky Navbar & Back-to-Top Button
export function initSmartNavbarAndScrollProgress() {
  initScrollProgress();

  let backToTop = document.getElementById('back-to-top');
  if (!backToTop) {
    backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top of page');
    backToTop.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    `;
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    // Back to top visibility
    if (backToTop) {
      if (currentScrollY > 280) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }

    // Smart Navbar hide on rapid scroll down / show on scroll up
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (currentScrollY > 20) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }

      if (currentScrollY > 180 && currentScrollY > lastScrollY && (currentScrollY - lastScrollY > 6)) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScrollY < lastScrollY - 4 || currentScrollY <= 100) {
        navbar.classList.remove('navbar-hidden');
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();
}

// 5. Interactive 3D Card Tilt with Specular Reflection
export function initDesktop3DTilt() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktopPointer || isReducedMotion) return;

  const tiltCards = document.querySelectorAll('.tilt-card, .doctor-card, .kpi-card');
  tiltCards.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// 6. Luminous Card Spotlight Cursor Tracking
export function initCardSpotlight() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isDesktopPointer) return;

  const cards = document.querySelectorAll('.card, .doctor-card, .kpi-card, .category-card, .queue-card, .trust-metric-box');
  cards.forEach(card => {
    if (card.dataset.spotlightInit) return;
    card.dataset.spotlightInit = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 7. Magnetic Buttons (Subtle Cursor Pull)
export function initMagneticButtons() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktopPointer || isReducedMotion) return;

  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-brand');
  magneticBtns.forEach(btn => {
    if (btn.dataset.magneticInit) return;
    btn.dataset.magneticInit = 'true';

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      btn.style.transform = `translate3d(${(x * 0.15).toFixed(1)}px, ${(y * 0.15).toFixed(1)}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// 8. Ripple Waves on Action Elements
export function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-primary, .btn-secondary, .slot-btn, .chip, .filter-chip');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-wave');

    const rippleExists = btn.getElementsByClassName('ripple-wave')[0];
    if (rippleExists) rippleExists.remove();

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}

// 9. Subtle Parallax for Ambient Hero Blobs & Badges
export function initParallaxOrbs() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const badges = document.querySelectorAll('.hero-floating-badge');
  if (badges.length === 0) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  function renderParallax() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    badges.forEach((b, i) => {
      const depth = (i + 1) * 12;
      b.style.transform = `translate3d(${(targetX * depth).toFixed(1)}px, ${(targetY * depth).toFixed(1)}px, 0)`;
    });

    requestAnimationFrame(renderParallax);
  }

  requestAnimationFrame(renderParallax);
}

// 10. Spring Modal Open Animation
export function initModalSpring() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const target = m.target;
        if (target.classList.contains('modal-backdrop') && (target.classList.contains('show') || target.classList.contains('open'))) {
          const box = target.querySelector('.modal-box');
          if (box) {
            box.style.transform = 'scale(0.92) translateY(20px)';
            box.style.opacity = '0';
            requestAnimationFrame(() => {
              box.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
              box.style.transform = 'scale(1) translateY(0)';
              box.style.opacity = '1';
            });
          }
        }
      }
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    observer.observe(modal, { attributes: true });
  });
}

// Global Orchestrator
export async function initAllAnimations() {
  await loadMotion();
  initScrollReveals();
  initSmartNavbarAndScrollProgress();
  initDesktop3DTilt();
  initCardSpotlight();
  initMagneticButtons();
  initButtonRipples();
  initParallaxOrbs();
  initModalSpring();
}

if (typeof window !== 'undefined') {
  window.initAllAnimations = initAllAnimations;
  window.initScrollReveals = initScrollReveals;
  window.initDesktop3DTilt = initDesktop3DTilt;
  window.initCardSpotlight = initCardSpotlight;
}

// Auto-boot on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    initAllAnimations();
  }
}
