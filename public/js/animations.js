/**
 * DocBook Modern Motion Engine (animations.js)
 * Clean, lightweight vanilla JS animation engine — ZERO CDN runtime dependencies.
 * Implements:
 * - Scroll-triggered fade/slide-up reveals (IntersectionObserver)
 * - Page-load staggered reveals
 * - Smooth animated counters for statistics
 * - Subtle 3D card tilt & cursor glow tracking (CSS transforms)
 * - Button micro-interactions (ripple wave)
 * - Sticky navbar hiding/showing & back-to-top
 * - Full respect for prefers-reduced-motion and manual .reduce-effects toggle
 */

export function isReducedMotion() {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('reduce-effects') ||
    localStorage.getItem('docbook_reduce_motion') === 'true'
  );
}

// 1. Scroll-Triggered Reveal (IntersectionObserver)
export function initScrollReveals() {
  const targets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade, [data-count-to]'
  );

  if (targets.length === 0) return;

  if (isReducedMotion()) {
    targets.forEach(el => {
      el.classList.add('is-revealed');
      if (el.hasAttribute('data-count-to') && !el.dataset.counted) {
        const prefix = el.getAttribute('data-count-prefix') || '';
        const suffix = el.getAttribute('data-count-suffix') || '';
        el.textContent = prefix + el.getAttribute('data-count-to') + suffix;
        el.dataset.counted = 'true';
      }
    });
    return;
  }

  // Stagger delays for child containers
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.children;
    const baseDelay = parseInt(parent.getAttribute('data-stagger') || '60', 10);
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * baseDelay}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          if (entry.target.hasAttribute('data-count-to') && !entry.target.dataset.counted) {
            animateCountUp(entry.target);
          }
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
  );

  targets.forEach(el => observer.observe(el));
}

// 2. Animated Counter for Stats
export function animateCountUp(element) {
  element.dataset.counted = 'true';
  const targetStr = element.getAttribute('data-count-to') || '0';
  const isDecimal = targetStr.includes('.');
  const targetNum = parseFloat(targetStr);
  const prefix = element.getAttribute('data-count-prefix') || '';
  const suffix = element.getAttribute('data-count-suffix') || '';
  const duration = 1200; // ms
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = progress === 1 ? targetNum : targetNum * easeOut;

    element.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = prefix + targetStr + suffix;
    }
  }

  requestAnimationFrame(step);
}

// 3. Subtle 3D Card Tilt on Pointer Movement (CSS Transforms)
export function initDesktop3DTilt() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isDesktopPointer || isReducedMotion()) return;

  const tiltCards = document.querySelectorAll('.tilt-card, .doctor-card, .kpi-card');
  tiltCards.forEach(card => {
    if (card.dataset.tiltWired) return;
    card.dataset.tiltWired = 'true';

    card.addEventListener('mousemove', (e) => {
      if (isReducedMotion()) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Limit max tilt to 4 degrees for subtle professional medical feel
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// 4. Cursor Spotlight Tracker for Cards
export function initCardSpotlight() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isDesktopPointer) return;

  const cards = document.querySelectorAll('.card, .doctor-card, .kpi-card, .category-card, .queue-card, .trust-metric-box');
  cards.forEach(card => {
    if (card.dataset.spotlightWired) return;
    card.dataset.spotlightWired = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

// 5. Button Micro-interactions (Ripple Wave)
export function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-primary, .btn-secondary, .slot-btn, .filter-chip');
    if (!btn || isReducedMotion()) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-wave');

    const prev = btn.querySelector('.ripple-wave');
    if (prev) prev.remove();

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
}

// 6. Sticky Navbar Hide/Show on Scroll & Back to Top
export function initSmartNavbarAndScrollProgress() {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop && !backToTop.dataset.wired) {
    backToTop.dataset.wired = 'true';
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: isReducedMotion() ? 'auto' : 'smooth' });
    });
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    // Back to top visibility
    if (backToTop) {
      if (currentScrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }

    // Navbar scrolled state and smart hide
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (currentScrollY > 20) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }

      if (currentScrollY > 160 && currentScrollY > lastScrollY && (currentScrollY - lastScrollY > 8)) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScrollY < lastScrollY - 4 || currentScrollY <= 80) {
        navbar.classList.remove('navbar-hidden');
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();
}

// 7. Accessible Modal Transitions
export function initModalSpring() {
  // Simple CSS handles modal open/close smoothly
}

// Global Orchestrator
export function initAllAnimations() {
  initScrollReveals();
  initSmartNavbarAndScrollProgress();
  initDesktop3DTilt();
  initCardSpotlight();
  initButtonRipples();
}

if (typeof window !== 'undefined') {
  window.initAllAnimations = initAllAnimations;
  window.initScrollReveals = initScrollReveals;
  window.initDesktop3DTilt = initDesktop3DTilt;
  window.initCardSpotlight = initCardSpotlight;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    initAllAnimations();
  }
}
