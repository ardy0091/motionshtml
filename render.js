/* renderer/render.js — data layer, easing, animasi, dan penggambaran kanvas */
const W = 1280, H = 720;
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const $ = id => document.getElementById(id);
let SCALE = 1;
function setRes(k){ SCALE = k; cv.width = Math.round(W*k); cv.height = Math.round(H*k); }
let layers = [], sel = null, t = 0, playing = false, last = 0, exporting = false, dur = 6, bg = '#14213d', uid = 1;

const ANIMS = {none:'Tanpa animasi', fade:'Muncul perlahan', slideL:'Masuk dari kiri', slideR:'Masuk dari kanan', slideUp:'Naik dari bawah', scale:'Membesar (pantul)', spin:'Putar masuk', bounce:'Jatuh memantul'};

function make(type, o = {}) {
  const base = {id: uid++, type, x: W/2, y: H/2, color: '#ffffff', start: 0, dur: 4, anim: 'fade', out: true};
  if (type === 'text') Object.assign(base, {text: 'Teks baru', size: 90});
  if (type === 'rect') Object.assign(base, {w: 400, h: 120, color: '#ff5d73'});
  if (type === 'circle') Object.assign(base, {w: 200, h: 200, color: '#ffd166'});
  return Object.assign(base, o);
}
function name(l){ return l.type === 'text' ? l.text.split('\n')[0].slice(0,18) || 'Teks' : (l.type === 'rect' ? 'Kotak ' : 'Bulat ') + l.id; }

/* ---------- easing & animasi ---------- */
const eo = p => 1 - Math.pow(1 - p, 3);
const eb = p => { const c = 1.70158; return 1 + (c+1)*Math.pow(p-1,3) + c*Math.pow(p-1,2); };
const bn = p => { const n = 7.5625, d = 2.75;
  if (p < 1/d) return n*p*p; if (p < 2/d) return n*(p-=1.5/d)*p + .75;
  if (p < 2.5/d) return n*(p-=2.25/d)*p + .9375; return n*(p-=2.625/d)*p + .984375; };
function anim(name, p) {
  const r = {a:1, dx:0, dy:0, s:1, rot:0}, e = eo(p);
  switch (name) {
    case 'fade': r.a = e; break;
    case 'slideL': r.dx = -(1-e)*500; r.a = Math.min(1,p*3); break;
    case 'slideR': r.dx = (1-e)*500; r.a = Math.min(1,p*3); break;
    case 'slideUp': r.dy = (1-e)*140; r.a = e; break;
    case 'scale': r.s = Math.max(0, eb(p)); r.a = Math.min(1,p*4); break;
    case 'spin': r.rot = -(1-e)*Math.PI; r.s = e; r.a = e; break;
    case 'bounce': r.dy = -(1-bn(p))*420; r.a = Math.min(1,p*5); break;
  }
  return r;
}

/* ---------- render ---------- */
function render(time) {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  for (const l of layers) {
    const local = time - l.start;
    l._vis = local >= 0 && local <= l.dur;
    if (!l._vis) continue;
    const r = anim(l.anim, Math.min(1, local / 0.8));
    if (l.out && local > l.dur - 0.4) r.a *= Math.max(0, (l.dur - local) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, r.a));
    ctx.translate(l.x + r.dx, l.y + r.dy);
    ctx.rotate(r.rot); ctx.scale(r.s, r.s);
    ctx.fillStyle = l.color;
    if (l.type === 'text') {
      ctx.font = `700 ${l.size}px "Segoe UI",system-ui,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = l.text.split('\n'), lh = l.size * 1.2;
      l._w = Math.max(40, ...lines.map(s => ctx.measureText(s).width)); l._h = lh * lines.length;
      lines.forEach((s, i) => ctx.fillText(s, 0, (i - (lines.length-1)/2) * lh));
    } else if (l.type === 'rect') {
      ctx.fillRect(-l.w/2, -l.h/2, l.w, l.h); l._w = l.w; l._h = l.h;
    } else {
      ctx.beginPath(); ctx.ellipse(0, 0, l.w/2, l.h/2, 0, 0, Math.PI*2); ctx.fill(); l._w = l.w; l._h = l.h;
    }
    ctx.restore();
  }
  const l = layers.find(x => x.id === sel);
  if (l && l._vis && !exporting) {
    ctx.save(); ctx.strokeStyle = '#2f4bff'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]);
    ctx.strokeRect(l.x - l._w/2 - 6, l.y - l._h/2 - 6, l._w + 12, l._h + 12); ctx.restore();
  }
}

