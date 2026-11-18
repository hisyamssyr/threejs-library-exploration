import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
} from './common.js';

// ---------- Scene dan kamera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101821);
scene.fog = new THREE.Fog(0x101821, 55, 110);

const camera = createCamera({ fov: 50, far: 400 });
const HOME_POSITION = new THREE.Vector3(21, 15, 23);
const HOME_TARGET = new THREE.Vector3(0, 2.2, 0);
camera.position.copy(HOME_POSITION);

const renderer = createRenderer();

const overlay = createOverlay(
  '03 · OrbitControls',
  'Klik kiri putar · klik kanan geser · scroll zoom · <kbd>R</kbd> reset kamera. Kamera dibatasi agar tidak menembus lantai.'
);

// ---------- OrbitControls ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 9;
controls.maxDistance = 48;
controls.maxPolarAngle = Math.PI / 2 - 0.06; // kamera tidak bisa ke bawah tanah
controls.update();

// Tombol reset di overlay
const actions = document.createElement('div');
actions.className = 'actions';
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset kamera (R)';
resetButton.addEventListener('click', resetCamera);
actions.appendChild(resetButton);
overlay.appendChild(actions);

function resetCamera() {
  camera.position.copy(HOME_POSITION);
  controls.target.copy(HOME_TARGET);
  controls.update();
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyR') resetCamera();
});

// ---------- Objek uji: bundaran sederhana ----------
addBasicLights(scene, { intensity: 2.7, ambient: 0.7 });

// Rumput luar
const lawn = new THREE.Mesh(
  new THREE.CircleGeometry(80, 96),
  new THREE.MeshStandardMaterial({ color: 0x3c5a3d, roughness: 0.95 })
);
lawn.rotation.x = -Math.PI / 2;
lawn.position.y = -0.02;
lawn.receiveShadow = true;
scene.add(lawn);

// Badan jalan berbentuk cincin
const road = new THREE.Mesh(
  new THREE.RingGeometry(7.5, 16.5, 96),
  new THREE.MeshStandardMaterial({ color: 0x2d3138, roughness: 0.9 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

// Pulau tengah
const island = new THREE.Mesh(
  new THREE.CylinderGeometry(7.5, 7.8, 0.6, 72),
  new THREE.MeshStandardMaterial({ color: 0x4f7a4a, roughness: 0.9 })
);
island.position.y = 0.3;
island.receiveShadow = true;
island.castShadow = true;
scene.add(island);

// Marka jalan: potongan kecil di lingkaran tengah jalan
const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.6 });
for (let i = 0; i < 24; i += 1) {
  const angle = (i / 24) * Math.PI * 2;
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.18), markingMaterial);
  dash.position.set(Math.cos(angle) * 12, 0.05, Math.sin(angle) * 12);
  dash.rotation.y = -angle + Math.PI / 2;
  scene.add(dash);
}

// Tepi jalan
const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x9a9a94, roughness: 0.8 });
for (const radius of [7.5, 16.5]) {
  const curb = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.16, 10, 96), curbMaterial);
  curb.rotation.x = Math.PI / 2;
  curb.position.y = 0.12;
  curb.receiveShadow = true;
  scene.add(curb);
}

// Tugu di atas pulau
const tugu = new THREE.Group();
const stone = new THREE.MeshStandardMaterial({ color: 0xe1ddd2, roughness: 0.5, metalness: 0.1 });
const tuguBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 0.5, 40), stone);
tuguBase.position.y = 0.85;
const tuguBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.0, 5.2, 40), stone);
tuguBody.position.y = 3.7;
const tuguTop = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 28, 18),
  new THREE.MeshStandardMaterial({ color: 0x62b6d8, metalness: 0.65, roughness: 0.22 })
);
tuguTop.position.y = 6.5;
for (const part of [tuguBase, tuguBody, tuguTop]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
tugu.add(tuguBase, tuguBody, tuguTop);
scene.add(tugu);

// Ornamen cincin di sisi pulau
const ringOrnament = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.35, 16, 48),
  new THREE.MeshStandardMaterial({ color: 0xb9803f, metalness: 0.7, roughness: 0.35 })
);
ringOrnament.position.set(-3.8, 2.2, 0.5);
ringOrnament.rotation.set(Math.PI / 2.6, 0.5, 0);
ringOrnament.castShadow = true;
scene.add(ringOrnament);

// Pohon-pohon di sekitar bundaran
const trunkGeometry = new THREE.CylinderGeometry(0.22, 0.32, 2.0, 8);
const crownGeometry = new THREE.ConeGeometry(1.5, 3.4, 10);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6a4a33, roughness: 0.9 });
const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7a48, roughness: 0.85 });

for (let i = 0; i < 14; i += 1) {
  const angle = (i / 14) * Math.PI * 2 + 0.15;
  const radius = 22 + (i % 3) * 2.5;
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1.0;
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = 3.4;
  trunk.castShadow = true;
  crown.castShadow = true;
  tree.add(trunk, crown);
  tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  tree.rotation.y = angle;
  tree.scale.setScalar(0.85 + (i % 4) * 0.08);
  scene.add(tree);
}

// Lampu taman sederhana mengelilingi jalan
const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x5a5f63, roughness: 0.7, metalness: 0.3 });
const lampMaterial = new THREE.MeshStandardMaterial({
  color: 0xfff0c2,
  emissive: 0xffcc66,
  emissiveIntensity: 1.2,
});
for (let i = 0; i < 8; i += 1) {
  const angle = (i / 8) * Math.PI * 2;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8), poleMaterial);
  pole.position.set(Math.cos(angle) * 17.8, 1.7, Math.sin(angle) * 17.8);
  pole.castShadow = true;
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), lampMaterial);
  lamp.position.set(Math.cos(angle) * 17.8, 3.5, Math.sin(angle) * 17.8);
  scene.add(pole, lamp);
}

handleResize(camera, renderer);

// ---------- Loop animasi ----------
const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.05);
  // Ornamen berputar pelan agar scene terasa hidup
  ringOrnament.rotation.z += delta * 0.35;

  controls.update(); // diperlukan karena damping aktif
  renderer.render(scene, camera);
});
