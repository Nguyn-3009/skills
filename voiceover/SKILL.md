---
name: voiceover
description: Free, offline text-to-speech voice-over (Kokoro) with the start and end time of every word, so animations land on spoken words and captions appear word by word. Use with video-engine when a video needs a narrator, word-synced scenes or captions.
---

# Voice-over

Kokoro (82M, Apache-2.0) runs on CPU. A small patch exposes the model's own sound durations,
so every word gets a start and end time with no second model.

## Setup (once per machine)

```bash
bash voiceover/tools/setup.sh            # PY=python3.13 bash ... if python3 lacks the packages
```
Installs kokoro-onnx, soundfile, onnx, numpy, pillow; downloads the model from GitHub
(Hugging Face is often blocked in sandboxes) into `/opt/kokoro`, then makes the timed copy.

## Use

```bash
cp voiceover/tools/*.py my-video/tools/ && cp voiceover/src/captions.js my-video/src/
cd my-video
# write lines.py (or edit LINES in tools/voice.py)
python tools/voice.py     # -> voice.wav, words.json (prints each line's start-end)
python tools/prep.py      # -> data.js (window.DATA: words, lines, mouth openness per frame)
```

`lines.py` (next to page.html):
```python
VOICE, SPEED = 'af_heart', 1.0          # af_heart warm female; am_puck lively male; ...
GAP, SECTION_GAP = 0.18, 0.32
LINES = [('hook', 'What if you never forgot anything?', 0), ('next', '...', SECTION_GAP)]
```
Add `<script src="src/captions.js"></script>` to page.html (before the scene).

In scenes, time everything from the voice - never typed numbers:
`LS(line)` first word, `LE(line)` last word's end, `WT(line, 'word', n)` the nth time a word is
said (throws if absent - a typo shows up at once), `VOICE_END`, `VO.mouth[frame]` (0-1).

Captions: set `CAPTION.keys` (one highlighted word per line) and style, call `captions(t)` in
the overlay. `style: 'pill'` = centred on a dark pill (Shorts look); `'plain'` = left-aligned ink
text under the header (explainer look). Long lines show one chunk (≤ 2 rows) at a time.

## Notes

- About 3 words a second at speed 1.0-1.1. A 45 s video is ~130 words.
- Write numbers and dates as words where the reading matters ("March seventeenth, 1904").
- A word with no matched sound is placed between its neighbours (printed) - fine for "a".
- The voice is synthetic: say so where a platform asks about AI-generated content.
