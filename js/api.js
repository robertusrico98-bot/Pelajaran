/* ===== Klien API — Google Apps Script (Google Sheets) =====
 * 1. Deploy Code.gs sebagai Web App, lalu tempel URL-nya di API_URL.
 * 2. Selama API_URL kosong, situs berjalan dalam MODE DEMO (data lokal).
 */

const API_URL = ''; // contoh: 'https://script.google.com/macros/s/AKfyc.../exec'

const Auth = {
  get guru() { try { return JSON.parse(sessionStorage.getItem('guru')); } catch (e) { return null; } },
  set guru(v) { v ? sessionStorage.setItem('guru', JSON.stringify(v)) : sessionStorage.removeItem('guru'); }
};

async function apiGet(action, params = {}) {
  if (!API_URL) {
    try { return { ok: true, data: Demo.handle(action, params) }; }
    catch (err) { return { ok: false, error: err.message }; }
  }
  const q = new URLSearchParams({ action, ...params }).toString();
  const r = await fetch(`${API_URL}?${q}`);
  return r.json();
}

async function apiPost(action, row) {
  if (!API_URL) return { ok: true, data: Demo.save(action, row) };
  const r = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, row, token: Auth.guru && Auth.guru.token })
  });
  return r.json();
}

/* ===== MODE DEMO: data lokal di localStorage ===== */
const Demo = {
  key: 'belajarku_demo',
  load() {
    let d = JSON.parse(localStorage.getItem(this.key) || 'null');
    if (d) return d;
    d = {
      Guru: [{ id: 1, username: 'guru', password: 'guru123', nama: 'Pak Guru (Demo)' }],
      Kelas: [{ id: 1, nama: 'Kelas VII' }, { id: 2, nama: 'Kelas VIII' }, { id: 3, nama: 'Kelas IX' }],
      Mapel: [], Konten: [], Soal: []
    };
    let id = 1;
    ['Aljabar', 'Geometri', 'Aritmetika Sosial', 'Perbandingan'].forEach(n => {
      for (let k = 1; k <= 3; k++) for (let s = 1; s <= 2; s++) d.Mapel.push({ id: id++, kelas_id: k, semester: s, nama: n });
    });
    // sampel konten Aljabar kelas VII sem 1
    d.Konten.push({
      id: 1, mapel_id: 1, jenis: 'materi', judul: 'Pengenalan Aljabar',
      body: `<h3>Apa itu Aljabar?</h3><p>Aljabar menggunakan <b>variabel</b> (huruf) untuk mewakili bilangan.</p><p>Contoh: jika x = 3, maka <span class="math" data-latex="2x+1"></span> bernilai <span class="math" data-latex="2(3)+1=7"></span>.</p><blockquote class="eq-num" style="display:flex;justify-content:space-between;align-items:center"><span class="math math-block" data-latex="x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}"></span><span>(1)</span></blockquote>`
    });
    d.Soal.push({
      id: 1, mapel_id: 1, jenis: 'pg',
      pertanyaan: 'Jika <span class="math" data-latex="x=4"></span>, berapakah nilai <span class="math" data-latex="3x-2"></span>?',
      pilihan: JSON.stringify({ a: '10', b: '12', c: '14', d: '16' }), kunci: 'a', esai: ''
    });
    localStorage.setItem(this.key, JSON.stringify(d));
    return d;
  },
  saveData(d) { localStorage.setItem(this.key, JSON.stringify(d)); },
  handle(action, p) {
    const d = this.load();
    switch (action) {
      case 'kelas': return d.Kelas;
      case 'mapel':
        return p.kelas_id ? d.Mapel.filter(m => String(m.kelas_id) === String(p.kelas_id)) : d.Mapel;
      case 'konten':
        return d.Konten.filter(c => String(c.mapel_id) === String(p.mapel_id) && c.jenis === p.jenis);
      case 'konten_get':
        return d.Konten.find(c => String(c.id) === String(p.id)) || null;
      case 'soal': {
        let s = d.Soal.filter(x => String(x.mapel_id) === String(p.mapel_id));
        if (p.mode !== 'guru') s = s.map(({ kunci, ...rest }) => rest);
        return s;
      }
      case 'login': {
        const g = d.Guru.find(g => g.username === p.username && g.password === p.password);
        if (!g) throw new Error('Username atau password salah');
        return { nama: g.nama, token: 'demo-token' };
      }
    }
  },
  save(action, row) {
    const d = this.load();
    const table = { save_mapel: 'Mapel', save_konten: 'Konten', save_soal: 'Soal' }[action];
    if (table) {
      if (!row.id) { row.id = Date.now(); d[table].push(row); }
      else { const i = d[table].findIndex(x => String(x.id) === String(row.id)); d[table][i] = row; }
      this.saveData(d);
      return row.id;
    }
    const del = { delete_mapel: 'Mapel', delete_konten: 'Konten', delete_soal: 'Soal' }[action];
    if (del) {
      d[del] = d[del].filter(x => String(x.id) !== String(row.id));
      this.saveData(d);
      return true;
    }
  }
};
