# Sounds made in code (numpy), at 44.1 kHz mono. Every function returns a float array.
# Deterministic: the same seed gives the same sound in every render.
import numpy as np

SR = 44100
_r = np.random.default_rng(7)
T = lambda dur: np.arange(int(dur * SR)) / SR
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)          # MIDI note -> Hz (60 = middle C)

def env(t, a, decay): return np.minimum(1, t / a) * np.exp(-t * decay)
def tone(f, dur, decay=6, kind='tri', attack=0.004):
    t = T(dur); ph = 2 * np.pi * f * t
    w = {'sin': np.sin(ph), 'tri': 2 / np.pi * np.arcsin(np.sin(ph)), 'sq': np.tanh(3 * np.sin(ph))}[kind]
    return w * env(t, attack, decay)
def noise(dur): return _r.normal(0, 1, int(dur * SR))
def place(buf, s, at, gain=1.0, peak_on_time=False):
    """Add sound s into buf at `at` seconds. peak_on_time: its loudest moment lands on `at`."""
    i = int(at * SR) - (int(np.argmax(np.abs(s))) if peak_on_time else 0)
    if i < 0: s, i = s[-i:], 0
    if i >= len(buf): return
    s = s[:len(buf) - i]; buf[i:i + len(s)] += s * gain

# ---- the library -------------------------------------------------------------
def pop():        # something appears (cards, titles, badges)
    t = T(0.08); f = 900 * np.exp(-t * 20); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55) * 0.7
def whoosh():     # something moves fast (wipes, cards flying)
    t = T(0.45); k = np.convolve(noise(0.45), np.ones(14) / 14, 'same'); return k * np.sin(np.pi * t / 0.45) ** 2 * 0.9
def stamp():      # a heavy landing (stamps, big titles)
    t = T(0.25); return np.sin(2 * np.pi * 90 * t * np.exp(-t * 4)) * np.exp(-t * 18) * 0.9
def slam():       # a title slams in
    t = T(0.18); return (np.sin(2 * np.pi * 160 * t) * 0.6 + noise(0.18) * 0.2) * np.exp(-t * 30) * 0.6
def ding():       # correct / done
    t = T(0.9); return sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1318, 0.5), (1976, 0.25), (2637, 0.12)]) * np.exp(-t * 5) * 0.6
def buzz():       # wrong
    t = T(0.35); return np.tanh(4 * np.sin(2 * np.pi * 110 * t)) * env(t, 0.01, 6) * 0.35
def shutter():    # camera snap
    s = np.zeros(int(0.15 * SR)); a = noise(0.03) * np.exp(-T(0.03) * 120); b = noise(0.05) * np.exp(-T(0.05) * 80)
    s[:len(a)] += a; j = int(0.07 * SR); s[j:j + len(b)] += b * 0.8; return s * 0.8
def sparkle():    # magic / reveal: a quick rising arpeggio
    s = np.zeros(int(0.8 * SR))
    for i, m in enumerate([84, 88, 91, 96]): x = tone(NOTE(m), 0.6, 7, 'sin'); j = int(i * 0.06 * SR); s[j:j + len(x)] += x * 0.35
    return s
def tap():        # a finger tap
    t = T(0.05); return np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * 0.6 + noise(0.05) * np.exp(-t * 300) * 0.2
def zip_():       # something zips away
    t = T(0.3); f = 500 + 2500 * t / 0.3; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.3) * 0.25
def note(m):      # a pitched blip; use rising notes for combos (84, 88, 91 ...)
    return tone(NOTE(m), 0.5, 6, 'tri') * 0.6 + tone(NOTE(m + 12), 0.5, 9, 'sin') * 0.3
def rise():       # tension before a reveal / during a zoom
    t = T(0.9); k = np.convolve(noise(0.9), np.ones(6) / 6, 'same'); return k * (t / 0.9) ** 2 * 0.35
def confetti():   # party popper
    s = np.zeros(int(0.9 * SR))
    for _ in range(40): x = noise(0.01) * 0.5; j = int(_r.uniform(0, 0.7) * SR); s[j:j + len(x)] += x
    b = noise(0.08) * np.exp(-T(0.08) * 40); s[:len(b)] += b; return s * 0.6
def win():        # a small victory jingle
    s = np.zeros(int(1.2 * SR))
    for i, m in enumerate([72, 76, 79, 84]): x = tone(NOTE(m), 0.8, 4, 'tri'); j = int(i * 0.09 * SR); s[j:j + len(x)] += x * 0.45
    return s
def tick():       # a timer tick
    t = T(0.03); return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200) * 0.5

SOUNDS = {'pop': pop, 'whoosh': whoosh, 'stamp': stamp, 'slam': slam, 'ding': ding, 'buzz': buzz, 'shutter': shutter,
          'sparkle': sparkle, 'tap': tap, 'zip': zip_, 'rise': rise, 'confetti': confetti, 'win': win, 'tick': tick,
          'note0': lambda: note(84), 'note1': lambda: note(88), 'note2': lambda: note(91), 'note3': lambda: note(96)}
GAIN = {'pop': 0.5, 'whoosh': 0.35, 'stamp': 0.5, 'slam': 0.35, 'ding': 0.4, 'buzz': 0.5, 'shutter': 0.9, 'sparkle': 0.35,
        'tap': 0.45, 'zip': 0.5, 'rise': 0.5, 'confetti': 0.5, 'win': 0.5, 'tick': 0.4}
def make(name): return SOUNDS[name]() * GAIN.get(name, 0.5)
