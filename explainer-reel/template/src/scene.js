// Demo explainer (voiced, ~8 s) - "Did you know that honey never goes bad?"
// Replace with your video. Times come from the voice: LS(line), LE(line), WT(line, 'word').
// Needs data.js: run voiceover's voice.py (its default LINES are this demo) and prep.py first.

const FONTS = ['150px Anton', '500 62px ISans', '700 30px ISans', 'italic 72px ISerif', '25px JMono', 'bold 25px JMono'];
const IMAGES = {};          // your own pictures, e.g. { jar: 'img/jar.jpg' } -> IMG.jar
const EV = [];
CAPTION.style = 'plain'; CAPTION.x = 120; CAPTION.y = 258; CAPTION.w = 850; CAPTION.size = 62;
CAPTION.ink = C.ink; CAPTION.keyInk = C.red; CAPTION.dim = C.light; CAPTION.hold = 99;
CAPTION.keys = ['honey', 'tombs', 'safe'];          // one red key word per line

function makeScenes() {
  const END = VOICE_END + 0.8;
  // the presenter: point at each new section, palm on questions; nod on key words
  HAND_EVENTS = [{ t: LS(0) + 0.3, kind: 'palm' }, { t: LS(1), kind: 'point' }, { t: LS(2), kind: 'point' }];
  NODS = CAPTION.keys.map((k, li) => { try { return WT(li, k); } catch (e) { return -9; } });
  const wipes = [LS(1) - 0.45];

  const hook = t => {
    header('// 01 · honey', 1, 3, 'fact');
    title('HONEY', 'FOREVER?', LS(0), t);
    const kj = t - (LS(0) + 0.5);
    if (kj >= 0) around(330, 1000, pop(kj), -0.04, 1, () => {                        // a jar, drawn in code
      card(170, 780, 320, 420, { r: 40 });
      ctx.fillStyle = '#F2A93B'; rrect(200, 900, 260, 270, 30); ctx.fill();
      ctx.fillStyle = C.ink; rrect(210, 820, 240, 70, 14); ctx.fill();
      text('HONEY', 330, 1060, '48px Anton', C.ink, 'center');
    });
    stamp('NEVER GOES BAD', 700, 1000, t - WT(0, 'bad'), 52);
  };
  const tombs = t => {
    header('// 02 · proof', 2, 3, 'fact');
    title('ANCIENT', 'TOMBS', LS(1), t);
    photoCard(PHOTOS.sunset, 'egypt.jpg (stand-in)', 140, 760, 420, t - WT(1, 'pots'));
    badge(1, 600, 800, t - WT(1, 'tombs'));
    checkRow('pots of honey', 600, 1000, WT(1, 'pots'), t);
    checkRow('still sealed', 600, 1080, WT(1, 'tombs'), t);
  };
  const years = t => {
    header('// 03 · age', 3, 3, 'fact');
    title('3,000', 'YEARS', LS(2), t, 170);
    ring(300, 560, 230, 110, clamp((t - WT(2, 'old')) / 0.5));
    stamp('SAFE TO EAT', 460, 1000, t - WT(2, 'safe'), 64);
  };
  const scene = t => {
    paper();
    if (t < wipes[0] + 0.45) hook(t); else if (t < LS(2) - 0.1) tombs(t); else years(t);
  };
  EV.push({ t: LS(0), name: 'slam' }, { t: LS(0) + 0.5, name: 'pop' }, { t: WT(0, 'bad'), name: 'stamp' });
  EV.push({ t: wipes[0], name: 'whoosh' }, { t: LS(1), name: 'slam' }, { t: WT(1, 'pots'), name: 'pop' }, { t: WT(1, 'tombs'), name: 'ding' });
  EV.push({ t: LS(2), name: 'slam' }, { t: WT(2, 'safe'), name: 'stamp' });
  return {
    END, list: [[0, END, scene]], fadeOut: 0,
    overlay: t => { drawPresenter(t); captions(t); for (const w of wipes) halftoneWipe(t, w); },
  };
}
