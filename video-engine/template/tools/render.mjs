// Renders page.html frame by frame in headless Chromium (Playwright).
//   node tools/render.mjs sheet 0.5,2.1,4.9   -> sheet/fNN.jpg + sheet.jpg (all tiled)
//   node tools/render.mjs ev                  -> ev.json (sound events, for sound-design)
//   node tools/render.mjs video out.mp4       -> the video; adds mix.wav if it exists
import { spawn, spawnSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

// Playwright from this folder, or the global install (no npm install needed where it is preinstalled).
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(path.join(execSync('npm root -g').toString().trim(), 'x'))('playwright')); }

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [mode, arg] = process.argv.slice(2);
const FPS = 30;

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto('file://' + path.join(root, 'page.html'));
await page.waitForFunction(() => window.READY || window.ERROR, null, { timeout: 120000 });
const err = await page.evaluate(() => window.ERROR);
if (err) { console.error(err); process.exit(1); }
const END = await page.evaluate(() => window.END);

const grab = t => page.evaluate(t => { window.seek(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t)
  .then(u => Buffer.from(u.split(',')[1], 'base64'));

if (mode === 'ev') {
  writeFileSync(path.join(root, 'ev.json'), JSON.stringify({ end: END, ev: await page.evaluate(() => window.EV) }));
  console.log('ev.json written, END', END);
} else if (mode === 'sheet') {
  const times = arg.split(',').map(Number);
  mkdirSync(path.join(root, 'sheet'), { recursive: true });
  for (const [i, t] of times.entries()) writeFileSync(path.join(root, `sheet/f${String(i).padStart(2, '0')}.jpg`), await grab(t));
  const cols = Math.min(times.length, 6), rows = Math.ceil(times.length / cols);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(root, 'sheet/f%02d.jpg'), '-vf', `scale=270:-1,tile=${cols}x${rows}`, '-frames:v', '1', path.join(root, 'sheet.jpg')]);
  console.log('sheet.jpg', times.length, 'frames; END', END.toFixed(2));
} else {
  const out = arg || 'video.mp4';
  const audio = existsSync(path.join(root, 'mix.wav'));
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...(audio ? ['-i', path.join(root, 'mix.wav'), '-c:a', 'aac', '-b:a', '192k', '-ar', '44100'] : []),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-t', END.toFixed(3), path.join(root, out)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.ceil(END * FPS), t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('done', out, audio ? '(with mix.wav)' : '(silent)', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await browser.close();
