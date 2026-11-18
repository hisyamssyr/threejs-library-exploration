import * as THREE from 'three';

/**
 * Membuat WebGLRenderer yang mengisi seluruh jendela.
 * Pixel ratio dibatasi 2 agar tetap ringan di laptop dengan GPU terintegrasi.
 */
export function createRenderer({ shadows = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }

  document.body.appendChild(renderer.domElement);
  return renderer;
}

/** Membuat PerspectiveCamera dengan rasio sesuai jendela. */
export function createCamera({ fov = 55, near = 0.1, far = 1000 } = {}) {
  return new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
}

/** Menjaga rasio kamera saat ukuran jendela berubah. */
export function handleResize(camera, renderer, onResize) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (onResize) onResize();
  });
}

/**
 * Overlay judul demo + petunjuk kontrol agar screenshot bisa menjelaskan dirinya sendiri.
 * HTML pada `controls` sengaja diizinkan supaya bisa memakai <kbd>.
 */
export function createOverlay(title, controls) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <a class="back-link" href="./index.html">&larr; Indeks demo</a>
    <h1>${title}</h1>
    <p class="controls">${controls}</p>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

/** Cahaya dasar: ambient lembut + directional light yang menghasilkan bayangan. */
export function addBasicLights(scene, { intensity = 2.5, ambient = 0.6 } = {}) {
  const ambientLight = new THREE.AmbientLight(0xffffff, ambient);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
  directionalLight.position.set(8, 14, 6);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 60;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  scene.add(directionalLight);

  return { ambientLight, directionalLight };
}

/** Membuat lantai datar yang menerima bayangan. */
export function createGround(size = 100, color = 0x39463a) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}
