// Boot and seek. The scene file defines FONTS, IMAGES and makeScenes();
// window.seek(t) draws time t, window.READY says fonts and images are in.

let IMG = {}, SCENES = null;
window.READY = false;

function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej('cannot load ' + src); i.src = src; });
}

async function boot() {
  const fonts = typeof FONTS !== 'undefined' ? FONTS : [];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'Aa🎨')));
  const imgs = typeof IMAGES !== 'undefined' ? IMAGES : {};
  for (const [k, src] of Object.entries(imgs)) IMG[k] = await loadImage(src);
  // screen recordings listed in data.js (DATA.recordings), for formats that define REC
  if (typeof REC !== 'undefined') for (const [name, r] of Object.entries(VO.recordings || {})) REC[name] = { ...r, frames: await Promise.all(r.files.map(loadImage)) };
  SCENES = makeScenes();
  window.END = SCENES.END;
  window.EV = typeof EV !== 'undefined' ? EV : [];
  window.READY = true;
}

window.seek = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  for (const [from, to, draw] of SCENES.list) if (t >= from && t < to) { ctx.save(); draw(t); ctx.restore(); }
  if (SCENES.overlay) { ctx.save(); SCENES.overlay(t); ctx.restore(); }
  const f = SCENES.fadeOut ?? 0;                       // seconds of fade to black at the end (0 = none)
  if (f > 0) { const k = clamp((t - (SCENES.END - f)) / f); if (k > 0) { ctx.globalAlpha = k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } }
};

boot().catch(e => { window.ERROR = String(e); });
