/* ai.js — prompt generator + render HTML canvas ke video (tanpa API key) */
const $ = id => document.getElementById(id);
function dims() { const h = +$('res').value, r = $('ratio').value; return r === '16:9' ? [Math.round(h * 16 / 9), h] : r === '9:16' ? [h, Math.round(h * 16 / 9)] : [h, h]; }
const fr = $('fr');

const PTYPES = {
  visual: {label: 'Tema animasi', head: t => `Buatkan SATU file HTML lengkap untuk animasi motion graphics dengan tema: "${t}".`, rules: [
    'Fokus hanya pada animasi visual: bentuk, objek, warna, dan gerakan dengan easing yang halus.',
    'JANGAN menampilkan teks, judul, label, angka, watermark, atau caption apa pun, kecuali tema di atas secara eksplisit memintanya.']},
  teks: {label: 'Teks yang ditampilkan (pisahkan baris dengan |)', head: t => `Buatkan SATU file HTML lengkap untuk animasi teks bergerak (kinetic typography). Teks yang ditampilkan, persis seperti ini dan tanpa tambahan apa pun: "${t}". Tanda | memisahkan tiap baris atau kata yang muncul bergantian.`, rules: [
    'Tampilkan HANYA teks di atas. Jangan menambah kata, subjudul, watermark, atau caption lain.',
    'Tiap baris atau kata masuk dengan animasi berbeda (slide, scale pantul, fade, putar), tertata rapi di tengah, mudah dibaca, dan keluar sebelum baris berikutnya muncul.',
    'Tambahkan elemen dekoratif sederhana (garis, bentuk, partikel) sebagai pendukung, tanpa teks tambahan.']},
  latar: {label: 'Tema latar', head: t => `Buatkan SATU file HTML lengkap untuk animasi LATAR BELAKANG abstrak yang bisa diulang tanpa putus (seamless loop), dengan tema: "${t}".`, rules: [
    'Tanpa teks sama sekali dan tanpa objek utama yang mencolok. Hanya pola, gradasi, partikel, gelombang, atau bentuk halus yang bergerak pelan.',
    'Awal dan akhir siklus harus identik (pakai fungsi sinus atau fase periodik) supaya loop tidak terlihat melompat.',
    'Kontras lembut, cocok dijadikan latar video atau layar belakang.']}
};
function buildPrompt() {
  const [w, h] = dims(), s = $('secs').value, p = PTYPES[$('ptype').value];
  return `${p.head($('subject').value)} Gaya visual: ${$('style').value}.

Aturan wajib:
- Semua dalam satu file (HTML + CSS + JavaScript). Tanpa library, font eksternal, atau gambar dari luar.
- Gunakan tepat satu <canvas id="stage" width="${w}" height="${h}"> dan gambar semuanya dengan Canvas 2D (ctx). Jangan pakai animasi CSS atau elemen DOM untuk visual utama.
- Style: body{margin:0;background:#000} canvas{display:block;width:100%;height:auto}
- Pakai ukuran canvas (canvas.width dan canvas.height) sebagai acuan semua posisi dan ukuran, jangan angka piksel tetap, supaya tampilan sama di resolusi apa pun.
- Animasi jalan otomatis dengan requestAnimationFrame, berbasis waktu (performance.now), bukan hitungan frame.
- Durasi satu siklus sekitar ${s} detik, lalu ulang dari awal (loop mulus).
${p.rules.map(r => '- ' + r).join('\n')}
- JANGAN menambahkan tombol, kontrol, atau elemen UI di halaman. Hanya canvas.
- Tulis kode 100% lengkap tanpa placeholder atau komentar "sisanya sama".
- Balasanmu hanya satu blok kode HTML. Tanpa kalimat pembuka, penjelasan, atau penutup di luar blok kode.`;
}
function refreshPrompt() { $('tlabel').textContent = PTYPES[$('ptype').value].label; $('prompt').value = buildPrompt(); $('rsecs').value = $('secs').value; fr.style.aspectRatio = $('ratio').value.replace(':', '/'); }
['subject', 'ptype', 'res', 'ratio', 'secs', 'style'].forEach(id => $(id).addEventListener('input', refreshPrompt));
refreshPrompt();

function copyText(txt, ta) {
  if (navigator.clipboard) return navigator.clipboard.writeText(txt);
  ta.select(); document.execCommand('copy'); return Promise.resolve();
}
$('copy').onclick = () => copyText($('prompt').value, $('prompt')).then(() => { $('copy').textContent = 'Tersalin ✓'; setTimeout(() => $('copy').textContent = 'Salin prompt', 1800); });
$('paste').onclick = async () => {
  try { $('code').value = await navigator.clipboard.readText(); } catch (e) { setStatus('Izin clipboard ditolak. Tempel manual dengan menekan lama di kolom kode.', true); }
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
function rsz(c) {
  const P = fr.contentWindow.HTMLCanvasElement.prototype;
  return [Object.getOwnPropertyDescriptor(P, 'width').get.call(c), Object.getOwnPropertyDescriptor(P, 'height').get.call(c)];
}
function loadFrame() {
  let code = $('code').value;
  const inj = ($('force').checked ? patchScript(dims()[0]) : '');
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


/* Nama file hasil render mengikuti isi kolom Tema animasi */
function fileBase() {
  const n = $('subject').value.trim().replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 80).replace(/_$/, '');
  return n || 'animasi-ai';
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}


$('go').onclick = async () => {
  if (!$('code').value.trim()) return setStatus('Kolom kode masih kosong.', true);
  if (!window.MediaRecorder) return setStatus('Browser tidak mendukung perekaman. Gunakan Chrome atau Edge.', true);
  const webm = ['video/webm;codecs=vp9', 'video/webm'];
  let mime = ($('fmt').value === 'webm' ? webm : ['video/mp4;codecs=avc1.42E01E', 'video/mp4']).find(m => MediaRecorder.isTypeSupported(m));
  if (!mime && $('fmt').value !== 'webm') { alert('Browser ini belum bisa merekam MP4/MOV. Update Chrome. Sementara hasilnya WebM.'); mime = webm.find(m => MediaRecorder.isTypeSupported(m)); }
  if (!mime) return setStatus('Format video tidak didukung browser ini.', true);
  $('go').disabled = true; setStatus('Memuat animasi dari awal…');
  await loadFrame();
  const canvas = findCanvas();
  if (!canvas) { $('go').disabled = false; return setStatus('Tidak ada <canvas> di kode ini, jadi tidak bisa direkam.', true); }

  const base = fileBase(), secs = Math.max(2, Math.min(120, +$('rsecs').value || 10)), chunks = [], fpsV = +$('fps').value;
  let stream = canvas.captureStream(0), vt = stream.getVideoTracks()[0], ft = null;
  if (vt && vt.requestFrame) ft = setInterval(() => vt.requestFrame(), 1000 / fpsV); else stream = canvas.captureStream(fpsV);
  const rec = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: Math.round(8e6 * Math.pow(Math.max(1, rsz(canvas)[0] * rsz(canvas)[1] / 921600), 0.75))});
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
