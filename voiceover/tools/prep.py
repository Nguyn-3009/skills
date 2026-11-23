# data.js for the page: the words with their times, the voice length, and how open a talking
# character's mouth is on each frame (from the voice's loudness).
#   python tools/prep.py  (after voice.py)  ->  data.js   (window.DATA)
import json
import numpy as np, soundfile as sf

FPS = 30
d = json.load(open('words.json'))
audio, sr = sf.read('voice.wav')
hop = sr // FPS
mouth, prev = [], 0.0
for i in range(int(len(audio) / hop) + 1):
    w = audio[i * hop:(i + 1) * hop]
    db = 20 * np.log10(np.sqrt(np.mean(w ** 2)) + 1e-9) if len(w) else -90
    raw = min(1.0, max(0.0, (db + 42) / 26))                     # -42 dB shut, -16 dB wide
    prev = raw if raw >= prev else prev + (raw - prev) * 0.55     # instant attack, eased release
    mouth.append(round(prev, 3))
d['mouth'] = mouth
d['fps'] = FPS
open('data.js', 'w').write('window.DATA = ' + json.dumps(d) + ';\n')
print(len(mouth), 'frames of mouth,', d['duration'], 's,', len(d['words']), 'words')
