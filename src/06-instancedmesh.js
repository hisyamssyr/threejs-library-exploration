import * as THREE from 'three';
import { createRenderer, createCamera, createOverlay, handleResize } from './common.js';

const COUNTS = [100, 500, 1000, 5000];

// ---------- Scene dan kamera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9db9cd);
scene.fog = new THREE.Fog(0x9db9cd, 90, 190);

const camera = createCamera({ fov: 55, far: 400 });
camera.position.set(48, 32, 48);
camera.lookAt(0, 3, 0);

const renderer = createRenderer({ shadows: false });

const overlay = createOverlay(
  '06 · InstancedMesh',
  'Pilih jumlah pohon lalu bandingkan FPS antara <strong>InstancedMesh</strong> dan <strong>mesh biasa</strong>. Mode mesh biasa membuat 2 mesh per pohon sehingga draw call melonjak.'
);

// ---------- HUD FPS ----------
const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="fps"><span id="fps-value">--</span> <small>FPS</small></div>
  <div>Instance: <strong id="count-value">1000</strong></div>
  <div>Draw call: <strong id="calls-value">-</strong></div>
  <div>Mode: <strong id="mode-value">InstancedMesh</strong></div>
`;
document.body.appendChild(hud);

const fpsEl = hud.querySelector('#fps-value');
const callsEl = hud.querySelector('#calls-value');
const countEl = hud.querySelector('#count-value');
const modeEl = hud.querySelector('#mode-value');

// ---------- Cahaya ----------
const hemisphereLight = new THREE.HemisphereLight(0xdff1ff, 0x40503a, 1.3);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xfff3dd, 2.2);
directionalLight.position.set(40, 60, 25);
scene.add(directionalLight);

// ---------- Lantai ----------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(120, 64),
  new THREE.MeshStandardMaterial({ color: 0x52734a, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ---------- Geometri pohon (dipakai bersama) ----------
const trunkGeometry = new THREE.CylinderGeometry(0.18, 0.3, 1.9, 6);
trunkGeometry.translate(0, 0.95, 0);

const crownGeometry = new THREE.ConeGeometry(1.2, 3.0, 7);
crownGeometry.translate(0, 2.9, 0);

const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.9 });
const crownMaterial = new THREE.MeshStandardMaterial({
  color: 0x3f8a4d,
  roughness: 0.85,
  flatShading: true,
});

// ---------- Data instance ----------
// PRNG sederhana agar sebaran pohon sama setiap kali halaman dimuat
function mulberry32(seed) {
  let value = seed;
  return function random() {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateTrees(amount) {
  const random = mulberry32(20261118);
  const trees = [];
  for (let i = 0; i < amount; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 55;
    trees.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      rotation: random() * Math.PI * 2,
      scale: 0.7 + random() * 1.0,
    });
  }
  return trees;
}

// ---------- Status dan pembangunan objek ----------
let mode = 'instanced';
let count = 1000;
let instancedTrunks = null;
let instancedCrowns = null;
let normalGroup = null;

const countButtons = [];
const actionsCount = document.createElement('div');
actionsCount.className = 'actions';

for (const value of COUNTS) {
  const button = document.createElement('button');
  button.textContent = value.toLocaleString('id-ID');
  button.addEventListener('click', () => {
    count = value;
    updateActiveButtons();
    rebuild();
  });
  actionsCount.appendChild(button);
  countButtons.push({ value, button });
}
overlay.appendChild(actionsCount);

const actionsMode = document.createElement('div');
actionsMode.className = 'actions';
const modeButton = document.createElement('button');
modeButton.addEventListener('click', () => {
  mode = mode === 'instanced' ? 'normal' : 'instanced';
  rebuild();
});
actionsMode.appendChild(modeButton);
overlay.appendChild(actionsMode);

function updateActiveButtons() {
  for (const item of countButtons) {
    item.button.classList.toggle('active', item.value === count);
  }
  modeButton.textContent =
    mode === 'instanced' ? 'Mode: InstancedMesh' : 'Mode: Mesh biasa';
  modeButton.classList.toggle('active', mode === 'normal');
  countEl.textContent = String(count);
  modeEl.textContent = mode === 'instanced' ? 'InstancedMesh' : 'Mesh biasa';
}

function clearTrees() {
  if (instancedTrunks) {
    scene.remove(instancedTrunks, instancedCrowns);
    instancedTrunks.dispose();
    instancedCrowns.dispose();
    instancedTrunks = null;
    instancedCrowns = null;
  }

  if (normalGroup) {
    scene.remove(normalGroup);
    normalGroup.clear();
    normalGroup = null;
  }
}

function rebuild() {
  clearTrees();

  const trees = generateTrees(count);
  const dummy = new THREE.Object3D();

  if (mode === 'instanced') {
    instancedTrunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
    instancedCrowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, count);

    for (let i = 0; i < count; i += 1) {
      const tree = trees[i];
      dummy.position.set(tree.x, 0, tree.z);
      dummy.rotation.set(0, tree.rotation, 0);
      dummy.scale.setScalar(tree.scale);
      dummy.updateMatrix();
      instancedTrunks.setMatrixAt(i, dummy.matrix);
      instancedCrowns.setMatrixAt(i, dummy.matrix);
    }

    instancedTrunks.instanceMatrix.needsUpdate = true;
    instancedCrowns.instanceMatrix.needsUpdate = true;
    instancedTrunks.computeBoundingSphere();
    instancedCrowns.computeBoundingSphere();

    scene.add(instancedTrunks, instancedCrowns);
  } else {
    normalGroup = new THREE.Group();

    for (let i = 0; i < count; i += 1) {
      const tree = trees[i];
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      trunk.position.set(tree.x, 0, tree.z);
      trunk.rotation.y = tree.rotation;
      trunk.scale.setScalar(tree.scale);
      crown.position.set(tree.x, 0, tree.z);
      crown.rotation.y = tree.rotation;
      crown.scale.setScalar(tree.scale);
      normalGroup.add(trunk, crown);
    }

    scene.add(normalGroup);
  }

  updateActiveButtons();
}

rebuild();

// ---------- Resize ----------
handleResize(camera, renderer);

// ---------- Loop dan pengukuran FPS ----------
const timer = new THREE.Timer();
timer.connect(document);
let frames = 0;
let elapsed = 0;

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = timer.getDelta();
  renderer.render(scene, camera);

  frames += 1;
  elapsed += delta;

  if (elapsed >= 0.5) {
    fpsEl.textContent = String(Math.round(frames / elapsed));
    callsEl.textContent = String(renderer.info.render.calls);
    frames = 0;
    elapsed = 0;
  }
});
