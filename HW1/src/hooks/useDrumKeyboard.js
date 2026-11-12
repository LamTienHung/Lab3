import { useEffect } from 'react';

const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color']);

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
  return target.tagName === 'INPUT' && !NON_TEXT_INPUTS.has(target.type);
}

export function useDrumKeyboard(padMap, onPadDown, onPadUp, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return undefined;

    const onKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return; // chống spam + không cướp Ctrl+S
      if (isTyping(e.target)) return;
      const pad = padMap.get(e.code); // e.code: phím vật lý, không bị UniKey ảnh hưởng
      if (!pad) return;
      e.preventDefault();
      onPadDown(pad.id);
    };

    const onKeyUp = (e) => {
      const pad = padMap.get(e.code);
      if (pad) onPadUp(pad.id);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [padMap, onPadDown, onPadUp, isEnabled]);
}