import { useCallback, useEffect, useId, useState } from 'react';
import { PADS, PAD_BY_CODE, PAD_BY_ID } from '../data/pads.js';
import { useDrumAudio } from '../hooks/useDrumAudio.js';
import { useDrumKeyboard } from '../hooks/useDrumKeyboard.js';
import { DrumPad } from './DrumPad.jsx';
import { LevelMeter } from './LevelMeter.jsx';
import styles from './DrumMachine.module.css';

const MAX_LOG = 8;

export function DrumMachine() {
  const shortcutId = useId();
  const volumeId = useId();
  const noteId = useId();

  const { status, error, start, play, setVolume, getAnalyser } = useDrumAudio(PADS);
  const [pressed, setPressed] = useState(() => new Set());
  const [hits, setHits] = useState([]);
  const [hitCount, setHitCount] = useState(0);
  const [shortcutsOn, setShortcutsOn] = useState(true);
  const [volume, setVolumeState] = useState(0.8);
  const [note, setNote] = useState('');

  const isReady = status === 'READY';

  const padDown = useCallback(
    (padId) => {
      play(padId);
      setPressed((prev) => (prev.has(padId) ? prev : new Set(prev).add(padId)));
      setHits((prev) => [{ id: crypto.randomUUID(), padId }, ...prev].slice(0, MAX_LOG));
      setHitCount((c) => c + 1);
    },
    [play],
  );

  const padUp = useCallback((padId) => {
    setPressed((prev) => {
      if (!prev.has(padId)) return prev; // cùng reference → không render
      const next = new Set(prev);
      next.delete(padId);
      return next;
    });
  }, []);

  useDrumKeyboard(PAD_BY_CODE, padDown, padUp, shortcutsOn && isReady);

  // Alt+Tab khi đang giữ phím → keyup không về → nhả hết pad
  useEffect(() => {
    const releaseAll = () => setPressed((prev) => (prev.size ? new Set() : prev));
    window.addEventListener('blur', releaseAll);
    return () => window.removeEventListener('blur', releaseAll);
  }, []);

  const handleVolume = (e) => {
    const value = e.target.valueAsNumber;
    const safe = Number.isNaN(value) ? 0 : value;
    setVolumeState(safe);
    setVolume(safe);
  };

  // Derived state: tính trong render, không dùng useEffect
  const latestPad = hits[0] ? PAD_BY_ID.get(hits[0].padId) : null;
  const announcement = latestPad
    ? `Hit ${hitCount}: ${latestPad.name} (${latestPad.label})`
    : 'Chưa có hit nào';

  return (
    <main className={styles.studio}>
      <header className={styles.header}>
        <h1 className={styles.title}>Production Studio Drum Kit</h1>
        {status === 'IDLE' && (
          <button type="button" className={styles.button} onClick={start}>
            Bật Studio
          </button>
        )}
        {status === 'LOADING' && <p role="status">Đang tải âm thanh…</p>}
      </header>

      {status === 'ERROR' && (
        <section role="alert" className={`${styles.section} ${styles.alert}`}>
          <p>Không tải được âm thanh: {error}</p>
          <button type="button" className={styles.button} onClick={start}>
            Thử lại
          </button>
        </section>
      )}

      <section aria-labelledby="pads-title" className={styles.section}>
        <h2 id="pads-title" className={styles.sectionTitle}>Pads</h2>
        <ul className={styles.grid}>
          {PADS.map((pad) => (
            <li key={pad.id}>
              <DrumPad
                pad={pad}
                isPressed={pressed.has(pad.id)}
                disabled={!isReady}
                onDown={padDown}
                onUp={padUp}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="controls-title" className={styles.section}>
        <h2 id="controls-title" className={styles.sectionTitle}>Điều khiển</h2>

        <p className={styles.field}>
          <input
            id={shortcutId}
            type="checkbox"
            checked={shortcutsOn}
            onChange={(e) => setShortcutsOn(e.target.checked)}
          />
          <label htmlFor={shortcutId}>Phím tắt bàn phím (W A S D J K L)</label>
        </p>

        <p className={styles.field}>
          <label htmlFor={volumeId}>Âm lượng</label>
          <input
            id={volumeId}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolume}
          />
        </p>

        <p className={styles.field}>
          <label htmlFor={noteId}>Ghi chú buổi tập</label>
          <input
            id={noteId}
            type="text"
            className={styles.text}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </p>

        <LevelMeter getAnalyser={getAnalyser} isActive={isReady} />
      </section>

      <section aria-labelledby="log-title" className={styles.section}>
        <h2 id="log-title" className={styles.sectionTitle}>Nhật ký đánh</h2>
        <output aria-live="polite" className={styles.latest}>
          {announcement}
        </output>
        <ol className={styles.log}>
          {hits.map((h) => {
            const pad = PAD_BY_ID.get(h.padId);
            return (
              <li key={h.id}>
                {pad.name} ({pad.label})
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}