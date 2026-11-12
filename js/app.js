/* ===== Router & Views ===== */
const app = document.getElementById('app');
const KONTEN_JENIS = [
  { jenis: 'materi', label: 'Materi', icon: '📖' },
  { jenis: 'contoh', label: 'Contoh Soal', icon: '✏️' },
  { jenis: 'trik', label: 'Trik Cepat', icon: '⚡' }
];

window.addEventListener('hashchange', route);
document.getElementById('btn-login').onclick = () => location.hash = '#/login';
document.getElementById('btn-logout').onclick = () => { Auth.guru = null; location.hash = '#/'; route(); };

function render(html) { app.innerHTML = html; window.scrollTo(0, 0); }
function esc(s) { return escapeHTML(s); }
function kelasNama(kelas, id) { const k = kelas.find(x => String(x.id) === String(id)); return k ? k.nama : ''; }
function crumbs(items) {
  return `<div class="crumb">${items.map((c, i) => i < items.length - 1
    ? `<a href="${c[1]}">${esc(c[0])}</a> › ` : esc(c[0])).join('')}</div>`;
}

async function route() {
  updateTopbar();
  const h = location.hash.slice(2) || '';
  const seg = h.split('/').map(decodeURIComponent);
  try {
    if (!h) return viewHome();
    if (seg[0] === 'login') return viewLogin();
    if (seg[0] === 'kelas' && seg[1] && seg[2] === 'sem' && seg[3]) return viewMapel(+seg[1], +seg[3]);
    if (seg[0] === 'kelas' && seg[1]) return viewSemester(+seg[1]);
    if (seg[0] === 'mapel' && seg[1] && seg[2] === 'konten' && seg[3]) return viewKontenList(+seg[1], seg[3]);
    if (seg[0] === 'mapel' && seg[1] && seg[2] === 'konten-edit') return guardGuru(() => viewKontenEdit(+seg[1], seg[3], seg[4] || null));
    if (seg[0] === 'mapel' && seg[1] && seg[2] === 'soal') return viewSoal(+seg[1]);
    if (seg[0] === 'mapel' && seg[1] && seg[2] === 'soal-edit') return guardGuru(() => viewSoalEdit(+seg[1], seg[3] || null));
    if (seg[0] === 'mapel' && seg[1]) return viewMapelMenu(+seg[1]);
    if (seg[0] === 'guru') return guardGuru(viewGuru);
    viewHome();
  } catch (err) {
    render(`<div class="card"><h2 class="page-title">Terjadi kesalahan</h2><p>${esc(err.message)}</p></div>`);
  }
}

function updateTopbar() {
  const nav = document.getElementById('topnav');
  nav.innerHTML = `<a href="#/">Beranda</a>`;
  document.getElementById('btn-login').classList.toggle('hidden', !!Auth.guru);
  document.getElementById('btn-logout').classList.toggle('hidden', !Auth.guru);
  const chip = document.getElementById('user-chip');
  chip.textContent = Auth.guru ? '👤 ' + Auth.guru.nama : '';
  if (Auth.guru) nav.innerHTML += `<a href="#/guru">Dashboard Guru</a>`;
}
function guardGuru(fn) {
  if (!Auth.guru) { location.hash = '#/login'; return; }
  return fn();
}

/* ===== HOME: pilih kelas ===== */
async function viewHome() {
  const { data: kelas } = await apiGet('kelas');
  render(`
    <div class="card" style="text-align:center;padding:36px 20px">
      <h1 class="page-title">Selamat Datang di BelajarKu 📚</h1>
      <p class="page-sub">Pilih kelasmu untuk mulai belajar. Materi, contoh soal, soal latihan, dan trik cepat tersedia per mata pelajaran.</p>
    </div>
    <div class="grid grid-3" id="kelas-grid"></div>`);
  const g = document.getElementById('kelas-grid');
  kelas.forEach(k => {
    const d = document.createElement('div');
    d.className = 'menu-card';
    d.innerHTML = `<span class="icon">🏫</span>${esc(k.nama)}`;
    d.onclick = () => location.hash = `#/kelas/${k.id}`;
    g.appendChild(d);
  });
}

/* ===== SEMESTER per kelas ===== */
async function viewSemester(kelasId) {
  const { data: kelas } = await apiGet('kelas');
  const { data: mapel } = await apiGet('mapel', { kelas_id: kelasId });
  const sems = [...new Set(mapel.map(m => m.semester))].sort();
  render(`
    ${crumbs([['Beranda', '#/'], [kelasNama(kelas, kelasId)]])}
    <div class="card"><h2 class="page-title">${esc(kelasNama(kelas, kelasId))}</h2>
      <p class="page-sub">Pilih semester:</p>
      <div class="grid grid-2" id="sem-grid"></div>
    </div>`);
  const g = document.getElementById('sem-grid');
  sems.forEach(s => {
    const d = document.createElement('div');
    d.className = 'menu-card';
    d.innerHTML = `<span class="icon">📅</span>Semester ${s === 1 ? 'I' : 'II'}`;
    d.onclick = () => location.hash = `#/kelas/${kelasId}/sem/${s}`;
    g.appendChild(d);
  });
}

/* ===== MAPEL per kelas+semester ===== */
async function viewMapel(kelasId, sem) {
  const { data: kelas } = await apiGet('kelas');
  const { data: mapel } = await apiGet('mapel', { kelas_id: kelasId });
  const list = mapel.filter(m => Number(m.semester) === sem);
  render(`
    ${crumbs([['Beranda', '#/'], [kelasNama(kelas, kelasId), `#/kelas/${kelasId}`], 'Semester ' + (sem === 1 ? 'I' : 'II')])}
    <div class="card"><h2 class="page-title">Mata Pelajaran — ${esc(kelasNama(kelas, kelasId))} · Semester ${sem === 1 ? 'I' : 'II'}</h2>
      <p class="page-sub">Pilih mata pelajaran:</p>
      <div class="grid grid-2" id="mapel-grid"></div>
    </div>`);
  const g = document.getElementById('mapel-grid');
  if (!list.length) g.innerHTML = '<p style="color:var(--muted)">Belum ada mata pelajaran.</p>';
  list.forEach(m => {
    const d = document.createElement('div');
    d.className = 'menu-card';
    d.innerHTML = `<span class="icon">📐</span>${esc(m.nama)}`;
    d.onclick = () => location.hash = `#/mapel/${m.id}`;
    g.appendChild(d);
  });
}

/* ===== MENU utama mapel: Materi / Contoh Soal / Soal / Trik Cepat ===== */
async function viewMapelMenu(mapelId) {
  const m = await getMapel(mapelId);
  render(`
    ${crumbs([['Beranda', '#/'], [m.kelasNama, `#/kelas/${m.kelas_id}`], [`Semester ${m.semester === 1 ? 'I' : 'II'}`, `#/kelas/${m.kelas_id}/sem/${m.semester}`], m.nama])}
    <div class="card" style="text-align:center">
      <h1 class="page-title">${esc(m.nama)}</h1>
      <p class="page-sub">${esc(m.kelasNama)} · Semester ${m.semester === 1 ? 'I' : 'II'}</p>
    </div>
    <div class="grid grid-2">
      ${KONTEN_JENIS.map(k => `
        <div class="menu-card" onclick="location.hash='#/mapel/${mapelId}/konten/${k.jenis}'">
          <span class="icon">${k.icon}</span>${k.label}
        </div>`).join('')}
      <div class="menu-card" onclick="location.hash='#/mapel/${mapelId}/soal'">
        <span class="icon">📝</span>Soal Latihan
      </div>
    </div>`);
}

async function getMapel(mapelId) {
  const { data: kelas } = await apiGet('kelas');
  const { data: mapel } = await apiGet('mapel');
  const m = mapel.find(x => String(x.id) === String(mapelId));
  if (!m) throw new Error('Mata pelajaran tidak ditemukan');
  m.kelasNama = kelasNama(kelas, m.kelas_id);
  return m;
}

/* ===== LIST KONTEN (Materi / Contoh Soal / Trik Cepat) ===== */
async function viewKontenList(mapelId, jenis) {
  const m = await getMapel(mapelId);
  const K = KONTEN_JENIS.find(k => k.jenis === jenis);
  const { data: list } = await apiGet('konten', { mapel_id: mapelId, jenis });
  render(`
    ${crumbs([['Beranda', '#/'], [m.nama, `#/mapel/${mapelId}`], K.label])}
    <div class="card">
      <div class="soal-head">
        <h2 class="page-title">${K.icon} ${K.label} — ${esc(m.nama)}</h2>
        ${Auth.guru ? `<button class="btn btn-sm" onclick="location.hash='#/mapel/${mapelId}/konten-edit/${jenis}'">+ Tambah</button>` : ''}
      </div>
      <div id="konten-list"></div>
    </div>`);
  const box = document.getElementById('konten-list');
  if (!list.length) box.innerHTML = '<p style="color:var(--muted)">Belum ada konten.</p>';
  list.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'soal-card';
    d.innerHTML = `
      <div class="soal-head">
        <span class="soal-num">${i + 1}. ${esc(c.judul)}</span>
        ${Auth.guru ? `<span>
          <button class="btn btn-sm btn-secondary" data-edit="${c.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-del="${c.id}">Hapus</button></span>` : ''}
      </div>
      <div class="content-view">${c.body}</div>`;
    box.appendChild(d);
  });
  RichEditor.renderMathIn(box);
  if (Auth.guru) {
    box.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => location.hash = `#/mapel/${mapelId}/konten-edit/${jenis}/${b.dataset.edit}`);
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Hapus konten ini?')) return;
      await apiPost('delete_konten', { id: b.dataset.del });
      viewKontenList(mapelId, jenis);
    });
  }
}

/* ===== FORM EDIT KONTEN (guru) ===== */
async function viewKontenEdit(mapelId, jenis, kontenId) {
  const m = await getMapel(mapelId);
  let item = { judul: '', body: '' };
  if (kontenId) item = (await apiGet('konten_get', { id: kontenId })).data || item;
  render(`
    ${crumbs([['Beranda', '#/'], [m.nama, `#/mapel/${mapelId}`], 'Edit Konten'])}
    <div class="card">
      <h2 class="page-title">${kontenId ? 'Edit' : 'Tambah'} ${esc(jenis.charAt(0).toUpperCase() + jenis.slice(1))} — ${esc(m.nama)}</h2>
      <div class="field"><label>Judul</label><input type="text" id="kf-judul" value="${esc(item.judul)}"></div>
      <div class="field"><label>Isi (gunakan toolbar: persamaan, simbol, format, shapes, grafik, tabel)</label>
        <div id="kf-editor"></div></div>
      <div class="btn-row">
        <button class="btn btn-ok" id="kf-save">💾 Simpan</button>
        <button class="btn btn-secondary" onclick="history.back()">Batal</button>
      </div>
      <p id="kf-msg" style="margin-top:10px"></p>
    </div>`);
  const ed = new RichEditor(document.getElementById('kf-editor'), { height: 260 });
  ed.setHTML(item.body);
  document.getElementById('kf-save').onclick = async () => {
    const judul = document.getElementById('kf-judul').value.trim();
    if (!judul) return alert('Judul wajib diisi');
    const r = await apiPost('save_konten', { id: kontenId || '', mapel_id: mapelId, jenis, judul, body: ed.getHTML() });
    const msg = document.getElementById('kf-msg');
    msg.innerHTML = r.ok ? `<span class="badge badge-green">✓ Tersimpan</span>` : `<span class="badge badge-red">✗ ${esc(r.error)}</span>`;
    if (r.ok) setTimeout(() => location.hash = `#/mapel/${mapelId}/konten/${jenis}`, 700);
  };
}

/* ===== SOAL (siswa mengerjakan; guru melihat kunci) ===== */
async function viewSoal(mapelId) {
  const m = await getMapel(mapelId);
  const mode = Auth.guru ? 'guru' : 'siswa';
  const { data: soal } = await apiGet('soal', { mapel_id: mapelId, mode });
  const pg = soal.filter(s => s.jenis === 'pg');
  const esai = soal.filter(s => s.jenis === 'esai');
  render(`
    ${crumbs([['Beranda', '#/'], [m.nama, `#/mapel/${mapelId}`], 'Soal Latihan'])}
    <div class="card">
      <div class="soal-head">
        <div><h2 class="page-title">📝 Soal Latihan — ${esc(m.nama)}</h2>
        <p class="page-sub">${Auth.guru ? 'Mode guru: kunci jawaban PG ditampilkan.' : 'Kerjakan lalu klik Selesai untuk melihat nilai.'}</p></div>
        ${Auth.guru ? `<button class="btn btn-sm" onclick="location.hash='#/mapel/${mapelId}/soal-edit'">+ Tambah Soal</button>` : ''}
      </div>
      ${!soal.length ? '<p style="color:var(--muted)">Belum ada soal.</p>' : ''}
      <div id="soal-list"></div>
      ${pg.length && !Auth.guru ? `<div class="btn-row"><button class="btn btn-ok" id="btn-selesai">Selesai & Nilai</button></div>` : ''}
      <div id="nilai-box"></div>
    </div>`);
  const box = document.getElementById('soal-list');
  pg.forEach((s, i) => box.appendChild(renderPG(s, i, Auth.guru)));
  esai.forEach((s, i) => box.appendChild(renderEsai(s, pg.length + i, Auth.guru)));
  RichEditor.renderMathIn(box);
  if (!Auth.guru) esai.forEach(s => {
    const holder = document.getElementById('esai-editor-' + s.id);
    if (holder) new RichEditor(holder, { placeholder: 'Tulis jawabanmu di sini (bisa pakai persamaan, simbol, tabel, dsb.)', height: 160 });
  });
  if (Auth.guru) {
    box.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => location.hash = `#/mapel/${mapelId}/soal-edit/${b.dataset.edit}`);
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
      if (!confirm('Hapus soal ini?')) return;
      await apiPost('delete_soal', { id: b.dataset.del });
      viewSoal(mapelId);
    });
  }
  const selesai = document.getElementById('btn-selesai');
  if (selesai) selesai.onclick = () => nilaiPG(pg, box);
}

function renderPG(s, i, isGuru) {
  const d = document.createElement('div');
  d.className = 'soal-card';
  let pilihan = {};
  try { pilihan = JSON.parse(s.pilihan || '{}'); } catch (e) {}
  const opsi = ['a', 'b', 'c', 'd'];
  d.innerHTML = `
    <div class="soal-head">
      <span class="soal-num">Soal ${i + 1}</span>
      ${isGuru ? `<span><span class="badge badge-green">Kunci: ${(s.kunci || '-').toUpperCase()}</span>
        <button class="btn btn-sm btn-secondary" data-edit="${s.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-del="${s.id}">Hapus</button></span>` : ''}
    </div>
    <div class="content-view">${s.pertanyaan}</div>
    <div class="pilihan" data-soal="${s.id}" data-kunci="${s.kunci || ''}">
      ${opsi.map(o => pilihan[o] !== undefined ? `
        <label data-opt="${o}">
          <input type="radio" name="pg-${s.id}" value="${o}">
          <span class="opt">${o}.</span><span>${pilihan[o]}</span>
        </label>` : '').join('')}
    </div>`;
  return d;
}

function renderEsai(s, i, isGuru) {
  const d = document.createElement('div');
  d.className = 'soal-card';
  d.innerHTML = `
    <div class="soal-head">
      <span class="soal-num">Soal ${i + 1} <span class="badge badge-orange">Esai</span></span>
      ${isGuru ? `<span>
        <button class="btn btn-sm btn-secondary" data-edit="${s.id}">Edit</button>
        <button class="btn btn-sm btn-danger" data-del="${s.id}">Hapus</button></span>` : ''}
    </div>
    <div class="content-view">${s.pertanyaan}</div>
    ${isGuru
      ? `<div style="margin-top:8px;color:var(--muted);font-size:.9rem">Jawaban siswa diketik di kolom editor di bawah soal (saat mode siswa).</div>`
      : `<div id="esai-editor-${s.id}" style="margin-top:8px"></div>`}`;
  return d;
}

function nilaiPG(pg, box) {
  let benar = 0, dijawab = 0;
  box.querySelectorAll('.pilihan').forEach(p => {
    const sel = p.querySelector('input:checked');
    p.querySelectorAll('label').forEach(l => {
      l.classList.remove('correct', 'wrong');
      if (l.dataset.opt === p.dataset.kunci) l.classList.add('correct');
    });
    if (sel) {
      dijawab++;
      if (sel.value === p.dataset.kunci) benar++;
      else sel.closest('label').classList.add('wrong');
    }
  });
  const skor = pg.length ? Math.round(benar / pg.length * 100) : 0;
  document.getElementById('nilai-box').innerHTML = `
    <div class="nilai-box card">
      <div class="skor">${skor}</div>
      <p>Benar <b>${benar}</b> dari <b>${pg.length}</b> soal pilihan ganda (dijawab ${dijawab}).</p>
      <p style="color:var(--muted);font-size:.9rem">Hijau = kunci jawaban, merah = jawabanmu yang salah.</p>
    </div>`;
  window.scrollTo(0, document.body.scrollHeight);
}

/* ===== FORM EDIT SOAL (guru) ===== */
async function viewSoalEdit(mapelId, soalId) {
  const m = await getMapel(mapelId);
  let s = { jenis: 'pg', pertanyaan: '', pilihan: { a: '', b: '', c: '', d: '' }, kunci: 'a', esai: '' };
  if (soalId) {
    const r = (await apiGet('soal', { mapel_id: mapelId, mode: 'guru' })).data.find(x => String(x.id) === String(soalId));
    if (r) { s = r; try { s.pilihan = JSON.parse(s.pilihan || '{}'); } catch (e) {} }
  }
  render(`
    ${crumbs([['Beranda', '#/'], [m.nama, `#/mapel/${mapelId}`], 'Edit Soal'])}
    <div class="card">
      <h2 class="page-title">${soalId ? 'Edit' : 'Tambah'} Soal — ${esc(m.nama)}</h2>
      <div class="field"><label>Jenis Soal</label>
        <select id="sf-jenis">
          <option value="pg" ${s.jenis === 'pg' ? 'selected' : ''}>Pilihan Ganda (a–d)</option>
          <option value="esai" ${s.jenis === 'esai' ? 'selected' : ''}>Esai</option>
        </select></div>
      <div class="field"><label>Pertanyaan</label><div id="sf-pertanyaan"></div></div>
      <div id="sf-pg-area">
        ${['a', 'b', 'c', 'd'].map(o => `
          <div class="field"><label>Pilihan ${o.toUpperCase()}</label>
            <input type="text" id="sf-pil-${o}" value="${esc(s.pilihan[o] || '')}"></div>`).join('')}
        <div class="field"><label>Kunci Jawaban (pilihan benar)</label>
          <select id="sf-kunci">${['a', 'b', 'c', 'd'].map(o =>
            `<option value="${o}" ${s.kunci === o ? 'selected' : ''}>${o.toUpperCase()}</option>`).join('')}</select></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-ok" id="sf-save">💾 Simpan</button>
        <button class="btn btn-secondary" onclick="history.back()">Batal</button>
      </div>
      <p id="sf-msg" style="margin-top:10px"></p>
    </div>`);
  const edTanya = new RichEditor(document.getElementById('sf-pertanyaan'), { height: 140 });
  edTanya.setHTML(s.pertanyaan);
  const jenisSel = document.getElementById('sf-jenis');
  const toggle = () => document.getElementById('sf-pg-area').classList.toggle('hidden', jenisSel.value === 'esai');
  jenisSel.onchange = toggle; toggle();
  document.getElementById('sf-save').onclick = async () => {
    const row = {
      id: soalId || '', mapel_id: mapelId, jenis: jenisSel.value,
      pertanyaan: edTanya.getHTML(), esai: ''
    };
    if (row.jenis === 'pg') {
      row.pilihan = JSON.stringify({
        a: val('sf-pil-a'), b: val('sf-pil-b'), c: val('sf-pil-c'), d: val('sf-pil-d')
      });
      row.kunci = document.getElementById('sf-kunci').value;
    } else { row.pilihan = '{}'; row.kunci = ''; }
    const r = await apiPost('save_soal', row);
    document.getElementById('sf-msg').innerHTML = r.ok
      ? `<span class="badge badge-green">✓ Tersimpan</span>`
      : `<span class="badge badge-red">✗ ${esc(r.error)}</span>`;
    if (r.ok) setTimeout(() => location.hash = `#/mapel/${mapelId}/soal`, 700);
  };
  function val(id) { return document.getElementById(id).value; }
}

/* ===== LOGIN GURU ===== */
function viewLogin() {
  render(`
    <div class="card" style="max-width:420px;margin:40px auto">
      <h2 class="page-title">Login Guru</h2>
      <p class="page-sub">Masuk untuk mengedit materi, contoh soal, trik cepat, dan bank soal.</p>
      <div class="field"><label>Username</label><input type="text" id="lg-user" autocomplete="username"></div>
      <div class="field"><label>Password</label><input type="password" id="lg-pass" autocomplete="current-password"></div>
      <button class="btn" id="lg-btn" style="width:100%">Masuk</button>
      <p id="lg-msg" style="margin-top:10px"></p>
      <p style="margin-top:12px;font-size:.82rem;color:var(--muted)">Akun demo: <b>guru</b> / <b>guru123</b></p>
    </div>`);
  const doLogin = async () => {
    const r = await apiGet('login', { username: v('lg-user'), password: v('lg-pass') });
    if (r.ok) { Auth.guru = r.data; location.hash = '#/guru'; route(); }
    else document.getElementById('lg-msg').innerHTML = `<span class="badge badge-red">${esc(r.error)}</span>`;
  };
  document.getElementById('lg-btn').onclick = doLogin;
  document.getElementById('lg-pass').onkeydown = e => { if (e.key === 'Enter') doLogin(); };
  function v(id) { return document.getElementById(id).value.trim(); }
}

/* ===== DASHBOARD GURU ===== */
async function viewGuru() {
  const { data: kelas } = await apiGet('kelas');
  const { data: mapel } = await apiGet('mapel');
  render(`
    <div class="card">
      <h2 class="page-title">Dashboard Guru 👨‍🏫</h2>
      <p class="page-sub">Kelola mata pelajaran per kelas & semester. Klik mapel untuk mengedit isinya.</p>
    </div>
    ${kelas.map(k => {
      const mp = mapel.filter(m => String(m.kelas_id) === String(k.id));
      const sems = [...new Set(mp.map(m => m.semester))].sort();
      return `<div class="card"><h3 style="margin-bottom:10px">🏫 ${esc(k.nama)}</h3>
        ${sems.map(s => `
          <p style="margin:10px 0 6px"><span class="badge">Semester ${s === 1 ? 'I' : 'II'}</span></p>
          <div class="grid grid-4">
            ${mp.filter(m => Number(m.semester) === s).map(m => `
              <div class="menu-card small" onclick="location.hash='#/mapel/${m.id}'">📐 ${esc(m.nama)}</div>`).join('')}
          </div>`).join('')}
      </div>`;
    }).join('')}
    <div class="card">
      <h3 style="margin-bottom:10px">➕ Tambah Mata Pelajaran</h3>
      <div class="grid grid-3">
        <div class="field"><label>Kelas</label>
          <select id="gm-kelas">${kelas.map(k => `<option value="${k.id}">${esc(k.nama)}</option>`).join('')}</select></div>
        <div class="field"><label>Semester</label>
          <select id="gm-sem"><option value="1">I</option><option value="2">II</option></select></div>
        <div class="field"><label>Nama Mapel</label><input type="text" id="gm-nama"></div>
      </div>
      <button class="btn" id="gm-add">Tambah</button>
      <p id="gm-msg" style="margin-top:8px"></p>
    </div>`);
  document.getElementById('gm-add').onclick = async () => {
    const nama = document.getElementById('gm-nama').value.trim();
    if (!nama) return;
    const r = await apiPost('save_mapel', {
      id: '', kelas_id: document.getElementById('gm-kelas').value,
      semester: document.getElementById('gm-sem').value, nama
    });
    document.getElementById('gm-msg').innerHTML = r.ok
      ? `<span class="badge badge-green">✓ Mapel ditambahkan</span>` : `<span class="badge badge-red">✗ ${esc(r.error)}</span>`;
    if (r.ok) setTimeout(viewGuru, 600);
  };
}

route();
