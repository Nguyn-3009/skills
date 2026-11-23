// Word-timed captions: each word appears on the frame it is spoken; one key word per line
// is highlighted. Long lines show one chunk (at most CAPTION.rows rows) at a time.
// Needs data.js (window.DATA from voiceover/tools/prep.py) and core.js.
//   CAPTION.keys = ['honey', 'tombs', ...]   // one key word per line (or '' for none)
//   in your scene's overlay: captions(t)

const CAPTION = {
  style: 'pill',          // 'pill': centred on a dark pill (Shorts look) | 'plain': left-aligned ink text (explainer look)
  x: W / 2, y: 1450,      // pill: centre x, baseline of the last row; plain: left x, baseline of the first row
  w: 880, size: 56, rows: 2,
  font: 'ISans', keyFont: 'ISerif',
  ink: '#FFF6E5', keyInk: '#E3A04F', dim: '#786E64', pill: '#120C08', pillAlpha: 0.62,
  keys: [],
  hold: 0.8,              // seconds a line stays after its last word
};

const _CHUNKS = {};
function _capFont(isKey) { const c = CAPTION; return isKey ? `italic ${Math.round(c.size * 1.18)}px ${c.keyFont}` : `500 ${c.size}px ${c.font}`; }
function _capRows(ws, li) {
  const rows = [[]]; let x = 0;
  for (const w of ws) {
    ctx.font = _capFont(clean(w.w) === CAPTION.keys[li]);
    const ww = ctx.measureText(w.w).width, sp = ctx.measureText(' ').width;
    if (x > 0 && x + ww > CAPTION.w) { rows.push([]); x = 0; }
    rows[rows.length - 1].push(w); x += ww + sp;
  }
  return rows;
}
// split a line into chunks of at most CAPTION.rows rows, preferring to break after punctuation
function _capChunks(li) {
  if (_CHUNKS[li]) return _CHUNKS[li];
  const words = lineWords(li), out = []; let cur = [];
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const next = words[i + 1]; if (!next) break;
    if (_capRows([...cur, next], li).length > CAPTION.rows) {
      let cut = cur.length;
      for (let j = cur.length - 1; j >= Math.ceil(cur.length / 2); j--) if (/[,.?!:]$/.test(cur[j].w)) { cut = j + 1; break; }
      out.push(cur.slice(0, cut)); cur = cur.slice(cut);
    }
  }
  if (cur.length) out.push(cur);
  return (_CHUNKS[li] = out);
}

function captions(t) {
  const c = CAPTION; let li = -1;
  for (let i = 0; i < VO.lines.length; i++) if (t >= LS(i) - 0.02) li = i;
  if (li < 0 || t > LE(li) + c.hold) return;
  let ws = _capChunks(li)[0];
  for (const ch of _capChunks(li)) if (t >= ch[0].start - 0.02) ws = ch;
  const rows = _capRows(ws, li), lh = c.size * 1.25;
  const y0 = c.style === 'pill' ? c.y - (rows.length - 1) * lh : c.y;
  const widthOf = r => { let s = 0; ctx.font = _capFont(false); const sp = ctx.measureText(' ').width; r.forEach((w, i) => { ctx.font = _capFont(clean(w.w) === c.keys[li]); s += ctx.measureText(w.w).width + (i ? sp : 0); }); return s; };
  if (c.style === 'pill') {
    const maxw = Math.max(...rows.map(widthOf));
    ctx.save(); ctx.globalAlpha = c.pillAlpha; rrect(c.x - maxw / 2 - 34, y0 - c.size - 18, maxw + 68, rows.length * lh + 30, 26); ctx.fillStyle = c.pill; ctx.fill(); ctx.restore();
  }
  rows.forEach((r, ri) => {
    ctx.font = _capFont(false); const sp = ctx.measureText(' ').width;
    let x = c.style === 'pill' ? c.x - widthOf(r) / 2 : c.x;
    for (const w of r) {
      const isKey = clean(w.w) === c.keys[li];
      ctx.font = _capFont(isKey); const ww = ctx.measureText(w.w).width;
      if (t >= w.start) {
        const k = clamp((t - w.start) / 0.2), hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
        const from = hex(c.dim), to = hex(isKey ? c.keyInk : c.ink);
        ctx.fillStyle = `rgb(${from.map((v, j) => Math.round(lerp(v, to[j], k)))})`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(w.w, x, y0 + ri * lh);
      }
      x += ww + sp;
    }
  });
}
