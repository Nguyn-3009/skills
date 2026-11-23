---
name: video-engine
description: Make short videos (9:16 Reels, Shorts, TikTok - or 16:9) entirely in code - one HTML canvas, every frame a pure function of time, rendered to MP4 in headless Chromium with Playwright. The base every other web-video skill builds on. Use when asked to make, animate or render a video, reel or Short from code.
---

# Video engine

Everything is drawn on one 1080x1920 canvas. `window.seek(t)` draws time `t`; the renderer
calls it for every frame (30 fps) and pipes the frames into ffmpeg. No state is carried between
frames, so any frame can be checked on its own and every render comes out the same.

## Start a video

```bash
cp -r video-engine/template <work>/my-video && cd <work>/my-video
node tools/render.mjs sheet 0.5,1.5,3,4.5      # check frames -> sheet.jpg (tiled) + sheet/fNN.jpg
node tools/render.mjs video my-video.mp4        # the video (adds mix.wav if present)
```

Needs: Node + Playwright (Chromium) and ffmpeg. `render.mjs` uses a local `playwright` or the
global install (`npm root -g`). Where Chromium isn't installed: `npx playwright install chromium`.

A format skill (explainer-reel, what-if-short, pastel-gameplay-ad) is copied **over** this
template: `cp -r <format>/template/. my-video/`. Sound: sound-design. Voice: voiceover.

## Writing a scene (`src/scene.js`)

```js
const FONTS = ['150px Anton', ...];      // loaded before the first frame
const IMAGES = { photo: 'img/photo.jpg' }; // -> IMG.photo
const EV = [];                            // sound events { t, name } for sound-design
function makeScenes() {
  return { END: 12, list: [[0, 6, sceneA], [6, 12, sceneB]], overlay: t => {...}, fadeOut: 0 };
}
```

- `list`: `[from, to, draw(t)]` - every scene whose range holds `t` draws, in order.
- `overlay(t)`: drawn on top of every frame (captions, a presenter, wipes).
- `fadeOut`: seconds of fade to black at the end (0 = none; loop-friendly).
- Motions take `k` = seconds since they began, and return nothing before it: `pop(k)` (scale
  with overshoot), `slam(k)` (big to normal), `rise(k)` (`{dy, a}` or null), `exitUp(k)`.
- `around(cx, cy, scale, rot, alpha, fn)` draws `fn` transformed about a point.
- Easing: `power3Out`, `power4Out`, `backOut`, `smooth`, `smoother`; `clamp`, `lerp`, `prog`.
- Drawing: `rrect`, `card` (halftone shadow), `text`, `imageCover`, `paper()` (grain).
- `rng(seed)`: seeded random - never `Math.random()`, or frames flicker between renders.
- Fonts in `fonts/` (all SIL Open Font License): Anton, Instrument Sans, Instrument Serif
  italic, JetBrains Mono, Poppins 600-900. Colour emoji: system `"Noto Color Emoji"`.

## Check before rendering

Render a sheet at the moments that matter (every new beat, every tap, the end) and look:
text off the edge, things hidden behind other things, empty frames, a title over a face.
Platform UI covers the **bottom ~20%** (caption, username, buttons) and the right edge
(like/comment column): keep key content above y 1500 and left of x 960.

## Gotchas

- Chrome draws colour emoji with the current `fillStyle`'s alpha: set an opaque fill first.
- White text with a white outline turns into a blob: use `outline = false` on coloured buttons.
- A render that crashes mid-way still leaves a short MP4: check the duration.
- Keep `END` a little after the last word or sound (0.6-0.9 s) so nothing is cut.
