/* ai.js — prompt generator + render HTML canvas ke video (tanpa API key) */
const $ = id => document.getElementById(id);
const SIZE = {'16:9': [1280, 720], '9:16': [720, 1280], '1:1': [1000, 1000]};
const fr = $('fr');

function buildPrompt() {
  const [w, h] = SIZE[$('ratio').value], s = $('secs').value;
  return `Buatkan SATU file HTML lengkap untuk animasi motion graphics dengan tema: "${$('subject').value}". Gaya visual: ${$('style').value}.

Aturan wajib:
- Semua dalam satu file (HTML + CSS + JavaScript). Tanpa library, font, atau gambar dari luar.
- Gunakan tepat satu <canvas id="stage" width="${w}" height="${h}"> dan gambar semuanya dengan Canvas 2D (ctx). Jangan pakai animasi CSS atau elemen DOM untuk visual utama.
- Style: body{margin:0;background:#000} canvas{display:block;width:100%;height:auto}
- Animasi jalan otomatis dengan requestAnimationFrame, berbasis waktu (performance.now), bukan hitungan frame.
- Durasi satu siklus sekitar ${s} detik, lalu ulang dari awal (loop mulus).
- Beri gerakan yang hidup: teks masuk dengan easing, objek bergerak, latar berubah halus.
- Tulis kode 100% lengkap tanpa placeholder atau komentar "sisanya sama".
- Keluarkan hanya satu blok kode HTML.`;
}
function refreshPrompt() { $('prompt').value = buildPrompt(); $('rsecs').value = $('secs').value; fr.style.aspectRatio = $('ratio').value.replace(':', '/'); }
['subject', 'ratio', 'secs', 'style'].forEach(id => $(id).addEventListener('input', refreshPrompt));
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
function loadFrame() {
  return new Promise(res => { fr.onload = () => setTimeout(res, 400); fr.srcdoc = $('code').value + '\n<!-- ' + Date.now() + ' -->'; });
}
function findCanvas() {
  try {
    const cs = [...fr.contentDocument.querySelectorAll('canvas')];
    return cs.sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
  } catch (e) { return null; }
}

$('prev').onclick = async () => {
  if (!$('code').value.trim()) return setStatus('Kolom kode masih kosong.', true);
  await loadFrame();
  const c = findCanvas();
  setStatus(c ? `Canvas ditemukan: ${c.width}×${c.height}. Siap dirender.` : 'Tidak ada <canvas> di kode ini. Minta AI membuat ulang dengan canvas.', !c);
};

function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

$('go').onclick = async () => {
  if (!$('code').value.trim()) return setStatus('Kolom kode masih kosong.', true);
  if (!window.MediaRecorder) return setStatus('Browser tidak mendukung perekaman. Gunakan Chrome atau Edge.', true);
  const mime = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(m => MediaRecorder.isTypeSupported(m));
  if (!mime) return setStatus('Format video tidak didukung browser ini.', true);
  $('go').disabled = true; setStatus('Memuat animasi dari awal…');
  await loadFrame();
  const canvas = findCanvas();
  if (!canvas) { $('go').disabled = false; return setStatus('Tidak ada <canvas> di kode ini, jadi tidak bisa direkam.', true); }

  const secs = Math.max(2, Math.min(120, +$('rsecs').value || 10)), chunks = [];
  const rec = new MediaRecorder(canvas.captureStream(+$('fps').value), {mimeType: mime, videoBitsPerSecond: 8e6});
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const t0 = performance.now();
  const timer = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / 1000 / secs);
    $('pb').style.width = p * 100 + '%';
    setStatus(`Merekam ${canvas.width}×${canvas.height}… ${Math.round(p * 100)}%. Jangan tutup atau pindah tab.`);
  }, 200);
  rec.onstop = () => {
    clearInterval(timer); $('pb').style.width = '100%';
    download(new Blob(chunks, {type: mime}), 'animasi-ai.' + (mime.startsWith('video/mp4') ? 'mp4' : 'webm'));
    setStatus('Selesai. Video terunduh.'); $('go').disabled = false;
  };
  rec.start(250);
  setTimeout(() => rec.stop(), secs * 1000);
};
