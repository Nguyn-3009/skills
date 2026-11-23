# Kokoro's ONNX model works out how long each sound lasts but doesn't output
# it. This adds that value as an output named "duration", so kokoro-onnx's
# create_timed() reports when every sound is spoken - word timings with no
# extra model (faster-whisper's model host may be blocked).
#   python tools/patch_kokoro.py /opt/kokoro/kokoro-v1.0.onnx /opt/kokoro/kokoro-v1.0-timed.onnx
import sys
import onnx
from onnx import helper, TensorProto

src, dst = sys.argv[1], sys.argv[2]
m = onnx.load(src)
g = m.graph
assert any('/encoder/Clip_output_0' in n.output for n in g.node), 'model layout changed: find the rounded duration tensor'
g.node.append(helper.make_node('Cast', ['/encoder/Clip_output_0'], ['duration'], to=TensorProto.INT64, name='duration_out'))
g.output.append(helper.make_tensor_value_info('duration', TensorProto.INT64, None))
onnx.save(m, dst)
print('saved', dst)
