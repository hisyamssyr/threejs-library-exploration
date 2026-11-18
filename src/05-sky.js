import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'lil-gui';
import {
  createRenderer,
  createCamera,
  createOverlay,
  handleResize,
} from './common.js';

// ---------- Scene, kamera, renderer ----------
const scene = new THREE.Scene();

const camera = createCamera({ fov: 60, far: 2000 });
camera.position.set(20, 4.5, 26);
camera.lookAt(0, 9, 0);

const renderer = createRenderer();
renderer.toneMappingExposure = 0.5;

const overlay = createOverlay(
  '05 · Sky',
  'Langit prosedural dengan posisi matahari dari elevasi dan azimut. Geser slider di panel kanan untuk mengubah pagi, siang, dan sore.'
);

// ---------- Sky ----------
const sky = new Sky();
sky.scale.setScalar(1000);
scene.add(sky);

// ---------- Cahaya matahari ----------
const sunLight = new THREE.DirectionalLight(0xffffff, 11.5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 400;
sunLight.shadow.camera.left = -45;
sunLight.shadow.camera.right = 45;
sunLight.shadow.camera.top = 45;
sunLight.shadow.camera.bottom = -45;
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);
scene.add(sunLight.target);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
scene.add(ambientLight);

// ---------- Objek uji ----------
const lawn = new THREE.Mesh(
  new THREE.CircleGeometry(100, 64),
  new THREE.MeshStandardMaterial({ color: 0x55714c, roughness: 0.95 })
);
lawn.rotation.x = -Math.PI / 2;
lawn.receiveShadow = true;
scene.add(lawn);

const road = new THREE.Mesh(
  new THREE.RingGeometry(7, 15, 80),
  new THREE.MeshStandardMaterial({ color: 0x32353a, roughness: 0.9 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

const island = new THREE.Mesh(
  new THREE.CylinderGeometry(7, 7.2, 0.6, 60),
  new THREE.MeshStandardMaterial({ color: 0x4d7a48, roughness: 0.9 })
);
island.position.y = 0.3;
island.castShadow = true;
island.receiveShadow = true;
scene.add(island);

const tugu = new THREE.Group();
const stone = new THREE.MeshStandardMaterial({ color: 0xe2ddd0, roughness: 0.55 });
const tuguBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 5.0, 36), stone);
tuguBody.position.y = 3.1;
const tuguTop = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 26, 18),
  new THREE.MeshStandardMaterial({ color: 0x62b6d8, metalness: 0.6, roughness: 0.25 })
);
tuguTop.position.y = 5.8;
for (const part of [tuguBody, tuguTop]) {
  part.castShadow = true;
  part.receiveShadow = true;
}
tugu.add(tuguBody, tuguTop);
scene.add(tugu);

const treeTrunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2.0, 8);
const treeCrownGeometry = new THREE.ConeGeometry(1.4, 3.2, 9);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6f4d35, roughness: 0.9 });
const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7a48, roughness: 0.85 });

// Arah kamera dipakai untuk menyisakan "koridor" agar tidak ada pohon
// yang menghalangi pandangan dari posisi awal.
const cameraAzimuth = Math.atan2(camera.position.z, camera.position.x);

for (let i = 0; i < 10; i += 1) {
  const angle = (i / 10) * Math.PI * 2 + 0.3;
  const diff = Math.abs(Math.atan2(Math.sin(angle - cameraAzimuth), Math.cos(angle - cameraAzimuth)));
  if (diff < 0.55) continue;

  const radius = 20 + (i % 3) * 3;
  const trunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial);
  trunk.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
  trunk.castShadow = true;

  const crown = new THREE.Mesh(treeCrownGeometry, crownMaterial);
  crown.position.set(trunk.position.x, 3.4, trunk.position.z);
  crown.castShadow = true;

  scene.add(trunk, crown);
}

// Beberapa batu/objek rendah agar bayangan mudah diamati
for (let i = 0; i < 6; i += 1) {
  const angle = (i / 6) * Math.PI * 2 + 0.5;
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.7 + (i % 3) * 0.2, 0),
    new THREE.MeshStandardMaterial({ color: 0x8b8577, roughness: 0.8 })
  );
  rock.position.set(Math.cos(angle) * 19, 0.5, Math.sin(angle) * 19);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

// ---------- Parameter atmosfer & matahari ----------
const params = {
  elevation: 25,
  azimuth: 165,
  turbidity: 1.2,
  rayleigh: 1.2,
  mieCoefficient: 0.001,
  mieDirectionalG: 0.8,
  cloudCoverage: 0.12,
  cloudDensity: 0.32,
  exposure: 0.15,
  sunIntensity: 11.5,
  ambientIntensity: 1.9,
};

// Preset praktis untuk screenshot "siang" dan "sore"
const presets = {
  siang: { ...params },
  sore: {
    elevation: 3.5,
    azimuth: 195,
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.01,
    mieDirectionalG: 0.9,
    cloudCoverage: 0.45,
    cloudDensity: 0.45,
    exposure: 0.7,
    sunIntensity: 3.2,
    ambientIntensity: 0.6,
  },
};

const sunPosition = new THREE.Vector3();

function updateAtmosphere() {
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = params.turbidity;
  uniforms.rayleigh.value = params.rayleigh;
  uniforms.mieCoefficient.value = params.mieCoefficient;
  uniforms.mieDirectionalG.value = params.mieDirectionalG;
  uniforms.cloudCoverage.value = params.cloudCoverage;
  uniforms.cloudDensity.value = params.cloudDensity;

  // Elevasi 90° = matahari tepat di atas; azimut menentukan arah horizontal
  const phi = THREE.MathUtils.degToRad(90 - params.elevation);
  const theta = THREE.MathUtils.degToRad(params.azimuth);
  sunPosition.setFromSphericalCoords(1, phi, theta);
  uniforms.sunPosition.value.copy(sunPosition);

  // DirectionalLight disinkronkan dengan posisi matahari
  sunLight.position.copy(sunPosition).multiplyScalar(120);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  sunLight.intensity = params.sunIntensity;
  ambientLight.intensity = params.ambientIntensity;
  renderer.toneMappingExposure = params.exposure;
}

updateAtmosphere();

// ---------- GUI ----------
const gui = new GUI({ title: 'Atmosfer & Matahari' });

const sunFolder = gui.addFolder('Posisi matahari');
sunFolder.add(params, 'elevation', 0, 90, 1).name('Elevasi (°)').onChange(updateAtmosphere);
sunFolder.add(params, 'azimuth', -180, 180, 1).name('Azimut (°)').onChange(updateAtmosphere);

const skyFolder = gui.addFolder('Parameter Sky');
skyFolder.add(params, 'turbidity', 0.1, 20, 0.1).name('Turbidity').onChange(updateAtmosphere);
skyFolder.add(params, 'rayleigh', 0, 4, 0.05).name('Rayleigh').onChange(updateAtmosphere);
skyFolder
  .add(params, 'mieCoefficient', 0, 0.05, 0.001)
  .name('Mie coefficient')
  .onChange(updateAtmosphere);
skyFolder
  .add(params, 'mieDirectionalG', 0, 1, 0.01)
  .name('Mie directional G')
  .onChange(updateAtmosphere);
skyFolder
  .add(params, 'cloudCoverage', 0, 1, 0.01)
  .name('Cloud coverage')
  .onChange(updateAtmosphere);
skyFolder
  .add(params, 'cloudDensity', 0, 1, 0.01)
  .name('Cloud density')
  .onChange(updateAtmosphere);

gui.add(params, 'exposure', 0.05, 1.2, 0.01).name('Exposure').onChange(updateAtmosphere);

const lightFolder = gui.addFolder('Cahaya');
lightFolder
  .add(params, 'sunIntensity', 0, 20, 0.1)
  .name('Intensitas matahari')
  .onChange(updateAtmosphere);
lightFolder
  .add(params, 'ambientIntensity', 0, 4, 0.05)
  .name('Intensitas ambient')
  .onChange(updateAtmosphere);

skyFolder.close();
lightFolder.close();

// Tombol preset di overlay agar mudah mengambil bukti screenshot siang/sore
const actions = document.createElement('div');
actions.className = 'actions';
for (const [name, preset] of Object.entries(presets)) {
  const button = document.createElement('button');
  button.textContent = name === 'siang' ? 'Langit siang' : 'Langit sore';
  button.addEventListener('click', () => {
    Object.assign(params, preset);
    updateAtmosphere();
    gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
  });
  actions.appendChild(button);
}
overlay.appendChild(actions);

handleResize(camera, renderer);

// ---------- Loop ----------
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
