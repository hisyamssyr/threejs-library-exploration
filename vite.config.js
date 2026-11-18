import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        dasar: resolve(root, '01-threejs-dasar.html'),
        pointerlock: resolve(root, '02-pointerlock.html'),
        orbit: resolve(root, '03-orbit.html'),
        gltf: resolve(root, '04-gltf-loader.html'),
        sky: resolve(root, '05-sky.html'),
        instancedmesh: resolve(root, '06-instancedmesh.html'),
        raycaster: resolve(root, '07-raycaster-label.html'),
        tabrakan: resolve(root, '08-tabrakan.html'),
        lilgui: resolve(root, '09-lilgui-stats.html'),
      },
    },
  },
});
