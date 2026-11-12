import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { KEY_BY_MIDI, OCTAVE_MAX, OCTAVE_MIN, WHITE_SLOTS } from '../data/keyboard.js';
import { useSynth } from '../hooks/useSynth.js';
import { usePianoKeyboard } from '../hooks/usePianoKeyboard.js';
import { useRecorder } from '../hooks/useRecorder.js';
import { PianoKey } from './PianoKey.jsx';
import styles from './GrandPiano.module.css';

const MAX_VOICES = 8;
const SPEEDS = [0.5, 1, 2];

function takeLengthMs(take) {
  let t = 0;
  let end = 0;
  for (const event of take) {
    t += event.deltaMs;
    end = Math.max(end, t + event.durationMs);
  }
  return end;
}

export function GrandPiano() {
  const kbId = useId();
  const sustainId = useId();
  const speedId = useId();
  const keysRef = useRef(null);

  const synth = useSynth(MAX_VOICES);
  const recorder = useRecorder({
    voiceOn: synth.voiceOn,
    voiceOff: synth.voiceOff,
    allNotesOff: synth.allNotesOff,
  });

  const [octave, setOctave] = useState(4);
  const [speed, setSpeed] = useState(1);
  const [kbOn, setKbOn] = useState(true);

  const { noteOn, noteOff } = synth;
  const { captureOn, captureOff } = recorder;

  const handleNoteOn = useCallback(
    (midi) => {
      noteOn(midi);
      captureOn(midi);
    },
    [noteOn, captureOn],
  );

  const handleNoteOff = useCallback(
    (midi) => {
      noteOff(midi);
      captureOff(midi);
    },
    [noteOff, captureOff],
  );

  const shiftOctave = useCallback((delta) => {
    setOctave((o) => Math.min(OCTAVE_MAX, Math.max(OCTAVE_MIN, o + delta)));
  }, []);

  usePianoKeyboard({
    baseMidi: (octave + 1) * 12,
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
    onOctaveShift: shiftOctave,
    isEnabled: kbOn,
  });

  // Cuộn bàn phím tới giữa C4 khi mount
  useEffect(() => {
    keysRef.current
      ?.querySelector('[data-midi="60"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  // Derived state
  const activeNames = [...synth.active].map((m) => KEY_BY_MIDI.get(m).noteName).join(' ');
  const { mode, take } = recorder;
  const isIdle = mode === 'IDLE';
  const statusText =
    mode === 'RECORDING'
      ? 'Đang ghi… bấm Dừng để kết thúc'
      : mode === 'PLAYING'
        ? `Đang phát lại ×${speed}`
        : take.length > 0
          ? `Bản ghi: ${take.length} nốt · ${(takeLengthMs(take) / 1000).toFixed(1)} giây`
          : 'Chưa có bản ghi';

  return (
    <main className={styles.app}>
      <header>
        <h1 className={styles.title}>88-Key Grand Piano</h1>
        <p className={styles.hint}>
          Bàn phím máy tính: <kbd>A</kbd>–<kbd>;</kbd> phím trắng, <kbd>W E T Y U O P</kbd> phím đen,{' '}
          <kbd>Z</kbd>/<kbd>X</kbd> đổi quãng tám.
        </p>
      </header>

      <section aria-labelledby="controls-title" className={styles.section}>
        <h2 id="controls-title" className={styles.sectionTitle}>Điều khiển</h2>
        <ul className={styles.controls}>
          <li className={styles.field}>
            <input id={kbId} type="checkbox" checked={kbOn} onChange={(e) => setKbOn(e.target.checked)} />
            <label htmlFor={kbId}>Chơi bằng bàn phím máy tính</label>
          </li>
          <li className={styles.field}>
            <input
              id={sustainId}
              type="checkbox"
              checked={synth.sustain}
              onChange={(e) => synth.setSustain(e.target.checked)}
            />
            <label htmlFor={sustainId}>Sustain pedal</label>
          </li>
          <li className={styles.field}>
            <button
              type="button"
              className={styles.button}
              aria-label="Giảm quãng tám"
              disabled={octave === OCTAVE_MIN}
              onClick={() => shiftOctave(-1)}
            >
              −
            </button>
            <output aria-live="polite">Quãng tám: C{octave}</output>
            <button
              type="button"
              className={styles.button}
              aria-label="Tăng quãng tám"
              disabled={octave === OCTAVE_MAX}
              onClick={() => shiftOctave(1)}
            >
              +
            </button>
          </li>
          <li className={styles.field}>
            <output>
              Đang vang: {synth.active.size}/{MAX_VOICES}
              {activeNames && ` · ${activeNames}`}
            </output>
          </li>
        </ul>
      </section>

      <section aria-labelledby="keys-title" className={styles.section}>
        <h2 id="keys-title" className={styles.sectionTitle}>Bàn phím</h2>
        <ul ref={keysRef} className={styles.keys} aria-label="88 phím, từ A0 đến C8">
          {WHITE_SLOTS.map(({ white, black }) => (
            <li key={white.midi} className={styles.slot}>
              <PianoKey
                keyInfo={white}
                isActive={synth.active.has(white.midi)}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
              />
              {black && (
                <PianoKey
                  keyInfo={black}
                  isActive={synth.active.has(black.midi)}
                  onNoteOn={handleNoteOn}
                  onNoteOff={handleNoteOff}
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rec-title" className={styles.section}>
        <h2 id="rec-title" className={styles.sectionTitle}>Ghi &amp; phát lại (FIFO)</h2>
        <ul className={styles.controls}>
          <li>
            <button type="button" className={styles.button} disabled={!isIdle} onClick={recorder.startRecording}>
              ● Ghi
            </button>
          </li>
          <li>
            <button type="button" className={styles.button} disabled={isIdle} onClick={recorder.stop}>
              ■ Dừng
            </button>
          </li>
          <li>
            <button
              type="button"
              className={styles.button}
              disabled={!isIdle || take.length === 0}
              onClick={() => recorder.play(speed)}
            >
              ▶ Phát lại
            </button>
          </li>
          <li>
            <button
              type="button"
              className={styles.button}
              disabled={!isIdle || take.length === 0}
              onClick={recorder.clearTake}
            >
              Xoá bản ghi
            </button>
          </li>
          <li className={styles.field}>
            <label htmlFor={speedId}>Tốc độ</label>
            <select
              id={speedId}
              className={styles.select}
              value={speed}
              disabled={!isIdle}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  ×{s}
                </option>
              ))}
            </select>
          </li>
        </ul>

        <output role="status" aria-live="polite" className={styles.status}>
          {statusText}
        </output>

        {take.length > 0 && (
          <ol className={styles.take}>
            {take.slice(0, 16).map((event) => (
              <li key={event.id}>
                {KEY_BY_MIDI.get(event.midi).noteName} · {Math.round(event.durationMs)} ms
              </li>
            ))}
            {take.length > 16 && <li>… và {take.length - 16} nốt nữa</li>}
          </ol>
        )}
      </section>
    </main>
  );
}