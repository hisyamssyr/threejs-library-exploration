import * as THREE from 'three';
import GUI from 'lil-gui';
import Stats from 'stats.js';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
  addBasicLights,
} from './common.js';

// ---------- Scene dan kamera ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1720);
scene.fog = new THREE.Fog(0x0f1720, 35, 80);

const camera = createCamera({ fov: 50, far: 300 });
const cameraTarget = new THREE.Vector3(0, 2.2, 0);

const renderer = createRenderer();
renderer.toneMappingExposure = 1;

createOverlay(
  '09 · lil-gui + stats.js',
  'Ubah warna, intensitas cahaya, posisi kamera, kecepatan putar, dan helper lewat panel kanan. Panel stats di kiri bawah menampilkan FPS dan memori.'
);

// ---------- Dunia ----------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(50, 64),
  new THREE.MeshStandardMaterial({ color: 0x304038, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(50, 50, 0x41586b, 0x2c3c4a);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(3);
axesHelper.position.y = 0.02;
axesHelper.visible = false;
scene.add(axesHelper);

const { directionalLight } = addBasicLights(scene, { intensity: 2.6, ambient: 0.6 });

// Objek utama: tugu + cincin
const objectGroup = new THREE.Group();
scene.add(objectGroup);

const objectMaterial = new THREE.MeshStandardMaterial({
  color: 0xb9c2cc,
  roughness: 0.45,
  metalness: 0.2,
});

const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.5, 40), objectMaterial);
base.position.y = 0.25;
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 4.4, 40), objectMaterial);
body.position.y = 2.7;
const orb = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 28, 18),
  new THREE.MeshStandardMaterial({ color: 0x4cc2ff, metalness: 0.65, roughness: 0.2 })
);
orb.position.y = 5.3;

for (const part of [base, body, orb]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
objectGroup.add(base, body, orb);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.3, 14, 48),
  new THREE.MeshStandardMaterial({ color: 0xc79a4b, metalness: 0.7, roughness: 0.3 })
);
ring.position.y = 1.6;
ring.rotation.x = Math.PI / 2;
ring.castShadow = true;
objectGroup.add(ring);

// ---------- Parameter GUI ----------
const defaults = {
  color: '#b9c2cc',
  lightIntensity: 2.6,
  cameraX: 8,
  cameraY: 5.5,
  cameraZ: 10,
  rotationSpeed: 0.6,
  showGrid: true,
  showAxes: false,
};

const params = { ...defaults };

function applyCamera() {
  camera.position.set(params.cameraX, params.cameraY, params.cameraZ);
  camera.lookAt(cameraTarget);
}

applyCamera();

const gui = new GUI({ title: 'Panel Debug' });

const objectFolder = gui.addFolder('Objek');
objectFolder
  .addColor(params, 'color')
  .name('Warna objek')
  .onChange((value) => objectMaterial.color.set(value));
objectFolder
  .add(params, 'rotationSpeed', 0, 2, 0.01)
  .name('Kecepatan putar');

const lightFolder = gui.addFolder('Cahaya');
lightFolder
  .add(params, 'lightIntensity', 0, 6, 0.05)
  .name('Intensitas')
  .onChange((value) => {
    directionalLight.intensity = value;
  });

const cameraFolder = gui.addFolder('Kamera');
cameraFolder.add(params, 'cameraX', -20, 20, 0.1).name('Posisi X').onChange(applyCamera);
cameraFolder.add(params, 'cameraY', 1, 20, 0.1).name('Posisi Y').onChange(applyCamera);
cameraFolder.add(params, 'cameraZ', -20, 20, 0.1).name('Posisi Z').onChange(applyCamera);

const helperFolder = gui.addFolder('Helper');
helperFolder
  .add(params, 'showGrid')
  .name('Grid')
  .onChange((value) => {
    gridHelper.visible = value;
  });
helperFolder
  .add(params, 'showAxes')
  .name('Axes')
  .onChange((value) => {
    axesHelper.visible = value;
  });

const actions = { reset: resetAll };
gui.add(actions, 'reset').name('Reset nilai awal');
cameraFolder.close();
helperFolder.close();

function resetAll() {
  Object.assign(params, defaults);

  objectMaterial.color.set(params.color);
  directionalLight.intensity = params.lightIntensity;
  gridHelper.visible = params.showGrid;
  axesHelper.visible = params.showAxes;
  applyCamera();

  gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
}

// ---------- stats.js: FPS (panel 0) dan memori (panel 2) ----------
const statsFps = new Stats();
statsFps.showPanel(0);
statsFps.dom.style.left = '16px';
statsFps.dom.style.top = 'auto';
statsFps.dom.style.bottom = '16px';
document.body.appendChild(statsFps.dom);

const statsMemory = new Stats();
statsMemory.dom.style.left = '102px';
statsMemory.dom.style.top = 'auto';
statsMemory.dom.style.bottom = '16px';
if (statsMemory.dom.children.length > 2) {
  statsMemory.showPanel(2);
  document.body.appendChild(statsMemory.dom);
}

// ---------- Loop ----------
const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  statsFps.begin();
  statsMemory.begin();

  const delta = Math.min(timer.getDelta(), 0.05);
  objectGroup.rotation.y += delta * params.rotationSpeed;
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);

  statsFps.end();
  statsMemory.end();
});

handleResize(camera, renderer);
