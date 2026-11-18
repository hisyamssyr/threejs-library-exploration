import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
  createGround,
} from './common.js';

// ---------- Scene dasar ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111a24);
scene.fog = new THREE.Fog(0x111a24, 30, 75);

const camera = createCamera({ fov: 50, far: 300 });
camera.position.set(8, 6, 11);

const renderer = createRenderer();

createOverlay(
  '04 · GLTFLoader + DRACOLoader',
  'Memuat <code>public/models/tugu-contoh.glb</code> (model buatan sendiri). Model otomatis dipusatkan, diskalakan, dan diletakkan di atas lantai.'
);

// HUD info model di kanan atas
const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = '<strong>Info model</strong><br />Menunggu model...';
document.body.appendChild(hud);

// Indikator status di tengah layar
const statusBox = document.createElement('div');
statusBox.className = 'status-box';
statusBox.textContent = 'Memuat model...';
document.body.appendChild(statusBox);

// ---------- Dunia ----------
const ground = createGround(150, 0x2f3a33);
scene.add(ground);

const grid = new THREE.GridHelper(150, 75, 0x3d4b58, 0x2b3742);
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.45;
scene.add(grid);

addBasicLights(scene, { intensity: 2.8, ambient: 0.65 });

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 3, 0);
controls.minDistance = 5;
controls.maxDistance = 35;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();

// ---------- DRACOLoader ----------
// Decoder disimpan lokal di public/draco/ agar tidak bergantung CDN.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const modelUrl = `${import.meta.env.BASE_URL}models/tugu-contoh.glb`;

loader.load(
  modelUrl,
  (gltf) => {
    const model = gltf.scene;

    let meshCount = 0;
    let triangleCount = 0;

    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      meshCount += 1;

      const geometry = object.geometry;
      const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
      triangleCount += Math.floor(count / 3);
    });

    // Hitung bounding box asli untuk penskalaan otomatis
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalSize = new THREE.Vector3();
    originalBox.getSize(originalSize);

    const targetHeight = 6;
    const scale = targetHeight / (originalSize.y || 1);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    // Setelah diskalakan, pusatkan di sumbu X/Z dan letakkan alas di lantai
    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    model.position.x -= scaledCenter.x;
    model.position.z -= scaledCenter.z;
    model.position.y -= scaledBox.min.y;

    scene.add(model);

    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = new THREE.Vector3();
    finalBox.getSize(finalSize);

    controls.target.set(0, finalSize.y * 0.45, 0);
    controls.update();

    statusBox.classList.add('hidden');

    hud.innerHTML = `
      <strong>Info model</strong>
      <div>File: <strong>tugu-contoh.glb</strong></div>
      <div>Mesh: <strong>${meshCount}</strong></div>
      <div>Segitiga: <strong>${triangleCount.toLocaleString('id-ID')}</strong></div>
      <div>Tinggi: <strong>${finalSize.y.toFixed(2)}</strong> satuan</div>
      <div>Skala: <strong>${scale.toFixed(2)}x</strong></div>
    `;
  },
  (event) => {
    if (event.total) {
      const percent = Math.round((event.loaded / event.total) * 100);
      statusBox.textContent = `Memuat model... ${percent}%`;
    }
  },
  (error) => {
    console.error('Gagal memuat model:', error);
    statusBox.classList.remove('hidden');
    statusBox.classList.add('error');
    statusBox.innerHTML =
      '<strong>Gagal memuat model.</strong><br />' +
      'Pastikan <code>public/models/tugu-contoh.glb</code> tersedia. ' +
      'Jalankan <code>npm run make-model</code> untuk membuat ulang model contoh.';
    hud.innerHTML = '<strong>Info model</strong><br /><span style="color:#ff9c9c">Model gagal dimuat</span>';
  }
);

handleResize(camera, renderer);

// ---------- Loop ----------
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
