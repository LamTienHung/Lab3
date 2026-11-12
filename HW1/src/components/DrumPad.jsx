import { memo } from 'react';
import styles from './DrumMachine.module.css';

const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';

export const DrumPad = memo(function DrumPad({ pad, isPressed, disabled, onDown, onUp }) {
  return (
    <button
      type="button"
      className={styles.pad}
      aria-pressed={isPressed}
      aria-keyshortcuts={pad.label}
      disabled={disabled}
      onPointerDown={() => onDown(pad.id)}
      onPointerUp={() => onUp(pad.id)}
      onPointerLeave={() => onUp(pad.id)}
      onPointerCancel={() => onUp(pad.id)}
      onKeyDown={(e) => {
        if (isActivateKey(e) && !e.repeat) {
          e.preventDefault();
          onDown(pad.id);
        }
      }}
      onKeyUp={(e) => {
        if (isActivateKey(e)) onUp(pad.id);
      }}
    >
      <kbd className={styles.key}>{pad.label}</kbd>
      <span>{pad.name}</span>
    </button>
  );
});