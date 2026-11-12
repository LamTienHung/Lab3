// Tổng hợp tiếng trống bằng toán học → không cần file mp3
const DURATION = { kick: 0.6, tom: 0.6, snare: 0.3, crash: 1.5 };

export function synthesize(ctx, { type, freq = 200 }) {
  const sr = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.ceil(sr * DURATION[type]), sr);
  const out = buffer.getChannelData(0);
  let phase = 0;
  let prevNoise = 0;

  for (let i = 0; i < out.length; i += 1) {
    const t = i / sr;
    switch (type) {
      case 'kick': {
        const f = 50 + 100 * Math.exp(-t * 30); // pitch rơi nhanh 150 → 50 Hz
        phase += (2 * Math.PI * f) / sr;
        out[i] = Math.sin(phase) * Math.exp(-t * 6);
        break;
      }
      case 'tom': {
        const f = freq * (0.6 + 0.4 * Math.exp(-t * 12));
        phase += (2 * Math.PI * f) / sr;
        out[i] = Math.sin(phase) * Math.exp(-t * 7) * 0.9;
        break;
      }
      case 'snare': {
        const noise = Math.random() * 2 - 1;
        phase += (2 * Math.PI * 180) / sr;
        const body = Math.sin(phase) * Math.exp(-t * 30) * 0.3;
        out[i] = (noise * 0.7 + body) * Math.exp(-t * 18);
        break;
      }
      case 'crash': {
        const noise = Math.random() * 2 - 1;
        const highPassed = noise - prevNoise; // lọc thông cao đơn giản → tiếng chũm chọe
        prevNoise = noise;
        out[i] = highPassed * 0.5 * Math.exp(-t * 3);
        break;
      }
      default:
        out[i] = 0;
    }
  }
  return buffer;
}