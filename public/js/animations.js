/**
 * DocBook Modern Motion & Scroll Animations Engine (animations.js)
 * Fully Vanilla ES6+, GPU-Accelerated, Bi-Directional Scroll & Micro-Interactions
 */

// 1. Bi-Directional Scroll Reveal via IntersectionObserver
export function initScrollReveals() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // Handle stagger parent groups
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.children;
    const baseDelay = parseInt(parent.getAttribute('data-stagger') || '80', 10);
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * baseDelay}ms`;
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Trigger count-up if element has data-count-to
        if (entry.target.hasAttribute('data-count-to') && !entry.target.dataset.counted) {
          animateCountUp(entry.target);
        }
      } else {
        // Bi-directional: re-hide softly when out of view so it replays up and down
        // Only re-hide if scrolled past it, giving smooth cinematic flow
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          entry.target.classList.remove('is-revealed');
        }
      }
    });
  }, observerOptions);

  const targets = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-fade, [data-count-to]'
  );
  targets.forEach(el => revealObserver.observe(el));
}

// 2. Count-Up Animation for Stat / Trust Metrics
function animateCountUp(element) {
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
    // Smooth ease-out cubic
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

// 3. Smart Navbar Hide/Show
export function initSmartNavbarAndScrollProgress() {
  // Remove scroll progress bar if it exists
  const existingProgressBar = document.querySelector('.scroll-progress-bar');
  if (existingProgressBar) {
    existingProgressBar.remove();
  }

  // Ensure Back-to-Top button exists
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

    // 2. Back to top visibility
    if (backToTop) {
      if (currentScrollY > 320) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }

    // 3. Smart Navbar hide on scroll down / show on scroll up
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (currentScrollY > 24) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }

      // Hide only after scrolling past 150px down and moving downwards rapidly
      if (currentScrollY > 180 && currentScrollY > lastScrollY && (currentScrollY - lastScrollY > 4)) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScrollY < lastScrollY - 4 || currentScrollY <= 120) {
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

// 4. Desktop 3D Card Tilt Effect (Doctor Cards & Feature Tiles)
export function initDesktop3DTilt() {
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isDesktopPointer || isReducedMotion) return;

  const tiltCards = document.querySelectorAll('.tilt-card, .doctor-card');
  tiltCards.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = 'true';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// 5. Button Click Ripple Micro-Interaction
export function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-primary, .btn-secondary, .slot-btn, .chip');
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

// 6. Subtle Parallax for Ambient Hero Blobs & Badges
export function initParallaxOrbs() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const blobs = document.querySelectorAll('.ambient-mesh-blob');
  const badges = document.querySelectorAll('.hero-floating-badge');
  if (blobs.length === 0 && badges.length === 0) return;

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

// Global Orchestrator
export function initAllAnimations() {
  initScrollReveals();
  initSmartNavbarAndScrollProgress();
  initDesktop3DTilt();
  initButtonRipples();
  initParallaxOrbs();
}

if (typeof window !== 'undefined') {
  window.initAllAnimations = initAllAnimations;
  window.initScrollReveals = initScrollReveals;
  window.initDesktop3DTilt = initDesktop3DTilt;
}

// Auto-boot on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    initAllAnimations();
  }
}
