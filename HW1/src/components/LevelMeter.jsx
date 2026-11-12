import { useEffect, useId, useState } from 'react';
import styles from './DrumMachine.module.css';

const FLOOR_DB = -60;

export function LevelMeter({ getAnalyser, isActive }) {
  const id = useId();
  const [db, setDb] = useState(FLOOR_DB);

  useEffect(() => {
    const analyser = isActive ? getAnalyser() : null;
    if (!analyser) return undefined;

    const data = new Float32Array(analyser.fftSize);
    let rafId = 0;

    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (const sample of data) sum += sample * sample;
      const rms = Math.sqrt(sum / data.length);
      const next = Math.max(FLOOR_DB, 20 * Math.log10(rms || 1e-6));
      setDb(Math.round(next)); // làm tròn → Object.is bỏ qua render khi không đổi
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getAnalyser, isActive]);

  return (
    <p className={styles.field}>
      <label htmlFor={id}>Mức âm lượng</label>
      <meter
        id={id}
        className={styles.meter}
        min={FLOOR_DB}
        max={0}
        low={-18}
        high={-6}
        optimum={-30}
        value={db}
      >
        {db} dB
      </meter>
      <span aria-hidden="true">{db} dB</span>
    </p>
  );
}