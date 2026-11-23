---
name: what-if-short
description: A voiced "What if…?" Short (30-60 s, 9:16 or 16:9) with a host character - Snap, a little walking box camera - deep teal night look, cream/amber Anton titles, drawn props, shutter cuts, captions on a pill, and an optional icon-only product moment mid-video. Use for curiosity/psychology/history "what if" questions.
---

# What-if Short

A question in the first second, a surprising turn, real research in plain words, one
practical takeaway. A warm female narrator (`af_heart`). Snap, the host, reacts: walks, waves,
looks sad, blushes.

## Build

```bash
cp -r video-engine/template my-short && cp -r what-if-short/template/. my-short/
cp voiceover/tools/*.py my-short/tools/ && cp voiceover/src/captions.js my-short/src/
cd my-short && python tools/voice.py && python tools/prep.py
node tools/render.mjs sheet 0.6,2.5,4.4,6.6 && node tools/render.mjs ev
python ../sound-design/tools/mix.py --music && node tools/render.mjs video my-short.mp4
```

## Script shape (~45-60 s)

1. Hook: the question ("What if every photo you take makes you remember less?").
2. Turn: "Sounds amazing, right? Not so fast."
3. Two or three findings - real studies, named, in one sentence each.
4. The product moment (optional, mid-video, ~4 s): icon + name + one tagline, said as a
   natural part of the story ("…there's an app that turns anything into X"). No gameplay, no
   screenshots, no "download now". `productMoment(t, t0, name, tagline, IMG.icon)`.
5. The takeaway + a question for the comments.

Put sources in the description. Labels for theories. Spicier hooks beat polite ones.

## Pieces (`src/look.js`)

`Q` palette, `bg`, `vignette`, `starfield`, `bigTitle(l1, l2, cx, y, t0, t)`,
`chip(str, x, y, k)`, `rstamp(str, cx, cy, k)`, `snap(cx, cy, scale, t, {walk, wave, sad, blush, look})`,
`face(cx, cy, s, seed, blank)` (sepia portrait), `person(...)`, `hand(...)` (skin -> x-ray),
`galaxy`, `earth`, `bubble(cx, cy, w, h, k, draw)`, `moodFace`, `brain`, `polaroid`,
`shutter(t, t0)` (iris cut, swap the scene at t0+0.25), `productMoment(...)`.

Captions: `CAPTION.style = 'pill'`, keys per line. For 16:9: canvas 1920x1080 in page.html,
`W, H` in core.js and the viewport in render.mjs.
