# BelajarKu — Website Pembelajaran SMP

Frontend statis (GitHub Pages) + database Google Sheets (via Google Apps Script Web App).

## Fitur

**Siswa (tanpa akun):**
- Pilih Kelas (VII/VIII/IX) → Semester (I/II) → Mata Pelajaran
- Per mapel: Materi, Contoh Soal, Soal Latihan (PG a–d dinilai otomatis), Trik Cepat
- Jawaban esai memakai editor lengkap (persamaan, simbol, format, shapes, tabel)

**Guru (1 akun):**
- Login: `guru` / `guru123` (ganti di sheet `Guru` / Apps Script)
- Dashboard: kelola mapel per kelas & semester (tambah mapel)
- Edit konten per mapel: Materi / Contoh Soal / Trik Cepat dengan editor rich-text
- Bank soal: PG (pilihan a–d + kunci benar) dan Esai

**Editor rich-text (poin b):**
1. Equation Editor — MathQuill (Insert Equation), input LaTeX/UnicodeMath, Ink Equation (canvas tinta)
2. Simbol — operator matematika, huruf Yunani, himpunan & logika
3. Format — superscript, subscript, italic, font, ukuran
4. Visual — shapes geometri (SVG), chart bar/garis, gambar/snipping
5. Layout — align at equal sign, rumus bernomor, tabel

## Setup (±10 menit)

### 1. Google Sheet + Apps Script (database)

1. Buat Google Sheet baru: https://sheets.new
2. Menu **Extensions → Apps Script**, hapus kode default, tempel isi [`gas/Code.gs`](gas/Code.gs)
3. Ganti `API_TOKEN` di baris atas dengan token rahasia bebas
4. Jalankan fungsi **`setup`** sekali (Run → review permissions → Allow). Sheet `Guru`, `Kelas`, `Mapel`, `Konten`, `Soal` dibuat otomatis
5. **Deploy → New deployment → Web app**: Execute as = *Me*, Access = *Anyone* → Deploy → salin URL `/exec`

### 2. Hubungkan frontend

Buka [`js/api.js`](js/api.js), isi URL Web App tadi:

```js
const API_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
```

> Selama `API_URL` kosong, situs jalan dalam **mode demo** (data tersimpan di browser/localStorage) — cocok untuk dicoba dulu.

### 3. GitHub Pages (frontend)

1. Buat repo GitHub, push semua file (`index.html`, `css/`, `js/`, `gas/`)
2. Repo → **Settings → Pages** → Source: branch `main`, folder `/ (root)` → Save
3. Situs online di `https://<username>.github.io/<repo>/`

### Struktur sheet (dibuat otomatis oleh `setup()`)

| Sheet | Kolom |
|---|---|
| Guru | id, username, password, nama |
| Kelas | id, nama |
| Mapel | id, kelas_id, semester, nama |
| Konten | id, mapel_id, jenis (materi/contoh/trik), judul, body (HTML) |
| Soal | id, mapel_id, jenis (pg/esai), pertanyaan, pilihan (JSON), kunci, esai |

Ganti password guru dengan mengedit sheet `Guru` (kolom password) di Google Sheets.

## Catatan keamanan

Web App "Anyone" berarti siapa pun bisa **membaca** data. Aksi tulis/hapus dilindungi `API_TOKEN` — token dikirim saat guru login dan disimpan di session. Untuk produksi penuh, pertimbangkan Google Sign-In; untuk pemakaian sekolah, setup ini umumnya sudah memadai.
