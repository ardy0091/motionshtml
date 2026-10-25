/* mp4.js — muxer MP4/MOV (H.264) sederhana: durasi dan frame dijamin tepat */
function mp4Cat(parts) {
  const ps = parts.map(p => p instanceof Uint8Array ? p : Uint8Array.from(p));
  const o = new Uint8Array(ps.reduce((a, p) => a + p.length, 0)); let k = 0;
  for (const p of ps) { o.set(p, k); k += p.length; }
  return o;
}
const m32 = v => [v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255];
const m16 = v => [v >> 8 & 255, v & 255];
const mStr = s => [...s].map(c => c.charCodeAt(0));
const mBox = (type, ...parts) => { const b = mp4Cat(parts); return mp4Cat([m32(b.length + 8), mStr(type), b]); };
const mFull = (type, flags, ...parts) => mBox(type, [0, flags >> 16 & 255, flags >> 8 & 255, flags & 255], ...parts);
const mZero = n => new Array(n).fill(0);
const MATRIX = [].concat(m32(0x10000), m32(0), m32(0), m32(0), m32(0x10000), m32(0), m32(0), m32(0), m32(0x40000000));

function muxMp4({samples, avcC, w, h, fps, mov}) {
  const n = samples.length;
  const stbl = off => mBox('stbl',
    mFull('stsd', 0, m32(1), mBox('avc1', mZero(6), m16(1), mZero(16), m16(w), m16(h), m32(0x480000), m32(0x480000), m32(0), m16(1), mZero(32), m16(0x18), [255, 255], mBox('avcC', avcC))),
    mFull('stts', 0, m32(1), m32(n), m32(1)),
    mFull('stss', 0, ...(() => { const k = []; samples.forEach((s, i) => s.key && k.push(i + 1)); return [m32(k.length), ...k.map(m32)]; })()),
    mFull('stsc', 0, m32(1), m32(1), m32(n), m32(1)),
    mFull('stsz', 0, m32(0), m32(n), ...samples.map(s => m32(s.data.length))),
    mFull('stco', 0, m32(1), m32(off)));
  const moov = off => mBox('moov',
    mFull('mvhd', 0, m32(0), m32(0), m32(1000), m32(Math.round(n / fps * 1000)), m32(0x10000), m16(0x100), mZero(10), MATRIX, mZero(24), m32(2)),
    mBox('trak',
      mFull('tkhd', 3, m32(0), m32(0), m32(1), m32(0), m32(Math.round(n / fps * 1000)), mZero(8), m16(0), m16(0), m16(0), m16(0), MATRIX, m32(w << 16), m32(h << 16)),
      mBox('mdia',
        mFull('mdhd', 0, m32(0), m32(0), m32(fps), m32(n), m16(0x55c4), m16(0)),
        mFull('hdlr', 0, m32(0), mStr('vide'), mZero(12), mStr('VideoHandler'), [0]),
        mBox('minf', mFull('vmhd', 1, mZero(8)), mBox('dinf', mFull('dref', 0, m32(1), mFull('url ', 1))), stbl(off)))));
  const ftyp = mov ? mBox('ftyp', mStr('qt  '), m32(0), mStr('qt  '))
                   : mBox('ftyp', mStr('isom'), m32(512), mStr('isom'), mStr('iso2'), mStr('avc1'), mStr('mp41'));
  const size = moov(0).length, off = ftyp.length + size + 8;
  const dataLen = samples.reduce((a, s) => a + s.data.length, 0);
  return new Blob([ftyp, moov(off), mp4Cat([m32(dataLen + 8), mStr('mdat')]), ...samples.map(s => s.data)], {type: mov ? 'video/quicktime' : 'video/mp4'});
}
