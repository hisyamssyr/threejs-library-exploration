# PRD: Eksplorasi Library Three.js untuk Model 3D Interaktif Bundaran ITS

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 18 November 2026 |
| **Penyusun** | Hisyam Syafa Raditya — 5025241130 |
| **Status** | Selesai |
| **Platform target** | Website, dibuka di browser laptop (Chrome / Edge / Firefox terbaru) |

---

## 1. Ringkasan

Proyek ini adalah tahap **eksplorasi library** sebelum membangun model 3D interaktif **Bundaran ITS** (Surabaya) berbasis web. Setiap library kandidat dicoba dalam satu halaman demo sendiri, didokumentasikan dengan screenshot sebagai bukti, lalu dibandingkan untuk menentukan library yang dipakai di proyek utama.

Keluaran tahap ini:
1. Satu proyek Vite berisi 9 halaman demo + 1 halaman indeks.
2. Screenshot bukti per demo.
3. Laporan eksplorasi yang berisi perbandingan dan rekomendasi library.

## 2. Latar Belakang dan Tujuan

**Latar belakang.** Produk akhir yang diinginkan adalah model 3D Bundaran ITS yang bisa dijelajahi (berjalan first-person) di laptop. Ada banyak library pendukung three.js, sehingga perlu dipastikan mana yang benar-benar dibutuhkan, ringan, dan mudah dipakai.

**Tujuan.**
- T1. Memahami fungsi dan cara pakai tiap library kandidat lewat demo kecil yang berjalan.
- T2. Mengumpulkan bukti (screenshot dan kode) yang bisa dimasukkan ke laporan.
- T3. Menentukan daftar library final untuk proyek Bundaran ITS.

**Bukan tujuan.**
- Membangun model Bundaran ITS yang lengkap dan detail.
- Dukungan perangkat mobile / layar sentuh.
- Fisika penuh (kendaraan yang bisa disetir, dll.).

## 3. Pengguna dan Skenario

| Pengguna | Kebutuhan |
|---|---|
| **Penyusun (mahasiswa)** | Menjalankan tiap demo, mengambil screenshot, dan menulis laporan. |
| **Dosen / pembimbing** | Melihat bukti bahwa library benar-benar dicoba dan dipahami. |
| **Tim pengembang berikutnya** | Memakai hasil eksplorasi sebagai dasar proyek utama. |

**Skenario utama.** Penyusun menjalankan `npm run dev`, membuka `localhost:5173`, memilih demo dari indeks, mencoba interaksinya, mengambil screenshot (termasuk bar alamat), lalu memindahkannya ke laporan.

## 4. Library Kandidat

| No | Library / Modul | Sumber | Peran di proyek akhir |
|---|---|---|---|
| 1 | three.js (inti) | `three` | Renderer, scene, kamera, mesh, cahaya |
| 2 | PointerLockControls | `three/addons` | Jalan first-person (WASD + mouse) |
| 3 | OrbitControls | `three/addons` | Melihat objek dari luar (putar, zoom) |
| 4 | GLTFLoader + DRACOLoader | `three/addons` | Memuat model `.glb` dari Blender |
| 5 | Sky | `three/addons` | Langit dan matahari prosedural |
| 6 | InstancedMesh | `three` | Pohon / lampu / kendaraan dalam jumlah banyak |
| 7 | Raycaster + CSS2DRenderer | `three`, `three/addons` | Klik objek, label info melayang |
| 8 | Tabrakan: `Box3` dan three-mesh-bvh | `three`, `three-mesh-bvh` | Mencegah menembus objek |
| 9 | lil-gui + stats.js | `lil-gui`, `stats.js` | Panel debug dan pemantau FPS |

## 5. Persyaratan Non-Fungsional

| ID | Persyaratan |
|---|---|
| NF1 | Semua demo berjalan di Chrome/Edge versi terbaru pada laptop dengan GPU terintegrasi. |
| NF2 | Minimal 30 FPS pada tiap demo (target 60 FPS). |
| NF3 | Satu proyek Vite, satu `node_modules`, satu `package.json`. |
| NF4 | Satu library utama = satu halaman HTML + satu file JS di `src/`. |
| NF5 | Kode diberi komentar singkat berbahasa Indonesia pada bagian inti agar mudah dijelaskan di laporan. |
| NF6 | Tiap halaman menampilkan **judul demo** dan **petunjuk kontrol** di layar, supaya screenshot menjelaskan dirinya sendiri. |
| NF7 | Tidak ada dependensi selain yang tercantum di Bagian 4. |
| NF8 | Tidak ada aset berlisensi tertutup. Aset eksternal harus berlisensi bebas (CC0 / MIT) dan dicatat sumbernya. |

## 6. Struktur Proyek

```
eksplorasi-its/
├── index.html                  # menu daftar demo
├── 01-threejs-dasar.html
├── 02-pointerlock.html
├── 03-orbit.html
├── 04-gltf-loader.html
├── 05-sky.html
├── 06-instancedmesh.html
├── 07-raycaster-label.html
├── 08-tabrakan.html
├── 09-lilgui-stats.html
├── public/
│   └── models/                 # file .glb untuk demo 04
├── src/
│   ├── common.js               # helper bersama (opsional)
│   ├── style.css               # gaya dasar bersama
│   ├── 01-threejs-dasar.js
│   ├── 02-pointerlock.js
│   ├── 03-orbit.js
│   ├── 04-gltf-loader.js
│   ├── 05-sky.js
│   ├── 06-instancedmesh.js
│   ├── 07-raycaster-label.js
│   ├── 08-tabrakan.js
│   └── 09-lilgui-stats.js
├── vite.config.js              # konfigurasi multi-page
├── package.json
├── README.md
└── screenshots/                # bukti untuk laporan
```

## 7. Spesifikasi Per File

Format tiap demo: **tujuan, fitur wajib, kriteria penerimaan, bukti yang diambil.**

---

### 7.0 `package.json` dan `vite.config.js`

**Tujuan.** Menyiapkan proyek agar semua halaman demo bisa dijalankan dan di-build.

**Fitur wajib.**
- Dependensi: `three`, `three-mesh-bvh`, `lil-gui`, `stats.js`.
- DevDependensi: `vite`.
- Skrip: `dev`, `build`, `preview`.
- `vite.config.js` mendaftarkan semua file HTML sebagai input (multi-page) lewat `build.rollupOptions.input`.

**Kriteria penerimaan.**
- `npm install` selesai tanpa error.
- `npm run dev` membuka server di `localhost:5173`.
- `npm run build` menghasilkan folder `dist/` berisi semua halaman.

**Bukti.** Screenshot terminal berisi `npm run dev` yang sukses.

---

### 7.1 `index.html` (menu demo)

**Tujuan.** Pintu masuk yang mendaftar semua demo.

**Fitur wajib.**
- Daftar tautan ke demo 01 sampai 09, masing-masing dengan nama library dan deskripsi satu kalimat.
- Judul proyek dan identitas penyusun.

**Kriteria penerimaan.** Semua tautan terbuka dan tidak ada yang 404.

**Bukti.** Screenshot halaman indeks.

---

### 7.2 `01-threejs-dasar.html` / `src/01-threejs-dasar.js`

**Tujuan.** Membuktikan three.js inti berfungsi: scene, kamera, renderer, mesh, cahaya, animasi.

**Fitur wajib.**
- Scene dengan `PerspectiveCamera` dan `WebGLRenderer` yang mengikuti ukuran jendela (resize handler).
- Sebuah silinder (mewakili tugu) atau kubus yang berputar.
- Lantai (`PlaneGeometry`) dan satu `DirectionalLight` + `AmbientLight`.
- Loop animasi dengan `requestAnimationFrame` atau `setAnimationLoop`.

**Kriteria penerimaan.**
- Objek tampil dan berputar mulus.
- Mengubah ukuran jendela tidak membuat gambar gepeng.

**Bukti.** Screenshot hasil (dengan bar alamat) + screenshot potongan kode scene.

---

### 7.3 `02-pointerlock.html` / `src/02-pointerlock.js`

**Tujuan.** Menguji kontrol jalan first-person, inti dari fitur "bisa jalan".

**Fitur wajib.**
- `PointerLockControls`: klik layar untuk mengunci kursor, `Esc` untuk melepas.
- Gerak: `W/A/S/D`; lari dengan `Shift`.
- Overlay "Klik untuk mulai" dan petunjuk kontrol.
- Tinggi mata kamera tetap (sekitar 1,7 satuan) di atas lantai.
- Lantai luas dengan beberapa kotak/silinder sebagai penanda posisi agar gerakan terlihat jelas.
- Gerak dihitung dengan `delta time` agar kecepatan konsisten di semua FPS.

**Kriteria penerimaan.**
- Kamera bergerak sesuai arah pandang, tidak melayang.
- Kecepatan lari lebih tinggi dari jalan.
- `Esc` memunculkan kembali kursor dan overlay.

**Bukti.** Screenshot tampilan first-person saat berjalan + screenshot overlay awal.

---

### 7.4 `03-orbit.html` / `src/03-orbit.js`

**Tujuan.** Menguji mode melihat objek dari luar sebagai pelengkap mode jalan.

**Fitur wajib.**
- `OrbitControls` dengan damping aktif.
- Batas zoom (jarak min/maks) dan batas sudut vertikal agar kamera tidak masuk ke bawah tanah.
- Objek uji: model sederhana bundaran (cincin jalan, pulau tengah, tugu).
- Tombol atau tombol keyboard `R` untuk mereset posisi kamera.

**Kriteria penerimaan.**
- Putar (klik kiri), geser (klik kanan), zoom (scroll) berfungsi.
- Kamera tidak bisa menembus lantai.

**Bukti.** Dua screenshot dari sudut pandang berbeda (misalnya dari atas dan dari samping).

---

### 7.5 `04-gltf-loader.html` / `src/04-gltf-loader.js`

**Tujuan.** Menguji pemuatan model `.glb` yang kelak dibuat di Blender (tugu, ornamen, bangunan).

**Fitur wajib.**
- `GLTFLoader` dengan `DRACOLoader` (decoder dari CDN resmi atau folder lokal).
- Memuat minimal satu file `.glb` dari `public/models/` (model contoh berlisensi bebas atau buatan sendiri).
- Model otomatis diskalakan dan dipusatkan (bounding box).
- Indikator "Memuat..." dan penanganan error jika file tidak ditemukan.
- Menampilkan info model (jumlah mesh, jumlah segitiga) di layar.

**Kriteria penerimaan.**
- Model tampil lengkap dengan tekstur/material aslinya.
- Jika file hilang, muncul pesan error yang jelas, bukan layar kosong.

**Bukti.** Screenshot model yang tampil + screenshot potongan kode loader.

---

### 7.6 `05-sky.html` / `src/05-sky.js`

**Tujuan.** Menguji langit dan matahari prosedural untuk suasana siang hari seperti pada foto referensi.

**Fitur wajib.**
- Objek `Sky` dengan parameter `turbidity`, `rayleigh`, `mieCoefficient`, `mieDirectionalG`.
- Posisi matahari ditentukan oleh elevasi dan azimut, lalu disinkronkan ke `DirectionalLight`.
- Tone mapping (misalnya ACESFilmic) dan exposure yang bisa diatur.
- Slider sederhana (boleh memakai `lil-gui`) untuk mengubah elevasi matahari.

**Kriteria penerimaan.**
- Langit berubah halus saat elevasi matahari digeser (pagi, siang, sore).
- Bayangan objek mengikuti arah matahari.

**Bukti.** Dua screenshot: langit siang dan langit sore.

---

### 7.7 `06-instancedmesh.html` / `src/06-instancedmesh.js`

**Tujuan.** Menguji cara menampilkan banyak objek serupa (pohon, tiang lampu, kendaraan) dengan performa baik.

**Fitur wajib.**
- `InstancedMesh` untuk pohon sederhana (batang silinder + tajuk kerucut/bola), jumlah bisa diubah (100, 500, 1000, 5000).
- Posisi, rotasi, dan skala tiap instance diacak.
- Tampilan FPS dan jumlah instance di layar.
- Perbandingan: tombol untuk beralih antara `InstancedMesh` dan mesh biasa pada jumlah yang sama.

**Kriteria penerimaan.**
- Dengan 1000 instance, FPS tetap mendekati 60.
- Perbandingan FPS antara `InstancedMesh` dan mesh biasa terlihat dan dapat dicatat.

**Bukti.** Screenshot dengan angka FPS untuk dua kondisi (misalnya 500 dan 5000 instance), dicatat dalam tabel di laporan.

---

### 7.8 `07-raycaster-label.html` / `src/07-raycaster-label.js`

**Tujuan.** Menguji interaksi klik objek dan label informasi, misalnya info sejarah Tugu ITS.

**Fitur wajib.**
- `Raycaster` yang membaca posisi klik/hover mouse.
- Objek yang bisa diklik (minimal tugu, pulau tengah, dan ornamen).
- Efek hover (objek berubah warna atau kursor berubah menjadi pointer).
- `CSS2DRenderer` menampilkan label teks melayang di atas objek (misalnya "Tugu ITS").
- Saat objek diklik, muncul panel info berisi judul dan deskripsi singkat (teks contoh).

**Kriteria penerimaan.**
- Hanya objek yang ditargetkan yang merespons klik.
- Label tetap berada di atas objek saat kamera digerakkan.

**Bukti.** Screenshot saat label tampil + screenshot saat panel info terbuka.

---

### 7.9 `08-tabrakan.html` / `src/08-tabrakan.js`

**Tujuan.** Menguji pencegahan tembus objek saat berjalan (tugu, pot tanaman, tembok).

**Fitur wajib.**
- Kontrol jalan seperti demo 02.
- **Metode A**: tabrakan `Box3` atau `Raycaster` ke obstacle sederhana.
- **Metode B**: `three-mesh-bvh` pada geometri yang lebih kompleks (mis. torus-knot atau model `.glb`).
- Tombol untuk beralih metode dan opsi menampilkan kotak tabrakan (debug helper).
- Pemain dapat "menyusur" dinding (tidak berhenti total) bila memungkinkan.

**Kriteria penerimaan.**
- Kamera tidak menembus obstacle pada kedua metode.
- Tidak ada penurunan FPS yang terasa pada scene uji.

**Bukti.** Screenshot kamera tertahan di depan obstacle + screenshot debug helper aktif.

---

### 7.10 `09-lilgui-stats.html` / `src/09-lilgui-stats.js`

**Tujuan.** Menguji alat bantu pengembangan: panel kontrol dan pemantau performa.

**Fitur wajib.**
- `stats.js` menampilkan FPS (panel 0) dan, bila ada, memori (panel 2).
- `lil-gui` mengatur: warna objek, intensitas cahaya, posisi kamera, kecepatan putar, dan visibilitas helper (grid/axes).
- Tombol "Reset" mengembalikan nilai awal.

**Kriteria penerimaan.**
- Perubahan di panel langsung terlihat di scene.
- Panel FPS selalu tampak di pojok layar.

**Bukti.** Screenshot dengan panel GUI dan FPS terlihat.

---

### 7.11 `src/common.js` dan `src/style.css` (opsional)

**Tujuan.** Menghindari kode berulang.

**Fitur.**
- `common.js`: fungsi pembuat renderer/kamera/handler resize, dan komponen overlay judul + petunjuk kontrol.
- `style.css`: gaya dasar (`body` tanpa margin, canvas penuh layar, overlay dengan font terbaca).

**Kriteria penerimaan.** Dipakai oleh minimal 5 demo; bila terlalu mengganggu keterbacaan kode, boleh dihapus dan tiap demo berdiri sendiri.

---

### 7.12 `README.md`

**Isi wajib.** Cara install dan menjalankan, daftar demo beserta kontrolnya, versi Node.js dan three.js yang dipakai, dan sumber aset eksternal beserta lisensinya.

## 8. Rencana Screenshot untuk Laporan

| No | Nama file screenshot | Isi |
|---|---|---|
| 1 | `00-terminal-dev.png` | Terminal `npm run dev` berhasil |
| 2 | `01-dasar.png` | Hasil demo 01 + bar alamat |
| 3 | `02-pointerlock.png` | Tampilan first-person |
| 4 | `03-orbit-atas.png`, `03-orbit-samping.png` | Dua sudut pandang |
| 5 | `04-gltf.png` | Model `.glb` tampil |
| 6 | `05-sky-siang.png`, `05-sky-sore.png` | Dua kondisi langit |
| 7 | `06-instanced-500.png`, `06-instanced-5000.png` | FPS tiap kondisi |
| 8 | `07-label.png`, `07-panel-info.png` | Label dan panel info |
| 9 | `08-tabrakan.png`, `08-tabrakan-debug.png` | Tertahan obstacle + helper |
| 10 | `09-gui-stats.png` | Panel GUI dan FPS |

**Aturan umum.** Sertakan bar alamat browser, beri keterangan "Gambar N. ..." di laporan, dan ambil juga screenshot potongan kode untuk tiap library.

## 9. Kriteria Keberhasilan Keseluruhan

- [x] Semua 9 demo + indeks berjalan tanpa error di konsol.
- [x] Setiap demo memenuhi kriteria penerimaannya (Bagian 7).
- [x] Seluruh screenshot pada Bagian 8 terkumpul.
- [x] Tabel perbandingan library terisi (kelebihan, kekurangan, kesulitan, performa).
- [x] Daftar library final untuk proyek Bundaran ITS sudah ditentukan, disertai alasan.

## 10. Template Tabel Perbandingan (untuk laporan)

| Library | Kemudahan (1-5) | Performa (1-5) | Dokumentasi (1-5) | Wajib untuk proyek utama? | Catatan |
|---|---|---|---|---|---|
| three.js inti | | | | Ya | |
| PointerLockControls | | | | | |
| OrbitControls | | | | | |
| GLTFLoader + Draco | | | | | |
| Sky | | | | | |
| InstancedMesh | | | | | |
| Raycaster + CSS2DRenderer | | | | | |
| Box3 / three-mesh-bvh | | | | | |
| lil-gui + stats.js | | | | Tidak (dev tool) | |

## 11. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pointer Lock ditolak browser | Demo 02/08 tidak bisa dipakai | Pastikan dibuka lewat `localhost`/HTTPS dan klik dulu sebelum bergerak |
| Decoder Draco gagal dimuat | Demo 04 error | Simpan decoder secara lokal di `public/draco/` atau pakai model tanpa Draco |
| File `.glb` tidak tersedia | Demo 04 tidak bisa dites | Siapkan model contoh (Khronos glTF Sample Models) atau ekspor dari Blender |
| FPS rendah di laptop lemah | Bukti performa tidak representatif | Kurangi jumlah instance dan resolusi, catat spesifikasi laptop di laporan |
| Waktu terbatas | Tidak semua demo selesai | Prioritaskan: 01, 02, 03, 04, 07, lalu sisanya |

## 12. Prioritas dan Urutan Pengerjaan

| Prioritas | Demo | Alasan |
|---|---|---|
| P0 (wajib) | 7.0 setup, 01, 02, 03 | Dasar dan inti fitur "bisa jalan" |
| P1 | 04, 05, 07 | Memuat model, suasana, interaksi |
| P2 | 06, 08 | Performa dan tabrakan |
| P3 | 09, common.js, README | Alat bantu dan pelengkap |

## 13. Lingkungan Pengembangan

| Komponen | Spesifikasi |
|---|---|
| Node.js | v20 atau lebih baru |
| Bundler | Vite (versi terbaru) |
| three.js | Catat versi tepat di laporan (`npm ls three`) |
| Browser | Chrome / Edge terbaru |
| Editor | VS Code (atau sejenisnya) |
| Perangkat | Laptop; catat tipe CPU/GPU dan RAM di laporan |

## 14. Referensi

- three.js Docs: https://threejs.org/docs
- three.js Examples: https://threejs.org/examples
  - `misc_controls_pointerlock`, `misc_controls_orbit`, `webgl_loader_gltf`, `webgl_shaders_sky`, `webgl_instancing_dynamic`, `css2d_label`
- three-mesh-bvh: https://github.com/gkjohnson/three-mesh-bvh
- lil-gui: https://lil-gui.georgealways.com
- stats.js: https://github.com/mrdoob/stats.js
- Vite: https://vite.dev