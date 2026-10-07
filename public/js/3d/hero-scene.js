// DocBook 3D Hero Scene (hero-scene.js)
// Anatomical Cardiac Form + Floating Care Cards + Parallax & Scroll Scrub

import { createSceneContext, getThree, isReducedEffects } from '/js/3d/core.js';
import { getCurrentLang } from '/js/i18n.js';

export async function initHeroScene(containerEl, tier = 1) {
  const THREE = await getThree();

  // Root group for all 3D scene elements
  const mainGroup = new THREE.Group();
  let heartGroup = new THREE.Group();
  let cardsGroup = new THREE.Group();

  let cardMeshes = [];
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;

  // -------------------------------------------------------------------------
  // 1. Procedural Stylized Anatomical Heart (Matte Clinical Ceramic / Teal)
  // -------------------------------------------------------------------------
  function createCardiacForm() {
    const group = new THREE.Group();

    // Matte Clinical Teal & Ivory Materials
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.38,
      metalness: 0.12,
      flatShading: false
    });

    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.45,
      metalness: 0.05
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.3,
      metalness: 0.2
    });

    // Left Ventricle (Tapered Ellipsoid)
    const leftVentGeo = new THREE.SphereGeometry(0.85, 24, 24);
    leftVentGeo.scale(0.85, 1.25, 0.9);
    const leftVentricle = new THREE.Mesh(leftVentGeo, tealMat);
    leftVentricle.position.set(-0.25, -0.1, 0);
    leftVentricle.rotation.z = 0.2;
    group.add(leftVentricle);

    // Right Ventricle
    const rightVentGeo = new THREE.SphereGeometry(0.72, 24, 24);
    rightVentGeo.scale(0.8, 1.15, 0.85);
    const rightVentricle = new THREE.Mesh(rightVentGeo, accentMat);
    rightVentricle.position.set(0.3, -0.05, 0.1);
    rightVentricle.rotation.z = -0.15;
    group.add(rightVentricle);

    // Apex Tip
    const apexGeo = new THREE.ConeGeometry(0.48, 0.7, 24);
    const apex = new THREE.Mesh(apexGeo, tealMat);
    apex.rotation.x = Math.PI;
    apex.position.set(-0.05, -1.05, 0.02);
    group.add(apex);

    // Aortic Arch (Curved Torus Segment)
    const aortaGeo = new THREE.TorusGeometry(0.5, 0.18, 16, 24, Math.PI * 0.85);
    const aorta = new THREE.Mesh(aortaGeo, ivoryMat);
    aorta.position.set(0, 0.75, -0.1);
    aorta.rotation.z = -Math.PI * 0.15;
    aorta.rotation.y = Math.PI * 0.1;
    group.add(aorta);

    // Superior Vena Cava / Pulmonary Branches (Cylinders)
    const branch1Geo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 16);
    const branch1 = new THREE.Mesh(branch1Geo, ivoryMat);
    branch1.position.set(-0.35, 1.05, -0.05);
    branch1.rotation.z = 0.15;
    group.add(branch1);

    const branch2Geo = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 16);
    const branch2 = new THREE.Mesh(branch2Geo, ivoryMat);
    branch2.position.set(0.25, 1.0, -0.15);
    branch2.rotation.z = -0.2;
    group.add(branch2);

    // Soft Contact Shadow Plane underneath
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.6;
    group.add(shadowMesh);

    return group;
  }

  // -------------------------------------------------------------------------
  // 2. Floating Care Cards with High-Res Canvas Textures
  // -------------------------------------------------------------------------
  function createCardTexture(title, subtitle, badge, badgeColor = '#0d9488') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const isDark = document.documentElement.getAttribute('data-theme') === 'midnight';

    // Frosted Card Glass Base
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.94)';
    roundRect(ctx, 8, 8, 496, 240, 24);
    ctx.fill();

    // Border
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDark ? 'rgba(45, 212, 191, 0.3)' : 'rgba(13, 148, 136, 0.25)';
    ctx.stroke();

    // Badge Pill
    ctx.fillStyle = badgeColor;
    roundRect(ctx, 32, 32, 160, 36, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(badge, 48, 56);

    // Title
    ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 30px "Plus Jakarta Sans", "Hind Siliguri", system-ui, sans-serif';
    ctx.fillText(title, 32, 128);

    // Subtitle
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '500 22px "Plus Jakarta Sans", "Hind Siliguri", system-ui, sans-serif';
    ctx.fillText(subtitle, 32, 175);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function buildCards() {
    cardsGroup.clear();
    cardMeshes = [];

    const isBn = getCurrentLang() === 'bn';

    const cardData = [
      {
        badge: isBn ? 'অনুমোদিত' : 'VERIFIED BMDC',
        title: isBn ? 'ড. তারিক রহমান' : 'Prof. Dr. Tariq Rahman',
        subtitle: isBn ? 'সিরিয়াল ০৪ • সকাল ১০:৩০' : 'Token SL-04 • 10:30 AM',
        pos: [-2.1, 0.8, 0.5],
        rot: [0.08, 0.25, -0.05],
        color: '#0d9488'
      },
      {
        badge: isBn ? 'লাইভ কিউ' : 'OPD QUEUE',
        title: isBn ? 'চেম্বার রুম ২০৪' : 'Chamber Room 204',
        subtitle: isBn ? '২ জন রোগী অপেক্ষমাণ' : '2 Patients Ahead • ~15m Wait',
        pos: [2.2, 0.2, 0.2],
        rot: [-0.05, -0.28, 0.04],
        color: '#0284c7'
      },
      {
        badge: isBn ? 'ই-প্রেসক্রিপশন' : 'DIGITAL RX',
        title: isBn ? 'ডিজিটাল সিল যাচাই' : 'Encrypted Seal Verified',
        subtitle: isBn ? 'কিউআর কোড নিরাপত্তা' : 'BMDC Verified Medical Record',
        pos: [-1.8, -1.2, 0.7],
        rot: [0.05, 0.2, 0.02],
        color: '#16a34a'
      }
    ];

    cardData.forEach((d, idx) => {
      const tex = createCardTexture(d.title, d.subtitle, d.badge, d.color);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
      });
      const geo = new THREE.PlaneGeometry(1.9, 0.95);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...d.pos);
      mesh.rotation.set(...d.rot);
      mesh.userData = {
        baseY: d.pos[1],
        baseX: d.pos[0],
        phase: idx * 1.8
      };
      cardsGroup.add(mesh);
      cardMeshes.push(mesh);
    });
  }

  // -------------------------------------------------------------------------
  // 3. Assemble Scene Graph
  // -------------------------------------------------------------------------
  heartGroup = createCardiacForm();
  mainGroup.add(heartGroup);

  if (tier === 1) {
    buildCards();
    mainGroup.add(cardsGroup);
  }

  // Slightly offset heart to right of hero text
  mainGroup.position.set(1.4, 0, 0);

  // -------------------------------------------------------------------------
  // 4. Animation Loop: 72 BPM Pulse + Parallax + Scroll Scrub
  // -------------------------------------------------------------------------
  const ctx = await createSceneContext(containerEl, {
    fov: 40,
    cameraZ: 6.2,
    onUpdate: (delta, elapsed) => {
      if (isReducedEffects()) return;

      // 72 BPM Physiological Heartbeat Pulse (1.2 Hz)
      const beatFreq = 1.2 * Math.PI * 2;
      const beat = Math.sin(elapsed * beatFreq);
      const pulseFactor = beat > 0.6 ? 1 + (beat - 0.6) * 0.12 : 1;
      heartGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);

      // Gentle Base Rotation
      heartGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.35 + 0.2;
      heartGroup.rotation.x = Math.cos(elapsed * 0.3) * 0.08;

      // Floating Care Cards Sine Drift
      if (tier === 1) {
        cardMeshes.forEach(mesh => {
          const t = elapsed + mesh.userData.phase;
          mesh.position.y = mesh.userData.baseY + Math.sin(t * 0.8) * 0.08;
          mesh.position.x = mesh.userData.baseX + Math.cos(t * 0.6) * 0.04;
        });
      }

      // Smooth Cursor Parallax Lerp (Max ~6 degrees)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      mainGroup.rotation.y = mouse.x * 0.12;
      mainGroup.rotation.x = -mouse.y * 0.08;

      // Scroll Scrub (Pulls Heart left and eases back as user scrolls down)
      const targetX = 1.4 - scrollProgress * 2.8;
      const targetZ = -scrollProgress * 1.5;
      mainGroup.position.x += (targetX - mainGroup.position.x) * 0.1;
      mainGroup.position.z += (targetZ - mainGroup.position.z) * 0.1;
    }
  });

  ctx.scene.add(mainGroup);

  // -------------------------------------------------------------------------
  // 5. Input Listeners: Pointer Move & Scroll
  // -------------------------------------------------------------------------
  function onPointerMove(e) {
    if (isReducedEffects()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouse.targetX = (e.clientX / w) * 2 - 1;
    mouse.targetY = (e.clientY / h) * 2 - 1;
  }

  function onScroll() {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight || 800;
    scrollProgress = Math.min(Math.max(scrollY / (viewportH * 0.8), 0), 1);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Re-render card textures on language or theme change
  window.addEventListener('docbook:language-changed', () => {
    if (tier === 1) buildCards();
  });

  // Mobile layout adjustment
  const updateLayout = () => {
    if (window.innerWidth < 1024) {
      mainGroup.position.x = 0;
      mainGroup.scale.set(0.82, 0.82, 0.82);
    } else {
      mainGroup.position.x = 1.4;
      mainGroup.scale.set(1, 1, 1);
    }
  };
  window.addEventListener('resize', updateLayout);
  updateLayout();

  return ctx;
}
