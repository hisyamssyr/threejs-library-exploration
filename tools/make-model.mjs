/**
 * Membuat model contoh `public/models/tugu-contoh.glb` dengan three.js + GLTFExporter.
 * Model ini buatan sendiri (bukan aset berlisensi tertutup) dan dipakai oleh demo 04.
 *
 * Jalankan: npm run make-model
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// GLTFExporter ditulis untuk browser dan memakai FileReader; sediakan polyfill kecil di Node.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReaderPolyfill {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend?.();
      });
    }

    readAsDataURL(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;
        this.onloadend?.();
      });
    }
  };
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const scene = new THREE.Scene();
scene.name = 'TuguContoh';

const stone = new THREE.MeshStandardMaterial({
  name: 'Stone',
  color: 0xd9d3c5,
  roughness: 0.58,
  metalness: 0.06,
});

const darkStone = new THREE.MeshStandardMaterial({
  name: 'DarkStone',
  color: 0x7d776d,
  roughness: 0.72,
  metalness: 0.08,
});

const gold = new THREE.MeshStandardMaterial({
  name: 'Gold',
  color: 0xc89b4c,
  roughness: 0.28,
  metalness: 0.85,
});

const accent = new THREE.MeshStandardMaterial({
  name: 'Accent',
  color: 0x4cc2ff,
  emissive: 0x0d3f55,
  emissiveIntensity: 0.7,
  roughness: 0.2,
  metalness: 0.5,
});

function addMesh(geometry, material, name, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Tangga dasar bertingkat
addMesh(new THREE.CylinderGeometry(2.4, 2.6, 0.35, 48), darkStone, 'TanggaBawah', [0, 0.175, 0]);
addMesh(new THREE.CylinderGeometry(1.9, 2.1, 0.35, 48), stone, 'TanggaAtas', [0, 0.525, 0]);
addMesh(new THREE.CylinderGeometry(1.35, 1.55, 0.7, 48), darkStone, 'Plinth', [0, 1.05, 0]);

// Badan tugu yang meruncing
addMesh(new THREE.CylinderGeometry(0.52, 0.82, 4.4, 48), stone, 'BadanTugu', [0, 3.6, 0]);

// Kerah / cincin dekoratif
addMesh(new THREE.TorusGeometry(0.78, 0.13, 16, 48), gold, 'KerahBawah', [0, 5.35, 0], [Math.PI / 2, 0, 0]);
addMesh(new THREE.TorusGeometry(0.58, 0.1, 14, 42), gold, 'KerahAtas', [0, 6.0, 0], [Math.PI / 2, 0, 0]);

// Mahkota dan ujung
addMesh(new THREE.SphereGeometry(0.58, 32, 20), accent, 'Mahkota', [0, 6.55, 0]);
const crown = scene.getObjectByName('Mahkota');
crown.scale.set(1, 1.3, 1);

addMesh(new THREE.ConeGeometry(0.2, 0.75, 20), gold, 'Ujung', [0, 7.55, 0]);

// Empat pilar kecil di sekeliling plinth
for (let i = 0; i < 4; i += 1) {
  const angle = (i / 4) * Math.PI * 2;
  addMesh(
    new THREE.CylinderGeometry(0.16, 0.2, 1.5, 16),
    stone,
    `Pilar${i + 1}`,
    [Math.cos(angle) * 1.9, 1.4, Math.sin(angle) * 1.9]
  );
  addMesh(
    new THREE.SphereGeometry(0.22, 18, 12),
    gold,
    `BolaPilar${i + 1}`,
    [Math.cos(angle) * 1.9, 2.25, Math.sin(angle) * 1.9]
  );
}

// Papan nama kecil
addMesh(new THREE.BoxGeometry(1.2, 0.5, 0.12), gold, 'PapanNama', [0, 0.8, 1.95], [0.12, 0, 0]);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, { binary: true });

const outputDir = resolve(root, 'public/models');
mkdirSync(outputDir, { recursive: true });
const outputFile = resolve(outputDir, 'tugu-contoh.glb');
writeFileSync(outputFile, Buffer.from(arrayBuffer));

let triangles = 0;
scene.traverse((object) => {
  if (!object.isMesh) return;
  const geometry = object.geometry;
  const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
  triangles += count / 3;
});

console.log(`Model ditulis ke ${outputFile}`);
console.log(`Jumlah mesh: ${scene.children.length}, segitiga: ${triangles}`);
