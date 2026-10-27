/* ai.js — prompt generator + render HTML canvas ke video (tanpa API key) */
const $ = id => document.getElementById(id);
function dims() { const h = +$('res').value, r = $('ratio').value; return r === '16:9' ? [Math.round(h * 16 / 9), h] : r === '9:16' ? [h, Math.round(h * 16 / 9)] : [h, h]; }
const fr = $('fr');

const STYLES = {
  'korporat bersih': 'korporat bersih dan profesional ala produk SaaS premium: latar putih keabuan sangat muda (#F6F8FB), kartu putih dengan sudut membulat 16px dan bayangan lembut berlapis, satu warna aksen biru royal (#2563EB) ditambah abu netral, ikon garis tipis konsisten, gerakan tenang dan presisi',
  'glassmorphism': 'glassmorphism modern: latar gradasi mesh lembut (biru, ungu, merah muda), panel kaca semi-transparan (putih 12-20%) dengan blur dan garis tepi putih 1px, kedalaman berlapis, cahaya lembut di sudut',
  'fintech premium': 'fintech premium dan mewah: latar hitam arang (#0B0B0F), aksen emas champagne (#C9A46B) dan putih hangat, garis tipis presisi, kartu dengan gradasi halus, warna sangat terbatas, kesan eksklusif dan tenang',
  'gradasi mesh modern': 'modern dan berenergi: gradasi mesh berani (jingga, magenta, ungu), bentuk organik besar yang mengalir, kontras tinggi, elemen besar dan percaya diri, gerakan mengalir',
  'isometrik 3D': 'ilustrasi isometrik 3D ala startup teknologi: blok dan kartu 3D pada sudut isometrik, palet pastel dengan satu warna aksen cerah, bayangan lembut, gerakan perakitan yang rapi dan memuaskan',
  'editorial berani': 'editorial berani: blok warna datar besar (krem, hitam, satu warna cerah #FF4D2E), bentuk geometris tegas, kontras tinggi, gerakan cepat dan ritmis seperti motion graphics iklan',
  'vektor 3D kartun lembut 2026': 'vektor 3D kartun lembut (tren 2026): bentuk tebal dan menggembung seperti balon atau clay, tampak 3D tetapi tetap vektor, gradasi lembut dua nada di tiap bentuk, highlight bulat kecil mengilap, bayangan jatuh tipis, palet 4-5 warna cerah yang harmonis (misalnya koral, kuning mentega, biru langit, lavender), gerakan memantul lentur dan ramah',
  'gambar tangan organik 2026': 'gambar tangan organik (tren 2026): garis vektor yang terasa digambar tangan dengan ketebalan sedikit bervariasi dan tepi tidak terlalu sempurna, bentuk datar dengan palet terbatas 4 warna hangat dan membumi (krem, terakota, hijau sage, kuning mustard), latar krem polos tanpa tekstur noise, gerakan lembut seperti gambar yang bernapas',
  'retro-futuris datar 2026': 'retro-futuris warna datar (tren 2026): bentuk geometris tajam dan bersih (lingkaran, setengah lingkaran, garis, bintang), palet nostalgia (mustard, teal, koral, krem, biru tua) tanpa gradasi, komposisi simetris ala poster ruang angkasa tahun 70-an, gerakan berirama dan tegas',
  'cyberpunk': 'cyberpunk ringan: latar ungu-hitam kota malam dengan siluet gedung, garis dan bentuk neon magenta (#FF2BD6), cyan (#00F0FF), dan kuning (#FCEE0A), efek cahaya dibuat dengan garis tebal berlapis semi-transparan (bukan shadowBlur besar), grid perspektif di lantai, hologram sederhana, efek glitch tipis dengan geser warna 2-4 piksel sesekali',
  'gelap sinematik': 'gelap sinematik: latar gelap dengan kontras tinggi, cahaya lembut dan vinyet halus, warna sangat terbatas, suasana dramatis namun bersih',
  'cerah berwarna': 'cerah dan ceria: warna penuh tetapi harmonis, bentuk bulat ramah, gerakan memantul ringan',
  'minimalis': 'minimalis: banyak ruang kosong, satu atau dua warna, bentuk geometris sederhana, gerakan halus dan terukur',
  'neon': 'neon futuristik: latar sangat gelap, garis dan bentuk bercahaya (glow) dalam 2-3 warna neon, gerakan cepat dan tajam'
};
const PALETS = {
  'merah - hitam - krem': 'merah tua #C8001A (dominan), hitam kemerahan #1A0005, krem #FFF8E7, salmon #F4A582 (aksen kecil)',
  'biru malam - oranye': 'biru malam #0B1F4B (dominan), biru tengah #1E4FA3, krem #FFF3DC, oranye #FF8A2B (aksen kecil)',
  'hijau zaitun - krem': 'hijau zaitun #4B5A2A (dominan), hijau tua #1E2A12, krem #F4EBD0, terakota #C8553D (aksen kecil)',
  'ungu - pink - kuning': 'ungu #3B1A8F (dominan), ungu tua #160A3D, pink #FF5FA2, kuning #FFD23F (aksen kecil)',
  'hitam - putih - emas': 'hitam #0B0B0B (dominan), putih tulang #F5F1E8, emas #C9A24B, abu gelap #3A3A3A'
};
const PTYPES = {
  visual: {label: 'Tema animasi', head: t => `Buatkan SATU file HTML lengkap untuk animasi motion graphics dengan tema: "${t}".`, rules: [
    'Fokus hanya pada animasi visual: bentuk, objek, warna, dan gerakan dengan easing yang halus.',
    'JANGAN menampilkan teks, judul, label, angka, watermark, atau caption apa pun, kecuali tema di atas secara eksplisit memintanya.']},
  teks: {label: 'Teks yang ditampilkan (pisahkan baris dengan |)', head: t => `Buatkan SATU file HTML lengkap untuk animasi teks bergerak (kinetic typography). Teks yang ditampilkan, persis seperti ini dan tanpa tambahan apa pun: "${t}". Tanda | memisahkan tiap baris atau kata yang muncul bergantian.`, rules: [
    'Tampilkan HANYA teks di atas. Jangan menambah kata, subjudul, watermark, atau caption lain.',
    'Tiap baris atau kata masuk dengan animasi berbeda (slide, scale pantul, fade, putar), tertata rapi di tengah, mudah dibaca, dan keluar sebelum baris berikutnya muncul.',
    'Tambahkan elemen dekoratif sederhana (garis, bentuk, partikel) sebagai pendukung, tanpa teks tambahan.']},
  karakter: {label: 'Subjek utama (karakter atau objek)', head: t => `Buatkan SATU file HTML lengkap untuk animasi SATU karakter atau objek utama bergaya ilustrasi vektor tren 2026 yang ringan dan hidup: "${t}".`, rules: [
    'Gambar subjek di tengah dan besar (sekitar 60% tinggi bingkai) dari bentuk sederhana yang berlapis: lingkaran, persegi membulat, dan kurva Bezier secukupnya, tanpa detail kecil yang berlebihan.',
    'Pakai palet 4-5 warna harmonis, shading dua nada yang lembut, dan satu highlight mengilap pada tiap bentuk besar. Garis tepi tipis atau tanpa garis tepi, sesuai gaya visual.',
    'Buat terasa hidup dengan cara yang ringan: muncul dengan pop (scale overshoot), lalu gerak idle berkelanjutan (bernapas, bergoyang, melayang), squash and stretch, gerak sekunder sederhana, dan maksimal sekitar 20 partikel atau percikan kecil.',
    'Tanpa teks. Fokus hanya pada subjek dan efeknya.']},
  poster: {label: 'Konsep utama (subjek dan detail yang memantulkan adegan lain)', noStyle: true, head: t => `Buatkan SATU file HTML lengkap untuk animasi poster sinematik bergaya ilustrasi grafis datar (flat), dengan konsep utama: "${t}". Animasi terdiri dari 3 sampai 4 adegan yang tersambung mulus lewat gerakan kamera zoom (match cut).`, rules: [
    'Gaya poster film klasik: bentuk datar bersiluet kuat, shading dua nada, TANPA gradasi halus dan tanpa outline tebal. Palet sangat terbatas (3-4 warna: satu warna dominan, satu gelap, satu krem terang, satu aksen). Semua detail dibangun dari bentuk geometris: lingkaran, persegi panjang, dan kurva Bezier.',
    'Struktur adegan: (1) mulai dari subjek utama dengan satu detail yang memuat adegan berikutnya (misalnya pantulan di lensa kacamata, jendela, mata, cermin, atau layar); (2) kamera zoom masuk ke detail itu sampai memenuhi layar dan adegan berikutnya terungkap; (3) lanjutkan zoom ke detail lain di dalam adegan tersebut; (4) pada akhir siklus kembali ke adegan awal supaya loop mulus.',
    'Implementasi kamera: buat tiap adegan sebagai fungsi drawScene yang menggambar adegan anak DI DALAM bagian tertentu (lensa, jendela) memakai ctx.save, translate, scale, dan clip. Kamera hanya satu transform (posisi dan skala) yang di-zoom dengan easing ease-in-out cubic dan interpolasi skala secara logaritmik (Math.exp dari lerp log). Dengan cara ini adegan anak otomatis membesar tanpa sambungan yang terlihat.',
    'Gerak mikro agar hidup: kedipan mata, cahaya atau bayangan yang menyapu pelan, paralaks antar lapisan, kain atau rambut bergoyang halus.',
    'Tanpa teks. Komposisi besar dan berani yang menyesuaikan rasio kanvas: untuk lanskap letakkan subjek di salah satu sisi dan detail fokus (lensa, jendela) agak di tengah, dan isi sisi lain dengan bentuk dekoratif datar dari palet yang sama. Seluruh siklus berlangsung tepat sesuai durasi yang diminta, dengan zoom pertama dimulai sekitar 10% waktu, dan di akhir siklus ada transisi halus kembali ke adegan awal.']},
  latar: {label: 'Tema latar', head: t => `Buatkan SATU file HTML lengkap untuk animasi LATAR BELAKANG abstrak yang bisa diulang tanpa putus (seamless loop), dengan tema: "${t}".`, rules: [
    'Tanpa teks sama sekali dan tanpa objek utama yang mencolok. Hanya pola, gradasi, partikel, gelombang, atau bentuk halus yang bergerak pelan.',
    'Awal dan akhir siklus harus identik (pakai fungsi sinus atau fase periodik) supaya loop tidak terlihat melompat.',
    'Kontras lembut, cocok dijadikan latar video atau layar belakang.']}
};
function buildPrompt() {
  const [w, h] = dims(), s = $('secs').value, p = PTYPES[$('ptype').value], bg = $('bgmode').value;
  const bodyBg = bg === 'transparan' ? 'transparent' : bg === 'hijau' ? '#00FF00' : '#000';
  const bgRule = bg === 'transparan'
    ? '\n- LATAR HARUS TRANSPARAN: jangan mengisi latar dengan warna atau gradasi. Panggil ctx.clearRect(0, 0, canvas.width, canvas.height) setiap frame, lalu gambar hanya subjek dan efeknya. Tanpa bayangan jatuh ke latar. Aturan latar ini mengalahkan aturan latar pada gaya visual.'
    : bg === 'hijau'
    ? '\n- LATAR HARUS satu warna hijau chroma key solid #00FF00 memenuhi seluruh bingkai: tanpa gradasi, vinyet, pola, atau bayangan pada latar. Jangan memakai warna hijau atau hijau muda pada subjek dan efek (pakai warna lain) supaya mudah dihapus dengan chroma key. Aturan latar ini mengalahkan aturan latar pada gaya visual.'
    : '';
  const palet = $('palet').value, paletRule = palet !== 'gaya' && PALETS[palet] ? `\n- PALET WARNA WAJIB (mengalahkan warna pada gaya visual): ${PALETS[palet]}. Jangan memakai warna di luar palet ini, kecuali turunan terang atau gelap dari warna yang sama.` : '';
  return `${p.head($('subject').value)}${p.noStyle ? '' : ' Gaya visual: ' + (STYLES[$('style').value] || $('style').value) + '.'}

Aturan wajib:
- Semua dalam satu file (HTML + CSS + JavaScript). Tanpa library, font eksternal, atau gambar dari luar.
- Gunakan tepat satu <canvas id="stage" width="${w}" height="${h}"> dan gambar semuanya dengan Canvas 2D (ctx). Jangan pakai animasi CSS atau elemen DOM untuk visual utama.
- Style: body{margin:0;background:${bodyBg}} canvas{display:block;width:100%;height:auto}${bgRule}${paletRule}
- Pakai ukuran canvas (canvas.width dan canvas.height) sebagai acuan semua posisi dan ukuran, jangan angka piksel tetap, supaya tampilan sama di resolusi apa pun.
- Animasi jalan otomatis dengan requestAnimationFrame, berbasis waktu (performance.now), bukan hitungan frame.
- Durasi satu siklus sekitar ${s} detik, lalu ulang dari awal (loop mulus).
${p.rules.map(r => '- ' + r).join('\n')}
- JANGAN menambahkan tombol, kontrol, atau elemen UI di halaman. Hanya canvas.
- Komposisi: isi seluruh bingkai. Elemen utama harus besar dan terbaca jelas dari jauh, margin tepi kecil dan seimbang. Jangan menampilkan antarmuka mini di sudut atau ruang kosong yang besar.
- Kualitas profesional: grid dan jarak yang rapi, sudut membulat konsisten, bayangan lembut berlapis, palet maksimal 4 warna, hierarki visual yang jelas, serta kedalaman lewat lapisan. Gerakan berurutan (stagger) dengan easing halus (ease-out cubic atau expo), tanpa gerakan kaku.
- Jaga performa tetap ringan: elemen kecil atau partikel maksimal sekitar 40, hindari ctx.filter dan shadowBlur besar (di atas 20) pada banyak elemen, pakai bentuk sederhana.
- Patuhi gaya visual di atas dengan setia. Jangan memakai tampilan dashboard gelap biru-navy dengan aksen teal kecuali gaya yang dipilih memintanya.
- Hasil harus bersih dan halus: hindari grain, noise acak, kilauan berkedip, atau pola yang berubah acak tiap frame. Pakai gradasi halus, tepi bersih (anti-aliasing), dan gerakan yang kontinu.
- Tulis kode 100% lengkap tanpa placeholder atau komentar "sisanya sama".
- Balasanmu hanya satu blok kode HTML. Tanpa kalimat pembuka, penjelasan, atau penutup di luar blok kode.`;
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

/* Jenis poster: rasio 16:9 dan durasi 10 detik dipilih otomatis (bisa diubah lagi) */
$('ptype').addEventListener('change', () => {
  if ($('ptype').value === 'poster') {
    $('ratio').value = '16:9'; $('secs').value = '10'; refreshPrompt();
    setStatus('Jenis poster: rasio 16:9 (lanskap) dan durasi 10 detik dipilih otomatis. Bisa diubah lagi.');
  }
});
