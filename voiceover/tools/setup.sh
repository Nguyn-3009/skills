#!/usr/bin/env bash
# One-time setup for a fresh container: Python packages, the Kokoro voice
# model (from GitHub), and the timed copy of it. Safe to run again.
set -euo pipefail
PY=${PY:-python3}
HERE="$(cd "$(dirname "$0")" && pwd)"
$PY -m pip install -q kokoro-onnx soundfile onnx pillow numpy 2>&1 | grep -v WARNING || true
$PY -c "import kokoro_onnx, soundfile, onnx, PIL" || { echo "packages missing for $PY - try PY=python3.13"; exit 1; }
mkdir -p /opt/kokoro && cd /opt/kokoro
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f kokoro-v1.0.onnx ] || curl -sSL -o kokoro-v1.0.onnx $base/kokoro-v1.0.onnx
[ -f voices-v1.0.bin ] || curl -sSL -o voices-v1.0.bin $base/voices-v1.0.bin
[ -f kokoro-v1.0-timed.onnx ] || $PY "$HERE/patch_kokoro.py" kokoro-v1.0.onnx kokoro-v1.0-timed.onnx
node -e "require('playwright')" 2>/dev/null && echo "playwright ok" || echo "playwright missing: npm i -g playwright"
echo "setup done ($PY)"
