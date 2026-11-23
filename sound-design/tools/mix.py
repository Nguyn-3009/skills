# The soundtrack: sound effects at ev.json's events, plus (if present) voice.wav and a music bed.
#   python mix.py                       sounds only, or sounds + voice.wav
#   python mix.py --music [--key G --bpm 110 --music-gain 0.8]
#   python mix.py --match-db -19        no loudness normalising: set the RMS level instead
#                                       (use it to continue another clip at that clip's level)
# Writes mix.wav (44.1 kHz stereo). Default loudness: -14 LUFS (Reels / Shorts / TikTok).
import argparse, json, os, subprocess, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sfx import SR, make, place
import music

ap = argparse.ArgumentParser()
ap.add_argument('--music', action='store_true'); ap.add_argument('--key', default='C'); ap.add_argument('--bpm', type=float, default=120)
ap.add_argument('--music-gain', type=float, default=0.8); ap.add_argument('--duck', type=float, default=0.35, help='music level while the voice speaks')
ap.add_argument('--match-db', type=float, default=None)
a = ap.parse_args()

d = json.load(open('ev.json')); END = d['end']; n = int((END + 0.3) * SR)
fx = np.zeros(n)
for e in d['ev']: place(fx, make(e['name']), e['t'], 1.0, peak_on_time=e['name'] in ('pop', 'stamp', 'slam', 'tap', 'shutter'))

voice = np.zeros(n)
if os.path.exists('voice.wav'):
    v, vsr = sf.read('voice.wav')
    if v.ndim > 1: v = v.mean(1)
    if vsr != SR: v = np.interp(np.arange(int(len(v) * SR / vsr)) / SR, np.arange(len(v)) / vsr, v)
    voice[:min(n, len(v))] = v[:n]

mix = fx * (0.6 if voice.any() else 1.0) + voice
if a.music:
    m = music.bed(END, a.key, a.bpm) * a.music_gain
    if voice.any():   # duck the music under the voice, smoothly
        lvl = np.convolve(np.abs(voice), np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
        g = np.where(lvl > 0.01, a.duck, 1.0); g = np.convolve(g, np.ones(int(0.2 * SR)) / int(0.2 * SR), 'same')
        m[:len(g)] *= g[:len(m)]
    mix[:len(m)] += m[:n]

if a.match_db is not None:
    mix *= 10 ** (a.match_db / 20) / np.sqrt((mix ** 2).mean()); mix = np.clip(mix, -0.95, 0.95)
    sf.write('mix.wav', np.stack([mix, mix], 1), SR)
else:
    sf.write('mix_raw.wav', mix, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5', '-ar', '44100', '-ac', '2', 'mix.wav'], check=True)
print(f'mix.wav {END:.2f} s, {len(d["ev"])} sounds' + (', voice' if voice.any() else '') + (', music' if a.music else ''))
