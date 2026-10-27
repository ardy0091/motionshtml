/* concepts.js — Creative Diversity Engine
   Membuat konsep motion graphics unik dari kombinasi kategori, struktur, bahasa desain,
   komposisi, palet, dan mekanisme gerak, lalu memvalidasi kemiripan dengan riwayat. */
const CE = (() => {
  const L = s => s.trim().split('\n').map(l => l.trim().split('|'));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = s => s.replace(/\b[a-z]/g, c => c.toUpperCase());

  // [nama, tag struktur yang cocok, jenis keluaran (opsional)]
  const GROUPS = {
    abstract: {name: 'Abstract & Experimental', out: 'loop', subs: L(`
Modern geometric abstraction|geo
Classic abstract art|geo organic
Mid-century modern|geo organic pattern
Retro optical art|optical pattern
Minimalist motion design|geo organic
Organic fluid shapes|organic
Kinetic geometric composition|geo mech
Abstract architectural forms|arch geo
Experimental typography-free graphics|geo optical organic
Bauhaus-inspired abstraction|geo grid
Memphis-inspired geometric patterns|pattern geo
Paper-cut abstract compositions|paper organic
Monochrome optical illusions|optical
Contemporary editorial abstraction|geo organic`)},
    overlay: {name: 'Overlay & Motion Elements', out: 'overlay', subs: L(`
Animated frame overlays|frame
Cinematic geometric transitions|wipe|transition
Decorative corner elements|frame orn
Animated border systems|frame pattern
Transparent-background motion elements|geo organic pattern
Light-free graphic overlays|geo pattern
Modular visual accents|geo grid
Dynamic masking shapes|wipe geo|transition
Looping decorative patterns|pattern orn`)},
    opening: {name: 'Opening & Content Intro', out: 'opening', subs: L(`
Abstract cinematic opening|geo arch organic
Minimalist introduction|geo
Editorial opening sequence|geo grid paper
Geometric scene reveal|geo wipe arch
Creative visual transition|wipe geo|transition
Modern presentation opener|geo grid
Motion background for titles|geo organic pattern|loop
Broadcasting-style opening graphics|geo wipe radial`)},
    illustr: {name: 'Illustration & Artistic Motion', out: 'illustration', subs: L(`
2D editorial illustration|nature arch life
Retro character illustration|char
Architectural illustration|arch
Nature-inspired vector scenes|nature
Fashion illustration|fash
Everyday lifestyle scenes|life
Surreal 2D compositions|surreal
Mechanical illustration|mech
Decorative ornamental illustration|orn
Scientific illustration|sci`)},
    bg: {name: 'Background & Seamless Loop', out: 'loop', subs: L(`
Geometric animated backgrounds|geo grid pattern
Organic repeating patterns|organic pattern
Abstract moving textures|pattern optical
Radial compositions|radial
Tessellation animation|tess
Morphing silhouettes|organic
Kinetic lines and curves|lines
Layered parallax illustrations|parallax nature arch
Minimalist looping environments|nature geo`)}
  };

  const STRUCTS = L(`
nested concentric arches|geo arch radial|Concentric Arches
interlocking hexagonal tiles|geo pattern tess grid|Hexagon Tiles
a lattice of crossing diagonal bars|geo grid lines|Diagonal Lattice
stacked offset circles forming a column|geo|Circle Column
overlapping half-moons in flat colour|geo organic|Half-Moons
a modular grid of squares with quarter-circle cutouts|geo grid pattern|Quarter-Circle Grid
a fan of triangular blades|geo radial mech|Blade Fan
staggered rounded bars sliding in tiers|geo wipe pattern|Tiered Bars
a cascade of rectangles folding like origami panels|geo paper|Folding Panels
a stack of semicircular arcs with gaps|geo arch|Arc Stack
rounded blobs that merge and split|organic fluid|Merging Blobs
meandering contour lines like a topographic map|organic lines|Contour Lines
a ribbon of folded paper planes|paper organic lines|Paper Ribbon
a swarm of drifting leaf silhouettes|nature organic|Leaf Drift
layered mountain ridges|nature parallax|Mountain Ridges
a radial rosette of petals|nature radial orn|Petal Rosette
a curtain of hanging vines|nature organic|Hanging Vines
tide-like wave bands|organic lines parallax|Wave Bands
concentric moire rings|optical radial|Moire Rings
a checkerboard warping into waves|optical pattern grid|Warped Checkerboard
parallel stripes bending around invisible spheres|optical lines|Bending Stripes
dot grids swelling in a travelling pulse|optical pattern grid|Pulse Dots
a skyline of staggered towers|arch parallax|Tower Skyline
a spiral staircase seen from above|arch radial|Spiral Stair
a row of tall windows with sliding shutters|arch frame|Shutter Windows
a colonnade of arches in forced perspective|arch|Arch Colonnade
a city grid seen from above with shifting blocks|arch grid|City Blocks
a train of meshing gears|mech radial|Gear Train
a rack of pendulum orbs|mech pendulum|Pendulum Rack
a clock-like mechanism of nested rings|mech radial|Ring Mechanism
a piston and lever assembly|mech|Piston Assembly
a row of rotating cams with followers|mech pattern|Cam Row
interlocking corner brackets|frame orn geo|Corner Brackets
a border of repeating notched tiles|frame pattern|Notched Border
a tracing line that draws a rounded frame|frame lines|Traced Frame
sweeping curved wipes|wipe organic|Curved Sweep
diagonal shutter blades|wipe geo|Shutter Blades
an ornamental scrollwork medallion|orn radial|Scroll Medallion
an art-deco sunburst fan|orn radial geo|Sunburst Fan
a filigree border of repeating scrolls|orn frame pattern|Filigree Border
a fern frond unfurling|sci nature|Fern Frond
a growing crystal lattice|sci geo tess|Crystal Lattice
a cell division diagram|sci organic|Cell Division
an orbital diagram on tilted rings|sci radial|Orbital Rings
a retro tin robot built from rounded rectangles|char mech|Tin Robot
a vintage diving helmet with a rotating porthole|char mech|Diving Helmet
a row of stylised hats on a conveyor|fash pattern|Hat Conveyor
a dress silhouette cycling through fabric patterns|fash pattern|Dress Patterns
a window-side table with steaming cups and swaying plants|life|Window Table
a bicycle rolling past layered street scenes|life parallax|Street Ride
a staircase that folds into the sky|surreal arch|Sky Stair
a floating island with an upside-down tree|surreal nature|Floating Island
tessellated fish scales shifting like water|tess nature pattern|Scale Tessellation`).map(([n, t, s]) => ({n, t: t.split(' '), s}));

  const MOTIONS = L(`
continuous rotation|radial mech geo|turns at a steady rate and completes whole revolutions within the clip|to give the form the calm authority of a working instrument|Orbit,Turn,Gyre
morphing geometry|geo organic|blends one outline into the next through interpolated vertices|so the shapes feel alive without ever leaving their grid|Metamorphosis,Shift
elastic deformation|organic fluid char|stretches and settles with damped springs|to suggest soft material responding to weight|Bounce,Give
organic oscillation|nature organic|sways on slightly offset sine waves|to echo wind and breathing rather than machinery|Sway,Drift
rhythmic repetition|pattern lines|fires the same gesture in a repeating beat across the whole set|to create a musical pulse that is easy to edit to|Rhythm,Pulse
sequential assembly|geo arch grid frame|builds the form piece by piece in a staggered order|so the viewer reads construction as a small story|Assembly,Build
mask reveal|frame wipe arch|uncovers the artwork through moving apertures|to give a cinematic sense of discovery|Reveal,Aperture
shape transformation|geo tess|turns each unit into its neighbour shape in turn|to make change the central idea|Passage,Change
smooth parallax|parallax nature arch|slides layers sideways at different speeds|to create depth out of flat planes|Layers,Depth
pendulum motion|pendulum mech|swings elements along phase-shifted arcs|to send a hypnotic wave through the row|Swing,Cadence
pattern displacement|pattern grid optical tess|slides rows and columns past each other by offsets|so the pattern seems to flow like fabric|Slide,Flow
synchronized motion|pattern mech|moves every part in lockstep on one shared clock|so the piece feels precise and engineered|Unison,Sync
counter-rotation|radial mech|spins neighbouring elements in opposite directions|to create tension and interference between layers|Opposition,Counterpoint
mechanical articulation|mech char|hinges, slides and cranks parts through linked joints|so the object reads as a believable machine|Mechanism,Linkage
progressive construction|arch sci grid|draws and fills the structure stroke by stroke|to explain how the form is built|Blueprint,Build-Up
looping environmental motion|nature life surreal parallax|runs gentle ambient cycles such as drift and sway|so the scene feels inhabited and endlessly watchable|Atmosphere,Ambience`).map(([n, t, h, w, s]) => ({n, t: t.split(' '), how: h, why: w, sfx: s.split(',')}));

  const LANGS = L(`
flat 2D vector|solid fills and crisp edges, with no gradients and no outlines beyond what the shapes need
bold editorial graphics|oversized forms, confident cropping inside safe margins and strong contrast between two dominant colours
vintage print-inspired illustration|slightly muted inks and offset layers that mimic screen printing, in flat colour only
clean corporate minimalism|very few shapes, generous spacing and one calm accent colour
Swiss-inspired geometric design|a strict grid, flush alignment, a restrained palette and rational proportions
Art Deco geometry|symmetry, stepped forms, fan and sunburst motifs and thin parallel lines
classic ornamental design|rhythmic scrolls and repeated motifs at a balanced density
contemporary motion graphics|smooth easing, flat layered planes and confident timing
cut-paper visual language|layered flat shapes with subtle soft shadows, as if cut from card
high-contrast monochrome|two or three tones only and strong graphic silhouettes
soft pastel abstraction|gentle tones, rounded forms and very low visual noise
limited-colour retro palette|three or four period-style colours, flat fills and slightly rounded corners
experimental asymmetric composition|deliberately unbalanced masses, unexpected crops inside safe margins and tension between large and small`).map(([n, l]) => ({n, l}));

  const COMPS = L(`
symmetric and centred|mirrored on the vertical axis with the hero form at the centre|
asymmetric with negative space|the main mass sits in the left third while a calm empty field fills the right|
radial burst from a corner|forms fan out from one corner of the frame toward the opposite side|
diagonal flow|elements travel along a 30-degree axis across the frame|
modular grid|cells align to a strict 16 by 9 grid with consistent gutters|
layered depth|foreground, middle ground and background planes move independently|
repeating pattern field|a single tile unit repeats across the whole frame|
single hero with generous margins|one dominant form surrounded by quiet space|
dense full-frame fabric|small units fill the frame edge to edge in a tightly controlled rhythm|d
edge-hugging frame|forms hug the borders and corners while the centre stays completely clear|e
corner-anchored accents|compact clusters anchor two opposite corners and leave the middle open|e`).map(([n, d, f]) => ({n, d, f: f || ''}));

  const PALS = L(`
Terracotta & Sage|#C8553D #E9C9A8 #7A8F6A #2E3B2E
Midnight & Amber|#0B1F4B #1E4FA3 #FF9F1C #FFF3DC
Ink & Vermilion|#111111 #F2EDE4 #E63E23
Pastel Sorbet|#FFD6E0 #FFEFD5 #C1E1C1 #BDE0FE
Olive & Cream|#4B5A2A #F4EBD0 #C8553D #1E2A12
Teal & Coral|#0F5257 #FF6F59 #F7F0E3 #254441
Monochrome Slate|#0E1116 #3A4150 #9AA3B2 #F2F4F7
Mustard & Plum|#E1AD01 #4A1942 #F5EEDC #B5446E
Cobalt & Blush|#1D3FBB #F7C6C0 #FFFFFF #0A1A5C
Forest & Gold|#12372A #436850 #ADBC9F #C9A24B
Dusk Orange|#3B3B58 #FF7B54 #FFB26B #FFD56F
Paper & Charcoal|#F2EFE9 #2B2B2B #A8A39A #D9534F
Lilac & Lime|#2D1E5A #B8A1E3 #E8FF8A #F7F5FF
Navy & Peach|#14213D #FCA311 #FFE8D6 #E5E5E5
Rust & Sky|#B7410E #87CEEB #FFF4E0 #2F2F2F
Black & Gold|#0B0B0B #3A3A3A #C9A24B #F5F1E8`).map(([n, h]) => ({n, h: h.split(' ')}));

  const OUT = {
    loop: {fn: ['a seamless background loop for title cards and corporate presentations', 'a calm backdrop for lifestyle and educational videos', 'a looping texture layer for explainer scenes and lower-thirds'],
      seq: 'All movement is periodic across the full 10 seconds, so the last frame flows straight back into the first with no jump in position, shape or colour.'},
    opening: {fn: ['an opening sequence for documentary and editorial videos', 'a modern intro that resolves into a clean area for titles'],
      seq: 'The first 2 seconds begin almost empty; from 2 to 7 seconds the forms assemble and settle; the final 3 seconds hold a composed frame with a quiet central area ready for titles.'},
    overlay: {fn: ['a transparent accent layer to frame interviews and social clips', 'a decorative border layer for slideshows and photo sequences', 'corner accents for lower-thirds and call-outs'],
      seq: 'On a transparent background the elements slide in during the first 1.5 seconds, idle with subtle motion, and exit in the last 1.5 seconds, keeping the centre of the frame completely free.'},
    transition: {fn: ['a scene-to-scene transition that covers and reveals the frame', 'a creative wipe for cutting between interview segments'],
      seq: 'Shapes sweep across to cover the frame fully by 4.5 seconds, hold briefly, then peel away so the frame is clear again by 9 seconds, leaving transparent space.'},
    illustration: {fn: ['a lively illustrated scene for explainer and lifestyle content', 'an illustrated loop for educational video backdrops'],
      seq: 'Several small ambient movements run at different rhythms so the scene feels inhabited, and the loop closes seamlessly at 10 seconds.'}
  };

  /* ---------- riwayat ---------- */
  const HK = 'motionstudio.concepts.v1';
  const empty = () => ({v: 1, concepts: [], customSubs: [], customStructs: []});
  const load = () => { try { const h = JSON.parse(localStorage.getItem(HK) || 'null'); return h && h.concepts ? Object.assign(empty(), h) : empty(); } catch (e) { return empty(); } };
  const save = h => { try { localStorage.setItem(HK, JSON.stringify(h)); return true; } catch (e) { return false; } };

  /* ---------- kemiripan ---------- */
  const tokens = s => new Set((s || '').toLowerCase().match(/[a-z]{4,}/g) || []);
  const jac = (a, b) => { if (!a.size || !b.size) return 0; let i = 0; a.forEach(x => b.has(x) && i++); return i / (a.size + b.size - i); };
  function sim(a, b) {
    const eq = k => (a[k] === b[k] ? 1 : 0);
    return 0.30 * eq('struct') + 0.22 * eq('motion') + 0.15 * eq('comp') + 0.10 * eq('sub') + 0.08 * eq('lang') + 0.07 * eq('pal') + 0.08 * eq('out');
  }
  function conflicts(c, pool) {
    let tk = null;
    for (const o of pool) {
      if (c.struct === o.struct && (c.motion === o.motion || c.comp === o.comp || c.sub === o.sub)) return true;
      if (c.title === o.title) return true;
      const s = sim(c, o);
      if (s >= 0.5) return true;
      if (s >= 0.3 && c.desc && o.desc) { tk = tk || tokens(c.desc); if (jac(tk, tokens(o.desc)) >= 0.62) return true; }
    }
    return false;
  }

  /* ---------- pembuat konsep ---------- */
  function build(sub, st, mo, cp, lg, pl, out) {
    const hx = pl.h, role = `${hx[0]} as the dominant field, ${hx[1]} for the main forms and ${hx[hx.length - 1]} as the sparing accent`;
    const title = `${st.s} ${pick(mo.sfx)}`;
    const o = OUT[out], fn = pick(o.fn), sn = sub.toLowerCase();
    const intro = pick([`${title} is ${fn}, designed as ${sn} in the spirit of ${lg.n}.`, `Conceived as ${fn}, ${title} explores ${sn} through ${lg.n}.`, `${title} serves as ${fn}, treating ${sn} with ${lg.n}.`]);
    const desc = [intro,
      `The image is built around ${st.n}, arranged with ${cp.n} composition, where ${cp.d}.`,
      `${lg.n[0].toUpperCase() + lg.n.slice(1)} here means ${lg.l}.`,
      `Colour is limited to the "${pl.n}" palette (${hx.join(', ')}), using ${role}.`,
      `Motion: the form ${mo.how}, a choice made ${mo.why}.`, o.seq,
      'It is drawn entirely with Canvas 2D at 1920x1080 (16:9) for 10 seconds, with no text, logos or external assets.'].join(' ');
    return {title, sub, out, struct: st.n, structShort: st.s, motion: mo.n, how: mo.how, why: mo.why, comp: cp.n, compDesc: cp.d,
      lang: lg.n, langLook: lg.l, pal: pl.n, hex: hx, desc, fn};
  }
  function tryMake(gk, h, pool, batch, attempt) {
    const g = GROUPS[gk], subs = g.subs.concat(h.customSubs.filter(s => s.g === gk).map(s => [s.n, s.w, s.o]));
    const free = subs.filter(s => !batch.some(b => b.sub === s[0]));
    const sb = pick(attempt < 200 && free.length ? free : subs), out = sb[2] || g.out, want = sb[1].split(' ');
    const sts = STRUCTS.concat(h.customStructs).filter(s => s.t.some(t => want.includes(t)));
    if (!sts.length) return null;
    const st = pick(sts), mos = MOTIONS.filter(m => m.t.some(t => st.t.includes(t)));
    if (!mos.length) return null;
    const mo = pick(mos), edge = out === 'overlay' || out === 'transition';
    const cps = COMPS.filter(c => edge ? c.f === 'e' || (c.f === '' && /diagonal|radial|layered/.test(c.n)) : c.f !== 'e');
    const cp = pick(cps), lg = pick(LANGS), pl = pick(PALS);
    if (cp.f === 'd' && (st.t.includes('orn') || /ornamental|Art Deco|vintage/.test(lg.n))) return null; // terlalu ramai
    if (edge && cp.f === 'd') return null;
    const c = build(sb[0], st, mo, cp, lg, pl, out);
    c.group = g.name; c.gk = gk;
    for (const b of batch) {
      if (b.struct === c.struct || b.motion === c.motion || b.comp === c.comp) return null;
      if (attempt < 300 && (b.lang === c.lang || b.pal === c.pal)) return null;
    }
    return conflicts(c, pool) ? null : c;
  }
  function generate(count, gk) {
    const h = load(), keys = gk === 'all' ? shuffle(Object.keys(GROUPS)) : [gk], batch = [];
    for (let i = 0; i < count; i++) {
      let made = null;
      for (const k of (gk === 'all' ? keys.slice(i % keys.length).concat(keys.slice(0, i % keys.length)) : keys)) {
        for (let a = 0; a < 400 && !made; a++) made = tryMake(k, h, h.concepts.concat(batch), batch, a);
        if (made) break;
      }
      if (!made) break;
      batch.push(made);
    }
    const stamp = Date.now();
    batch.forEach((c, i) => { c.id = stamp + '-' + i; h.concepts.push({id: c.id, title: c.title, sub: c.sub, out: c.out, struct: c.struct, motion: c.motion, comp: c.comp, lang: c.lang, pal: c.pal, desc: c.desc, ts: stamp, used: false}); });
    const stored = save(h);
    return {batch, exhausted: batch.length < count, stored, total: h.concepts.length};
  }
  function newCategory(gk) {
    const h = load(), mods = ['Kinetic', 'Modular', 'Folded', 'Layered', 'Woven', 'Stacked', 'Drifting', 'Tidal', 'Faceted', 'Looped'],
      bases = ['Study', 'Mosaic', 'Field', 'Assembly', 'Atlas', 'Garden', 'Relay'], tagSets = ['geo grid', 'organic lines', 'pattern geo', 'arch geo', 'optical pattern', 'nature organic'];
    const g = gk === 'all' ? pick(Object.keys(GROUPS)) : gk, name = `${pick(mods)} ${pick(bases)}`;
    h.customSubs.push({n: name, w: pick(tagSets), g, o: ''});
    const adj = ['interlaced', 'nested', 'staggered', 'mirrored', 'tapering', 'layered', 'interleaved'],
      noun = [['ribbons', 'organic lines'], ['arcs', 'geo arch'], ['blades', 'geo radial'], ['rings', 'radial geo'], ['bars', 'geo wipe pattern'], ['facets', 'geo tess'], ['spirals', 'radial organic'], ['chevrons', 'geo pattern'], ['lozenges', 'geo grid']],
      noun2 = ['tiles', 'columns', 'waves', 'steps', 'strips'];
    for (let i = 0; i < 4; i++) {
      const a = pick(adj), [n, t] = pick(noun), n2 = pick(noun2), nm = `${a} ${n} forming ${n2}`;
      if (!STRUCTS.concat(h.customStructs).some(s => s.n === nm)) h.customStructs.push({n: nm, t: t.split(' '), s: cap(`${a} ${n}`)});
    }
    save(h); return name;
  }

  const stats = () => { const h = load(); return {total: h.concepts.length, used: h.concepts.filter(c => c.used).length, subs: h.customSubs.length}; };
  const markUsed = id => { const h = load(), c = h.concepts.find(x => x.id === id); if (c) { c.used = true; save(h); } };
  const clear = () => { try { localStorage.removeItem(HK); } catch (e) {} };
  const exportJSON = () => JSON.stringify(load(), null, 1);
  function importJSON(text) {
    const d = JSON.parse(text); if (!d || !Array.isArray(d.concepts)) throw new Error('Format riwayat tidak dikenali.');
    const h = load(), seen = new Set(h.concepts.map(c => c.title + '|' + c.struct));
    let added = 0;
    d.concepts.forEach(c => { if (c && c.title && !seen.has(c.title + '|' + c.struct)) { h.concepts.push(c); seen.add(c.title + '|' + c.struct); added++; } });
    (d.customSubs || []).forEach(s => { if (!h.customSubs.some(x => x.n === s.n)) h.customSubs.push(s); });
    (d.customStructs || []).forEach(s => { if (!h.customStructs.some(x => x.n === s.n)) h.customStructs.push(s); });
    save(h); return added;
  }
  return {GROUPS, OUT, generate, newCategory, stats, markUsed, clear, exportJSON, importJSON, sim, load};
})();

/* ---------- UI ---------- */
(() => {
  const el = id => document.getElementById(id);
  let last = [];
  const flash = (msg, err) => { setStatus(msg, err); };
  function refreshStats() {
    const s = CE.stats();
    el('cg-hist').textContent = `Riwayat konsep di browser ini: ${s.total} konsep (${s.used} dipakai)${s.subs ? ', ' + s.subs + ' kategori baru' : ''}. Konsep di riwayat tidak ditawarkan lagi.`;
  }
  const full = c => `${c.title}\n${c.desc}`;
  function copy(text, btn) {
    const done = () => { const t = btn.textContent; btn.textContent = 'Tersalin ✓'; setTimeout(() => btn.textContent = t, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => flash('Salin gagal. Tekan lama teks lalu pilih Salin.', true)); else flash('Browser tidak mendukung salin otomatis.', true);
  }
  function card(c) {
    const d = document.createElement('div'); d.className = 'cc';
    const h = document.createElement('h3'); h.textContent = c.title; d.appendChild(h);
    const tg = document.createElement('div'); tg.className = 'tags';
    [c.group, c.sub, c.out, c.lang, c.comp, c.motion].forEach(t => { const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; tg.appendChild(s); });
    c.hex.forEach(x => { const s = document.createElement('span'); s.className = 'sw'; s.style.background = x; s.title = x; tg.appendChild(s); });
    d.appendChild(tg);
    const p = document.createElement('p'); p.textContent = c.desc; d.appendChild(p);
    const q = document.createElement('p'); q.style.cssText = 'font-size:11px;color:var(--mute)'; q.textContent = 'QC: tidak mirip riwayat · komposisi dan gerak berbeda dari konsep lain di batch · tidak terlalu ramai · bisa dibuat dengan Canvas 2D · tanpa merek atau teks.'; d.appendChild(q);
    const r = document.createElement('div'); r.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    const b1 = document.createElement('button'); b1.type = 'button'; b1.textContent = 'Salin deskripsi'; b1.onclick = () => copy(full(c), b1);
    const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'pri'; b2.textContent = 'Pakai konsep ini'; b2.onclick = () => use(c);
    r.appendChild(b1); r.appendChild(b2); d.appendChild(r); return d;
  }
  function use(c) {
    window.__concept = c; CE.markUsed(c.id);
    el('ptype').value = 'konsep'; el('ratio').value = '16:9'; el('res').value = '1080'; el('secs').value = '10'; el('palet').value = 'gaya';
    el('subject').value = c.title; el('bgmode').value = (c.out === 'overlay' || c.out === 'transition') ? 'transparan' : 'gaya';
    bgUi(); refreshPrompt(); refreshStats();
    flash(`Konsep "${c.title}" dipakai. Salin prompt di bagian 1, tempel ke AI, lalu tempel kodenya di bagian 2.` + (el('bgmode').value === 'transparan' ? ' Konsep ini transparan, jadi hasil disimpan sebagai WebM.' : ''));
    el('prompt').scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  el('cg-go').onclick = () => {
    const n = Math.max(1, Math.min(10, +el('cg-count').value || 5)), r = CE.generate(n, el('cg-group').value);
    last = r.batch; const out = el('cg-out'); out.innerHTML = ''; r.batch.forEach(c => out.appendChild(card(c)));
    el('cg-bar').style.display = r.batch.length ? 'flex' : 'none';
    let msg = r.batch.length ? `${r.batch.length} konsep dibuat.` : 'Tidak ada konsep baru yang lolos pemeriksaan kemiripan.';
    if (r.exhausted) {
      msg += ' Ide unik di kategori ini mulai habis, jadi saya buat kategori baru. Klik Buat konsep lagi.';
      msg += ' (' + CE.newCategory(el('cg-group').value) + ')';
    }
    if (!r.stored) msg += ' Riwayat tidak bisa disimpan di browser ini. Gunakan Ekspor riwayat.';
    flash(msg, !r.batch.length); refreshStats();
  };
  el('cg-copyall').onclick = () => copy(last.map((c, i) => `${i + 1}. ${full(c)}`).join('\n\n'), el('cg-copyall'));
  el('cg-exp').onclick = () => download(new Blob([CE.exportJSON()], {type: 'application/json'}), 'riwayat-konsep.json');
  el('cg-imp').onclick = () => el('cg-file').click();
  el('cg-file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { const n = CE.importJSON(t); flash(`Impor selesai: ${n} konsep baru ditambahkan.`); refreshStats(); }).catch(err => flash('Impor gagal: ' + err.message, true));
    e.target.value = '';
  };
  el('cg-clr').onclick = () => { if (confirm('Hapus seluruh riwayat konsep? Konsep lama bisa ditawarkan lagi.')) { CE.clear(); el('cg-out').innerHTML = ''; el('cg-bar').style.display = 'none'; refreshStats(); flash('Riwayat konsep dihapus.'); } };
  refreshStats();
})();
