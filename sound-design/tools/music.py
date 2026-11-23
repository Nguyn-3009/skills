# A light, loopable music bed made in code: kick, clap, hats, bass, a plucked arpeggio and a little lead,
# in a major-pentatonic key. Bright and "casual game" in feel; sits under sound effects.
import numpy as np
from sfx import SR, T, NOTE, tone, noise, place

KEYS = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9}
def bed(seconds, key='C', bpm=120, ending=True, seed=7):
    """Returns a mono float array `seconds` long. 4 beats a bar, chords I - vi - IV - V."""
    r = np.random.default_rng(seed); n = int(seconds * SR); out = np.zeros(n)
    beat = 60 / bpm; bar = 4 * beat; o = KEYS[key]
    chords = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (43, [55, 59, 62, 67])]
    pent = [72, 74, 76, 79, 81, 84]
    for b in range(int(seconds / bar) + 1):
        root, ch = chords[b % 4]; t0 = b * bar
        for k in range(4):
            kt = T(0.25); place(out, np.sin(2 * np.pi * 55 * kt * np.exp(-kt * 9) * 2) * np.exp(-kt * 14), t0 + k * beat, 0.55)
            if k % 2: place(out, r.normal(0, 1, int(0.12 * SR)) * np.exp(-T(0.12) * 30), t0 + k * beat, 0.12)
            place(out, r.normal(0, 1, int(0.04 * SR)) * np.exp(-T(0.04) * 120), t0 + k * beat + beat / 2, 0.06)
        for k in range(8): place(out, tone(NOTE(root + o), beat / 2 * 0.96, 9, 'sq'), t0 + k * beat / 2, 0.16)
        for k in range(8): place(out, tone(NOTE(ch[(k * 3 + b) % 4] + 12 + o), 0.35, 11, 'tri'), t0 + k * beat / 2, 0.10)
        for k, step in enumerate([0, 1.5, 2, 3]): place(out, tone(NOTE(pent[(b * 3 + k * 2) % 6] + o), 0.3, 8, 'sin'), t0 + step * beat, 0.09)
    fi = int(0.25 * SR); out[:fi] *= np.linspace(0, 1, fi)
    if ending:   # the last 1.6 s: the loop fades and one big chord rings out
        last = max(0, seconds - 1.6); i = int(last * SR)
        out[i:] *= np.linspace(1, 0, n - i) ** 2
        for m in [60, 64, 67, 72, 76]: place(out, tone(NOTE(m + o), 2.0, 1.6, 'tri', 0.01), last, 0.09)
    return out
