/* ai.js — prompt generator + render HTML canvas ke video (tanpa API key) */
const $ = id => document.getElementById(id);
function dims() { const h = +$('res').value, r = $('ratio').value; return r === '16:9' ? [Math.round(h * 16 / 9), h] : r === '9:16' ? [h, Math.round(h * 16 / 9)] : [h, h]; }
const fr = $('fr');

const PALETS = {
  'Electric Blue': ['#0B1E3F', '#1E6BFF', '#5CC8FF', '#EAF4FF'],
  'Teal Mint': ['#0E2A2F', '#14B8A6', '#A7F3D0', '#F0FDFA'],
  'Cyan Circuit': ['#07111F', '#00E5FF', '#1E90FF', '#D6F7FF'],
  'Mono Blueprint': ['#0B3D91', '#FFFFFF', '#7FB3FF', '#CFE3FF'],
  'Sunset Retro': ['#1F2A44', '#FF8A3D', '#F4E3C1', '#2BB3A3'],
  'Mono Contrast': ['#0A0A0A', '#FFFFFF', '#8A8A8A'],
  'Corporate Blue': ['#0F3D8C', '#3B82F6', '#E5E7EB', '#111827'],
  'Editorial Red-Blue': ['#101820', '#FF4D2E', '#2F5BFF', '#F5F0E6'],
  'Neon Magenta': ['#12081F', '#FF2BD6', '#00F0FF', '#FCEE0A'],
  'Lab Paper': ['#FAF7F0', '#1F2937', '#D9534F', '#2E86AB'],
  'Safety Industrial': ['#2B2B2B', '#FFC400', '#FF7A00', '#BFC4C9'],
  'Primary Geometric': ['#1D3557', '#E63946', '#F1C453', '#F1FAEE'],
  'Dark Gold': ['#0D0D12', '#C9A24B', '#4B6BFF', '#E8E6DF'],
  'Clean White': ['#FFFFFF', '#1E6BFF', '#FF7A59', '#E5E7EB']
};
const STYLES = {
  'Modern Flat Technology Vector': {look: 'solid flat fills, consistent rounded corners, one bright accent colour and thin flat offset shadows with no gradients', pals: ['Electric Blue', 'Teal Mint']},
  'Futuristic Technical Illustration': {look: 'fine precise lines, technical panels and a restrained cyan accent drawn as double strokes rather than blur, still completely flat', pals: ['Cyan Circuit', 'Electric Blue']},
  'Minimalist Technology Vector': {look: 'very few shapes, generous negative space, uniform line weight and a single accent colour', pals: ['Clean White', 'Mono Contrast']},
  'Isometric 2D Technology Illustration': {look: 'isometric projection drawn as flat parallelograms with three flat tones per object (no real 3D, no perspective, no gradients)', pals: ['Corporate Blue', 'Primary Geometric']},
  'Technical Blueprint Vector': {look: 'deep blueprint-blue field, thin white and cyan lines, a faint grid and dimension ticks without numbers', pals: ['Mono Blueprint', 'Cyan Circuit']},
  'Retro Futuristic Technology': {look: 'nostalgic orange, cream and teal on navy, rounded 1970s-80s forms, all flat fills', pals: ['Sunset Retro']},
  'High Contrast Monochrome Technology': {look: 'black, white and one mid grey only, with strong silhouettes', pals: ['Mono Contrast']},
  'Corporate Technology Illustration': {look: 'clean business-friendly blues and greys, simple flat icons and cards, calm and trustworthy', pals: ['Corporate Blue', 'Clean White']},
  'Editorial Technology Vector': {look: 'large bold shapes, decisive crops inside safe margins, two dominant colours and one accent, like a magazine spread', pals: ['Editorial Red-Blue', 'Primary Geometric']},
  'Cyberpunk Flat Vector': {look: 'purple-black field with magenta and cyan, thick solid neon-coloured lines (no blur), flat city and circuit silhouettes', pals: ['Neon Magenta']},
  'Scientific Diagram Animation': {look: 'lab-paper background, thin dark linework, colour coding per part, leader lines and scale ticks without text', pals: ['Lab Paper']},
  'Industrial Technical Vector': {look: 'safety yellow, orange and graphite, sturdy shapes, hazard stripes, bolts and panels', pals: ['Safety Industrial']},
  'Geometric Technology Illustration': {look: 'devices reduced to pure geometry (circles, triangles, squares) in a limited palette', pals: ['Primary Geometric', 'Electric Blue']},
  'Premium Dark Technology Vector': {look: 'deep charcoal field with gold or electric-blue accents, fine lines and a calm exclusive mood without heavy glow', pals: ['Dark Gold', 'Cyan Circuit']},
  'Clean White Background Technology': {look: 'pure white (#FFFFFF) background with flat coloured objects and thin flat contact shadows, ideal for stock', pals: ['Clean White', 'Corporate Blue']}
};
const TECH_COMMON = [
  'Ilustrasi 2D murni dari bentuk dan path Canvas (fill, stroke, arc, bezier). DILARANG: rendering atau model 3D, perspektif 3D, ekstrusi, bevel, gradasi atau bayangan yang mensimulasikan volume 3D, objek fotorealistik, dan tekstur noise.',
  'Perangkat teknologi harus mudah dikenali: gambar komponen nyata (bukan hanya lingkaran, kotak, dan garis acak) dengan detail teknis secukupnya seperti sekrup, port, sirip pendingin, pin, lensa, kabel, atau rel. Detail komponen konsisten di seluruh objek.',
  'Kualitas: garis dan kurva presisi, warna profesional, hierarki visual jelas, negative space seimbang, transisi halus. Tidak ada flicker, jitter, atau elemen bertabrakan, dan seluruh objek utama tetap terlihat penuh di dalam bingkai.',
  'Jangan terlalu sering memakai dashboard, panel UI, progress bar, atau grafik data. Utamakan objek teknologi dan proses visualnya.',
  'Gerak harus sesuai fungsi objek (sinyal merambat, perakitan, pemindaian, perutean paket data, orbit, aliran energi, dan sebagainya). Jangan memakai rotasi, zoom, atau gerakan partikel yang sama untuk semua elemen.',
  'Tanpa teks, huruf, angka, merek, logo, atau watermark.'
];
const PTYPES = {
  proses: {label: 'Subjek teknologi (objek dan prosesnya)', loop: false,
    head: t => `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi bertipe PROSES: menjelaskan cara kerja "${t}" dari awal sampai hasil.`,
    rules: () => ['Struktur wajib tiga babak (proporsi terhadap durasi): (1) 0-30%: komponen utama muncul dan siap, masukan (input) masuk; (2) 30-75%: proses berjalan dalam 3-4 tahap berurutan, tiap tahap punya sebab dan akibat yang terlihat (komponen bergerak, berubah warna atau status); (3) 75-100%: hasil keluaran terlihat jelas dan animasi berhenti pada keadaan akhir yang rapi.',
      'Ini proses linear: jangan dipaksa menjadi loop. Awal dan akhir boleh berbeda.',
      'Tampilkan alur input, proses, lalu output dengan arah gerak yang konsisten (misalnya kiri ke kanan).']},
  perangkat: {label: 'Subjek teknologi (perangkat atau mesin)', loop: false,
    head: t => `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi bertipe PERANGKAT: satu perangkat atau mesin "${t}" yang bergerak sesuai fungsinya.`,
    rules: () => ['Satu perangkat utama menjadi pusat (sekitar 50-65% tinggi bingkai), digambar dari bagian yang mudah dikenali (rangka, penggerak, sensor, kabel, panel) dengan detail komponen konsisten.',
      'Bagian bergerak dengan artikulasi masuk akal: ada poros, engsel, rel, atau roda yang menjadi alasan gerak, dan tiap gerak punya penyebab mekanis atau elektrik yang terlihat.',
      'Tampilkan siklus kerja perangkat: siap, beroperasi, lalu selesai. Gunakan tampak samping, potongan (cutaway), atau tampak depan, tanpa perspektif.']},
  sistem: {label: 'Subjek teknologi (sistem dan komponennya)', loop: false,
    head: t => `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi bertipe SISTEM: memvisualisasikan hubungan antarkomponen pada "${t}".`,
    rules: () => ['Gambar 5-9 komponen yang berbeda bentuk dan fungsinya sebagai node, dihubungkan jalur atau kabel yang jelas, dengan hierarki penempatan (sumber di satu sisi, tujuan di sisi lain, pengatur di tengah).',
      'Aliran (paket data, daya, sinyal, atau material) bergerak di jalur sesuai topologi, dengan percabangan, penggabungan, dan antrean yang terlihat.',
      'Tunjukkan satu peristiwa sistem dengan urutan sebab-akibat: beban meningkat, komponen gagal lalu dialihkan, atau sinkronisasi tercapai.',
      'Jangan membuat dashboard, panel UI, atau grafik data. Pakai objek teknologi dan jalur fisik atau skematik.']},
  ilmiah: {label: 'Subjek teknologi (proses ilmiah atau teknis)', loop: false,
    head: t => `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi bertipe ILMIAH: diagram ilmiah dan teknis dari "${t}".`,
    rules: () => ['Gaya diagram ilmiah: penampang (cross-section), tampak terurai (exploded 2D), atau skema, dengan garis penunjuk, penanda ukuran, dan skala berupa garis atau titik, tanpa teks dan tanpa angka.',
      'Visualisasikan proses ilmiah atau teknis secara bertahap (misalnya pengukuran, reaksi, aliran partikel atau cahaya) dengan kode warna konsisten per bagian.',
      'Akurasi teknis lebih penting daripada dekorasi: bentuk dan urutan harus sesuai cara kerja sebenarnya pada tingkat konsep.',
      'Satu fokus utama di tengah, dengan elemen pendukung kecil dan tertata.']},
  loop: {label: 'Subjek teknologi (animasi yang berulang)', loop: true,
    head: t => `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi bertipe SEAMLESS LOOP: animasi "${t}" yang berulang sempurna.`,
    rules: () => ['Seamless loop WAJIB: semua gerakan periodik dengan jumlah siklus bulat dalam durasi. Keadaan frame terakhir identik dengan frame pertama, tanpa lompatan posisi, bentuk, atau warna.',
      'Rancang siklus tertutup yang masuk akal secara teknis (aliran terus-menerus, putaran mekanis, denyut sinyal, atau siklus kerja yang kembali ke posisi awal).',
      'Gabungkan 2-3 gerakan berbeda dengan periode yang membagi durasi dengan rapi, bukan satu objek yang hanya berputar atau berdenyut di tengah layar.',
      'Aman diulang berkali-kali sebagai latar: komposisi stabil dan area tengah tidak terlalu ramai.']},
  konsep: {label: 'Judul konsep (dari generator)', concept: true,
    head: (t, c) => {
      if (!c) return `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi berjudul "${t}". (Belum ada konsep dari generator. Gunakan tombol "Pakai konsep ini" agar spesifikasi lengkap ikut tertulis.)`;
      return `Buatkan SATU file HTML lengkap untuk animasi ilustrasi vektor 2D teknologi (commercial stock footage) berjudul "${c.title}".\n\nSpesifikasi konsep (patuhi persis, jangan diganti dengan desain generik):\n- Kategori: ${c.cat}\n- Objek teknologi utama: ${c.object}\n- Fungsi teknologi: ${c.fn}\n- Komponen visual wajib: ${c.components.join(', ')}\n- Mekanisme gerak: ${c.motion}, yaitu ${c.how}\n- Tata letak: ${c.layout}\n- Urutan animasi: ${c.steps.join(' | ')}\n- Gaya: ${c.style} (${c.styleLook})\n- Palet warna: ${c.pal} = ${c.hex.join(', ')}\n- Penggunaan komersial: ${c.use}\n- Deskripsi lengkap (English): ${c.desc}`;
    },
    rules: c => ['Gambarkan SEMUA komponen visual wajib sebagai bentuk teknologi yang mudah dikenali, dan beri tiap komponen fungsi sesuai urutan animasi.',
      'Ikuti urutan animasi tiga babak pada spesifikasi dengan waktu yang proporsional terhadap durasi. Gunakan hanya warna dari palet konsep (boleh turunan terang atau gelap dari warna yang sama).',
      c && c.loop ? 'Konsep ini loop: keadaan akhir siklus menyambung ke keadaan awal tanpa lompatan.' : 'Konsep ini proses linear: jangan dipaksa menjadi loop, dan akhiri pada keadaan akhir yang rapi.']}
};
function buildPrompt() {
  const [w, h] = dims(), s = $('secs').value, p = PTYPES[$('ptype').value], bg = $('bgmode').value, c = p.concept ? window.__concept : null;
  const bodyBg = bg === 'transparan' ? 'transparent' : bg === 'hijau' ? '#00FF00' : '#000';
  const bgRule = bg === 'transparan'
    ? '- LATAR HARUS TRANSPARAN: jangan mengisi latar dengan warna atau gradasi. Panggil ctx.clearRect(0, 0, canvas.width, canvas.height) setiap frame, lalu gambar hanya objek teknologinya. Tanpa bayangan jatuh ke latar. Aturan latar ini mengalahkan aturan latar pada gaya visual.'
    : bg === 'hijau'
    ? '- LATAR HARUS satu warna hijau chroma key solid #00FF00 memenuhi seluruh bingkai: tanpa gradasi, vinyet, pola, atau bayangan pada latar. Jangan memakai warna hijau atau hijau muda pada objek (pakai warna lain) supaya mudah dihapus dengan chroma key. Aturan latar ini mengalahkan aturan latar pada gaya visual.'
    : '';
  const pal = $('palet').value, palRule = pal !== 'gaya' && PALETS[pal] ? `- PALET WARNA WAJIB (mengalahkan palet pada gaya): ${pal} = ${PALETS[pal].join(', ')}. Jangan memakai warna di luar palet ini, kecuali turunan terang atau gelap dari warna yang sama.` : '';
  const sk = $('style').value, S = STYLES[sk], styleLine = p.concept ? '' : ` Gaya visual: ${sk} (${S.look}).`;
  const loop = p.concept ? !!(c && c.loop) : !!p.loop;
  const dur = loop ? `- Durasi satu siklus tepat ${s} detik, lalu ulang dari awal tanpa lompatan (seamless loop).` : `- Durasi total tepat ${s} detik. Ini animasi berurutan: awal dan akhir boleh berbeda dan tidak dipaksa menjadi loop.`;
  const lines = ['Aturan wajib:',
    '- Semua dalam satu dokumen HTML lengkap (HTML + CSS + JavaScript). Tanpa library, font, gambar, atau aset eksternal.',
    `- Gunakan tepat satu <canvas id="stage" width="${w}" height="${h}"> dan gambar semuanya dengan Canvas 2D (ctx). Jangan pakai animasi CSS atau elemen DOM untuk visual utama.`,
    `- Style: body{margin:0;background:${bodyBg}} canvas{display:block;width:100%;height:auto}`,
    bgRule, palRule,
    '- Pakai ukuran canvas (canvas.width dan canvas.height) sebagai acuan semua posisi dan ukuran, jangan angka piksel tetap, supaya tampilan sama di resolusi apa pun.',
    '- Animasi jalan otomatis dengan requestAnimationFrame, berbasis waktu (performance.now), bukan hitungan frame. Target stabil minimal 30 FPS dengan gerakan halus dan konsisten.',
    dur].concat(p.rules(c).map(r => '- ' + r), TECH_COMMON.map(r => '- ' + r), [
    '- JANGAN menambahkan tombol, kontrol, atau elemen UI di halaman. Hanya canvas.',
    '- Jaga performa tetap ringan: elemen kecil atau partikel maksimal sekitar 40, hindari ctx.filter dan shadowBlur besar (di atas 20) pada banyak elemen, pakai bentuk sederhana.',
    '- Hasil harus bersih dan halus: hindari grain, noise acak, kilauan berkedip, atau pola yang berubah acak tiap frame. Tepi bersih (anti-aliasing) dan gerakan kontinu.',
    '- Tulis kode 100% lengkap tanpa placeholder atau komentar "sisanya sama".',
    '- Balasanmu hanya satu blok kode HTML. Tanpa kalimat pembuka, penjelasan, atau penutup di luar blok kode.']).filter(Boolean).join('\n');
  return `${p.head($('subject').value, c)}${styleLine}\n\n${lines}\n`;
}
function bgUi() {
  const tr = $('bgmode').value === 'transparan';
  fr.style.background = tr ? 'repeating-conic-gradient(#bbb 0% 25%, #eee 0% 50%) 50% / 20px 20px' : '';
  if (tr) { $('fmt').value = 'webm'; setStatus('Latar transparan hanya bisa disimpan sebagai WebM (MP4 dan MOV tidak mendukung transparansi).'); }
}
function refreshPrompt() { $('tlabel').textContent = PTYPES[$('ptype').value].label; $('prompt').value = buildPrompt(); $('rsecs').value = $('secs').value; fr.style.aspectRatio = $('ratio').value.replace(':', '/'); }
['subject', 'ptype', 'bgmode', 'palet', 'res', 'ratio', 'secs', 'style'].forEach(id => $(id).addEventListener('input', refreshPrompt));
refreshPrompt();
$('fps').value = '60'; // FPS default tinggi (60)

function copyText(txt, ta) {
  if (navigator.clipboard) return navigator.clipboard.writeText(txt);
  ta.select(); document.execCommand('copy'); return Promise.resolve();
}
$('copy').onclick = () => copyText($('prompt').value, $('prompt')).then(() => { $('copy').textContent = 'Tersalin ✓'; setTimeout(() => $('copy').textContent = 'Salin prompt', 1800); });
$('paste').onclick = async () => {
  try { $('code').value = await navigator.clipboard.readText(); updClr(); } catch (e) { setStatus('Izin clipboard ditolak. Tempel manual dengan menekan lama di kolom kode.', true); }
};

function setStatus(msg, err) { $('st').textContent = msg; $('st').style.color = err ? '#e5484d' : ''; }

/* Memaksa resolusi: canvas diperbesar, kode AI tetap menggambar di ukuran aslinya */
function patchScript(tw) {
  return '<script>(function(){var TW=' + tw + ';' +
  'var P=HTMLCanvasElement.prototype,og=P.getContext,wd=Object.getOwnPropertyDescriptor(P,"width"),hd=Object.getOwnPropertyDescriptor(P,"height");' +
  'P.getContext=function(t){var c=og.apply(this,arguments);if(t!=="2d"||!c||this.__f)return c;this.__f=1;' +
  'var cv=this,lw=wd.get.call(cv),lh=hd.get.call(cv);if(!lw||Math.abs(TW/lw-1)<0.01)return c;' +
  'var S=1,sT=c.setTransform.bind(c);' +
  'function sync(){S=TW/lw;wd.set.call(cv,TW);hd.set.call(cv,Math.round(lh*S));sT(S,0,0,S,0,0);}' +
  'c.setTransform=function(a,b,d,e,f,g){if(arguments.length===6)sT(a*S,b*S,d*S,e*S,f*S,g*S);else sT.apply(null,arguments);};' +
  'c.resetTransform=function(){sT(S,0,0,S,0,0);};' +
  'Object.defineProperty(cv,"width",{get:function(){return lw},set:function(v){lw=+v||0;if(lw)sync();},configurable:true});' +
  'Object.defineProperty(cv,"height",{get:function(){return lh},set:function(v){lh=+v||0;if(lw)sync();},configurable:true});' +
  'sync();return c;};})();</' + 'script>';
}
/* Menyalin frame tepat setelah animasi selesai menggambar (irama frame merata, tidak patah-patah) */
function syncPatch() {
  return '<script>(function(){var r=window.requestAnimationFrame.bind(window),last=0;' +
  'window.requestAnimationFrame=function(cb){return r(function(ts){try{cb(ts)}finally{var v=window.__vt,f=window.__fps||30;' +
  'if(v&&v.requestFrame&&ts-last>=1000/f-2){v.requestFrame();last=ts;window.__hits=(window.__hits||0)+1}}})}})();</' + 'script>';
}
function rsz(c) {
  const P = fr.contentWindow.HTMLCanvasElement.prototype;
  return [Object.getOwnPropertyDescriptor(P, 'width').get.call(c), Object.getOwnPropertyDescriptor(P, 'height').get.call(c)];
}
function loadFrame(virtual) {
  let code = $('code').value;
  const inj = syncPatch() + (virtual ? timePatch() : '') + ($('force').checked ? patchScript(dims()[0]) : '');
  if (inj) code = /<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, m => m + inj) : inj + code;
  return new Promise(res => { fr.onload = () => setTimeout(res, 400); fr.srcdoc = code + '\n<!-- ' + Date.now() + ' -->'; });
}
function findCanvas() {
  try {
    const cs = [...fr.contentDocument.querySelectorAll('canvas')];
    const ar = c => { const s = rsz(c); return s[0] * s[1]; };
    return cs.sort((a, b) => ar(b) - ar(a))[0] || null;
  } catch (e) { return null; }
}

$('prev').onclick = async () => {
  if (!$('code').value.trim()) return setStatus('Kolom kode masih kosong.', true);
  await loadFrame();
  const c = findCanvas();
  setStatus(c ? `Canvas ditemukan: ${rsz(c).join('×')}. Siap dirender.` : 'Tidak ada <canvas> di kode ini. Minta AI membuat ulang dengan canvas.', !c);
};


/* Nama file hasil render = 8 kata pertama dari kolom Tema animasi */
function fileBase() {
  const n = $('subject').value.trim().replace(/[^\p{L}\p{N}_-]+/gu, '_').split('_').filter(Boolean).slice(0, 8).join('_').slice(0, 120).replace(/_$/, '');
  return n || 'animasi-ai';
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}


/* Waktu virtual: animasi dijalankan frame demi frame, tidak bergantung kecepatan HP */
function timePatch() {
  return '<script>(function(){var vt=0,cbs={},id=0,n=0,base=Date.now();' +
  'performance.now=function(){return vt};Date.now=function(){return base+vt};' +
  'window.requestAnimationFrame=function(f){n++;cbs[++id]=f;return id};' +
  'window.cancelAnimationFrame=function(i){delete cbs[i]};' +
  'window.__n=function(){return n};' +
  'window.__step=function(dt){vt+=dt;var l=cbs;cbs={};for(var k in l){try{l[k](vt)}catch(e){console.error(e)}}};' +
  '})();</' + 'script>';
}
async function exportFastAI(fmt) {
  $('go').disabled = true; setStatus('Menyiapkan render cepat…');
  let enc = null;
  try {
    await loadFrame(true);
    const canvas = findCanvas(), win = fr.contentWindow;
    if (!canvas || !win.__step || !win.__n()) return false;
    const [w, h] = rsz(canvas), fps = +$('fps').value, secs = Math.max(2, Math.min(120, +$('rsecs').value || 10)), n = Math.round(secs * fps);
    if (w % 2 || h % 2) return false;
    const px = w * h, lv = px <= 921600 ? '1f' : px <= 2088960 ? '28' : px <= 5652480 ? '32' : '33';
    const bitrate = Math.round(8e6 * (fps > 30 ? 1.4 : 1) * Math.pow(Math.max(1, px / 921600), 0.9));
    let cfg = null;
    for (const c of ['6400', '4d00', '4200']) {
      for (const mode of ['constant', null]) {
        const t = {codec: 'avc1.' + c + lv, width: w, height: h, bitrate, framerate: fps, latencyMode: 'realtime'};
        if (mode) t.bitrateMode = mode;
        try { if ((await VideoEncoder.isConfigSupported(t)).supported) { cfg = t; break; } } catch (e) {}
      }
      if (cfg) break;
    }
    if (!cfg) return false;
    const samples = []; let avcC = null, err = null;
    enc = new VideoEncoder({
      output: (c, m) => {
        const d = new Uint8Array(c.byteLength); c.copyTo(d); samples.push({data: d, key: c.type === 'key'});
        const ds = m && m.decoderConfig && m.decoderConfig.description;
        if (ds && !avcC) avcC = ArrayBuffer.isView(ds) ? new Uint8Array(ds.buffer, ds.byteOffset, ds.byteLength).slice() : new Uint8Array(ds.slice(0));
      },
      error: e => { err = e; }
    });
    enc.configure(cfg);
    for (let i = 0; i < n && !err; i++) {
      win.__step(1000 / fps);
      const f = new VideoFrame(canvas, {timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps)});
      enc.encode(f, {keyFrame: i % fps === 0}); f.close();
      while (enc.encodeQueueSize > 6 && !err) await new Promise(r => setTimeout(r, 4));
      if (i % 5 === 0) { $('pb').style.width = (i / n * 100) + '%'; setStatus(`Render cepat ${w}×${h}… ${Math.round(i / n * 100)}%`); await new Promise(r => setTimeout(r)); }
    }
    await enc.flush(); enc.close();
    if (err || !avcC || samples.length < n) throw err || new Error('encode gagal');
    download(muxMp4({samples, avcC, w, h, fps, mov: fmt === 'mov'}), fileBase() + '.' + fmt);
    $('pb').style.width = '100%'; setStatus(`Selesai. Video ${secs} detik (${n} frame) terunduh.`);
    return true;
  } catch (e) { console.warn('Render cepat gagal', e); try { enc && enc.close(); } catch (_) {} return false; }
  finally { $('go').disabled = false; }
}
$('go').onclick = async () => {
  if (!$('code').value.trim()) return setStatus('Kolom kode masih kosong.', true);
  if ($('bgmode').value === 'transparan') $('fmt').value = 'webm';
  if ($('fast').checked && $('fmt').value !== 'webm' && window.VideoEncoder && window.VideoFrame && await exportFastAI($('fmt').value)) return;
  if (!window.MediaRecorder) return setStatus('Browser tidak mendukung perekaman. Gunakan Chrome atau Edge.', true);
  const webm = ['video/webm;codecs=vp9', 'video/webm'];
  let mime = ($('fmt').value === 'webm' ? webm : ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.4d0028', 'video/mp4;codecs=avc1.42E01E', 'video/mp4']).find(m => MediaRecorder.isTypeSupported(m));
  if (!mime && $('fmt').value !== 'webm') { alert('Browser ini belum bisa merekam MP4/MOV. Update Chrome. Sementara hasilnya WebM.'); mime = webm.find(m => MediaRecorder.isTypeSupported(m)); }
  if (!mime) return setStatus('Format video tidak didukung browser ini.', true);
  $('go').disabled = true; setStatus('Memuat animasi dari awal…');
  await loadFrame();
  const canvas = findCanvas();
  if (!canvas) { $('go').disabled = false; return setStatus('Tidak ada <canvas> di kode ini, jadi tidak bisa direkam.', true); }

  const base = fileBase(), secs = Math.max(2, Math.min(120, +$('rsecs').value || 10)), chunks = [], fpsV = +$('fps').value;
  let stream = canvas.captureStream(0), vt = stream.getVideoTracks()[0], ft = null;
  const win = fr.contentWindow;
  if (vt && vt.requestFrame) { win.__vt = vt; win.__fps = fpsV; win.__hits = 0; setTimeout(() => { if (!win.__hits && !ft) ft = setInterval(() => vt.requestFrame(), 1000 / fpsV); }, 800); } else stream = canvas.captureStream(fpsV);
  const rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: Math.min(80e6, Math.round(12e6 * (fpsV > 30 ? 1.5 : 1) * Math.pow(Math.max(1, rsz(canvas)[0] * rsz(canvas)[1] / 921600), 0.9)))});
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const t0 = performance.now();
  const timer = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / 1000 / secs);
    $('pb').style.width = p * 100 + '%';
    setStatus(`Merekam ${rsz(canvas).join('×')}… ${Math.round(p * 100)}%. Jangan tutup atau pindah tab.`);
  }, 200);
  rec.onstop = () => {
    clearInterval(timer); clearInterval(ft); $('pb').style.width = '100%';
    const ext = mime.startsWith('video/mp4') ? $('fmt').value : 'webm';
    download(new Blob(chunks, {type: ext === 'mov' ? 'video/quicktime' : mime}), base + '.' + ext);
    setStatus('Selesai. Video terunduh.'); $('go').disabled = false;
  };
  rec.start(250);
  setTimeout(() => rec.stop(), secs * 1000);
};

/* ---------- riwayat tema & hapus kode ---------- */
const HK = 'motionstudio.subjects';
function loadHist() { try { return JSON.parse(localStorage.getItem(HK) || '[]'); } catch (e) { return []; } }
function drawHist() {
  const h = loadHist(); $('hist').style.display = h.length ? 'flex' : 'none'; $('histlist').innerHTML = '';
  h.forEach(v => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = v.length > 42 ? v.slice(0, 42) + '…' : v; b.title = v;
    b.style.cssText = 'min-height:30px;padding:4px 12px;font-size:12px;border-radius:999px'; b.onclick = () => { $('subject').value = v; refreshPrompt(); };
    $('histlist').appendChild(b);
  });
}
function saveHist(v) {
  v = (v || '').trim(); if (!v) return;
  const h = [v].concat(loadHist().filter(x => x !== v)).slice(0, 8);
  try { localStorage.setItem(HK, JSON.stringify(h)); } catch (e) {}
  drawHist();
}
$('clrhist').onclick = () => { try { localStorage.removeItem(HK); } catch (e) {} drawHist(); };
$('copy').addEventListener('click', () => saveHist($('subject').value));
$('go').addEventListener('click', () => saveHist($('subject').value));
drawHist();

function updClr() { $('clrcode').style.display = $('code').value ? '' : 'none'; }
$('code').addEventListener('input', updClr);
$('clrcode').onclick = () => { $('code').value = ''; fr.srcdoc = ''; $('pb').style.width = '0'; setStatus('Kode dihapus. Tempel kode baru lalu klik Render video.'); updClr(); };
$('bgmode').addEventListener('change', bgUi);
bgUi();

