// DocBook 3D Hold Countdown Dial Engine (timer-scene.js)
// Real-time 3D Clinical Progress Ring with Dynamic State Shifting

import { createSceneContext, getThree, isReducedEffects } from '/js/3d/core.js';

export async function initTimerScene(containerEl) {
  const THREE = await getThree();

  const group = new THREE.Group();
  let progressArcMesh = null;
  let backgroundRingMesh = null;

  // Outer Background Track
  const bgRingGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 48);
  const bgRingMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.5,
    metalness: 0.1
  });
  backgroundRingMesh = new THREE.Mesh(bgRingGeo, bgRingMat);
  group.add(backgroundRingMesh);

  // Active Progress Arc Material
  const arcMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    roughness: 0.25,
    metalness: 0.2
  });

  function updateArc(fraction) {
    if (progressArcMesh) {
      group.remove(progressArcMesh);
      if (progressArcMesh.geometry) progressArcMesh.geometry.dispose();
    }

    const arcAngle = Math.max(fraction * Math.PI * 2, 0.01);
    const arcGeo = new THREE.TorusGeometry(0.85, 0.09, 16, 48, arcAngle);
    progressArcMesh = new THREE.Mesh(arcGeo, arcMat);
    progressArcMesh.rotation.z = Math.PI / 2; // start from top
    group.add(progressArcMesh);
  }

  updateArc(1.0);

  // Mount Scene
  const ctx = await createSceneContext(containerEl, {
    fov: 38,
    cameraZ: 3.2,
    alpha: true,
    onUpdate: (delta, elapsed) => {
      if (isReducedEffects()) return;

      // Soft continuous tilt
      group.rotation.x = Math.sin(elapsed * 0.8) * 0.15 + 0.1;
      group.rotation.y = Math.cos(elapsed * 0.6) * 0.2;

      // Read remaining time from DOM #hold-countdown
      const timeEl = document.getElementById('hold-countdown');
      if (timeEl) {
        const parts = timeEl.textContent.trim().split(':');
        if (parts.length === 2) {
          const totalSecs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          const fraction = Math.min(Math.max(totalSecs / 300, 0), 1); // 300s = 5 min
          updateArc(fraction);

          // Color shift
          if (totalSecs < 60) {
            arcMat.color.setHex(0xef4444); // Urgent Red
            const pulse = 1 + Math.sin(elapsed * 6) * 0.06;
            group.scale.set(pulse, pulse, pulse);
          } else if (totalSecs < 120) {
            arcMat.color.setHex(0xf59e0b); // Warning Amber
            group.scale.set(1, 1, 1);
          } else {
            arcMat.color.setHex(0x0d9488); // Clinical Teal
            group.scale.set(1, 1, 1);
          }
        }
      }
    }
  });

  ctx.scene.add(group);
  return ctx;
}
