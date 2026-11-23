// Art drawn in code: stand-in photos, phones, hearts, stamps, badges, rings,
// underlines, strike-throughs and the halftone wipe.

function offscreen(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h); return c;
}

// ---- stand-in photos (flat illustrations) ----------------------------------
const PHOTOS = {
  cat: offscreen(600, 600, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#f3d9b8'); sky.addColorStop(1, '#e3b98c');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c98f5d'; g.fillRect(0, 430, w, 170);                     // a sofa
    g.fillStyle = '#e8892f';                                                  // body
    g.beginPath(); g.ellipse(330, 420, 190, 120, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(210, 300, 110, 100, 0, 0, 7); g.fill();          // head
    g.beginPath(); g.moveTo(120, 250); g.lineTo(140, 150); g.lineTo(200, 220); g.fill();
    g.beginPath(); g.moveTo(230, 210); g.lineTo(290, 150); g.lineTo(300, 250); g.fill();
    g.fillStyle = '#c86b1c';                                                  // stripes
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(300 + i * 55, 360, 14, 60, 0.2, 0, 7); g.fill(); }
    g.fillStyle = '#2a2a1f';
    g.beginPath(); g.ellipse(175, 300, 12, 18, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(245, 300, 12, 18, 0, 0, 7); g.fill();
    g.fillStyle = '#e9707a'; g.beginPath(); g.moveTo(200, 335); g.lineTo(220, 335); g.lineTo(210, 348); g.fill();
  }),
  friends: offscreen(600, 600, (g, w, h) => {
    g.fillStyle = '#7fb7c9'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5c9db3'; g.fillRect(0, 420, w, 180);
    const person = (x, shirt, hair, skin) => {
      g.fillStyle = shirt; g.beginPath(); g.ellipse(x, 560, 120, 170, 0, 0, 7); g.fill();
      g.fillStyle = skin; g.beginPath(); g.ellipse(x, 300, 80, 92, 0, 0, 7); g.fill();
      g.fillStyle = hair; g.beginPath(); g.ellipse(x, 250, 86, 56, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#2a2220'; g.beginPath(); g.arc(x - 26, 305, 8, 0, 7); g.arc(x + 26, 305, 8, 0, 7); g.fill();
      g.strokeStyle = '#2a2220'; g.lineWidth = 6; g.beginPath(); g.arc(x, 330, 26, 0.2, Math.PI - 0.2); g.stroke();
    };
    person(190, '#e2552f', '#3a2418', '#f1c49b'); person(410, '#f2c14e', '#1d1d24', '#c98c63');
  }),
  sunset: offscreen(600, 600, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, 380);
    sky.addColorStop(0, '#5b3fa6'); sky.addColorStop(0.55, '#e2552f'); sky.addColorStop(1, '#f6b04d');
    g.fillStyle = sky; g.fillRect(0, 0, w, 380);
    g.fillStyle = '#ffd979'; g.beginPath(); g.arc(300, 380, 110, Math.PI, 0); g.fill();
    g.fillStyle = '#2d3a6b'; g.fillRect(0, 380, w, 220);
    g.fillStyle = '#f6b04d';
    for (let i = 0; i < 6; i++) g.fillRect(220 - i * 6, 400 + i * 30, 160 + i * 12, 8);
  }),
};

// ---- a phone ---------------------------------------------------------------
// Draws the phone and calls screen(x, y, w, h) clipped to the screen.
function phone(x, y, w, screen) {
  const h = w * 2.12, r = w * 0.14, b = w * 0.035;
  card(x, y, w, h, { r, fill: '#1E1C1A' });
  ctx.save(); rrect(x + b, y + b, w - 2 * b, h - 2 * b, r - b); ctx.clip();
  ctx.fillStyle = '#F5F3EF'; ctx.fillRect(x + b, y + b, w - 2 * b, h - 2 * b);
  screen(x + b, y + b, w - 2 * b, h - 2 * b);
  ctx.restore();
  rrect(x + w / 2 - w * 0.16, y + b + 8, w * 0.32, w * 0.075, w * 0.04); ctx.fillStyle = '#1E1C1A'; ctx.fill();
  return h;
}

// ---- hearts, stamps, badges, rings, underlines --------------------------------
function heart(cx, cy, s, color, broken = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s / 40, s / 40);
  const shape = () => {
    ctx.beginPath(); ctx.moveTo(0, 14);
    ctx.bezierCurveTo(-34, -10, -18, -34, 0, -18);
    ctx.bezierCurveTo(18, -34, 34, -10, 0, 14); ctx.closePath();
  };
  if (broken <= 0) { shape(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke(); }
  else {
    for (const side of [-1, 1]) {           // two halves fall apart
      ctx.save(); ctx.translate(side * 10 * broken, 30 * broken * broken); ctx.rotate(side * 0.5 * broken);
      ctx.globalAlpha *= 1 - clamp((broken - 0.6) / 0.4);
      ctx.beginPath(); ctx.rect(side < 0 ? -40 : 0, -40, 40, 80); ctx.clip();
      shape(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

// Stamp: red Anton in a red box, landing from 1.75x and -18 deg to 1x and -6 deg.
function stamp(str, cx, cy, k, size = 52) {
  if (k < 0) return;
  const e = power4Out(clamp(k / 0.2));
  around(cx, cy, lerp(1.75, 1, e), lerp(-18, -6, e) * Math.PI / 180, clamp(k / 0.08), () => {
    ctx.font = `${size}px Anton`; const tw = ctx.measureText(str).width;
    ctx.lineWidth = 5; ctx.strokeStyle = C.red;
    ctx.strokeRect(cx - tw / 2 - 22, cy - size * 0.75, tw + 44, size * 1.5);
    text(str, cx, cy + size * 0.36, `${size}px Anton`, C.red, 'center');
  });
}

// "#N" badge: a red disc that spins in.
function badge(n, cx, cy, k) {
  if (k < 0) return;
  const e = backOut(clamp(k / 0.4), 1.8);
  around(cx, cy, e, (1 - clamp(k / 0.4)) * -2.5, 1, () => {
    ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 7); ctx.fillStyle = C.red; ctx.fill();
    text('#' + n, cx, cy + 15, '44px Anton', '#fff', 'center');
  });
}

// A hand-drawn red ring drawn round a box, k 0..1.
function ring(cx, cy, rx, ry, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath();
  const end = k * Math.PI * 2.15, n = 60;
  for (let i = 0; i <= n; i++) {
    const a = -2.2 + end * i / n, wob = 1 + 0.04 * Math.sin(i * 0.7) + 0.05 * (i / n);
    const px = cx + Math.cos(a) * rx * wob, py = cy + Math.sin(a) * ry * wob;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

// The red swash under a title, k 0..1.
function swash(x, y, w, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); const n = 40;
  for (let i = 0; i <= n * k; i++) {
    const u = i / n, px = x + w * u, py = y + Math.sin(u * Math.PI * 1.1) * -10 + u * 8;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

// A red strike drawn across, k 0..1.
function strike(x1, y1, x2, y2, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, k), lerp(y1, y2, k)); ctx.stroke(); ctx.restore();
}

// The halftone wipe: 13 x 23 ink dots grow from the centre out to 62 px, then
// shrink away; 0.9 s in all. Every dot is full size from 0.44 to 0.56 of the
// way through, so a scene swapped at t0 + 0.45 is never seen changing.
function halftoneWipe(t, t0) {
  const k = (t - t0) / 0.9;
  if (k <= 0 || k >= 1) return;
  ctx.fillStyle = C.ink;
  const cols = 13, rows = 23, cw = W / cols, ch = H / rows;
  const far = Math.hypot(W / 2, H / 2);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = (i + 0.5) * cw, y = (j + 0.5) * ch;
    const d = Math.hypot(x - W / 2, y - H / 2) / far;            // 0 centre .. 1 corner
    const local = clamp((k - d * 0.3) / 0.7);                      // later further out
    const r = 62 * clamp(1.6 * Math.sin(local * Math.PI));
    if (r > 0.5) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  }
}

// A short round ink line at angle a (radians), length len.
function inkLine(cx, cy, a, len, color = C.ink) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2);
  ctx.lineTo(cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2); ctx.stroke(); ctx.restore();
}
