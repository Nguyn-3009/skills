#!/usr/bin/env bash
# Continue an existing clip with a rendered one: cut A at CUT seconds, 0.2 s crossfade
# (picture and sound), then B from its first frame. B's t=0 lands exactly on CUT.
#   bash splice.sh A.mp4 CUT B.mp4 out.mp4
# Tip: render B's audio with `mix.py --match-db <A's mean dB>` so the level doesn't jump
# (A's level: ffmpeg -i A.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume).
set -euo pipefail
A=$1; CUT=$2; B=$3; OUT=$4; D=0.2
END=$(python3 -c "print($CUT + $D)")
ffmpeg -v error -y -i "$A" -i "$B" -filter_complex \
 "[0:v]trim=0:$END,setpts=PTS-STARTPTS,fps=30,format=yuv420p[a];[1:v]fps=30,format=yuv420p[b];[a][b]xfade=transition=fade:duration=$D:offset=$CUT[v];\
  [0:a]atrim=0:$END,asetpts=PTS-STARTPTS,aresample=44100[x];[1:a]aresample=44100[y];[x][y]acrossfade=d=$D:c1=tri:c2=tri[au]" \
 -map "[v]" -map "[au]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "done $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") s)"
