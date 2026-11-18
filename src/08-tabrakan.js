import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, BVHHelper } from 'three-mesh-bvh';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
  createGround,
} from './common.js';

// Pasang implementasi BVH ke prototype three.js
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const EYE_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.45;
const WALK_SPEED = 4.2;
const RUN_SPEED = 7.5;
const START_POSITION = new THREE.Vector3(0, EYE_HEIGHT, 12);

// ---------- Scene dan kamera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x93b2c9);
scene.fog = new THREE.Fog(0x93b2c9, 50, 140);

const camera = createCamera({ fov: 70, far: 300 });
camera.position.copy(START_POSITION);
camera.lookAt(0, EYE_HEIGHT, 0);

const renderer = createRenderer();

const overlay = createOverlay(
  '08 · Tabrakan Box3 &amp; three-mesh-bvh',
  'Klik layar untuk mulai, lalu coba menembus tugu, tembok, pot, dan ornamen torus-knot. <kbd>T</kbd> ganti metode, <kbd>H</kbd> tampilkan debug helper.'
);

// HUD status metode
const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div>Metode: <strong id="method-label">Box3</strong></div>
  <div>Ornamen: <strong id="ornament-label">Box3</strong></div>
  <div>Debug: <strong id="debug-label">nonaktif</strong></div>
  <div>Obstacle: <strong id="obstacle-label">0</strong> kotak</div>
  <div>Posisi X,Z: <strong id="position-label">0.0, 0.0</strong></div>
`;
document.body.appendChild(hud);

const methodLabel = hud.querySelector('#method-label');
const ornamentLabel = hud.querySelector('#ornament-label');
const debugLabel = hud.querySelector('#debug-label');
const obstacleLabel = hud.querySelector('#obstacle-label');
const positionLabel = hud.querySelector('#position-label');

// ---------- Dunia ----------
const ground = createGround(180, 0x5e7f58);
scene.add(ground);

const grid = new THREE.GridHelper(180, 90, 0x6f8f69, 0x6f8f69);
grid.position.y = 0.015;
grid.material.transparent = true;
grid.material.opacity = 0.3;
scene.add(grid);

addBasicLights(scene, { intensity: 2.6, ambient: 0.85 });

// ---------- Kontrol jalan ----------
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

// ---------- Obstacle sederhana (metode A: Box3) ----------
const boxObstacles = [];
const boxHelpers = [];

function registerBoxObstacle(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  boxObstacles.push({ root, box });

  const helper = new THREE.Box3Helper(box, 0x4cc2ff);
  helper.visible = false;
  scene.add(helper);
  boxHelpers.push(helper);
}

// Tugu
const tugu = new THREE.Group();
const stone = new THREE.MeshStandardMaterial({ color: 0xe2ded2, roughness: 0.55 });
const tuguBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.5, 36), stone);
tuguBase.position.y = 0.25;
const tuguBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 4.6, 36), stone);
tuguBody.position.y = 2.8;
const tuguTop = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 26, 18),
  new THREE.MeshStandardMaterial({ color: 0x62b6d8, metalness: 0.6, roughness: 0.25 })
);
tuguTop.position.y = 5.5;
for (const part of [tuguBase, tuguBody, tuguTop]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
tugu.add(tuguBase, tuguBody, tuguTop);
tugu.position.set(-7.5, 0, 2);
scene.add(tugu);
registerBoxObstacle(tugu);

// Tembok
const wall = new THREE.Mesh(
  new THREE.BoxGeometry(9, 2.6, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xb9b3a4, roughness: 0.85 })
);
wall.position.set(7.5, 1.3, -1.5);
wall.castShadow = true;
wall.receiveShadow = true;
scene.add(wall);
registerBoxObstacle(wall);

// Pot tanaman
const potMaterial = new THREE.MeshStandardMaterial({ color: 0xa9614c, roughness: 0.8 });
const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x437d49, roughness: 0.85 });
const potPositions = [
  [-3.5, 4.5],
  [3.8, 4.2],
  [-10, -3.5],
  [11, 3],
];
for (const [x, z] of potPositions) {
  const pot = new THREE.Group();
  const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.9, 20), potMaterial);
  potBody.position.y = 0.45;
  const plant = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.4, 10), plantMaterial);
  plant.position.y = 1.55;
  potBody.castShadow = true;
  plant.castShadow = true;
  pot.add(potBody, plant);
  pot.position.set(x, 0, z);
  scene.add(pot);
  registerBoxObstacle(pot);
}

obstacleLabel.textContent = String(boxObstacles.length);

// ---------- Obstacle kompleks (metode B: BVH) ----------
const complexGeometry = new THREE.TorusKnotGeometry(2.2, 0.55, 256, 32, 2, 3);
complexGeometry.computeBoundsTree();

const complexMesh = new THREE.Mesh(
  complexGeometry,
  new THREE.MeshStandardMaterial({
    color: 0x4d9c86,
    metalness: 0.55,
    roughness: 0.3,
    emissive: 0x0b2a22,
    emissiveIntensity: 0.6,
  })
);
complexMesh.position.set(0, 3.3, -7);
complexMesh.castShadow = true;
complexMesh.receiveShadow = true;
scene.add(complexMesh);
complexMesh.updateMatrixWorld(true);

// Kotak kasar untuk metode A
const complexBox = new THREE.Box3().setFromObject(complexMesh);
const complexBoxHelper = new THREE.Box3Helper(complexBox, 0xffb454);
complexBoxHelper.visible = false;
scene.add(complexBoxHelper);

// Visualisasi BVH untuk metode B
const bvhHelper = new BVHHelper(complexMesh, 2);
bvhHelper.visible = false;
scene.add(bvhHelper);

// ---------- Status metode dan debug ----------
let method = 'box';
let debugVisible = false;

const actions = document.createElement('div');
actions.className = 'actions';

const methodButton = document.createElement('button');
methodButton.addEventListener('click', () => setMethod(method === 'box' ? 'bvh' : 'box'));
actions.appendChild(methodButton);

const debugButton = document.createElement('button');
debugButton.textContent = 'Debug helper (H)';
debugButton.addEventListener('click', () => {
  debugVisible = !debugVisible;
  updateDebugVisibility();
});
actions.appendChild(debugButton);

overlay.appendChild(actions);

function setMethod(next) {
  method = next;

  // Jika posisi pemain masuk ke kotak obstacle metode baru, kembalikan ke titik awal
  if (method === 'box' && hitsBox3(camera.position.x, camera.position.z)) {
    camera.position.copy(START_POSITION);
    camera.lookAt(0, EYE_HEIGHT, 0);
  }

  methodLabel.textContent = method === 'box' ? 'Box3 (A)' : 'three-mesh-bvh (B)';
  ornamentLabel.textContent = method === 'box' ? 'Box3' : 'MeshBVH';
  methodButton.textContent = `Metode: ${method === 'box' ? 'Box3' : 'MeshBVH'} (T)`;
  methodButton.classList.toggle('active', method === 'bvh');
  updateDebugVisibility();
}

function updateDebugVisibility() {
  for (const helper of boxHelpers) helper.visible = debugVisible;
  complexBoxHelper.visible = debugVisible && method === 'box';
  bvhHelper.visible = debugVisible && method === 'bvh';
  debugLabel.textContent = debugVisible ? 'aktif' : 'nonaktif';
  debugButton.classList.toggle('active', debugVisible);
}

setMethod('box');

// ---------- Input keyboard ----------
const keys = new Set();

window.addEventListener('keydown', (event) => {
  keys.add(event.code);

  if (event.code === 'KeyT') setMethod(method === 'box' ? 'bvh' : 'box');
  if (event.code === 'KeyH') {
    debugVisible = !debugVisible;
    updateDebugVisibility();
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

// ---------- Deteksi tabrakan ----------
function circleHitsBox(box, x, z) {
  // Abaikan kotak yang seluruhnya di atas kepala atau di bawah kaki
  if (box.min.y > 1.9 || box.max.y < 0.15) return false;

  const closestX = THREE.MathUtils.clamp(x, box.min.x, box.max.x);
  const closestZ = THREE.MathUtils.clamp(z, box.min.z, box.max.z);
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS;
}

function hitsBox3(x, z) {
  for (const { box } of boxObstacles) {
    if (circleHitsBox(box, x, z)) return true;
  }
  // Metode A menganggap ornamen kompleks sebagai satu kotak besar
  if (method === 'box' && circleHitsBox(complexBox, x, z)) return true;
  return false;
}

const bvhRaycaster = new THREE.Raycaster();
bvhRaycaster.firstHitOnly = true;

const rayOrigin = new THREE.Vector3();
const rayDirection = new THREE.Vector3();

function hitsComplexWithBVH(fromX, fromZ, dirX, dirZ, distance) {
  rayDirection.set(dirX, 0, dirZ);
  const checkHeights = [0.4, 1.0, 1.65];

  for (const height of checkHeights) {
    rayOrigin.set(fromX, height, fromZ);
    bvhRaycaster.set(rayOrigin, rayDirection);
    bvhRaycaster.near = 0;
    bvhRaycaster.far = distance + PLAYER_RADIUS;

    if (bvhRaycaster.intersectObject(complexMesh, false).length > 0) return true;
  }

  return false;
}

function canMoveTo(nextX, nextZ, fromX, fromZ) {
  if (hitsBox3(nextX, nextZ)) return false;

  if (method === 'bvh') {
    const dx = nextX - fromX;
    const dz = nextZ - fromZ;
    const distance = Math.hypot(dx, dz);
    if (distance > 0.0001) {
      if (hitsComplexWithBVH(fromX, fromZ, dx / distance, dz / distance, distance)) {
        return false;
      }
    }
  }

  return true;
}

// ---------- Gerak dengan delta time + sliding ----------
const timer = new THREE.Timer();
timer.connect(document);
const desired = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.05);

  if (controls.isLocked) {
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
    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(speed * delta);

    // Uji sumbu X dan Z terpisah supaya pemain bisa menyusur dinding
    const nextX = camera.position.x + desired.x;
    if (canMoveTo(nextX, camera.position.z, camera.position.x, camera.position.z)) {
      camera.position.x = nextX;
    }

    const nextZ = camera.position.z + desired.z;
    if (canMoveTo(camera.position.x, nextZ, camera.position.x, camera.position.z)) {
      camera.position.z = nextZ;
    }

    camera.position.y = EYE_HEIGHT;
  }

  positionLabel.textContent = `${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)}`;
  renderer.render(scene, camera);
});

handleResize(camera, renderer);
