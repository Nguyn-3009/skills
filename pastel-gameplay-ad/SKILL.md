---
name: pastel-gameplay-ad
description: A no-voice 9:16 product/gameplay ad in the bright pastel casual-game style - lavender-to-peach background, white rounded cards, Poppins titles with emoji, a tapping hand with ripples, "Nice!/Great!" floaters, ✓/✗ marks, countdown ring, confetti, flips and flashes, a before ➜ after board, and a "LINK IN BIO" ending with a pulsing button. Use for mobile game or app ads that hook with gameplay ("Think quick!") instead of a story.
---

# Pastel gameplay ad

Product-first: the hook **is** the product's own mechanic ("Think quick! Which one is
different?"), so nobody feels tricked when the product appears - the ad never "turns into" an ad.
No voice; titles carry the story, sounds carry the energy. 15-40 s.

## Build

```bash
cp -r video-engine/template my-ad && cp -r pastel-gameplay-ad/template/. my-ad/ && cd my-ad
node tools/render.mjs sheet 0.6,2.4,3.4,6.5,8.6,11.4,13.4,14.8
node tools/render.mjs ev && python ../sound-design/tools/mix.py --music && node tools/render.mjs video my-ad.mp4
```

## Beats (the demo, 15 s)

1. **Think quick** (0-4.5 s): a puzzle on a card, a 3-2-1 ring, a wrong tap (✗, shake, buzz,
   "Oops!"), the right tap (✓, "Nice!", confetti, the rest of the board falls away).
2. **Round 2, harder** (4.6-7.5 s): slides in, one tap, "Great!".
3. **What the product does** (7.6-11 s): flash, then before ➜ after rows.
4. **Close** (11-15.6 s): "Love X? / Love Y?" over two tilted cards with a "+",
   "This game is made for YOU! 💜", the app row (icon, name, FREE), the **LINK IN BIO** button
   tapped twice, "one tap ➜ you're playing ✨", 👇 "tap my name" (toward the username, bottom left).

Swap the demo's odd-one-out board and drawn pictures for the product's own visuals. Titles:
`titles(t, [[t0, t1, small line, big line, gradient], ...])`.

## Pieces (`src/pastel.js`)

`pastel(t)` background · `tline(str, cx, y, size, fill, weight, outline)` · `titles` ·
`whiteCard` · `CARD` · `flip(t, t0, dur, drawA, drawB)` · `flash(t, at, rect)` · `shake(k)` ·
`hand`, `ripple`, `handPath(t, [[t, x, y], ...], tIn, tOut)` · `floater(str, x, y, k, gradient)` ·
`confetti(t, t0)` · `mark(ok, x, y, k)` · `timerRing(t, t0, n, x, y)` ·
`beforeAfter(t, t0, [[drawBefore, drawAfter, aspect], ...])` · `plusCards` ·
`appRow(t, t0, name, platform, icon)` · `linkButton(t, t0, taps)` · `pointToName(t, t0)` ·
gradients `GRAD.pink/purple/teal/blue`, `NAVY`.

## Why "link in bio"

When a product ranks low in store search, "search for it" loses most viewers. Say and show
**one tap**: the bio link (Instagram; TikTok once unlocked), the description link (YouTube).
Pin a comment that repeats it.

## Continuing someone else's clip

If the first part already exists as a video, render only the new part starting from that
clip's last layout and join them with `sound-design/tools/splice.sh` (0.2 s crossfade, level matched).
