import { useEffect, useRef } from 'react';
import { COMPUTER_KEYS, MIDI_MAX, MIDI_MIN } from '../data/keyboard.js';

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color']);

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.tagName === 'TEXTAREA') return true;
  return target.tagName === 'INPUT' && !NON_TEXT_INPUTS.has(target.type);
}

export function usePianoKeyboard({ baseMidi, onNoteOn, onNoteOff, onOctaveShift, isEnabled = true }) {
  // e.code → midi lúc nhấn; giữ qua các lần re-bind để keyup luôn nhả đúng nốt
  const pressedRef = useRef(new Map());

  useEffect(() => {
    if (!isEnabled) return undefined;
    const pressed = pressedRef.current;

    const onKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;

      if (e.code === 'KeyZ' || e.code === 'KeyX') {
        e.preventDefault();
        onOctaveShift(e.code === 'KeyZ' ? -1 : 1);
        return;
      }

      const offset = COMPUTER_KEYS.get(e.code);
      if (offset === undefined) return;
      const midi = baseMidi + offset;
      if (midi < MIDI_MIN || midi > MIDI_MAX) return;

      e.preventDefault();
      pressed.set(e.code, midi);
      onNoteOn(midi);
    };

    const onKeyUp = (e) => {
      const midi = pressed.get(e.code);
      if (midi === undefined) return;
      pressed.delete(e.code);
      onNoteOff(midi);
    };

    const onBlur = () => {
      for (const midi of pressed.values()) onNoteOff(midi);
      pressed.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [baseMidi, onNoteOn, onNoteOff, onOctaveShift, isEnabled]);
}