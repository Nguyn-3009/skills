// Core: the canvas, colours, easing, word times and drawing primitives.
// Every frame is a pure function of time t (seconds): no state carried between frames,
// so any frame can be drawn on its own and every render is identical.

const W = 1080, H = 1920, FPS = 30;
const C = {
  paper: '#EBE7E1', ink: '#1E1C1A', red: '#D7372C', grey: '#8A857E',
  card: '#FBFAF8', light: '#B5AFA7', outline: '#3B2418',
};
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---- easing --------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, t0, dur) => clamp((t - t0) / dur);
const backOut = (k, s = 2.2) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const power3Out = k => 1 - Math.pow(1 - k, 3);
const power4Out = k => 1 - Math.pow(1 - k, 4);
const smooth = k => k * k * (3 - 2 * k);
const smoother = k => k * k * k * (k * (k * 6 - 15) + 10);

// A seeded random, so every render is the same.
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// ---- word times ------------------------------------------------------------
// data.js (made by the voiceover skill) sets window.DATA; without a voice it is empty.
const VO = window.DATA || { words: [], lines: [], duration: 0 };
const WORDS = VO.words;
const clean = w => w.toLowerCase().replace(/[^a-z']/g, '');
const lineWords = li => WORDS.filter(w => w.line === li);
const LS = li => lineWords(li)[0].start;               // a line's first word
const LE = li => { const ws = lineWords(li); return ws[ws.length - 1].end; };
// The start of the nth time `word` is said in line li.
function WT(li, word, n = 1) {
  const hits = lineWords(li).filter(w => clean(w.w) === clean(word));
  if (!hits[n - 1]) throw new Error(`no "${word}" #${n} in line ${li}`);
  return hits[n - 1].start;
}
const VOICE_END = WORDS.length ? WORDS[WORDS.length - 1].end : 0;

// ---- primitives ------------------------------------------------------------
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The halftone dot pattern for card shadows: 1.7 px ink dots on an 8 px grid.
const dotTile = document.createElement('canvas');
dotTile.width = dotTile.height = 8;
{ const d = dotTile.getContext('2d'); d.fillStyle = C.ink; d.beginPath(); d.arc(4, 4, 1.7, 0, 7); d.fill(); }
let dotPattern = null;

// A card: halftone shadow (13 left, 12 down), off-white, 3 px ink border.
function card(x, y, w, h, opts = {}) {
  const r = opts.r ?? 20;
  if (opts.shadow !== false) {
    dotPattern = dotPattern || ctx.createPattern(dotTile, 'repeat');
    ctx.save(); rrect(x - 13, y + 12, w, h, r); ctx.clip();
    ctx.fillStyle = dotPattern; ctx.fillRect(x - 13, y + 12, w, h); ctx.restore();
  }
  rrect(x, y, w, h, r); ctx.fillStyle = opts.fill || C.card; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
}

// Draw `fn` scaled about (cx, cy) by s, rotated by rot, faded by alpha.
function around(cx, cy, s, rot, alpha, fn) {
  if (s <= 0.001 || alpha <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy); ctx.rotate(rot || 0); ctx.scale(s, s); ctx.translate(-cx, -cy);
  fn(); ctx.restore();
}

// Motions (k = seconds since the motion began).
const pop = k => k < 0 ? 0 : lerp(0.55, 1, backOut(clamp(k / 0.34)));          // scale
const rise = k => k < 0 ? null : { dy: 70 * (1 - power3Out(clamp(k / 0.4))), a: clamp(k / 0.25) };
const slam = k => k < 0 ? 0 : lerp(1.22, 1, power4Out(clamp(k / 0.24)));
function exitUp(k) { return k < 0 ? { dy: 0, a: 1 } : { dy: -50 * power3Out(clamp(k / 0.22)), a: 1 - clamp(k / 0.22) }; }

function text(str, x, y, font, color, align = 'left', base = 'alphabetic') {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillText(str, x, y);
}

// An image fitted (cover) into a rounded box.
function imageCover(img, x, y, w, h, r = 0) {
  const iw = img.width, ih = img.height, s = Math.max(w / iw, h / ih);
  const sw = w / s, sh = h / s;
  ctx.save(); if (r) { rrect(x, y, w, h, r); ctx.clip(); }
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  ctx.restore();
}

// Paper with fine grain (fixed, so it never flickers).
const grain = document.createElement('canvas');
grain.width = 540; grain.height = 960;
{
  const g = grain.getContext('2d'), im = g.createImageData(540, 960), r = rng(7);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
    im.data[i + 3] = Math.floor(r() * 16);
  }
  g.putImageData(im, 0, 0);
}
function paper() {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(grain, 0, 0, W, H);
}
