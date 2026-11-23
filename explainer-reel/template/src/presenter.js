// The presenter: an original cartoon guy (glasses, teal hoodie), bottom
// right, cropped at the chest. He talks the whole time: the mouth follows the
// voice's loudness, he blinks, sways, nods on key words and raises a hand.

const P = {
  skin: '#F2C29B', skinShade: '#E2A87E', hair: '#2B1F1A', hoodie: '#2E5E5A',
  hoodieShade: '#244B48', string: '#D7372C', line: C.outline, lw: 6,
  hx: 840, hy: 1415,                        // head centre
};

// Blinks: 0.14 s every 2.4-4.2 s, on a fixed seed.
const BLINKS = (() => { const r = rng(11), out = []; let t = 1.2; while (t < 60) { out.push(t); t += 2.4 + r() * 1.8; } return out; })();
const blinking = t => BLINKS.some(b => t >= b && t < b + 0.14);

function mouthAt(t) {
  const m = VO.mouth || [], i = Math.floor(t * FPS);
  return i >= 0 && i < m.length ? m[i] : 0;
}

// Set by main.js: [{t, kind: 'point' | 'palm'}], [key word times]
let HAND_EVENTS = [], NODS = [];

function handLift(t) {
  // 0..1 lift of the hand, and which kind, for the event playing now.
  for (const e of HAND_EVENTS) {
    const k = t - e.t, dur = 1.7;
    if (k >= 0 && k < dur + 0.3) {
      const up = backOut(clamp(k / 0.35), 1.6), down = clamp((k - dur) / 0.3);
      return { lift: up * (1 - smooth(down)), kind: e.kind };
    }
  }
  return null;
}

function nodAt(t) {
  let a = 0;
  for (const n of NODS) { const k = (t - n) / 0.5; if (k >= 0 && k < 1) a += Math.sin(k * Math.PI) * 0.07; }
  return a;
}

function strokeFill(fill) {
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = P.lw; ctx.strokeStyle = P.line; ctx.lineJoin = 'round'; ctx.stroke();
}

function drawBody() {
  const { hx } = P;
  // hood behind the neck
  ctx.beginPath(); ctx.ellipse(hx, 1625, 175, 70, 0, 0, Math.PI * 2); strokeFill(P.hoodieShade);
  // neck
  ctx.beginPath(); ctx.rect(hx - 48, 1520, 96, 110); strokeFill(P.skin);
  // torso
  ctx.beginPath();
  ctx.moveTo(hx - 120, 1625);
  ctx.bezierCurveTo(hx - 260, 1640, hx - 330, 1700, hx - 345, 1960);
  ctx.lineTo(hx + 345, 1960);
  ctx.bezierCurveTo(hx + 330, 1700, hx + 260, 1640, hx + 120, 1625);
  ctx.quadraticCurveTo(hx, 1700, hx - 120, 1625);
  ctx.closePath(); strokeFill(P.hoodie);
  // the neckline curve and the drawstrings
  ctx.beginPath(); ctx.moveTo(hx - 120, 1627); ctx.quadraticCurveTo(hx, 1705, hx + 120, 1627);
  ctx.lineWidth = P.lw; ctx.strokeStyle = P.line; ctx.stroke();
  for (const dx of [-38, 38]) {
    ctx.beginPath(); ctx.moveTo(hx + dx, 1672); ctx.lineTo(hx + dx * 1.08, 1800);
    ctx.lineWidth = 7; ctx.strokeStyle = P.string; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx + dx * 1.08, 1806, 9, 0, 7); strokeFill('#f2efe9');
  }
  // pocket line
  ctx.beginPath(); ctx.moveTo(hx - 150, 1900); ctx.quadraticCurveTo(hx, 1870, hx + 150, 1900);
  ctx.lineWidth = P.lw; ctx.strokeStyle = P.line; ctx.stroke();
}

function drawMouth(o, x, y) {
  // 10 shapes, by how open the voice is.
  const step = Math.round(o * 9) / 9;
  ctx.lineWidth = P.lw; ctx.strokeStyle = P.line; ctx.lineCap = 'round';
  if (step < 0.12) {
    ctx.beginPath(); ctx.arc(x, y - 18, 30, 0.35 * Math.PI, 0.65 * Math.PI); ctx.stroke();
    return;
  }
  const w = 30 + step * 14, h = 8 + step * 44;
  ctx.beginPath(); ctx.ellipse(x, y + h * 0.2, w, h / 2 + 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5A1F1F'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(x - w, y + h * 0.2 - h / 2 - 4, w * 2, Math.max(6, h * 0.22));   // teeth
  ctx.fillStyle = '#D9666A'; ctx.beginPath(); ctx.ellipse(x, y + h * 0.2 + h / 2, w * 0.6, h * 0.35, 0, 0, 7); ctx.fill(); // tongue
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(x, y + h * 0.2, w, h / 2 + 4, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawHead(t) {
  const { hx, hy } = P;
  const sway = Math.sin(t * 1.3) * 0.025 + Math.sin(t * 0.47) * 0.015;
  const nod = nodAt(t);
  ctx.save();
  ctx.translate(hx, 1560); ctx.rotate(sway); ctx.translate(0, nod * 60); ctx.translate(-hx, -1560);
  // ears
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(hx + s * 128, hy + 18, 26, 36, 0, 0, 7); strokeFill(P.skin); }
  // face
  ctx.beginPath(); ctx.ellipse(hx, hy, 130, 148, 0, 0, Math.PI * 2); strokeFill(P.skin);
  ctx.save(); ctx.clip();
  ctx.fillStyle = P.skinShade; ctx.beginPath(); ctx.ellipse(hx + 120, hy + 30, 50, 160, 0, 0, 7); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(hx, hy, 130, 148, 0, 0, Math.PI * 2);
  ctx.lineWidth = P.lw; ctx.strokeStyle = P.line; ctx.stroke();
  // hair: a mop with a few tufts
  ctx.beginPath();
  ctx.moveTo(hx - 140, hy - 10);
  ctx.bezierCurveTo(hx - 170, hy - 150, hx - 60, hy - 205, hx + 20, hy - 190);
  ctx.bezierCurveTo(hx + 110, hy - 205, hx + 175, hy - 130, hx + 138, hy - 20);
  ctx.lineTo(hx + 120, hy - 70);
  ctx.quadraticCurveTo(hx + 60, hy - 95, hx + 10, hy - 75);
  ctx.quadraticCurveTo(hx - 40, hy - 115, hx - 80, hy - 80);
  ctx.quadraticCurveTo(hx - 115, hy - 70, hx - 125, hy - 25);
  ctx.closePath(); strokeFill(P.hair);
  // eyes behind the glasses
  const look = Math.sin(t * 0.8) * 3, ey = hy + 2;
  for (const s of [-1, 1]) {
    const ex = hx + s * 50 + look;
    if (blinking(t)) {
      ctx.beginPath(); ctx.moveTo(ex - 14, ey); ctx.quadraticCurveTo(ex, ey + 8, ex + 14, ey);
      ctx.lineWidth = 5; ctx.strokeStyle = P.line; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(ex, ey, 10, 0, 7); ctx.fillStyle = P.line; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + 3, ey - 4, 3, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    }
  }
  // brows: up a little on a nod
  const browUp = nod * 120;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(hx + s * 26, hy - 58 - browUp); ctx.lineTo(hx + s * 78, hy - 66 - browUp - 4);
    ctx.lineWidth = 9; ctx.strokeStyle = P.hair; ctx.lineCap = 'round'; ctx.stroke();
  }
  // glasses
  ctx.lineWidth = 7; ctx.strokeStyle = C.ink;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(hx + s * 50, hy + 2, 40, 0, 7); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(hx - 12, hy - 4); ctx.quadraticCurveTo(hx, hy - 12, hx + 12, hy - 4); ctx.stroke();
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + s * 90, hy - 4); ctx.lineTo(hx + s * 128, hy - 12); ctx.stroke(); }
  // nose
  ctx.beginPath(); ctx.moveTo(hx + 4, hy + 30); ctx.quadraticCurveTo(hx + 18, hy + 58, hx - 4, hy + 62);
  ctx.lineWidth = 5; ctx.strokeStyle = P.line; ctx.stroke();
  drawMouth(mouthAt(t), hx, hy + 98);
  ctx.restore();
}

function drawHand(t) {
  const h = handLift(t);
  if (!h || h.lift <= 0.001) return;
  const baseX = P.hx - 250, top = 1470, y = lerp(2050, top, h.lift);
  // sleeve
  ctx.beginPath();
  ctx.moveTo(baseX - 60, 2000); ctx.lineTo(baseX - 52, y + 110); ctx.lineTo(baseX + 52, y + 110); ctx.lineTo(baseX + 70, 2000);
  ctx.closePath(); strokeFill(P.hoodie);
  ctx.beginPath(); ctx.rect(baseX - 56, y + 96, 112, 30); strokeFill(P.hoodieShade);
  // hand
  ctx.save(); ctx.translate(baseX, y);
  if (h.kind === 'point') {
    ctx.beginPath(); ctx.roundRect(-44, 10, 88, 92, 30); strokeFill(P.skin);       // fist
    ctx.beginPath(); ctx.roundRect(-30, -78, 30, 104, 15); strokeFill(P.skin);     // index finger, up
    ctx.beginPath(); ctx.moveTo(10, 30); ctx.lineTo(10, 70); ctx.moveTo(26, 34); ctx.lineTo(26, 70);
    ctx.lineWidth = 4; ctx.strokeStyle = P.line; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(-46, -10, 92, 112, 34); strokeFill(P.skin);     // palm
    [[-44, -60, -0.25], [-16, -82, -0.08], [12, -84, 0.06], [38, -66, 0.22]].forEach(([fx, fy, rot]) => {
      ctx.save(); ctx.translate(fx + 10, fy + 40); ctx.rotate(rot);
      ctx.beginPath(); ctx.roundRect(-12, -42, 24, 70, 12); strokeFill(P.skin); ctx.restore();
    });
    ctx.save(); ctx.translate(-50, 40); ctx.rotate(-0.9);
    ctx.beginPath(); ctx.roundRect(-12, -40, 24, 62, 12); strokeFill(P.skin); ctx.restore();   // thumb
  }
  ctx.restore();
}

function drawPresenter(t) {
  drawBody();
  drawHead(t);
  drawHand(t);
}
