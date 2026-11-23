// The "what if" look: deep teal night, cream and amber type, Anton titles, warm drawn props,
// and Snap - the host, a little walking box camera with one big lens eye.
// Everything here is drawn in code (no images needed).

const Q = { teal: '#1F4E5A', tealD: '#143640', cream: '#F2E6D0', amber: '#E3A04F', brown: '#3B2A1E', rust: '#C4553A', night: '#0B1220', skin: '#E9C29A', grey: '#9A8F80', wood: '#8A5A36' };

const poly = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
function fillStroke(fill, lw = 5, stroke = Q.brown) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
function bg(top, bottom) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function vignette(a = 0.45) { const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function bigTitle(l1, l2, cx, y, t0, t, size = 110) {
  const k = t - t0; if (k < 0) return;
  around(cx, y, slam(k), 0, clamp(k / 0.08), () => {
    text(l1, cx, y, `${size}px Anton`, Q.cream, 'center');
    if (l2) text(l2, cx, y + size * 1.08, `${size}px Anton`, Q.amber, 'center');
  });
}
function chip(str, x, y, k, bgc = Q.amber, fg = Q.brown, font = 'bold 30px JMono') {
  if (k < 0) return;
  ctx.font = font; const w = ctx.measureText(str).width + 44;
  around(x + w / 2, y, pop(k), -0.03, clamp(k / 0.1), () => { rrect(x, y - 30, w, 60, 30); ctx.fillStyle = bgc; ctx.fill(); text(str, x + w / 2, y + 11, font, fg, 'center'); });
}
function rstamp(str, cx, cy, k, size = 70, rot = -0.1) {
  if (k < 0) return;
  const e = power4Out(clamp(k / 0.2));
  around(cx, cy, lerp(1.7, 1, e), rot, clamp(k / 0.08), () => {
    ctx.font = `${size}px Anton`; const tw = ctx.measureText(str).width;
    ctx.lineWidth = 7; ctx.strokeStyle = Q.rust; ctx.strokeRect(cx - tw / 2 - 26, cy - size * 0.78, tw + 52, size * 1.5);
    text(str, cx, cy + size * 0.36, `${size}px Anton`, Q.rust, 'center');
  });
}
const STARS = (() => { const r = rng(4), s = []; for (let i = 0; i < 220; i++) s.push([r() * W, r() * H, r() * 2.2 + 0.4, r() * 6]); return s; })();
function starfield(t, a = 1) { for (const [x, y, s, ph] of STARS) { ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 1.5 + ph)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }

// Snap, the host: a little walking box camera with one big lens eye.
function snap(cx, cy, s, t, o = {}) {
  const walk = o.walk || 0, bob = walk ? Math.abs(Math.sin(t * 9)) * 10 : Math.sin(t * 2) * 3;
  ctx.save(); ctx.translate(cx, cy - bob * s); ctx.scale(s, s); if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = Q.brown;
  const lg = walk ? Math.sin(t * 9) * 16 : 0;
  ctx.beginPath(); ctx.moveTo(-30, 50); ctx.lineTo(-30 + lg, 112); ctx.moveTo(30, 50); ctx.lineTo(30 - lg, 112); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-44 + lg, 114); ctx.lineTo(-18 + lg, 114); ctx.moveTo(18 - lg, 114); ctx.lineTo(44 - lg, 114); ctx.stroke();
  const arm = o.wave ? Math.sin(t * 10) * 0.5 - 0.9 : 0.5;
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-80 - Math.cos(arm) * 40, Math.sin(arm) * 40); ctx.moveTo(80, 0); ctx.lineTo(118, 22); ctx.stroke();
  rrect(-48, -84, 44, 26, 6); fillStroke('#B9B2A6', 5);                         // flash
  rrect(-84, -60, 168, 118, 20); fillStroke('#D98E3A', 6);                      // body
  ctx.fillStyle = '#B7702A'; ctx.fillRect(-80, -8, 160, 10);
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); fillStroke('#2B2D32', 6);           // lens
  ctx.beginPath(); ctx.arc(0, 0, 27, 0, 7); ctx.fillStyle = '#3E4652'; ctx.fill();
  const blink = (t % 3.7) < 0.12 ? 0.15 : 1, look = o.look || 0;
  ctx.save(); ctx.translate(look * 8, (o.sad ? 5 : 0)); ctx.scale(1, blink);
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fillStyle = '#0D0F12'; ctx.fill();
  ctx.beginPath(); ctx.arc(-6, -7, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = Q.brown; ctx.beginPath();
  if (o.sad) ctx.arc(52, 40, 10, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(52, 30, 10, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  if (o.blush) { ctx.globalAlpha *= o.blush; ctx.fillStyle = '#E8607A'; ctx.beginPath(); ctx.ellipse(-60, 34, 16, 9, 0, 0, 7); ctx.ellipse(60, 34, 16, 9, 0, 0, 7); ctx.fill(); }
  ctx.restore();
}

// A simple sepia portrait face inside an oval.
function face(cx, cy, s, seed, blank = 0) {
  const r = rng(seed * 13 + 1), hairs = ['#3B2A1E', '#6B4A2E', '#9A8F80', '#2A2420', '#B98A55'];
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 90, 0, 0, 7); ctx.fillStyle = '#E7D6B8'; ctx.fill(); ctx.save(); ctx.clip();
  ctx.globalAlpha = 1 - blank;
  ctx.fillStyle = '#7A5F45'; ctx.beginPath(); ctx.ellipse(0, 110, 70, 50, 0, 0, 7); ctx.fill();          // shoulders
  ctx.fillStyle = '#D8B48C'; ctx.beginPath(); ctx.ellipse(0, -6, 34, 42, 0, 0, 7); ctx.fill();            // head
  ctx.fillStyle = hairs[Math.floor(r() * hairs.length)];
  if (r() < 0.5) { ctx.beginPath(); ctx.ellipse(0, -34, 38, 22, 0, Math.PI, 0); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(0, -20, 42, 40, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-42, -22, 14, 50); ctx.fillRect(28, -22, 14, 50); }
  ctx.fillStyle = '#2A2420'; ctx.beginPath(); ctx.arc(-12, -6, 3.5, 0, 7); ctx.arc(12, -6, 3.5, 0, 7); ctx.fill();
  if (r() < 0.4) { ctx.fillRect(-16, 12, 32, 6); }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (blank > 0.5) { ctx.globalAlpha = (blank - 0.5) * 2; text('?', 0, 26, '80px Anton', '#B9A88C', 'center'); ctx.globalAlpha = 1; }
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 90, 0, 0, 7); ctx.lineWidth = 12; ctx.strokeStyle = '#B7894A'; ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = Q.brown; ctx.beginPath(); ctx.ellipse(0, 0, 77, 97, 0, 0, 7); ctx.stroke();
  ctx.restore();
}

function person(cx, cy, s, col, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = Q.brown; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-50, 160); ctx.quadraticCurveTo(-56, 52, 0, 46); ctx.quadraticCurveTo(56, 52, 50, 160); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = o.skin || col; ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fill(); ctx.stroke();
  if (o.tophat) { ctx.fillStyle = '#1E1A18'; ctx.fillRect(-46, -40, 92, 10); ctx.fillRect(-30, -100, 60, 62); }
  if (o.beret) { ctx.fillStyle = Q.rust; ctx.beginPath(); ctx.ellipse(-6, -34, 44, 16, -0.2, 0, 7); ctx.fill(); }
  if (o.eyes) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-13, -2, o.wide ? 7 : 4, 0, 7); ctx.arc(13, -2, o.wide ? 7 : 4, 0, 7); ctx.fill(); }
  if (o.mirror) { ctx.fillStyle = '#C9CDD2'; ctx.beginPath(); ctx.arc(0, -36, 14, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// The X-ray hand: k = 0 skin, 1 bones.
const FINGERS = [[-58, -40, -0.32, 120], [-22, -70, -0.1, 150], [12, -76, 0.04, 160], [44, -66, 0.16, 145], [78, -10, 0.75, 110]];
function hand(cx, cy, s, k) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const skin = Q.skin;
  ctx.globalAlpha = 1 - k * 0.85;
  ctx.fillStyle = skin; ctx.strokeStyle = Q.brown; ctx.lineWidth = 5;
  rrect(-80, -60, 170, 190, 50); ctx.fill(); ctx.stroke();
  rrect(-50, 110, 110, 140, 30); ctx.fill(); ctx.stroke();
  for (const [x, y, a, len] of FINGERS) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rrect(-17, -len, 34, len + 20, 17); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.globalAlpha = k;
  ctx.strokeStyle = '#EAF4FF'; ctx.lineCap = 'round';
  for (const [x, y, a, len] of FINGERS) {
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x + Math.sin(a) * 6, y + 8); ctx.lineTo(x * 0.35, 128); ctx.stroke();       // metacarpal
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const l = (len - 24) / 3;
    for (let j = 0; j < 3; j++) { ctx.lineWidth = 11 - j * 2; ctx.beginPath(); ctx.moveTo(0, -4 - j * (l + 8)); ctx.lineTo(0, -4 - j * (l + 8) - l); ctx.stroke(); }
    ctx.restore();
  }
  ctx.fillStyle = '#EAF4FF'; for (const [x, y] of [[-30, 150], [0, 145], [30, 150], [-15, 175], [15, 175]]) { ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); }
  ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-25, 195); ctx.lineTo(-30, 260); ctx.moveTo(25, 195); ctx.lineTo(28, 260); ctx.stroke();
  ctx.globalAlpha = 1;
  // the wedding ring on the ring finger
  { const [x, y, a] = FINGERS[3]; ctx.save(); ctx.translate(x, y); ctx.rotate(a); rrect(-22, -38, 44, 18, 8); ctx.fillStyle = k > 0.5 ? '#FFE9B0' : '#D9A441'; ctx.fill(); ctx.restore(); }
  ctx.restore();
}

// A spiral galaxy made of dots.
function galaxy(cx, cy, r, tilt, rot, seed, a = 1) {
  const g = rng(seed);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, tilt); ctx.rotate(rot);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5); glow.addColorStop(0, `rgba(255,236,200,${0.9 * a})`); glow.addColorStop(1, 'rgba(255,236,200,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, 7); ctx.fill();
  for (let i = 0; i < 900; i++) {
    const arm = i % 2, u = g(), ang = u * 3.6 * Math.PI + arm * Math.PI, rr = u * r + (g() - 0.5) * r * 0.12;
    ctx.globalAlpha = a * (0.4 + g() * 0.6); ctx.fillStyle = g() < 0.3 ? '#BFD6FF' : '#FFF3DC';
    ctx.beginPath(); ctx.arc(Math.cos(ang) * rr, Math.sin(ang) * rr, 1 + g() * 2.2, 0, 7); ctx.fill();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}

function earth(cx, cy, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#2B6CB0'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.fillStyle = '#4E9A5A'; for (const [x, y, rx, ry] of [[-0.35, -0.2, 0.3, 0.22], [0.25, 0.15, 0.25, 0.3], [-0.1, 0.45, 0.2, 0.12]]) { ctx.beginPath(); ctx.ellipse(cx + x * r, cy + y * r, rx * r, ry * r, 0.4, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y, rx, ry] of [[-0.1, -0.5, 0.5, 0.08], [0.3, -0.05, 0.4, 0.07], [-0.4, 0.25, 0.35, 0.06]]) { ctx.beginPath(); ctx.ellipse(cx + x * r, cy + y * r, rx * r, ry * r, -0.2, 0, 7); ctx.fill(); }
  const sh = ctx.createLinearGradient(cx - r, cy, cx + r, cy); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.55, 'rgba(0,0,0,0.1)'); sh.addColorStop(0.75, 'rgba(0,0,0,0.85)'); sh.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
}

// The shutter cut: an iris closes to black and opens again; the scene swaps in the middle.
function shutter(t, t0) {
  const k = (t - t0) / 0.5; if (k <= 0 || k >= 1) return;
  const open = Math.abs(1 - 2 * k), R = Math.hypot(W, H) / 2 * smooth(open);
  ctx.save(); ctx.fillStyle = '#0A0806'; ctx.beginPath(); ctx.rect(0, 0, W, H);
  const rot = k * 1.2;
  for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3, x = W / 2 + Math.cos(a) * R, y = H / 2 + Math.sin(a) * R; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); ctx.fill('evenodd');
  ctx.strokeStyle = '#2A2420'; ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * R, H / 2 + Math.sin(a) * R); ctx.lineTo(W / 2 + Math.cos(a + 1.3) * W, H / 2 + Math.sin(a + 1.3) * W); ctx.stroke(); }
  ctx.restore();
}


// ---- more drawings: speech bubble, mood face, brain, polaroid -------------------
function bubble(cx, cy, w, h, k, draw) {
  if (k < 0) return;
  around(cx, cy, pop(k), 0, clamp(k / 0.1), () => {
    ctx.beginPath(); ctx.moveTo(cx - 20, cy + h / 2 - 4); ctx.lineTo(cx - 40, cy + h / 2 + 50); ctx.lineTo(cx + 20, cy + h / 2 - 4); ctx.closePath(); fillStroke('#FFF6E5', 5);
    rrect(cx - w / 2, cy - h / 2, w, h, 40); fillStroke('#FFF6E5', 5);
    ctx.fillStyle = '#FFF6E5'; ctx.fillRect(cx - 18, cy + h / 2 - 8, 36, 12);
    draw();
  });
}
function moodFace(cx, cy, mood) {
  ctx.beginPath(); ctx.arc(cx, cy, 58, 0, 7); fillStroke(mood === 'angry' ? '#E07A5F' : '#F2C38A', 5);
  ctx.fillStyle = Q.brown; ctx.beginPath(); ctx.arc(cx - 20, cy - 6, 6, 0, 7); ctx.arc(cx + 20, cy - 6, 6, 0, 7); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = Q.brown; ctx.lineCap = 'round';
  if (mood === 'angry') { ctx.beginPath(); ctx.moveTo(cx - 34, cy - 30); ctx.lineTo(cx - 8, cy - 18); ctx.moveTo(cx + 34, cy - 30); ctx.lineTo(cx + 8, cy - 18); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + 34, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  else { ctx.fillStyle = '#E8607A'; ctx.beginPath(); ctx.ellipse(cx - 32, cy + 14, 12, 7, 0, 0, 7); ctx.ellipse(cx + 32, cy + 14, 12, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 14, cy + 28); ctx.lineTo(cx + 14, cy + 28); ctx.stroke(); ctx.fillStyle = '#7FC8F0'; ctx.beginPath(); ctx.ellipse(cx + 50, cy - 30, 8, 12, 0, 0, 7); ctx.fill(); }
}
function brain(cx, cy, s, glow) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 330); g.addColorStop(0, `rgba(255,214,120,${0.55 * glow})`); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); ctx.fill(); }
  ctx.beginPath();
  const lobes = [[-120, -40, 90], [-50, -110, 90], [50, -110, 90], [120, -40, 90], [90, 60, 80], [-10, 70, 85], [-100, 50, 80]];
  for (const [x, y, r] of lobes) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); }
  ctx.fillStyle = '#F0A8B8'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = '#B5617A'; ctx.lineCap = 'round';
  for (const [x, y, r] of lobes) { ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0.3, 2.4); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, -190); ctx.bezierCurveTo(-20, -80, 20, 0, 0, 130); ctx.stroke();
  ctx.restore();
}
function polaroid(x, y, rot, i, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#F7F1E6'; ctx.fillRect(-60, -70, 120, 140);
  ctx.fillStyle = ['#7FA8C9', '#D9A066', '#9AB87A', '#C98A8A', '#B9A3D6', '#E3C27A'][i % 6]; ctx.fillRect(-50, -60, 100, 96);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(-60, -70, 120, 140);
  ctx.restore();
}



// The product moment (mid-video, icon only, one line): a rounded icon, a name and a tagline.
// icon: an Image (IMG.icon) or null for a placeholder. Keep it to ~4 s; no gameplay, no screenshots.
function productMoment(t, t0, name, tagline, icon = null) {
  const k = t - t0; if (k < 0) return;
  around(W / 2, 760, pop(k), 0, clamp(k / 0.1), () => {
    ctx.save(); ctx.shadowColor = 'rgba(227,160,79,0.5)'; ctx.shadowBlur = 70; rrect(390, 610, 300, 300, 70); ctx.fillStyle = Q.amber; ctx.fill(); ctx.restore();
    if (icon) imageCover(icon, 390, 610, 300, 300, 70);
    else text(name[0], W / 2, 830, '200px Anton', Q.brown, 'center');
  });
  if (k >= 0.25) around(W / 2, 1010, pop(k - 0.25), 0, 1, () => text(name, W / 2, 1040, '96px Anton', Q.cream, 'center'));
  if (k >= 0.5) around(W / 2, 1120, pop(k - 0.5), 0, 1, () => text(tagline, W / 2, 1140, 'italic 64px ISerif', Q.amber, 'center'));
}
