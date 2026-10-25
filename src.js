/* src.js — loop, UI, timeline, dan ekspor (butuh renderer/render.js dimuat lebih dulu) */
/* ---------- loop ---------- */
function tick(now) {
  if (playing) {
    t += (now - last) / 1000;
    if (t >= dur) { if (exporting) finishExport(); else t = 0; }
  }
  last = now;
  render(t); updateTime();
  if (exporting && vtrack && now - lastReq >= 33) { vtrack.requestFrame(); lastReq = now; }
  requestAnimationFrame(tick);
}
function updateTime() {
  $('seek').value = t / dur;
  $('time').textContent = t.toFixed(1) + ' / ' + dur.toFixed(1) + ' d';
  const ph = document.querySelector('.ph'); if (ph) ph.style.left = (t / dur * 100) + '%';
}

/* ---------- UI: layer, properti, timeline ---------- */
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function select(id){ sel = id; drawLists(); drawProps(); }

function drawLists() {
  $('layers').innerHTML = layers.slice().reverse().map(l =>
    `<div class="layer ${l.id===sel?'on':''}" data-id="${l.id}"><span>${esc(name(l))}</span></div>`).join('')
    || '<p style="color:var(--mute);margin:0">Belum ada layer. Tambahkan teks atau bentuk.</p>';
  $('names').innerHTML = layers.map(l => `<div class="${l.id===sel?'on':''}" data-id="${l.id}">${esc(name(l))}</div>`).join('');
  $('tracks').innerHTML = layers.map(l =>
    `<div class="trow"><div class="bar ${l.id===sel?'on':''}" data-id="${l.id}" style="left:${l.start/dur*100}%;width:${Math.max(1,l.dur/dur*100)}%"></div></div>`).join('')
    + '<div class="ph"></div>';
  if (!layers.length) $('tracks').style.minHeight = '30px';
}

function drawProps() {
  const l = layers.find(x => x.id === sel), el = $('props');
  if (!l) { el.innerHTML = '<h2>Properti</h2><p style="color:var(--mute);margin:0">Pilih layer untuk mengubah isinya.</p>'; return; }
  const num = (k, lab, min, max, step = 1) => `<div class="f"><label>${lab}</label><input data-k="${k}" type="number" min="${min}" max="${max}" step="${step}" value="${+l[k].toFixed(2)}"></div>`;
  el.innerHTML = `<h2>Properti</h2>
    ${l.type==='text' ? `<div class="f"><label>Isi teks</label><textarea data-k="text" rows="2">${esc(l.text)}</textarea></div>${num('size','Ukuran huruf',10,400)}` : `<div class="row2">${num('w','Lebar',10,2000)}${num('h','Tinggi',10,2000)}</div>`}
    <div class="f"><label>Warna</label><input data-k="color" type="color" value="${l.color}"></div>
    <div class="row2">${num('x','Posisi X',-500,1800)}${num('y','Posisi Y',-500,1200)}</div>
    <div class="row2">${num('start','Mulai (d)',0,60,0.1)}${num('dur','Lama (d)',0.2,60,0.1)}</div>
    <div class="f"><label>Animasi masuk</label><select data-k="anim">${Object.entries(ANIMS).map(([k,v]) => `<option value="${k}" ${l.anim===k?'selected':''}>${v}</option>`).join('')}</select></div>
    <label style="display:flex;gap:6px;align-items:center"><input data-k="out" type="checkbox" ${l.out?'checked':''}> Menghilang di akhir</label>
    <div class="row2"><button data-act="up">Naikkan</button><button data-act="down">Turunkan</button><button data-act="dup">Gandakan</button><button data-act="del">Hapus</button></div>`;
}

$('props').addEventListener('input', e => {
  const l = layers.find(x => x.id === sel), k = e.target.dataset.k; if (!l || !k) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
  l[k] = v;
  if (['text','start','dur'].includes(k)) drawLists();
});
$('props').addEventListener('click', e => {
  const act = e.target.dataset.act, i = layers.findIndex(x => x.id === sel); if (!act || i < 0) return;
  if (act === 'del') { layers.splice(i, 1); sel = layers.length ? layers[Math.max(0,i-1)].id : null; }
  if (act === 'dup') { const c = Object.assign({}, layers[i], {id: uid++, x: layers[i].x + 30, y: layers[i].y + 30}); layers.splice(i+1, 0, c); sel = c.id; }
  if (act === 'up' && i < layers.length-1) [layers[i], layers[i+1]] = [layers[i+1], layers[i]];
  if (act === 'down' && i > 0) [layers[i], layers[i-1]] = [layers[i-1], layers[i]];
  drawLists(); drawProps();
});
document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
  const l = make(b.dataset.add, {start: Math.min(t, dur - 1)}); layers.push(l); select(l.id);
});
['layers','names'].forEach(id => $(id).addEventListener('click', e => { const d = e.target.closest('[data-id]'); if (d) select(+d.dataset.id); }));

/* ---------- timeline: scrub & seret batang ---------- */
function timeFromX(clientX) { const r = $('tracks').getBoundingClientRect(); return Math.max(0, Math.min(dur, (clientX - r.left) / r.width * dur)); }
$('tracks').addEventListener('pointerdown', e => {
  const bar = e.target.closest('.bar');
  if (bar) {
    const l = layers.find(x => x.id === +bar.dataset.id); select(l.id);
    const w = $('tracks').getBoundingClientRect().width, sx = e.clientX, s0 = l.start;
    const mv = ev => { l.start = Math.max(0, Math.min(dur - 0.2, s0 + (ev.clientX - sx) / w * dur)); l.start = Math.round(l.start*10)/10; drawLists(); drawProps(); };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); return;
  }
  playing = false; $('play').textContent = 'Putar'; t = timeFromX(e.clientX);
  const mv = ev => t = timeFromX(ev.clientX), up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
});

/* ---------- kanvas: pilih & geser ---------- */
cv.addEventListener('pointerdown', e => {
  const r = cv.getBoundingClientRect(), k = W / r.width;
  const px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
  const hit = layers.slice().reverse().find(l => l._vis && Math.abs(px - l.x) <= l._w/2 + 10 && Math.abs(py - l.y) <= l._h/2 + 10);
  if (!hit) { select(null); return; }
  select(hit.id);
  const ox = px - hit.x, oy = py - hit.y;
  const mv = ev => { hit.x = Math.round((ev.clientX - r.left) * k - ox); hit.y = Math.round((ev.clientY - r.top) * k - oy);
    document.querySelectorAll('#props [data-k=x]').forEach(i => i.value = hit.x); document.querySelectorAll('#props [data-k=y]').forEach(i => i.value = hit.y); };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
});

/* ---------- kontrol utama ---------- */
$('play').onclick = () => { if (exporting) return; playing = !playing; if (playing && t >= dur) t = 0; $('play').textContent = playing ? 'Jeda' : 'Putar'; };
$('seek').oninput = e => { playing = false; $('play').textContent = 'Putar'; t = e.target.value * dur; };
$('dur').onchange = e => { dur = Math.max(1, Math.min(60, parseFloat(e.target.value) || 6)); e.target.value = dur; t = Math.min(t, dur); drawLists(); };
$('bg').oninput = e => bg = e.target.value;

/* ---------- ekspor ---------- */
function download(blob, filename) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
$('png').onclick = () => { setRes(+$('q').value); render(t); cv.toBlob(b => { download(b, 'frame.png'); setRes(1); }, 'image/png'); };

let recorder, chunks, mime, prevSel;
let vtrack = null, lastReq = 0;
function makeStream() {
  const s = cv.captureStream(0); vtrack = s.getVideoTracks()[0];
  if (!vtrack || !vtrack.requestFrame) { vtrack = null; return cv.captureStream(30); }
  return s;
}
function pickMime(f) {
  const webm = ['video/webm;codecs=vp9', 'video/webm'];
  if (f === 'webm') return webm.find(x => MediaRecorder.isTypeSupported(x));
  const list = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'];
  let m = list.find(x => MediaRecorder.isTypeSupported(x));
  if (!m) { alert('Browser ini belum bisa merekam MP4/MOV. Update Chrome ke versi terbaru. Sementara ini hasilnya berformat WebM.'); m = webm.find(x => MediaRecorder.isTypeSupported(x)); }
  return m;
}
async function exportFast(fmt) {
  const k = +$('q').value, w = Math.round(W * k), h = Math.round(H * k), fps = 30, n = Math.max(2, Math.round(dur * fps));
  const px = w * h, lv = px <= 921600 ? '1f' : px <= 2088960 ? '28' : px <= 5652480 ? '32' : '33';
  let cfg = null;
  for (const c of ['6400', '4d00', '4200']) {
    const t = {codec: 'avc1.' + c + lv, width: w, height: h, bitrate: Math.round(8e6 * Math.pow(k, 1.5)), framerate: fps, latencyMode: 'realtime'};
    try { if ((await VideoEncoder.isConfigSupported(t)).supported) { cfg = t; break; } } catch (e) {}
  }
  if (!cfg) return false;
  exporting = true; playing = false; $('play').textContent = 'Putar'; $('exp').disabled = true;
  const samples = []; let avcC = null, err = null;
  const enc = new VideoEncoder({
    output: (c, m) => {
      const d = new Uint8Array(c.byteLength); c.copyTo(d); samples.push({data: d, key: c.type === 'key'});
      const ds = m && m.decoderConfig && m.decoderConfig.description;
      if (ds && !avcC) avcC = ArrayBuffer.isView(ds) ? new Uint8Array(ds.buffer, ds.byteOffset, ds.byteLength).slice() : new Uint8Array(ds.slice(0));
    },
    error: e => { err = e; }
  });
  try {
    setRes(k); enc.configure(cfg);
    for (let i = 0; i < n && !err; i++) {
      render(i / fps);
      const f = new VideoFrame(cv, {timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps)});
      enc.encode(f, {keyFrame: i % fps === 0}); f.close();
      while (enc.encodeQueueSize > 6 && !err) await new Promise(r => setTimeout(r, 4));
      if (i % 5 === 0) { $('exp').textContent = 'Render ' + Math.round(i / n * 100) + '%'; await new Promise(r => setTimeout(r)); }
    }
    await enc.flush(); enc.close();
    if (err || !avcC || samples.length < n) throw err || new Error('encode gagal');
    download(muxMp4({samples, avcC, w, h, fps, mov: fmt === 'mov'}), 'animasi.' + fmt);
    return true;
  } catch (e) { console.warn('Ekspor cepat gagal, pakai perekam biasa', e); try { enc.close(); } catch (_) {} return false; }
  finally { exporting = false; setRes(1); $('exp').disabled = false; $('exp').textContent = 'Ekspor video'; }
}
$('exp').onclick = async () => {
  if (exporting) return;
  if ($('fmt').value !== 'webm' && window.VideoEncoder && window.VideoFrame && await exportFast($('fmt').value)) return;
  if (!window.MediaRecorder) { alert('Browser ini tidak mendukung ekspor video. Coba Chrome atau Edge.'); return; }
  mime = pickMime($('fmt').value);
  if (!mime) { alert('Format video tidak didukung browser ini.'); return; }
  prevSel = sel; exporting = true; chunks = [];
  const k = +$('q').value; setRes(k);
  recorder = new MediaRecorder(makeStream(), {mimeType: mime, videoBitsPerSecond: Math.round(8e6 * Math.pow(k, 1.5))});
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    const isMp4 = mime.startsWith('video/mp4'), ext = isMp4 ? $('fmt').value : 'webm';
    download(new Blob(chunks, {type: ext === 'mov' ? 'video/quicktime' : mime}), 'animasi.' + ext);
    exporting = false; vtrack = null; setRes(1); $('exp').disabled = false; $('exp').textContent = 'Ekspor video';
  };
  $('exp').disabled = true; $('exp').textContent = 'Merekam…';
  t = 0; playing = true; recorder.start(200);
};
function finishExport() { playing = false; t = dur; $('play').textContent = 'Putar'; render(t); if (vtrack) vtrack.requestFrame(); setTimeout(() => recorder.stop(), 150); }

/* ---------- contoh awal ---------- */
layers = [
  make('rect', {x: W/2, y: 520, w: 700, h: 8, color: '#ffd166', start: 0.6, dur: 5, anim: 'slideL'}),
  make('circle', {x: 1040, y: 200, w: 180, h: 180, color: '#ff5d73', start: 0.2, dur: 5.5, anim: 'bounce'}),
  make('text', {x: W/2, y: 340, text: 'Halo, Motion Studio', size: 110, start: 0.3, dur: 5.4, anim: 'scale'}),
  make('text', {x: W/2, y: 450, text: 'Buat, atur waktu, lalu ekspor', size: 48, color: '#ffd166', start: 1, dur: 4.7, anim: 'slideUp'})
];
select(layers[2].id);
requestAnimationFrame(n => { last = n; tick(n); });
    
