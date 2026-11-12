/* ===== Rich Editor untuk materi & jawaban esai ===== */

const SYMBOLS = {
  'Operator Matematika': [
    ['+', '+'], ['−', '-'], ['×', '\\times'], ['÷', '\\div'], ['±', '\\pm'], ['∓', '\\mp'],
    ['=', '='], ['≠', '\\ne'], ['≈', '\\approx'], ['≡', '\\equiv'], ['<', '<'], ['>', '>'],
    ['≤', '\\le'], ['≥', '\\ge'], ['≪', '\\ll'], ['≫', '\\gg'], ['∝', '\\propto'],
    ['∑', '\\sum'], ['∏', '\\prod'], ['∫', '\\int'], ['∮', '\\oint'], ['√', '\\sqrt{}'],
    ['∂', '\\partial'], ['∇', '\\nabla'], ['∞', '\\infty'], ['′', '\\prime'], ['∴', '\\therefore'], ['∵', '\\because']
  ],
  'Huruf Yunani': [
    ['α', '\\alpha'], ['β', '\\beta'], ['γ', '\\gamma'], ['δ', '\\delta'], ['ε', '\\epsilon'],
    ['θ', '\\theta'], ['λ', '\\lambda'], ['μ', '\\mu'], ['π', '\\pi'], ['ρ', '\\rho'],
    ['σ', '\\sigma'], ['τ', '\\tau'], ['φ', '\\phi'], ['χ', '\\chi'], ['ψ', '\\psi'], ['ω', '\\omega'],
    ['Γ', '\\Gamma'], ['Δ', '\\Delta'], ['Θ', '\\Theta'], ['Λ', '\\Lambda'], ['Π', '\\Pi'],
    ['Σ', '\\Sigma'], ['Φ', '\\Phi'], ['Ω', '\\Omega']
  ],
  'Himpunan & Logika': [
    ['∈', '\\in'], ['∉', '\\notin'], ['⊂', '\\subset'], ['⊆', '\\subseteq'], ['⊃', '\\supset'],
    ['∪', '\\cup'], ['∩', '\\cap'], ['∅', '\\emptyset'], ['ℚ', '\\mathbb{Q}'], ['ℝ', '\\mathbb{R}'],
    ['ℕ', '\\mathbb{N}'], ['ℤ', '\\mathbb{Z}'], ['∀', '\\forall'], ['∃', '\\exists'], ['¬', '\\neg'],
    ['∧', '\\land'], ['∨', '\\lor'], ['⇒', '\\Rightarrow'], ['⇔', '\\Leftrightarrow'], ['∴', '\\therefore']
  ]
};

const SHAPES = [
  { name: 'Segitiga', svg: '<svg class="shape" width="120" height="100" viewBox="0 0 120 100"><polygon points="60,8 112,92 8,92" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Persegi', svg: '<svg class="shape" width="100" height="100" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Persegi Panjang', svg: '<svg class="shape" width="140" height="90" viewBox="0 0 140 90"><rect x="6" y="20" width="128" height="54" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Lingkaran', svg: '<svg class="shape" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><line x1="50" y1="50" x2="92" y2="50" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Jajar Genjang', svg: '<svg class="shape" width="140" height="90" viewBox="0 0 140 90"><polygon points="30,10 130,10 110,80 10,80" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Trapesium', svg: '<svg class="shape" width="140" height="90" viewBox="0 0 140 90"><polygon points="35,10 105,10 135,80 5,80" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Kubus', svg: '<svg class="shape" width="110" height="110" viewBox="0 0 110 110"><polygon points="20,35 75,35 90,20 35,20" fill="#e0e7ff" stroke="#2563eb" stroke-width="2"/><polygon points="20,35 20,90 35,75 35,20" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/><rect x="20" y="35" width="55" height="55" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/></svg>' },
  { name: 'Garis & Sudut', svg: '<svg class="shape" width="140" height="80" viewBox="0 0 140 80"><line x1="15" y1="65" x2="125" y2="65" stroke="#2563eb" stroke-width="2"/><line x1="15" y1="65" x2="85" y2="15" stroke="#dc2626" stroke-width="2"/><path d="M 40 65 A 28 28 0 0 0 36 51" fill="none" stroke="#f59e0b" stroke-width="2"/></svg>' }
];

class RichEditor {
  constructor(container, opts = {}) {
    this.opts = Object.assign({ placeholder: 'Tulis di sini…', height: 200 }, opts);
    container.innerHTML = `
      <div class="editor-toolbar"></div>
      <div class="editor-area" contenteditable="true" style="min-height:${this.opts.height}px"></div>`;
    this.area = container.querySelector('.editor-area');
    this.area.dataset.placeholder = this.opts.placeholder;
    this.buildToolbar(container.querySelector('.editor-toolbar'));
  }

  getHTML() { return this.area.innerHTML; }
  setHTML(html) { this.area.innerHTML = html || ''; }

  focus() { this.area.focus(); }
  exec(cmd, val) { this.focus(); document.execCommand(cmd, false, val || null); }
  insertHTML(html) { this.exec('insertHTML', html + '\u00a0'); }

  /* ---------- Toolbar ---------- */
  buildToolbar(tb) {
    const B = (title, html, fn, cls = '') =>
      `<button type="button" class="${cls}" title="${title}" data-cmd>${html}</button>`;
    tb.innerHTML = [
      B('Tebal', '<b>B</b>', () => this.exec('bold')),
      B('Miring (Italic)', '<i>I</i>', () => this.exec('italic')),
      B('Garis bawah', '<u>U</u>', () => this.exec('underline')),
      `<select title="Font" data-font>
        <option value="">Font</option><option>Arial</option><option>Times New Roman</option>
        <option>Courier New</option><option>Georgia</option><option>Comic Sans MS</option></select>`,
      `<select title="Ukuran" data-size>
        <option value="">Size</option>${[1,2,3,4,5,6,7].map(s => `<option value="${s}">${s}</option>`).join('')}</select>`,
      '<span class="sep"></span>',
      B('Superscript (Pangkat)', 'x<sup>2</sup>', () => this.exec('superscript'), 'sup'),
      B('Subscript (Indeks)', 'x<sub>2</sub>', () => this.exec('subscript'), 'sub'),
      '<span class="sep"></span>',
      B('Persamaan (MathQuill)', '𝑓(𝑥)', () => this.openEquation()),
      B('LaTeX / UnicodeMath', '∑ LaTeX', () => this.openLatex()),
      B('Ink Equation (Tinta)', '✎', () => this.openInk()),
      B('Simbol', 'Ω', () => this.openSymbols()),
      '<span class="sep"></span>',
      B('Shapes', '△', () => this.openShapes()),
      B('Chart / Grafik', '📊', () => this.openChart()),
      B('Gambar / Snipping', '🖼', () => this.openImage()),
      '<span class="sep"></span>',
      B('Rata = (Align at Equal Sign)', '𝑥&nbsp;=&nbsp;…', () => this.insertAligned()),
      B('Rumus Bernomor (n)', '(1)', () => this.insertNumberedEquation()),
      B('Tabel', '⊞', () => this.insertTable())
    ].join('');
    this.bindButtons(tb);
    tb.querySelector('[data-font]').addEventListener('change', e => { if (e.target.value) this.exec('fontName', e.target.value); e.target.value = ''; });
    tb.querySelector('[data-size]').addEventListener('change', e => { if (e.target.value) this.exec('fontSize', e.target.value); e.target.value = ''; });
  }

  bindButtons(tb) {
    const acts = [
      () => this.exec('bold'), () => this.exec('italic'), () => this.exec('underline'),
      () => this.exec('superscript'), () => this.exec('subscript'),
      () => this.openEquation(), () => this.openLatex(), () => this.openInk(), () => this.openSymbols(),
      () => this.openShapes(), () => this.openChart(), () => this.openImage(),
      () => this.insertAligned(), () => this.insertNumberedEquation(), () => this.insertTable()
    ];
    let bi = 0;
    tb.querySelectorAll('button[data-cmd]').forEach(btn => { btn.onclick = () => acts[bi++](); });
  }

  /* ---------- Persamaan ---------- */
  static renderMathIn(el) {
    el.querySelectorAll('span.math[data-latex]').forEach(sp => {
      try {
        katex.render(sp.dataset.latex, sp, { throwOnError: false, displayMode: sp.classList.contains('math-block') });
      } catch (e) { sp.textContent = sp.dataset.latex; }
    });
  }

  insertLatex(latex, display) {
    const cls = display ? 'math math-block' : 'math';
    this.insertHTML(`<span class="${cls}" contenteditable="false" data-latex="${escapeAttr(latex)}"></span>`);
    RichEditor.renderMathIn(this.area);
  }

  openEquation() {
    openModal('Insert Equation (MathQuill)', `
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:8px">Ketik persamaan dengan keyboard. Gunakan ^ untuk pangkat, _ untuk indeks, / untuk pecahan.</p>
      <div id="mq-input"></div>
      <div class="latex-preview" id="mq-preview"></div>
      <div class="btn-row">
        <button class="btn" id="mq-inline">Sisipkan Inline</button>
        <button class="btn btn-secondary" id="mq-display">Sisipkan Blok (Tengah)</button>
      </div>`);
    const mqEl = document.getElementById('mq-input');
    const MQ = MathQuill.getInterface(2);
    const mq = MQ.MathField(mqEl, {
      autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta',
      handlers: { edit: update }
    });
    function update() {
      const l = mq.latex();
      try { katex.render(l, document.getElementById('mq-preview'), { throwOnError: false }); }
      catch (e) { document.getElementById('mq-preview').textContent = l; }
    }
    update();
    document.getElementById('mq-inline').onclick = () => { this.insertLatex(mq.latex(), false); closeModal(); };
    document.getElementById('mq-display').onclick = () => { this.insertLatex(mq.latex(), true); closeModal(); };
  }

  openLatex() {
    openModal('LaTeX / UnicodeMath Input', `
      <div class="field"><label>LaTeX / UnicodeMath</label>
        <textarea id="latex-in" rows="4" placeholder="x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}"></textarea></div>
      <div class="latex-preview" id="latex-preview"></div>
      <div class="btn-row">
        <button class="btn" id="lx-inline">Sisipkan Inline</button>
        <button class="btn btn-secondary" id="lx-display">Sisipkan Blok</button>
      </div>`);
    const inp = document.getElementById('latex-in');
    const prev = () => { try { katex.render(inp.value || ' ', document.getElementById('latex-preview'), { throwOnError: false }); } catch (e) {} };
    inp.oninput = prev; prev();
    const go = d => { this.insertLatex(inp.value.trim(), d); closeModal(); };
    document.getElementById('lx-inline').onclick = () => go(false);
    document.getElementById('lx-display').onclick = () => go(true);
  }

  /* ---------- Ink / drawing canvas ---------- */
  openInk() {
    openModal('Ink Equation / Drawing Canvas', `
      <p style="font-size:.85rem;color:var(--muted);margin-bottom:8px">Gambar di kanvas (mouse/jari), lalu sisipkan sebagai gambar.</p>
      <canvas class="ink-canvas" id="ink-canvas" width="560" height="220"></canvas>
      <div class="btn-row">
        <button class="btn btn-secondary btn-sm" id="ink-clear">Hapus</button>
        <button class="btn" id="ink-insert">Sisipkan Gambar</button>
      </div>`);
    const cv = document.getElementById('ink-canvas');
    const ctx = cv.getContext('2d');
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
    let draw = false;
    const pos = e => {
      const r = cv.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [(t.clientX - r.left) * (cv.width / r.width), (t.clientY - r.top) * (cv.height / r.height)];
    };
    const start = e => { draw = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); };
    const move = e => { if (!draw) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); e.preventDefault(); };
    const end = () => draw = false;
    cv.onmousedown = start; cv.onmousemove = move; cv.onmouseup = end;
    cv.ontouchstart = start; cv.ontouchmove = move; cv.ontouchend = end;
    document.getElementById('ink-clear').onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);
    document.getElementById('ink-insert').onclick = () => {
      this.insertHTML(`<img src="${cv.toDataURL()}" style="max-width:100%" alt="drawing">`);
      closeModal();
    };
  }

  /* ---------- Simbol ---------- */
  openSymbols() {
    openModal('Simbol Khusus', `<div class="sym-tabs" id="sym-tabs"></div><div class="sym-palette" id="sym-grid"></div>`);
    const tabs = document.getElementById('sym-tabs');
    const grid = document.getElementById('sym-grid');
    Object.keys(SYMBOLS).forEach((k, i) => {
      const b = document.createElement('button');
      b.textContent = k;
      if (i === 0) b.classList.add('active');
      b.onclick = () => {
        tabs.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active'); render(k);
      };
      tabs.appendChild(b);
    });
    const render = k => {
      grid.innerHTML = '';
      SYMBOLS[k].forEach(([ch, tex]) => {
        const b = document.createElement('button');
        b.textContent = ch; b.title = tex;
        b.onclick = () => this.insertLatex(tex, false);
        grid.appendChild(b);
      });
    };
    render(Object.keys(SYMBOLS)[0]);
  }

  /* ---------- Shapes, Chart, Gambar ---------- */
  openShapes() {
    openModal('Insert Shapes (Bentuk Geometri)', `<div class="grid grid-4" id="shape-grid"></div>`);
    const g = document.getElementById('shape-grid');
    SHAPES.forEach(s => {
      const d = document.createElement('div');
      d.className = 'menu-card small';
      d.innerHTML = s.svg + `<div style="margin-top:6px">${s.name}</div>`;
      d.onclick = () => { this.insertHTML(s.svg.replace('class="shape"', 'class="shape" contenteditable="false"')); closeModal(); };
      g.appendChild(d);
    });
  }

  openChart() {
    openModal('Chart / Grafik', `
      <div class="field"><label>Judul grafik</label><input type="text" id="ch-title" value="Grafik"></div>
      <div class="field"><label>Data (label:nilai per baris)</label>
        <textarea id="ch-data" rows="5">Matematika:85\nIPA:78\nBahasa:90</textarea></div>
      <div class="field"><label>Jenis</label>
        <select id="ch-type"><option value="bar">Bar</option><option value="line">Garis</option></select></div>
      <button class="btn" id="ch-insert">Sisipkan Grafik</button>`);
    document.getElementById('ch-insert').onclick = () => {
      const title = document.getElementById('ch-title').value || 'Grafik';
      const type = document.getElementById('ch-type').value;
      const pts = document.getElementById('ch-data').value.split('\n').map(l => l.split(':')).filter(p => p.length === 2)
        .map(([label, v]) => ({ label: label.trim(), v: Number(v.trim()) || 0 }));
      if (!pts.length) return;
      const W = 480, H = 280, pad = 46, bw = (W - pad * 2) / pts.length;
      const max = Math.max(...pts.map(p => p.v)) * 1.15 || 1;
      const y = v => H - pad - (v / max) * (H - pad * 2);
      let body = '';
      pts.forEach((p, i) => {
        const x = pad + i * bw + bw * 0.15, w = bw * 0.7, yy = y(p.v);
        body += `<rect x="${x}" y="${yy}" width="${w}" height="${H - pad - yy}" fill="#2563eb" opacity=".8" rx="3"/>`;
        body += `<text x="${x + w / 2}" y="${yy - 6}" text-anchor="middle" font-size="12">${p.v}</text>`;
        body += `<text x="${x + w / 2}" y="${H - pad + 16}" text-anchor="middle" font-size="11">${p.label}</text>`;
      });
      let line = '';
      if (type === 'line') {
        const ptsStr = pts.map((p, i) => `${pad + i * bw + bw / 2},${y(p.v)}`).join(' ');
        line = `<polyline points="${ptsStr}" fill="none" stroke="#dc2626" stroke-width="2.5"/>` +
          pts.map((p, i) => `<circle cx="${pad + i * bw + bw / 2}" cy="${y(p.v)}" r="4" fill="#dc2626"/>`).join('');
      }
      const grid = [0.25, 0.5, 0.75, 1].map(f =>
        `<line x1="${pad}" y1="${y(max * f)}" x2="${W - pad}" y2="${y(max * f)}" stroke="#e2e8f0"/>`).join('');
      const svg = `<svg class="shape chart-canvas" contenteditable="false" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <text x="${W / 2}" y="20" text-anchor="middle" font-weight="bold" font-size="14">${escapeHTML(title)}</text>
        ${grid}<line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#94a3b8"/>
        <line x1="${pad}" y1="${pad / 2}" x2="${pad}" y2="${H - pad}" stroke="#94a3b8"/>
        ${type === 'line' ? line : body}</svg>`;
      this.insertHTML(svg);
      closeModal();
    };
  }

  openImage() {
    openModal('Sisipkan Gambar / Snipping', `
      <div class="field"><label>Pilih file gambar (screenshot/snipping)</label>
        <input type="file" id="img-file" accept="image/*"></div>
      <div class="btn-row"><button class="btn" id="img-insert">Sisipkan</button></div>`);
    document.getElementById('img-insert').onclick = () => {
      const f = document.getElementById('img-file').files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { this.insertHTML(`<img src="${r.result}" style="max-width:100%" alt="">`); closeModal(); };
      r.readAsDataURL(f);
    };
  }

  /* ---------- Layout ---------- */
  insertAligned() {
    openModal('Align at Equal Sign (Perataan =)', `
      <div class="field"><label>Baris persamaan (satu per baris)</label>
        <textarea id="al-lines" rows="4" placeholder="x+2=5&#10;2x=6"></textarea></div>
      <button class="btn" id="al-insert">Sisipkan</button>`);
    document.getElementById('al-insert').onclick = () => {
      const lines = document.getElementById('al-lines').value.split('\n').map(s => s.trim()).filter(Boolean);
      if (!lines.length) return;
      const parts = lines.map(l => {
        const i = l.indexOf('=');
        return i < 0 ? [l, ''] : [l.slice(0, i), l.slice(i + 1)];
      });
      const latex = '\\begin{aligned} ' + parts.map(p => `${p[0]} &= ${p[1]}`).join(' \\\\ ') + ' \\end{aligned}';
      this.insertLatex(latex, true);
      closeModal();
    };
  }

  insertNumberedEquation() {
    openModal('Numbered Equation (Rumus Bernomor)', `
      <div class="field"><label>Nomor</label><input type="number" id="ne-num" value="1"></div>
      <div class="field"><label>LaTeX persamaan</label>
        <input type="text" id="ne-latex" placeholder="E = mc^2"></div>
      <button class="btn" id="ne-insert">Sisipkan</button>`);
    document.getElementById('ne-insert').onclick = () => {
      const n = document.getElementById('ne-num').value || '1';
      const l = document.getElementById('ne-latex').value.trim() || 'x=1';
      this.insertHTML(
        `<blockquote class="eq-num" contenteditable="false" style="display:flex;justify-content:space-between;align-items:center;gap:12px">` +
        `<span class="math math-block" data-latex="${escapeAttr(l)}"></span>` +
        `<span style="white-space:nowrap">(${n})</span></blockquote>`);
      RichEditor.renderMathIn(this.area);
      closeModal();
    };
  }

  insertTable() {
    openModal('Tabel', `
      <div class="grid grid-2">
        <div class="field"><label>Baris</label><input type="number" id="tb-r" value="3" min="1"></div>
        <div class="field"><label>Kolom</label><input type="number" id="tb-c" value="3" min="1"></div>
      </div>
      <button class="btn" id="tb-insert">Sisipkan Tabel</button>`);
    document.getElementById('tb-insert').onclick = () => {
      const r = +document.getElementById('tb-r').value || 3, c = +document.getElementById('tb-c').value || 3;
      let html = '<table><tbody>';
      for (let i = 0; i < r; i++) { html += '<tr>' + '<td><br></td>'.repeat(c) + '</tr>'; }
      html += '</tbody></table><p><br></p>';
      this.insertHTML(html);
      closeModal();
    };
  }
}

/* ===== Util global ===== */
function escapeHTML(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeAttr(s) { return escapeHTML(s).replace(/"/g, '&quot;'); }

function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }
