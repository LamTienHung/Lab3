import { memo, useRef } from 'react';
import styles from './GrandPiano.module.css';

const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';

export const PianoKey = memo(function PianoKey({ keyInfo, isActive, onNoteOn, onNoteOff }) {
  const downRef = useRef(false); // chỉ nhả nốt mà chính phím này đã nhấn
  const { midi, noteName, isBlack, isC } = keyInfo;

  const press = () => {
    if (downRef.current) return;
    downRef.current = true;
    onNoteOn(midi);
  };

  const release = () => {
    if (!downRef.current) return;
    downRef.current = false;
    onNoteOff(midi);
  };

  return (
    <button
      type="button"
      data-midi={midi}
      className={isBlack ? styles.black : styles.white}
      aria-pressed={isActive}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={(e) => {
        if (isActivateKey(e) && !e.repeat) {
          e.preventDefault();
          press();
        }
      }}
      onKeyUp={(e) => {
        if (isActivateKey(e)) release();
      }}
      onBlur={release}
    >
      <span className={isC ? styles.label : styles.srOnly}>{noteName}</span>
    </button>
  );
});