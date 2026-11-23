# The voice: one Kokoro take per line, joined with short gaps, plus the start and end of
# every word (from the model's own sound timings - see patch_kokoro.py).
#   python tools/voice.py  ->  voice.wav, words.json
import difflib, json, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

# Voices: am_puck (male, lively), af_heart (female, warm) ... see the kokoro-onnx voice list.
VOICE, SPEED = 'am_puck', 1.1
GAP, SECTION_GAP = 0.18, 0.32
# (section, text, gap before it). One or two sentences per line; scenes hang off line and word times.
LINES = [
    ('hook', 'Did you know that honey never goes bad?', 0),
    ('why', 'Archaeologists found pots of it in ancient tombs.', SECTION_GAP),
    ('why', 'Three thousand years old, and still safe to eat.', GAP),
]
# A project's own script: lines.py next to page.html (VOICE, SPEED, LINES) replaces the default above.
import os
sys.path.insert(0, os.getcwd())
try:
    import lines as _proj
    VOICE, SPEED, LINES = getattr(_proj, 'VOICE', VOICE), getattr(_proj, 'SPEED', SPEED), _proj.LINES
    print('script: lines.py,', VOICE, SPEED)
except ImportError:
    print('script: the default in voice.py')
PUNCT = set(',.?!;:—…"')

k = Kokoro('/opt/kokoro/kokoro-v1.0-timed.onnx', '/opt/kokoro/voices-v1.0.bin')

def word_spans(text, timing):
    """Each script word's (start, end): the line's spoken sounds are matched,
    sound by sound, against each word said on its own - in context the voice
    runs some words together ("This one"), so gaps can't be counted."""
    spoken = [t for t in timing if t.phoneme != ' ' and t.phoneme not in PUNCT]
    said = ''.join(t.phoneme for t in spoken)
    ref, owner = '', []
    words = text.split()
    for i, w in enumerate(words):
        ph = k.tokenizer.phonemize(re.sub(r"[^\w']", '', w), 'en-us').replace(' ', '')
        ref += ph; owner += [i] * len(ph)
    hit = [[] for _ in words]
    for blk in difflib.SequenceMatcher(None, ref, said, autojunk=False).get_matching_blocks():
        for j in range(blk.size):
            hit[owner[blk.a + j]].append(spoken[blk.b + j])
    spans = []
    for i, h in enumerate(hit):
        if h:
            spans.append((h[0].start, h[-1].end))
        else:
            spans.append(None)
    # A word with no matched sound: between its neighbours
    for i, sp in enumerate(spans):
        if sp is None:
            prev = next((spans[j][1] for j in range(i - 1, -1, -1) if spans[j]), spoken[0].start)
            nxt = next((spans[j][0] for j in range(i + 1, len(spans)) if spans[j]), spoken[-1].end)
            spans[i] = (prev, nxt)
            print(f'  (no sound matched for {words[i]!r}: placed between its neighbours)')
    return spans

audio, words, t0 = [], [], 0.0
sr = 24000
for li, (section, text, gap) in enumerate(LINES):
    a, sr, timing = k.create_timed(text, voice=VOICE, speed=SPEED)
    if gap:
        audio.append(np.zeros(int(gap * sr), np.float32)); t0 += gap
    for w, (a0, a1) in zip(text.split(), word_spans(text, timing)):
        words.append({'w': w.rstrip('.'), 'line': li, 'section': section,
                      'start': round(t0 + a0, 3), 'end': round(t0 + a1, 3)})
    audio.append(a.astype(np.float32)); t0 += len(a) / sr

full = np.concatenate(audio)
sf.write('voice.wav', full, sr)
json.dump({'duration': round(len(full) / sr, 3), 'lines': [l[1] for l in LINES], 'words': words},
          open('words.json', 'w'), indent=1)
spoken = len(words)
print(f'{len(full)/sr:.2f} s, {spoken} words, {spoken/(len(full)/sr):.2f} words/s')
for li, (s, text, _) in enumerate(LINES):
    ws = [w for w in words if w['line'] == li]
    print(f"{ws[0]['start']:6.2f}-{ws[-1]['end']:6.2f}  {s:5}  {text}")
