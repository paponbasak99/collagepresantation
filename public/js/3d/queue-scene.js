// DocBook 3D Queue Token Stack & Success Moment (queue-scene.js)
// Tactile Numbered Tokens + Restrained 3D Checkmark Settle

import { createSceneContext, getThree, isReducedEffects } from '/js/3d/core.js';

export async function initSuccessCheckmark(containerEl) {
  const THREE = await getThree();
  const group = new THREE.Group();

  // Torus Ring
  const ringGeo = new THREE.TorusGeometry(0.85, 0.08, 16, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x14b8a6,
    roughness: 0.3,
    metalness: 0.2
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  // Checkmark stem 1
  const stem1Geo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 16);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.2,
    metalness: 0.3
  });
  const stem1 = new THREE.Mesh(stem1Geo, stemMat);
  stem1.rotation.z = -Math.PI / 4;
  stem1.position.set(-0.2, -0.05, 0.05);

  // Checkmark stem 2
  const stem2Geo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 16);
  const stem2 = new THREE.Mesh(stem2Geo, stemMat);
  stem2.rotation.z = Math.PI / 4;
  stem2.position.set(0.18, 0.1, 0.05);

  group.add(stem1, stem2);
  group.scale.set(0.01, 0.01, 0.01);

  let startTime = null;

  const ctx = await createSceneContext(containerEl, {
    fov: 35,
    cameraZ: 3.5,
    alpha: true,
    onUpdate: (delta, elapsed) => {
      if (!startTime) startTime = elapsed;
      const progress = Math.min((elapsed - startTime) / 0.8, 1);

      // Spring overshoot settle
      const scale = progress < 0.7 
        ? (progress / 0.7) * 1.15
        : 1.15 - (progress - 0.7) / 0.3 * 0.15;
      
      group.scale.set(scale, scale, scale);
      group.rotation.y = (1 - progress) * 1.5;
    }
  });

  ctx.scene.add(group);
  return ctx;
}
