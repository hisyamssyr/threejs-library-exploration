import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
} from './common.js';

// ---------- Scene, kamera, renderer ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1821);
scene.fog = new THREE.Fog(0x0f1821, 45, 100);

const camera = createCamera({ fov: 50, far: 300 });
camera.position.set(14, 9.5, 17);

const renderer = createRenderer();
renderer.domElement.style.cursor = 'grab';

const overlay = createOverlay(
  '07 · Raycaster + CSS2DRenderer',
  'Arahkan kursor ke objek untuk highlight, lalu klik untuk membuka panel info. Label melayang tetap menempel pada objek saat kamera diputar.'
);

// Lapisan label CSS2D di atas canvas
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.zIndex = '10';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();

// ---------- Dunia ----------
const lawn = new THREE.Mesh(
  new THREE.CircleGeometry(80, 80),
  new THREE.MeshStandardMaterial({ color: 0x39543c, roughness: 0.95 })
);
lawn.rotation.x = -Math.PI / 2;
lawn.receiveShadow = true;
scene.add(lawn);

const road = new THREE.Mesh(
  new THREE.RingGeometry(8, 17, 80),
  new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.9 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

addBasicLights(scene, { intensity: 2.6, ambient: 0.7 });

// ---------- Pulau tengah (objek yang bisa diklik) ----------
const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x4f7a4b, roughness: 0.9 });
const island = new THREE.Mesh(new THREE.CylinderGeometry(8, 8.2, 0.7, 60), islandMaterial);
island.position.y = 0.35;
island.castShadow = true;
island.receiveShadow = true;
island.userData.info = {
  title: 'Pulau Tengah',
  body: 'Pulau tengah menjadi titik fokus bundaran. Pada model final, area ini dapat diisi tanaman, jalur pejalan kaki, serta ornamen khas ITS.',
};
scene.add(island);

// ---------- Tugu (grup yang bisa diklik) ----------
const tugu = new THREE.Group();
tugu.position.y = 0.7;

const stone = new THREE.MeshStandardMaterial({ color: 0xe0dccf, roughness: 0.5 });
const tuguBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.45, 40), stone);
tuguBase.position.y = 0.22;
const tuguBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 5.4, 40), stone);
tuguBody.position.y = 3.1;
const tuguOrb = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 28, 18),
  new THREE.MeshStandardMaterial({
    color: 0x6cc6e8,
    emissive: 0x0d3f55,
    emissiveIntensity: 0.8,
    metalness: 0.6,
    roughness: 0.2,
  })
);
tuguOrb.position.y = 6.1;

for (const part of [tuguBase, tuguBody, tuguOrb]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
tugu.add(tuguBase, tuguBody, tuguOrb);
tugu.userData.info = {
  title: 'Tugu ITS',
  body: 'Tugu ini adalah penanda kampus Institut Teknologi Sepuluh Nopember di Surabaya. Model pada demo ini masih sederhana; model final akan dibuat di Blender dan dimuat dengan GLTFLoader.',
};
scene.add(tugu);

// ---------- Ornamen (objek yang bisa diklik) ----------
const ornamentMaterial = new THREE.MeshStandardMaterial({
  color: 0xbf8946,
  metalness: 0.75,
  roughness: 0.3,
});
const ornament = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.5, 0.4, 180, 28, 2, 3),
  ornamentMaterial
);
ornament.position.set(-4.6, 3.1, 1.6);
ornament.rotation.set(0.3, 0.2, 0);
ornament.castShadow = true;
ornament.userData.info = {
  title: 'Ornamen Bundaran',
  body: 'Ornamen dekoratif ini mewakili detail kecil yang bisa diklik. Di proyek utama, label serupa dapat menjelaskan bagian-bagian penting Bundaran ITS kepada pengunjung.',
};
scene.add(ornament);

// ---------- Pohon latar (tidak diklik) ----------
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6a4a33, roughness: 0.9 });
const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7a48, roughness: 0.85 });
for (let i = 0; i < 10; i += 1) {
  const angle = (i / 10) * Math.PI * 2;
  const radius = 21 + (i % 3) * 2;
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2, 8), trunkMaterial);
  trunk.position.y = 1;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 9), crownMaterial);
  crown.position.y = 3.3;
  trunk.castShadow = true;
  crown.castShadow = true;
  tree.add(trunk, crown);
  tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  scene.add(tree);
}

// ---------- Label CSS2D ----------
function addLabel(root, text, position) {
  const element = document.createElement('div');
  element.className = 'label';
  element.textContent = text;
  const label = new CSS2DObject(element);
  label.position.copy(position);
  root.add(label);
  return label;
}

addLabel(tugu, 'Tugu ITS', new THREE.Vector3(0, 7.2, 0));
addLabel(island, 'Pulau Tengah', new THREE.Vector3(4.8, 1.6, 0));
addLabel(ornament, 'Ornamen', new THREE.Vector3(0, 2.4, 0));

// ---------- Raycaster: hover dan klik ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clickables = [tugu, island, ornament];

let hovered = null;
let pointerDown = null;

function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersections = raycaster.intersectObjects(clickables, true);
  if (intersections.length === 0) return null;

  // Cari induk yang memiliki data info (objek grup seperti tugu)
  let object = intersections[0].object;
  while (object && !object.userData.info) object = object.parent;
  return object || null;
}

function setHighlight(root, enabled) {
  root.traverse((child) => {
    if (!child.isMesh || !child.material?.emissive) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material.emissive) continue;
      if (material.userData.baseEmissive === undefined) {
        material.userData.baseEmissive = material.emissive.getHex();
      }
      material.emissive.setHex(enabled ? 0x2e7f9f : material.userData.baseEmissive);
    }
  });
}

renderer.domElement.addEventListener('pointermove', (event) => {
  const target = pick(event);
  if (target === hovered) return;

  if (hovered) setHighlight(hovered, false);
  hovered = target;
  if (hovered) setHighlight(hovered, true);
  renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  pointerDown = null;

  // Abaikan klik yang sebenarnya drag saat memutar kamera
  if (distance > 5) return;

  const target = pick(event);
  if (target) openInfo(target.userData.info);
});

// ---------- Panel info ----------
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoBody = document.getElementById('info-body');

function openInfo(info) {
  infoTitle.textContent = info.title;
  infoBody.textContent = info.body;
  infoPanel.classList.add('open');
}

document.getElementById('info-close').addEventListener('click', () => {
  infoPanel.classList.remove('open');
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') infoPanel.classList.remove('open');
});

// ---------- Resize ----------
handleResize(camera, renderer, () => {
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Loop ----------
const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.05);
  ornament.rotation.y += delta * 0.35;

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera); // label ikut kamera setiap frame
});
