// The pastel gameplay-ad kit: lavender -> peach background with soft bokeh, white rounded cards,
// Poppins titles with emoji (white outline, gradient fill), a tapping 👆 hand with ripples,
// floating praise ("Nice!"), confetti, card flips and flashes, a before ➜ after board,
// and the "LINK IN BIO" ending. No voice: titles carry the story, sounds carry the energy.

const EMO = '"Noto Color Emoji"';
const NAVY = '#2B2350';
const GRAD = { pink: ['#FF4F8B', '#FF8A3D'], purple: ['#8A5CF6', '#6D4AE8'], teal: ['#14B8A6', '#22C55E'], blue: ['#3B82F6', '#6366F1'] };

// ---- background ------------------------------------------------------------------------------
const BOKEH = (() => { const r = rng(11), out = []; for (let i = 0; i < 12; i++) out.push([r() * W, r() * H, 60 + r() * 110, r() * 6, r() < 0.5 ? '255,170,205' : '200,180,255']); return out; })();
function pastel(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F2E4FE'); g.addColorStop(0.5, '#FBE3F0'); g.addColorStop(1, '#FEE8D6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, ph, c] of BOKEH) { ctx.fillStyle = `rgba(${c},0.22)`; ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.4 + ph) * 30, y + Math.cos(t * 0.3 + ph) * 40, r, 0, 7); ctx.fill(); }
}

// ---- type ---------------------------------------------------------------------------------------
function fitSize(str, weight, size, maxW) { ctx.font = `${weight} ${size}px Poppins, ${EMO}`; const w = ctx.measureText(str).width; return w > maxW ? size * maxW / w : size; }
// One title line. fill: a colour or a [from, to] gradient. Emoji keep their own colours.
function tline(str, cx, y, size, fill, weight = 800, outline = true) {
  size = fitSize(str, weight, size, 980);
  ctx.font = `${weight} ${size}px Poppins, ${EMO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width;
  if (outline) { ctx.save(); ctx.shadowColor = 'rgba(110,60,160,0.28)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#fff'; ctx.strokeText(str, cx, y); ctx.restore(); }
  if (Array.isArray(fill)) { const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]); ctx.fillStyle = g; } else ctx.fillStyle = fill;
  ctx.fillText(str, cx, y);
}
// Titles at the top: [t0, t1, line1, line2?, fill2?, fill1?]. Pop in at t0, shrink out at t1.
// With two lines: a small navy line over a big gradient one. One line: big gradient.
function titles(t, list) {
  for (const [t0, t1, l1, l2, f2, f1] of list) {
    if (t < t0 || t > t1 + 0.25) continue;
    const kout = clamp((t - t1) / 0.2), s = pop(t - t0) * (1 - 0.4 * kout);
    around(W / 2, 200, s, 0, 1 - kout, () => {
      if (l2) { tline(l1, W / 2, 175, 60, f1 || NAVY); tline(l2, W / 2, 275, 92, f2 || GRAD.pink, 900); }
      else tline(l1, W / 2, 245, 96, f1 || GRAD.pink, 900);
    });
  }
}

// ---- cards --------------------------------------------------------------------------------------
const CARD = { x: 90, y: 330, w: 900, h: 1180, r: 48 };          // the big centre card
function whiteCard(x, y, w, h, r = 48, fill = '#fff') {
  ctx.save(); ctx.shadowColor = 'rgba(120,70,150,0.20)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
  rrect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}
// Card flip over dur seconds: drawA until halfway, then drawB, with a horizontal squash.
function flip(t, t0, dur, drawA, drawB, cx = W / 2) {
  const k = clamp((t - t0) / dur), sx = Math.abs(Math.cos(Math.PI * k));
  ctx.save(); ctx.translate(cx, 0); ctx.scale(Math.max(0.02, sx), 1); ctx.translate(-cx, 0); (k < 0.5 ? drawA : drawB)(); ctx.restore();
}
// A white flash over a rect (a camera snap, a reveal).
function flash(t, at, rect = CARD) { const f = t - at; if (f >= 0 && f < 0.35) { ctx.save(); ctx.fillStyle = `rgba(255,255,255,${0.95 * (1 - f / 0.35)})`; rrect(rect.x, rect.y, rect.w, rect.h, rect.r || 0); ctx.fill(); ctx.restore(); } }
// A sideways shake for a wrong answer: offset in px, k = seconds since.
const shake = k => (k >= 0 && k < 0.4) ? Math.sin(k * 60) * 18 * (1 - k / 0.4) : 0;

// ---- the hand -----------------------------------------------------------------------------------
// fillStyle must be opaque: Chrome draws colour emoji with the current fill alpha.
function hand(x, y, press = 0, a = 1) {
  if (a <= 0) return;
  around(x, y, 1 - 0.12 * press, -0.25, a, () => {
    ctx.font = `130px ${EMO}`; ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; ctx.fillText('👆', x + 8, y - 12); ctx.restore();
  });
}
function ripple(x, y, k) { if (k < 0 || k > 0.5) return; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k / 0.5)})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, y, 20 + 110 * power3Out(k / 0.5), 0, 7); ctx.stroke(); ctx.restore(); }
// A hand that enters at tIn, glides to each tap [t, x, y], presses, and leaves after tOut.
function handPath(t, taps, tIn, tOut) {
  if (t < tIn || t > tOut + 0.3) return;
  let x = taps[0][1], y = taps[0][2] + 200 * (1 - power3Out(clamp((t - tIn) / 0.35))), press = 0;
  for (let i = 0; i < taps.length; i++) {
    const [tt, tx, ty] = taps[i];
    if (t >= tt - 0.3) {
      const k = power3Out(clamp((t - (tt - 0.3)) / 0.25));
      x = lerp(i ? taps[i - 1][1] : x, tx, k); y = lerp(i ? taps[i - 1][2] : y, ty, k);
    }
    const d = t - tt; if (d >= -0.06 && d < 0.12) press = 1 - Math.abs(d - 0.03) / 0.09;
    ripple(tx, ty, t - tt);
  }
  hand(x, y, clamp(press), 1 - clamp((t - tOut) / 0.3));
}

// ---- praise, confetti, marks -------------------------------------------------------------------------
function floater(str, x, y, k, fill = GRAD.purple) {
  if (k < 0 || k > 0.9) return;
  const yy = y - 60 * power3Out(clamp(k / 0.9));
  around(x, yy, pop(k), -0.08, 1 - clamp((k - 0.6) / 0.3), () => tline(str, x, yy, 70, fill, 900));
}
const CONF = (() => { const r = rng(5), cols = ['#FF4F8B', '#FFC93C', '#7B5CF0', '#22C3A6', '#3B82F6', '#FF8A3D'], o = []; for (let i = 0; i < 90; i++) o.push([r() * W, -r() * 300, (r() - 0.5) * 300, 300 + r() * 500, r() * 6, cols[i % cols.length], 10 + r() * 14]); return o; })();
function confetti(t, t0) {
  const k = t - t0; if (k < 0 || k > 2.6) return;
  for (const [x, y, vx, vy, sp, c, s] of CONF) {
    const px = x + vx * k, py = y + vy * k + 240 * k * k; if (py > H) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(sp + k * 6); ctx.globalAlpha = 1 - clamp((k - 2) / 0.6); ctx.fillStyle = c; ctx.fillRect(-s / 2, -s / 4, s, s / 2); ctx.restore();
  }
}
// A round badge with ✓ or ✗ popping in; it fades after `hold` seconds (Infinity = stays).
function mark(ok, x, y, k, r = 46, hold = 0.9) {
  if (k < 0 || k > hold + 0.3) return;
  around(x, y, pop(k), 0, 1 - clamp((k - hold) / 0.3), () => {
    ctx.fillStyle = ok ? '#22C55E' : '#EF4444'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    if (ok) { ctx.moveTo(x - r * 0.42, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.34); ctx.lineTo(x + r * 0.45, y - r * 0.3); }
    else { ctx.moveTo(x - r * 0.35, y - r * 0.35); ctx.lineTo(x + r * 0.35, y + r * 0.35); ctx.moveTo(x + r * 0.35, y - r * 0.35); ctx.lineTo(x - r * 0.35, y + r * 0.35); }
    ctx.stroke();
  });
}
// A countdown ring (3-2-1): n seconds from t0.
function timerRing(t, t0, n, x, y, r = 50) {
  const k = t - t0; if (k < 0 || k > n + 0.3) return;
  const left = Math.max(0, n - k);
  ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(120,70,150,0.2)'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#FF4F8B'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r - 10, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * left / n); ctx.stroke();
  text(String(Math.ceil(left) || '✓'), x, y + 16, `800 46px Poppins, ${EMO}`, NAVY, 'center');
}

// ---- before ➜ after -------------------------------------------------------------------------------
// Two rows: [drawBefore(x, y, w, h), drawAfter(x, y, w, h), aspect h/w], popping in from t0.
function beforeAfter(t, t0, rows, y0 = 380, gap = 650) {
  rows.forEach(([drawA, drawB, asp], j) => {
    const k1 = t - t0 - j * 0.45, k2 = k1 - 0.25, k3 = k1 - 0.45;
    const pw = 320, ph = pw * asp, qw = 400, qh = qw * asp, cy = y0 + j * gap + qh / 2;
    if (k1 >= 0) around(70 + pw / 2 + 20, cy, pop(k1), -0.06, 1, () => { whiteCard(70, cy - ph / 2 - 20, pw + 40, ph + 40, 26); ctx.save(); rrect(90, cy - ph / 2, pw, ph, 14); ctx.clip(); drawA(90, cy - ph / 2, pw, ph); ctx.restore(); });
    if (k2 >= 0) around(500, cy, pop(k2), 0, 1, () => tline('➜', 500, cy + 40, 110, GRAD.pink, 900));
    if (k3 >= 0) around(600 + qw / 2, cy, pop(k3), 0.05, 1, () => { whiteCard(580, cy - qh / 2 - 20, qw + 40, qh + 40, 26); ctx.save(); rrect(600, cy - qh / 2, qw, qh, 14); ctx.clip(); drawB(600, cy - qh / 2, qw, qh, k3); ctx.restore(); });
  });
}

// ---- the ending ------------------------------------------------------------------------------------
// Two tilted cards with a "+" between (drawLeft/drawRight(x, y, w, h)), popping in at t0.
function plusCards(t, t0, drawLeft, drawRight) {
  const k1 = t - t0, k2 = k1 - 0.2, k3 = k1 - 0.4;
  if (k1 >= 0) around(330, 610, pop(k1), -0.09, 1, () => { whiteCard(150, 430, 360, 360, 30); ctx.save(); rrect(166, 446, 328, 328, 18); ctx.clip(); drawLeft(166, 446, 328, 328); ctx.restore(); });
  if (k2 >= 0) around(750, 600, pop(k2), 0.07, 1, () => { whiteCard(570, 420, 360, 360, 30); ctx.save(); rrect(586, 436, 328, 328, 18); ctx.clip(); drawRight(586, 436, 328, 328); ctx.restore(); });
  if (k3 >= 0) around(540, 610, pop(k3), 0, 1, () => { ctx.fillStyle = '#FF4F8B'; ctx.beginPath(); ctx.arc(540, 610, 48, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(518, 610); ctx.lineTo(562, 610); ctx.moveTo(540, 588); ctx.lineTo(540, 632); ctx.stroke(); });
}
// App row: icon (Image or null = placeholder letter), name, FREE badge, platform.
function appRow(t, t0, name, platform = 'on iPhone', icon = null, y = 1060) {
  const k = t - t0; if (k < 0) return;
  around(540, y + 60, pop(k), 0, 1, () => {
    ctx.save(); ctx.shadowColor = 'rgba(123,92,240,0.35)'; ctx.shadowBlur = 30; rrect(250, y, 120, 120, 28);
    const g = ctx.createLinearGradient(250, y, 370, y + 120); g.addColorStop(0, '#8A5CF6'); g.addColorStop(1, '#FF4F8B'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    if (icon) imageCover(icon, 250, y, 120, 120, 28); else text(name[0], 310, y + 86, '900 76px Poppins', '#fff', 'center');
    text(name, 395, y + 52, '800 56px Poppins', NAVY);
    rrect(395, y + 70, 120, 48, 24); ctx.fillStyle = '#22C55E'; ctx.fill(); text('FREE', 455, y + 105, '800 30px Poppins', '#fff', 'center');
    text(platform, 530, y + 105, '600 30px Poppins', '#6B6390');
  });
}
// The big pulsing button, tapped at each of taps (seconds); a shine sweeps across it.
function linkButton(t, t0, taps, label = 'LINK IN BIO 🔗', y = 1230) {
  const k = t - t0; if (k < 0) return;
  let press = 0; for (const tt of taps) { const d = t - tt; if (d >= -0.05 && d < 0.15) press = 1; }
  around(540, y + 80, pop(k) * (1 + 0.04 * Math.sin(k * 7)) * (press ? 0.93 : 1), 0, 1, () => {
    ctx.save(); ctx.shadowColor = 'rgba(255,79,139,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 10; rrect(170, y, 740, 160, 80);
    const g = ctx.createLinearGradient(170, 0, 910, 0); g.addColorStop(0, '#FF4F8B'); g.addColorStop(1, '#FF8A3D'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.save(); rrect(170, y, 740, 160, 80); ctx.clip(); const sx = 170 + (k % 1.6) / 1.6 * 1300 - 200; const sg = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.45)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(170, y, 740, 160); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(150,30,60,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; tline(label, 540, y + 106, 76, '#FFFFFF', 900, false); ctx.restore();
  });
}
// 👇 bouncing toward the username, bottom left of a Reel / Short / TikTok.
function pointToName(t, t0, label = 'tap my name') {
  const k = t - t0; if (k < 0) return;
  const bob = Math.sin(k * 8) * 14;
  around(150, 1640, pop(k), 0, 1, () => { ctx.font = `110px ${EMO}`; ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('👇', 150, 1620 + bob); tline(label, 330, 1650, 50, NAVY, 800); });
}
