// DocBook 3D Login Scene Engine (login-scene.js)
// Calm Medical Environment Primitives: Matte Capsule, Shield, Calendar Plate

import { createSceneContext, getThree, isReducedEffects } from '/js/3d/core.js';

export async function initLoginScene(containerEl) {
  const THREE = await getThree();

  const group = new THREE.Group();

  // Matte Clinical Materials
  const tealMat = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    roughness: 0.35,
    metalness: 0.15
  });

  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
    metalness: 0.05
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x14b8a6,
    roughness: 0.3,
    metalness: 0.2
  });

  // 1. Two-Tone Matte Capsule
  const capsuleGroup = new THREE.Group();
  const capCylinder = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 24);
  const capHalf1 = new THREE.SphereGeometry(0.35, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const capHalf2 = capHalf1.clone();

  const cylMesh = new THREE.Mesh(capCylinder, tealMat);
  const topMesh = new THREE.Mesh(capHalf1, ivoryMat);
  topMesh.position.y = 0.4;

  const btmMesh = new THREE.Mesh(capHalf2, tealMat);
  btmMesh.position.y = -0.4;
  btmMesh.rotation.x = Math.PI;

  capsuleGroup.add(cylMesh, topMesh, btmMesh);
  capsuleGroup.position.set(-1.2, 0.8, 0.2);
  capsuleGroup.rotation.z = 0.6;
  group.add(capsuleGroup);

  // 2. Clinical Shield Plate
  const shieldGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.1, 6);
  const shieldMesh = new THREE.Mesh(shieldGeo, accentMat);
  shieldMesh.rotation.x = Math.PI / 2;
  shieldMesh.position.set(1.3, -0.6, -0.2);
  group.add(shieldMesh);

  // 3. Calendar Plate (Rounded Box)
  const plateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.08);
  const plateMesh = new THREE.Mesh(plateGeo, ivoryMat);
  plateMesh.position.set(0.9, 1.1, -0.4);
  plateMesh.rotation.set(0.2, -0.4, 0.1);
  group.add(plateMesh);

  // Position group in container
  group.position.set(0.2, 0, 0);

  const ctx = await createSceneContext(containerEl, {
    fov: 42,
    cameraZ: 4.8,
    alpha: true,
    onUpdate: (delta, elapsed) => {
      if (isReducedEffects()) return;

      // Slow, calm orbit
      group.rotation.y = elapsed * 0.15;
      group.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

      // Gentle individual primitive floating
      capsuleGroup.position.y = 0.8 + Math.sin(elapsed * 0.8) * 0.08;
      capsuleGroup.rotation.y = elapsed * 0.4;

      shieldMesh.position.y = -0.6 + Math.cos(elapsed * 0.7) * 0.06;
      shieldMesh.rotation.z = Math.sin(elapsed * 0.5) * 0.1;

      plateMesh.position.y = 1.1 + Math.sin(elapsed * 0.6 + 1) * 0.07;
    }
  });

  ctx.scene.add(group);
  return ctx;
}
