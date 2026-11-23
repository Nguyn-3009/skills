// The demo scene (6 s): replace this file with your video.
// Rules: every value comes from t; motions are functions of k = seconds since they began.

const FONTS = ['150px Anton', '500 62px ISans', 'italic 72px ISerif', '700 30px JMono'];
const IMAGES = {};          // e.g. { photo: 'img/photo.jpg' } -> IMG.photo
const EV = [];              // sound events for the sound-design skill: { t, name }

function makeScenes() {
  const tTitle = 0.3, tCard = 1.2, tCount = 2.2, END = 6;
  EV.push({ t: tTitle, name: 'slam' }, { t: tCard, name: 'pop' });
  for (let i = 0; i < 3; i++) EV.push({ t: tCount + i, name: 'pop' });
  EV.push({ t: tCount + 3, name: 'ding' });

  const scene = t => {
    paper();
    around(W / 2, 560, slam(t - tTitle), -0.03, clamp((t - tTitle) / 0.08), () => {
      text('MADE IN', W / 2, 520, '150px Anton', C.ink, 'center');
      text('CODE', W / 2, 680, '150px Anton', C.red, 'center');
    });
    const kc = t - tCard;
    if (kc >= 0) around(W / 2, 1050, pop(kc), 0.02, 1, () => {
      card(190, 860, 700, 380);
      text('every frame', W / 2, 1010, '500 62px ISans', C.ink, 'center');
      text('is a function of t', W / 2, 1110, 'italic 72px ISerif', C.red, 'center');
    });
    const kn = t - tCount;
    if (kn >= 0) {
      const n = 3 - Math.floor(kn), k = kn % 1;
      const label = n > 0 ? String(n) : 'GO!';
      around(W / 2, 1480, n > 0 ? pop(k) : slam(kn - 3), 0, n > 0 ? 1 - clamp((k - 0.7) / 0.3) : 1, () => text(label, W / 2, 1540, '170px Anton', n > 0 ? C.ink : C.red, 'center'));
    }
    text('// video-engine demo', 90, 160, '700 30px JMono', C.grey);
  };
  return { END, list: [[0, END, scene]], fadeOut: 0 };
}
