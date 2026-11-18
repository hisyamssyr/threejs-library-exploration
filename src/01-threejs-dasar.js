import * as THREE from 'three';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
  createGround,
} from './common.js';

// ---------- Scene, kamera, renderer ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1620);
scene.fog = new THREE.Fog(0x0e1620, 30, 80);

const camera = createCamera({ fov: 50, far: 500 });
camera.position.set(7.5, 4.5, 9.5);
camera.lookAt(0, 2.4, 0);

const renderer = createRenderer();
renderer.toneMappingExposure = 1.05;

createOverlay(
  '01 · three.js Dasar',
  'Scene, kamera, renderer, mesh, dan cahaya inti three.js. Silinder tugu berputar otomatis; ubah ukuran jendela untuk menguji resize.'
);

// ---------- Lantai dan cahaya ----------
const ground = createGround(80, 0x33413a);
scene.add(ground);

const grid = new THREE.GridHelper(80, 80, 0x3c4d5a, 0x2a3640);
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.5;
scene.add(grid);

addBasicLights(scene, { intensity: 2.8, ambient: 0.55 });

// ---------- Tugu sederhana (silinder = objek utama demo) ----------
const tugu = new THREE.Group();

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0xd9dee5,
  roughness: 0.45,
  metalness: 0.15,
});

const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 48), stoneMaterial);
base.position.y = 0.25;
base.castShadow = true;
base.receiveShadow = true;
tugu.add(base);

const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 4.2, 48), stoneMaterial);
body.position.y = 2.6;
body.castShadow = true;
tugu.add(body);

const collar = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.1, 12, 48), stoneMaterial);
collar.rotation.x = Math.PI / 2;
collar.position.y = 4.6;
collar.castShadow = true;
tugu.add(collar);

const orbMaterial = new THREE.MeshStandardMaterial({
  color: 0x4cc2ff,
  emissive: 0x0d4f6e,
  emissiveIntensity: 0.8,
  roughness: 0.2,
  metalness: 0.6,
});

const orb = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 20), orbMaterial);
orb.position.y = 5.3;
orb.castShadow = true;
tugu.add(orb);

scene.add(tugu);

// Penanda tambahan supaya ukuran ruang terasa
const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x5b7f6a, roughness: 0.7 });
for (let i = 0; i < 10; i += 1) {
  const angle = (i / 10) * Math.PI * 2;
  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), markerMaterial);
  marker.position.set(Math.cos(angle) * 9, 0.6, Math.sin(angle) * 9);
  marker.rotation.y = angle;
  marker.castShadow = true;
  marker.receiveShadow = true;
  scene.add(marker);
}

// ---------- Resize ----------
handleResize(camera, renderer);

// ---------- Animasi ----------
const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.05);

  // Mesh berputar dengan kecepatan konstan, tidak bergantung FPS
  tugu.rotation.y += delta * 0.55;
  orb.position.y = 5.3 + Math.sin(timer.getElapsed() * 1.4) * 0.12;

  renderer.render(scene, camera);
});
