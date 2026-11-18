# Daftar Screenshot

Folder ini berisi tangkapan layar seluruh demo. Sebagian besar gambar adalah **baseline
otomatis** yang diambil dengan Chrome 156 headless pada ukuran jendela 1366 × 768 dan
renderer perangkat lunak (SwiftShader). Karena diambil headless, **bar alamat browser tidak
terlihat** dan **angka FPS tidak representatif** untuk GPU laptop.

Dua berkas diambil manual di laptop penyusun:

- `00-terminal-dev.png` — `npm run dev` berhasil (Vite ready 294 ms, `localhost:5173`).
- `09-gui-stats.png` — panel stats menunjukkan **60 FPS (50–60)** dan memori 20 MB.

Untuk laporan yang diserahkan, screenshot baseline dapat diambil ulang di browser laptop
dengan bar alamat terlihat bila dosen mensyaratkannya. Potongan kode inti setiap library
sudah disertakan pada `LAPORAN.md` Bagian 3.

## Cara mengambil ulang

1. Jalankan server: `npm run dev` lalu buka `http://localhost:5173`.
2. Buka halaman demo sesuai daftar di bawah.
3. Ambil screenshot dengan bar alamat terlihat (misalnya Snipping Tool / PrtSc).
4. Untuk demo 02 dan 08, klik layar dulu agar kursor terkunci sebelum menekan tombol
   screenshot; untuk demo 07, klik objek agar panel info terbuka.
5. Simpan sebagai PNG dengan nama berkas yang sama di folder ini.

## Daftar berkas

| No | Berkas | Isi | Status |
|---|---|---|---|
| 0 | `00-terminal-dev.png` | Terminal dengan `npm run dev` berhasil | **Diambil manual di laptop — Vite ready 294 ms** |
| 1 | `00-indeks.png` | Halaman indeks seluruh demo | Baseline |
| 2 | `01-dasar.png` | Demo 01: tugu silinder berputar | Baseline |
| 3 | `02-overlay-awal.png` | Demo 02: overlay "Klik untuk mulai" | Baseline |
| 4 | `02-pointerlock.png` | Demo 02: tampilan first-person setelah kursor terkunci | Baseline |
| 5 | `03-orbit-samping.png` | Demo 03: sudut pandang samping | Baseline |
| 6 | `03-orbit-atas.png` | Demo 03: sudut pandang atas | Baseline |
| 7 | `04-gltf.png` | Demo 04: model `.glb` tampil beserta info mesh/segitiga | Baseline |
| 8 | `05-sky-siang.png` | Demo 05: langit siang | Baseline |
| 9 | `05-sky-sore.png` | Demo 05: langit sore | Baseline |
| 10 | `06-instanced-500.png` | Demo 06: 500 pohon mode InstancedMesh | Baseline |
| 11 | `06-instanced-5000.png` | Demo 06: 5.000 pohon mode InstancedMesh | Baseline |
| 12 | `06-mesh-biasa-5000.png` | Demo 06: pembanding mesh biasa pada 5.000 pohon | Baseline |
| 13 | `07-label.png` | Demo 07: label CSS2D melayang di atas objek | Baseline |
| 14 | `07-panel-info.png` | Demo 07: panel info setelah objek diklik | Baseline |
| 15 | `08-tabrakan.png` | Demo 08: kamera tertahan di depan ornamen | Baseline |
| 16 | `08-tabrakan-debug.png` | Demo 08: debug helper Box3 aktif | Baseline |
| 17 | `08-tabrakan-bvh-debug.png` | Demo 08: visualisasi BVH pada metode three-mesh-bvh | Baseline |
| 18 | `09-gui-stats.png` | Demo 09: panel lil-gui dan stats.js | **Diambil ulang di laptop — 60 FPS (50–60), memori 20 MB** |

## Catatan

- Angka FPS pada gambar baseline berasal dari renderer perangkat lunak, jadi abaikan untuk
  tabel performa. Pengukuran FPS di GPU laptop sudah dilakukan terpisah memakai Chrome
  headless + ANGLE OpenGL (Intel Arc) dan dicatat di `LAPORAN.md` Bagian 7: 60 FPS untuk
  InstancedMesh 500/5.000 pohon, 42–52 FPS untuk mesh biasa 5.000 pohon, dan 60 FPS untuk
  demo 08.
- `00-terminal-dev.png` dan `09-gui-stats.png` adalah bukti manual yang sudah dilengkapi.
- Screenshot baseline belum menampilkan bar alamat; ambil ulang di browser laptop bila
  bar alamat wajib terlihat agar sesuai PRD Bagian 8.
