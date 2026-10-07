// DocBook 3D Admin Analytics Bar Field (admin-scene.js)
// 3D Bar Field Visualization with Soft Shadows and Pointer Orbit

import { createSceneContext, getThree, isReducedEffects } from '/js/3d/core.js';

export async function initAdmin3DChart(containerEl, dataPoints = []) {
  const THREE = await getThree();
  const group = new THREE.Group();

  const maxVal = Math.max(...dataPoints.map(d => d.count || d.value || 1), 10);
  const barCount = Math.min(dataPoints.length || 14, 14);

  // Matte Clinical Teal Material for Bars
  const barMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    roughness: 0.3,
    metalness: 0.15
  });

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.6,
    metalness: 0.05
  });

  // Base Floor Grid Plate
  const floorGeo = new THREE.BoxGeometry(6.5, 0.1, 2.5);
  const floorMesh = new THREE.Mesh(floorGeo, baseMat);
  floorMesh.position.y = -0.05;
  group.add(floorMesh);

  // Instanced or Grouped Bars
  const spacing = 5.6 / Math.max(barCount, 1);
  const startX = -2.8 + spacing / 2;

  dataPoints.slice(0, barCount).forEach((dp, i) => {
    const val = dp.count || dp.value || Math.floor(Math.random() * 8 + 2);
    const height = Math.max((val / maxVal) * 2.4, 0.2);

    const barGeo = new THREE.BoxGeometry(spacing * 0.7, height, 0.4);
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.set(startX + i * spacing, height / 2, 0);
    group.add(barMesh);
  });

  group.position.set(0, -0.6, 0);

  // Pointer drag Orbit logic
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;
  let targetRotationY = -0.25;
  let targetRotationX = 0.2;

  containerEl.style.cursor = 'grab';
  containerEl.style.pointerEvents = 'auto';

  containerEl.addEventListener('pointerdown', (e) => {
    isDragging = true;
    containerEl.style.cursor = 'grabbing';
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging || isReducedEffects()) return;
    const deltaX = e.clientX - previousMouseX;
    const deltaY = e.clientY - previousMouseY;

    targetRotationY += deltaX * 0.008;
    targetRotationX = Math.min(Math.max(targetRotationX + deltaY * 0.008, -0.2), 0.6);

    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      containerEl.style.cursor = 'grab';
    }
  });

  const ctx = await createSceneContext(containerEl, {
    fov: 42,
    cameraZ: 4.8,
    alpha: true,
    onUpdate: (delta, elapsed) => {
      if (isReducedEffects()) return;

      // Smooth lerp to target rotation
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.1;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.1;

      // Very subtle idle breathe
      if (!isDragging) {
        targetRotationY += 0.002;
      }
    }
  });

  ctx.scene.add(group);
  return ctx;
}
