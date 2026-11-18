import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
  createGround,
} from './common.js';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 4.2;
const RUN_SPEED = 8.0;

// ---------- Scene dan kamera first-person ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a9c4);
scene.fog = new THREE.Fog(0x87a9c4, 45, 130);

const camera = createCamera({ fov: 70, far: 300 });
camera.position.set(0, EYE_HEIGHT, 20);
camera.lookAt(0, EYE_HEIGHT, 0);

const renderer = createRenderer();

createOverlay(
  '02 · PointerLockControls',
  'Klik layar untuk mengunci kursor. <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> jalan, tahan <kbd>Shift</kbd> untuk lari, <kbd>Esc</kbd> melepas kursor.'
);

// Kontrol pointer lock: mengunci kursor dan mengubah arah kamera dengan mouse
const controls = new PointerLockControls(camera, renderer.domElement);

const startPrompt = document.getElementById('start-prompt');

renderer.domElement.addEventListener('click', () => {
  if (!controls.isLocked) controls.lock();
});

controls.addEventListener('lock', () => {
  document.body.classList.add('locked');
  startPrompt.classList.add('hidden');
});

controls.addEventListener('unlock', () => {
  document.body.classList.remove('locked');
  startPrompt.classList.remove('hidden');
});

// ---------- Dunia uji ----------
const ground = createGround(220, 0x5d7f58);
scene.add(ground);

const grid = new THREE.GridHelper(220, 110, 0x6f8f69, 0x6f8f69);
grid.position.y = 0.015;
grid.material.transparent = true;
grid.material.opacity = 0.35;
scene.add(grid);

addBasicLights(scene, { intensity: 2.6, ambient: 0.85 });

// Tugu penanda di tengah agar arah gerak mudah dibaca
const tugu = new THREE.Group();
const stone = new THREE.MeshStandardMaterial({ color: 0xe3e0d6, roughness: 0.6 });
const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.0, 0.5, 32), stone);
base.position.y = 0.25;
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 3.6, 32), stone);
shaft.position.y = 2.3;
const orb = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 24, 16),
  new THREE.MeshStandardMaterial({ color: 0x2f86b3, metalness: 0.5, roughness: 0.3 })
);
orb.position.y = 4.4;
for (const part of [base, shaft, orb]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
tugu.add(base, shaft, orb);
scene.add(tugu);

// Kotak dan silinder berwarna sebagai penanda posisi
const palette = [0xc96b5b, 0xd9a441, 0x4f9d8a, 0x7a6fc4, 0xc474a8];
for (let i = 0; i < 24; i += 1) {
  const angle = (i / 24) * Math.PI * 2 + 0.26;
  const radius = 8 + (i % 4) * 3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  // Sisakan koridor pandang di depan titik awal kamera
  if (Math.abs(x) < 3 && z > 4) continue;

  const material = new THREE.MeshStandardMaterial({
    color: palette[i % palette.length],
    roughness: 0.65,
  });
  const geometry =
    i % 2 === 0
      ? new THREE.BoxGeometry(1.4, 1.6, 1.4)
      : new THREE.CylinderGeometry(0.7, 0.9, 1.8, 20);
  const marker = new THREE.Mesh(geometry, material);
  marker.position.set(x, 0.9, z);
  marker.rotation.y = -angle;
  marker.castShadow = true;
  marker.receiveShadow = true;
  scene.add(marker);
}

// Beberapa "pagar" untuk memberi skala pada ruang
const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8c8f93, roughness: 0.8 });
for (let i = 0; i < 12; i += 1) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), fenceMaterial);
  const angle = (i / 12) * Math.PI * 2;
  post.position.set(Math.cos(angle) * 30, 0.55, Math.sin(angle) * 30);
  post.castShadow = true;
  scene.add(post);
}

handleResize(camera, renderer);

// ---------- Input keyboard ----------
const keys = new Set();

window.addEventListener('keydown', (event) => {
  keys.add(event.code);
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

// ---------- Gerak dengan delta time ----------
const timer = new THREE.Timer();
timer.connect(document);
const velocity = new THREE.Vector3();
const desired = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  // delta dibatasi agar kamera tidak meloncat setelah tab tidak aktif
  const delta = Math.min(timer.getDelta(), 0.05);

  if (controls.isLocked) {
    // Arah horizontal dari kamera (komponen Y dibuang supaya tidak melayang)
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, camera.up).normalize();

    desired.set(0, 0, 0);
    if (keys.has('KeyW')) desired.add(forward);
    if (keys.has('KeyS')) desired.sub(forward);
    if (keys.has('KeyD')) desired.add(right);
    if (keys.has('KeyA')) desired.sub(right);

    const running = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const speed = running ? RUN_SPEED : WALK_SPEED;
    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(speed);

    // Interpolasi kecepatan agar gerak terasa halus dan konsisten antar-FPS
    velocity.lerp(desired, 1 - Math.exp(-12 * delta));
    camera.position.addScaledVector(velocity, delta);

    // Tinggi mata tetap 1,7 satuan di atas lantai
    camera.position.y = EYE_HEIGHT;

    // Jaga pemain tetap di dalam area demo
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -100, 100);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -100, 100);
  } else {
    velocity.set(0, 0, 0);
  }

  renderer.render(scene, camera);
});
