// Demo "what if" Short (voiced, ~9 s): Snap walks in, the question, faces, the turn.
// Replace with your video. Times come from the voice: LS(line), LE(line), WT(line, 'word').
// Needs data.js: run voiceover's voice.py (reads lines.py) and prep.py first.

const FONTS = ['150px Anton', '500 62px ISans', 'italic 72px ISerif', 'bold 30px JMono'];
const IMAGES = {};          // e.g. { icon: 'img/icon.png' } for productMoment()
const EV = [];
CAPTION.style = 'pill'; CAPTION.y = 1560; CAPTION.keys = ['forgot', 'face', 'fast'];

function makeScenes() {
  const END = VOICE_END + 0.9;
  const cut = LS(2) - 0.25;                    // a shutter cut into the turn
  const night = t => {
    bg(Q.night, Q.tealD); starfield(t, 0.6);
    // Snap walks in from the left and stops under the title
    const kw = clamp(t / 1.4), x = lerp(-200, 540, power3Out(kw));
    snap(x, 1180, 1.6, t, { walk: kw < 1 ? 1 : 0, wave: t > WT(0, 'forgot') && t < WT(0, 'forgot') + 1.2 });
    bigTitle('WHAT IF YOU', 'NEVER FORGOT?', W / 2, 420, LS(0), t, 120);
    // faces fill the sky, one per word
    const words = ['face', 'word', 'single'];
    const pos = [[230, 760], [540, 700], [850, 760]];
    words.forEach((w, i) => { const k = t - WT(1, w); if (k >= 0) around(pos[i][0], pos[i][1], pop(k), (i - 1) * 0.1, 1, () => face(pos[i][0], pos[i][1], 1.1, i + 2)); });
    chip('EVERY. SINGLE. DAY.', 300, 980, t - WT(1, 'day'));
  };
  const turn = t => {
    bg(Q.teal, Q.tealD); vignette(0.5);
    snap(540, 1150, 1.8, t, { sad: t > WT(2, 'not') });
    bigTitle('SOUNDS', 'AMAZING?', W / 2, 420, LS(2), t, 130);
    rstamp('NOT SO FAST', W / 2, 820, t - WT(2, 'not'), 90, -0.08);
  };
  EV.push({ t: 0.2, name: 'whoosh' }, { t: LS(0), name: 'slam' });
  for (const w of ['face', 'word', 'single']) EV.push({ t: WT(1, w), name: 'pop' });
  EV.push({ t: cut, name: 'shutter' }, { t: LS(2), name: 'slam' }, { t: WT(2, 'not'), name: 'stamp' });
  return {
    END, fadeOut: 0.6,
    list: [[0, cut + 0.25, night], [cut + 0.25, END + 1, turn]],
    overlay: t => { captions(t); shutter(t, cut); },
  };
}
