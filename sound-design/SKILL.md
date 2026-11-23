---
name: sound-design
description: Sound effects and a music bed made in code (numpy) for code-drawn videos - pops, whooshes, taps, shutter, sparkle, confetti, win jingle, a pentatonic loop - mixed at the frame events of a video-engine video, ducked under a voice, normalised for social platforms; plus splicing a rendered part onto an existing clip. Use when a video needs sound.
---

# Sound design

No sample files, no licences: every sound is synthesised, deterministic, and lands on the
frame its event names.

## Use

```bash
node tools/render.mjs ev                          # ev.json: END + every EV.push({t, name}) of the scene
python sound-design/tools/mix.py                  # sounds (+ voice.wav if present) -> mix.wav, -14 LUFS
python sound-design/tools/mix.py --music          # + a music bed (--key C|D|E|F|G|A --bpm 120 --music-gain 0.8)
node tools/render.mjs video out.mp4               # picks up mix.wav
```
Run `mix.py` from the video folder (it reads `ev.json`, `voice.wav`).

Sounds (`tools/sfx.py`): `pop` appear, `whoosh` move, `stamp` heavy landing, `slam` title,
`ding` correct, `buzz` wrong, `shutter` camera, `sparkle` reveal, `tap` finger, `zip` fly away,
`rise` build-up, `confetti`, `win` jingle, `tick` timer, `note0..3` rising combo notes.
Add your own: a function returning a numpy array at 44.1 kHz, registered in `SOUNDS`.

Music (`tools/music.py`): kick/clap/hats, bass, plucked arpeggio and a small lead over
I-vi-IV-V in a major pentatonic key; fades in, ends on one ringing chord. Under a voice it
ducks automatically (`--duck 0.35`).

## Rules of thumb

- One sound per visible event; nothing for things that don't move.
- No sounds over a product shot or an end card someone else made (e.g. a store promo clip):
  filter those events out of `EV`.
- Taps: `tap` + the result (`ding`/`buzz`/`note`) 0.03-0.05 s later. Reveals: `rise` then `sparkle`.
- Loudness: -14 LUFS is what Reels/Shorts/TikTok play at.

## Continue an existing clip

To append a rendered part to a clip you already have (e.g. a clip made elsewhere):
1. Find the cut (a calm frame) and the clip's level: `ffmpeg -i A.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume`.
2. Start part B on that same frame (redraw its last layout), render B with
   `mix.py --music --match-db <A's mean dB>` and the same key.
3. `bash sound-design/tools/splice.sh A.mp4 <cut seconds> B.mp4 out.mp4` - 0.2 s crossfade of
   picture and sound; B's t=0 lands exactly on the cut.
