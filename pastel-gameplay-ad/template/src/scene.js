// Demo pastel gameplay ad (no voice, 15 s): "Think quick! Which one is different?"
// round 1 (a wrong tap, then the right one), round 2, before ➜ after, then the link-in-bio ending.
// Replace the game and pictures with your product's; keep the beats.

const FONTS = ['600 30px Poppins', '700 30px Poppins', '800 30px Poppins', '900 30px Poppins', `30px ${EMO}`];
const IMAGES = {};          // e.g. { icon: 'img/icon.png', after1: 'img/after1.png' } -> IMG.icon ...
const EV = [];
const sfx = (t, name) => EV.push({ t, name });

// pictures drawn in code (stand-ins for your own before/after images)
function offscreen(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
const LAKE = offscreen(600, 600, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, '#7DB7F0'); sky.addColorStop(1, '#FFD3A6'); g.fillStyle = sky; g.fillRect(0, 0, w, 330);
  g.fillStyle = '#FFC93C'; g.beginPath(); g.arc(420, 170, 70, 0, 7); g.fill();
  g.fillStyle = '#8A7FD6'; g.beginPath(); g.moveTo(0, 330); g.lineTo(150, 170); g.lineTo(290, 330); g.lineTo(400, 210); g.lineTo(600, 330); g.fill();
  g.fillStyle = '#4FB0C6'; g.fillRect(0, 330, w, 140); g.fillStyle = '#5FC48A'; g.fillRect(0, 450, w, 150);
  g.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 5; i++) g.fillRect(330 + i * 8, 360 + i * 18, 160 - i * 20, 6);
});
const FLOWER = offscreen(600, 600, (g, w, h) => {
  g.fillStyle = '#FDE7F0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#5FC48A'; g.fillRect(288, 300, 24, 300); g.beginPath(); g.ellipse(360, 470, 70, 26, -0.5, 0, 7); g.fill();
  g.fillStyle = '#FF4F8B'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.ellipse(300 + Math.cos(a) * 95, 260 + Math.sin(a) * 95, 70, 42, a, 0, 7); g.fill(); }
  g.fillStyle = '#FFC93C'; g.beginPath(); g.arc(300, 260, 62, 0, 7); g.fill();
});
// the "after": a chunky mosaic of the picture (your product's result goes here)
const mosaic = (src, n) => offscreen(600, 600, g => { const s = offscreen(n, n, (q) => q.drawImage(src, 0, 0, n, n)); g.imageSmoothingEnabled = false; g.drawImage(s, 0, 0, 600, 600); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { const p = i * 600 / n; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 600); g.moveTo(0, p); g.lineTo(600, p); g.stroke(); } });
const LAKE_M = mosaic(LAKE, 14), FLOWER_M = mosaic(FLOWER, 14);
const drawImg = img => (x, y, w, h) => ctx.drawImage(img, x, y, w, h);

// the odd-one-out board inside a square card
const BOARD = { x: 90, y: 380, s: 900 };
function board(t, n, odd, base, delta, t0, wrong, tWrong, tRight) {
  whiteCard(BOARD.x, BOARD.y, BOARD.s, BOARD.s, 48);
  const cell = (BOARD.s - 80) / n, r = cell * 0.38;
  for (let i = 0; i < n * n; i++) {
    const cx = BOARD.x + 40 + (i % n + 0.5) * cell, cy = BOARD.y + 40 + (Math.floor(i / n) + 0.5) * cell;
    const k = t - (t0 + (i % n + Math.floor(i / n)) * 0.04); if (k < 0) continue;
    let s = pop(k), a = 1;
    if (t > tRight + 0.3) { if (i === odd) s *= 1 + 0.25 * power3Out(clamp((t - tRight - 0.3) / 0.3)); else { const e = clamp((t - tRight - 0.3 - i * 0.01) / 0.25); s *= 1 - e; a = 1 - e; } }
    const dx = i === wrong ? shake(t - tWrong) : 0;
    around(cx + dx, cy, s, 0, a, () => { ctx.fillStyle = i === odd ? `hsl(${base + delta},80%,62%)` : `hsl(${base},80%,62%)`; ctx.beginPath(); ctx.arc(cx + dx, cy, r, 0, 7); ctx.fill(); });
  }
}
const cellXY = (n, i) => { const cell = (BOARD.s - 80) / n; return [BOARD.x + 40 + (i % n + 0.5) * cell, BOARD.y + 40 + (Math.floor(i / n) + 0.5) * cell]; };

function makeScenes() {
  const R1 = { n: 4, odd: 9, wrong: 6, base: 200, delta: 18, t0: 0.3, tWrong: 2.3, tRight: 3.3 };
  const R2 = { n: 6, odd: 22, wrong: -1, base: 330, delta: 12, t0: 4.9, tWrong: -9, tRight: 6.4 };
  const tFlip = 7.6, tBA = 8.0, tEnd = 11.0, tYou = 11.6, tApp = 12.1, tLink = 12.5, tTap1 = 13.3, tTap2 = 14.2, END = 15.6;

  const scene = t => {
    pastel(t);
    if (t < 4.6) {
      const k = power3Out(clamp((t - 4.3) / 0.3));
      around(540, 830, 1 - 0.3 * k, 0, 1 - k, () => board(t, R1.n, R1.odd, R1.base, R1.delta, R1.t0, R1.wrong, R1.tWrong, R1.tRight));
      if (t < R1.tRight + 0.3) timerRing(t, 1.0, 3, 540, 1400);           // stops when solved
      handPath(t, [[R1.tWrong, ...cellXY(4, R1.wrong)], [R1.tRight, ...cellXY(4, R1.odd)]], 1.7, 3.6);
      const [wx, wy] = cellXY(4, R1.wrong), [ox, oy] = cellXY(4, R1.odd);
      mark(false, wx + 70, wy - 70, t - R1.tWrong);
      mark(true, ox + 80, oy - 80, t - R1.tRight - 0.05);
      floater('Oops!', wx, wy - 120, t - R1.tWrong, ['#EF4444', '#F97316']);
      floater('Nice!', ox, oy - 130, t - R1.tRight - 0.05, GRAD.purple);
      confetti(t, R1.tRight + 0.05);
    } else if (t < tFlip) {
      const kin = power3Out(clamp((t - 4.6) / 0.35));
      ctx.save(); ctx.translate(900 * (1 - kin), 0);
      board(t, R2.n, R2.odd, R2.base, R2.delta, R2.t0, -1, -9, R2.tRight);
      ctx.restore();
      handPath(t, [[R2.tRight, ...cellXY(6, R2.odd)]], 5.6, 7.0);
      const [gx, gy] = cellXY(6, R2.odd); mark(true, gx + 900 * (1 - kin) + 60, gy - 60, t - R2.tRight - 0.05, 40);
      floater('Great!', gx, gy - 110, t - R2.tRight - 0.05, GRAD.pink);
      confetti(t, R2.tRight + 0.05);
    } else if (t < tEnd) {
      const out = power3Out(clamp((t - (tEnd - 0.3)) / 0.3));
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -200 * out);
      beforeAfter(t, tBA, [[drawImg(LAKE), drawImg(LAKE_M), 1], [drawImg(FLOWER), drawImg(FLOWER_M), 1]], 400, 600);
      ctx.restore();
      confetti(t, tBA + 1.3);
    } else {
      plusCards(t, tEnd + 0.1, (x, y, w, h) => { ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h); for (let i = 0; i < 9; i++) { ctx.fillStyle = i === 4 ? 'hsl(218,80%,62%)' : 'hsl(200,80%,62%)'; ctx.beginPath(); ctx.arc(x + 60 + (i % 3) * 104, y + 60 + Math.floor(i / 3) * 104, 38, 0, 7); ctx.fill(); } }, drawImg(LAKE_M));
      const ky = t - tYou;
      if (ky >= 0) around(540, 920, pop(ky), 0, 1, () => { tline('This game is', 540, 900, 58, NAVY, 700); tline('made for YOU! 💜', 540, 990, 84, GRAD.pink, 900); });
      appRow(t, tApp, 'Your App', 'on iPhone', IMG.icon || null);
      linkButton(t, tLink, [tTap1, tTap2]);
      handPath(t, [[tTap1, 790, 1315], [tTap2, 790, 1315]], tLink + 0.35, END);
      const kt = t - tTap1 - 0.15;
      if (kt >= 0) around(540, 1470, pop(kt), 0, 1, () => tline("one tap ➜ you're playing ✨", 540, 1490, 54, GRAD.purple, 800));
      pointToName(t, tTap1 + 0.6);
      confetti(t, tTap1 + 0.05);
    }
    titles(t, [
      [0.05, 4.4, 'Which one is different? 👀', 'THINK QUICK! ⚡'],
      [4.65, 7.5, 'Level 2', 'Harder… 🔥', GRAD.purple],
      [7.7, 10.8, 'Any picture ➜', 'a PUZZLE ✨', GRAD.teal],
      [11.05, END + 1, 'Love PUZZLES? 🧩', 'Love COLORING? 🎨', GRAD.pink, GRAD.purple],
    ]);
    // the flip between game and before/after: a flash
    flash(t, tFlip, { x: 0, y: 0, w: W, h: H, r: 0 });
  };

  sfx(0.05, 'pop'); sfx(0.3, 'whoosh');
  for (let i = 0; i < 3; i++) sfx(1.0 + i, 'tick');
  sfx(R1.tWrong, 'tap'); sfx(R1.tWrong + 0.03, 'buzz'); sfx(R1.tRight, 'tap'); sfx(R1.tRight + 0.05, 'ding'); sfx(R1.tRight + 0.05, 'confetti');
  sfx(4.6, 'whoosh'); sfx(4.65, 'pop'); sfx(R2.tRight, 'tap'); sfx(R2.tRight + 0.05, 'note2'); sfx(R2.tRight + 0.05, 'confetti');
  sfx(tFlip, 'sparkle'); sfx(7.7, 'pop');
  for (const j of [0, 1]) { sfx(tBA + j * 0.45, 'pop'); sfx(tBA + j * 0.45 + 0.25, 'pop'); sfx(tBA + j * 0.45 + 0.45, 'sparkle'); }
  sfx(tBA + 1.3, 'confetti');
  sfx(tEnd + 0.05, 'pop'); sfx(tEnd + 0.1, 'pop'); sfx(tEnd + 0.3, 'pop'); sfx(tEnd + 0.5, 'pop'); sfx(tYou, 'sparkle'); sfx(tApp, 'pop'); sfx(tLink, 'pop');
  sfx(tTap1, 'tap'); sfx(tTap1 + 0.05, 'win'); sfx(tTap1 + 0.05, 'confetti'); sfx(tTap2, 'tap');
  return { END, list: [[0, END + 1, scene]], fadeOut: 0 };
}
