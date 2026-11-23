// Shared scene pieces: screen recordings, header, title, checklist rows, photo cards.

// Screen recordings as frames (rec/<name>/0001.jpg ...), listed in data.js under
// DATA.recordings (see SKILL.md) and loaded by main.js. recFrame() returns null when absent,
// so scenes can fall back to drawn stand-ins.
const REC = {};

function recFrame(name, k) {
  // The frame of recording `name` k seconds in (held on the last frame).
  const r = REC[name];
  if (!r || !r.frames.length) return null;
  let rt = k;                                      // seconds into the clip
  if (r.map) {
    const m = r.map; rt = m[m.length - 1][1];
    for (let j = 0; j < m.length - 1; j++) if (k < m[j + 1][0]) { rt = lerp(m[j][1], m[j + 1][1], clamp((k - m[j][0]) / (m[j + 1][0] - m[j][0]))); break; }
    if (k < m[0][0]) rt = m[0][1];
  }
  const i = clamp(Math.floor(rt * r.fps), 0, r.frames.length - 1);
  return r.frames[i];
}

// ---- shared bits -----------------------------------------------------------
const TITLE_Y = 610;

function header(left, num, total, label) {
  text(left, 72, 132, '25px JMono', C.grey);
  ctx.font = '25px JMono'; const tail = ` / ${total}`; const tw = ctx.measureText(tail).width;
  text(tail, 1008, 132, '25px JMono', C.grey, 'right');
  ctx.font = 'bold 25px JMono'; const nw = ctx.measureText(String(num)).width;
  text(String(num), 1008 - tw, 132, 'bold 25px JMono', C.red, 'right');
  text(label + ' ', 1008 - tw - nw, 132, '25px JMono', C.grey, 'right');
}

// Title: first word ink, second red, slammed in at t0, red swash 0.12 s later.
function title(w1, w2, t0, t, size = 150) {
  const k = t - t0;
  if (k < 0) return;
  let fs = size;
  ctx.font = `${fs}px Anton`;
  let tw = ctx.measureText(w1 + ' ' + w2).width;
  if (tw > 880) { fs = Math.floor(fs * 880 / tw); ctx.font = `${fs}px Anton`; tw = ctx.measureText(w1 + ' ' + w2).width; }
  const x = 110, w1w = ctx.measureText(w1 + ' ').width;
  around(x + tw / 2, TITLE_Y - fs * 0.35, slam(k), 0, clamp(k / 0.06), () => {
    text(w1, x, TITLE_Y, `${fs}px Anton`, C.ink);
    text(w2, x + w1w, TITLE_Y, `${fs}px Anton`, C.red);
  });
  swash(x + w1w, TITLE_Y + 34, tw - w1w, clamp((k - 0.12) / 0.35));
  return x + tw;
}

function checkRow(label, x, y, tOn, t) {
  const done = t >= tOn;
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink;
  rrect(x, y - 30, 40, 40, 8); ctx.stroke();
  if (done) {
    const k = clamp((t - tOn) / 0.18);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(x + 8, y - 10);
    if (k < 0.4) ctx.lineTo(x + 8 + 10 * k / 0.4, y - 10 + 10 * k / 0.4);
    else { ctx.lineTo(x + 18, y); ctx.lineTo(x + 18 + 20 * (k - 0.4) / 0.6, y - 26 * (k - 0.4) / 0.6); }
    ctx.stroke(); ctx.restore();
  }
  text(label, x + 60, y, '500 38px ISans', done ? C.ink : C.light);
}

function photoCard(img, label, x, y, s, k, alt = null, altK = 0) {
  if (k < 0) return;
  around(x + s / 2, y + s / 2, pop(k), 0, clamp(k / 0.12), () => {
    card(x, y, s, s + 46);
    imageCover(img, x + 10, y + 10, s - 20, s - 20, 12);
    if (alt && altK > 0) {                       // a second image ("after") wipes in over the first
      ctx.save(); ctx.beginPath(); ctx.rect(x + 10, y + 10, (s - 20) * altK, s - 20); ctx.clip();
      imageCover(alt, x + 10, y + 10, s - 20, s - 20, 12); ctx.restore();
    }
    text(label, x + 18, y + s + 28, '22px JMono', C.grey);
  });
}

