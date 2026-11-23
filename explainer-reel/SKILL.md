---
name: explainer-reel
description: A 30-60 s voiced vertical explainer reel - cream paper, a cartoon presenter who talks, points and nods, Anton titles, word-timed captions, stamps, checklists, photo cards, halftone wipes - with the product (if any) only as the payoff in the last third. Use for "did you know" facts, stories, history, mystery explainers.
---

# Explainer reel

The look: paper `#EBE7E1` with grain, ink `#1E1C1A`, red `#D7372C`. Header `// 01 · name`
at the top, captions left-aligned under it (each word grey -> ink as it's said, the line's key
word in red serif italic), a title slammed in on each section, the presenter bottom right.

## Build

```bash
cp -r video-engine/template my-reel && cp -r explainer-reel/template/. my-reel/
cp voiceover/tools/*.py my-reel/tools/ && cp voiceover/src/captions.js my-reel/src/
cd my-reel
python tools/voice.py && python tools/prep.py      # the demo script is in lines.py
node tools/render.mjs sheet 0.5,2,4,6,7.5          # look
node tools/render.mjs ev && python ../sound-design/tools/mix.py
node tools/render.mjs video my-reel.mp4
```

## Steps for a new reel

1. **Script first** - a table (line, words, what's on screen). Get an OK before recording.
2. `lines.py`: one or two sentences per line, sections named. Open with "Did you know that…".
3. `src/scene.js`: one function per section; times only from `LS/LE/WT`. `CAPTION.keys` =
   one key word per line (it turns red and the presenter nods on it). `HAND_EVENTS`:
   `point` on each new section, `palm` on questions.
4. Sheet, sound, render.

## Pieces (`src/`)

- `art.js`: stand-in `PHOTOS` (cat, friends, sunset - drawn), `phone(x, y, w, screen)`,
  `heart`, `stamp(str, cx, cy, k)`, `badge(n, ...)`, `ring` (hand-drawn circle around
  something), `swash` (underline), `strike`, `halftoneWipe(t, t0)` (scene swaps at t0+0.45),
  `inkLine`, `offscreen(w, h, draw)`.
- `shared.js`: `header(left, num, total, label)`, `title(w1, w2, t0, t)` (w1 ink, w2 red),
  `checkRow(label, x, y, tOn, t)`, `photoCard(img, label, x, y, size, k, after, afterK)`,
  `recFrame(name, k)` (screen recordings as frames).
- `presenter.js`: the talking presenter (mouth from the voice's loudness, blinks, sway,
  nods at `NODS`, hand at `HAND_EVENTS`). Fills the bottom right: below y 1215 keep content
  left of x 670.

Screen recordings: cut frames with
`ffmpeg -ss A -to B -i clip.mp4 -vf "fps=30,scale=420:-2" -q:v 4 rec/<name>/%04d.jpg`, list them in
`data.js` (`DATA.recordings = { name: { files: [...], fps: 30, map: [[t, clipT], ...] } }` - add it
in prep.py), declare `const REC = {}` (shared.js does) and draw `recFrame(name, k)` inside `phone()`.

## Story rules that worked

- Story first, product last third. Viewers skip anything that smells like an ad, and retention
  drops right at the ad moment - keep it short and make it the payoff.
- Facts true, in simple words; label theories as theories.
- Mystery format: a silhouette with "?" until the reveal; explain how things work step by step.
- Say "this app/this game", never "I made".
- On YouTube and TikTok links can't be tapped: say the store search phrase too.
- The last frame can equal the first, so the reel loops.
