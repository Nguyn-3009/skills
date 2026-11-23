# skills
All video for marketing skill

Code-drawn marketing videos (9:16 Reels, Shorts, TikTok): every frame drawn on a canvas,
rendered to MP4 in headless Chromium, with voice and sound made in code. No video editor,
no stock footage, no paid tools.

| Skill | What it makes |
|---|---|
| [video-engine](video-engine/SKILL.md) | The base: canvas page, `seek(t)`, motions, the MP4 renderer, fonts |
| [voiceover](voiceover/SKILL.md) | Offline voice (Kokoro) with every word's timing; word-by-word captions |
| [sound-design](sound-design/SKILL.md) | Sound effects and a music bed made in code; mixing; splicing onto an existing clip |
| [explainer-reel](explainer-reel/SKILL.md) | Voiced "did you know" reel with a talking presenter |
| [what-if-short](what-if-short/SKILL.md) | Voiced "What if…?" Short with Snap, a walking camera host |
| [pastel-gameplay-ad](pastel-gameplay-ad/SKILL.md) | No-voice pastel gameplay ad with taps, confetti and a "link in bio" ending |

## Quick start

```bash
cp -r video-engine/template my-ad && cp -r pastel-gameplay-ad/template/. my-ad/ && cd my-ad
node tools/render.mjs sheet 1,3,8,13          # look at frames
node tools/render.mjs ev && python ../sound-design/tools/mix.py --music
node tools/render.mjs video my-ad.mp4
```

Needs Node + Playwright (Chromium), ffmpeg, Python 3 with numpy + soundfile (and kokoro-onnx
for voice: `bash voiceover/tools/setup.sh`).

## Use as Claude Code skills

Copy (or symlink) a skill folder into a project's `.claude/skills/`, e.g.
`cp -r pastel-gameplay-ad <project>/.claude/skills/` - Claude picks it up from the
`SKILL.md` description. The format skills expect video-engine (and voiceover / sound-design
where they say so) next to them.

## Licences

Fonts in `video-engine/template/fonts/` are under the SIL Open Font License 1.1 (Anton,
Instrument Sans, Instrument Serif, JetBrains Mono, Poppins). The Kokoro voice model is
Apache-2.0 and downloaded by `voiceover/tools/setup.sh`, not stored here.
