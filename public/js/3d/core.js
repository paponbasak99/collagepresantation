// DocBook 3D Clinical Engine Core (core.js)
// Central Lifecycle, Hardware Capability Detection, Viewport Pause & Disposal

let threeModulePromise = null;

/**
 * Lazy loads Three.js strictly from self-hosted vendor path
 */
export async function getThree() {
  if (!threeModulePromise) {
    threeModulePromise = import('/vendor/three/three.module.js');
  }
  return threeModulePromise;
}

/**
 * Evaluates hardware performance tier and user accessibility preferences
 * @returns {1 | 2 | 3} 1 = High WebGL, 2 = Mid/Mobile WebGL, 3 = Pure CSS/Static Fallback
 */
export function detectCapability() {
  if (typeof window === 'undefined') return 3;

  // Check user motion preferences & manual setting
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const userReduced = localStorage.getItem('docbook_reduce_motion') === 'true';
  if (prefersReduced || userReduced) return 3;

  // Check WebGL availability
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return 3;
  } catch (e) {
    return 3;
  }

  // Check low-spec CPU or RAM
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || window.innerWidth < 768;

  if (cores <= 4 || memory <= 4 || isMobile) {
    return 2;
  }

  return 1;
}

/**
 * Reduce-effects setting management
 */
export function isReducedEffects() {
  return localStorage.getItem('docbook_reduce_motion') === 'true';
}

export function setReducedEffects(enabled) {
  localStorage.setItem('docbook_reduce_motion', enabled ? 'true' : 'false');
  if (enabled) {
    document.documentElement.classList.add('reduce-effects');
  } else {
    document.documentElement.classList.remove('reduce-effects');
  }
  window.dispatchEvent(new CustomEvent('docbook:reduce-effects-changed', { detail: { enabled } }));
}

export function initReduceEffects() {
  if (isReducedEffects()) {
    document.documentElement.classList.add('reduce-effects');
  }
}

/**
 * Creates a managed Three.js scene context with viewport pausing and disposal
 */
export async function createSceneContext(containerEl, options = {}) {
  const THREE = await getThree();
  const width = containerEl.clientWidth || 400;
  const height = containerEl.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    options.fov || 42,
    width / height,
    options.near || 0.1,
    options.far || 100
  );
  camera.position.set(0, 0, options.cameraZ || 5);

  const renderer = new THREE.WebGLRenderer({
    alpha: options.alpha !== false,
    antialias: true,
    powerPreference: 'high-performance'
  });

  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);
  renderer.domElement.setAttribute('data-canvas-3d', 'true');
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;';

  containerEl.appendChild(renderer.domElement);

  // Standard Clinical Three-Point Lighting Setup
  const isDark = document.documentElement.getAttribute('data-theme') === 'midnight';

  // 1. Top-Left Key Light
  const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.6 : 1.4);
  keyLight.position.set(-3, 4, 3);
  scene.add(keyLight);

  // 2. Soft Cool Rim Light (Teal / Cyan accent)
  const rimLight = new THREE.DirectionalLight(0xa5f3fc, isDark ? 1.2 : 0.8);
  rimLight.position.set(3, -2, -2);
  scene.add(rimLight);

  // 3. Ambient Fill Light
  const ambientLight = new THREE.AmbientLight(isDark ? 0x0f172a : 0xf8fafc, isDark ? 0.9 : 0.7);
  scene.add(ambientLight);

  let isRunning = false;
  let isVisible = true;
  let reqId = null;

  function renderLoop() {
    if (!isRunning || !isVisible) return;
    if (options.onUpdate) {
      options.onUpdate(clock.getDelta(), clock.getElapsedTime());
    }
    renderer.render(scene, camera);
    reqId = requestAnimationFrame(renderLoop);
  }

  const clock = new THREE.Clock();

  function start() {
    if (!isRunning) {
      isRunning = true;
      clock.start();
      renderLoop();
    }
  }

  function stop() {
    isRunning = false;
    if (reqId) {
      cancelAnimationFrame(reqId);
      reqId = null;
    }
  }

  // Viewport Observer (IntersectionObserver)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting && !document.hidden;
      if (isVisible && !isRunning) {
        start();
      } else if (!isVisible && isRunning) {
        stop();
      }
    });
  }, { threshold: 0.05 });
  observer.observe(containerEl);

  // Tab visibility listener
  const handleVisibilityChange = () => {
    isVisible = !document.hidden;
    if (isVisible && !isRunning) start();
    else if (!isVisible && isRunning) stop();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Resize handler
  const handleResize = () => {
    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
  };
  window.addEventListener('resize', handleResize);

  // Teardown / Cleanup
  function dispose() {
    stop();
    observer.disconnect();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('resize', handleResize);

    // Recursively dispose scene geometries and materials
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });

    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  start();

  return {
    THREE,
    scene,
    camera,
    renderer,
    keyLight,
    rimLight,
    ambientLight,
    start,
    stop,
    dispose,
    handleResize
  };
}

/**
 * Attaches pointer-driven CSS 3D tilt and specular glide to all matching elements
 */
export function initTiltCards(selector = '[data-tilt]') {
  const elements = document.querySelectorAll(selector);

  elements.forEach(card => {
    if (card._tiltBound) return;
    card._tiltBound = true;

    card.classList.add('tilt-card-3d');

    // Add specular highlight plane if not already present
    if (!card.querySelector('.tilt-specular-shine')) {
      const shine = document.createElement('div');
      shine.className = 'tilt-specular-shine';
      card.appendChild(shine);
    }

    const maxTilt = Number(card.getAttribute('data-tilt-max')) || 8; // max degrees

    function onPointerMove(e) {
      if (isReducedEffects()) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to +1
      const normY = (y / rect.height) * 2 - 1; // -1 to +1

      const tiltX = -normY * maxTilt;
      const tiltY = normX * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width * 100).toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height * 100).toFixed(1)}%`);
    }

    function onPointerLeave() {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerleave', onPointerLeave);
  });
}

/**
 * Initializes all registered 3D scenes on the page
 */
export async function init3DExperience() {
  initReduceEffects();
  initTiltCards();

  const sceneContainers = document.querySelectorAll('[data-scene]');
  if (sceneContainers.length === 0) return;

  const tier = detectCapability();
  if (tier === 3) {
    console.log('[DocBook 3D] Running in Tier 3 (Accessible / Static Fallback mode)');
    return;
  }

  for (const container of sceneContainers) {
    const sceneName = container.getAttribute('data-scene');
    try {
      if (sceneName === 'hero') {
        const { initHeroScene } = await import('/js/3d/hero-scene.js');
        initHeroScene(container, tier);
      } else if (sceneName === 'login') {
        const { initLoginScene } = await import('/js/3d/login-scene.js');
        initLoginScene(container, tier);
      } else if (sceneName === 'timer') {
        const { initTimerScene } = await import('/js/3d/timer-scene.js');
        initTimerScene(container, tier);
      } else if (sceneName === 'slip') {
        const { initSlipScene } = await import('/js/3d/slip-scene.js');
        initSlipScene(container, tier);
      }
    } catch (err) {
      console.warn(`[DocBook 3D] Failed to load scene "${sceneName}":`, err);
    }
  }
}

// Auto-run on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DExperience);
  } else {
    init3DExperience();
  }
}
