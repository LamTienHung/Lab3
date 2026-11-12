export const MIDI_MIN = 21; // A0
export const MIDI_MAX = 108; // C8
export const OCTAVE_MIN = 0;
export const OCTAVE_MAX = 7;

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

export const midiToFreq = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Sinh 88 phím bằng thuật toán, không hardcode
export const PIANO_KEYS = Array.from({ length: MIDI_MAX - MIDI_MIN + 1 }, (_, i) => {
  const midi = MIDI_MIN + i;
  const pitchClass = midi % 12;
  return {
    midi,
    noteName: `${NOTE_NAMES[pitchClass]}${Math.floor(midi / 12) - 1}`,
    isBlack: BLACK_PITCH_CLASSES.has(pitchClass),
    isC: pitchClass === 0,
    freqHz: midiToFreq(midi),
  };
});

export const KEY_BY_MIDI = new Map(PIANO_KEYS.map((k) => [k.midi, k]));

// Mỗi slot = 1 phím trắng + phím đen ngay sau nó (nếu có) → DOM đúng thứ tự chromatic
export const WHITE_SLOTS = PIANO_KEYS.filter((k) => !k.isBlack).map((white) => {
  const next = KEY_BY_MIDI.get(white.midi + 1);
  return { white, black: next?.isBlack ? next : null };
});

export const BLACK_COUNT = PIANO_KEYS.filter((k) => k.isBlack).length;

console.assert(WHITE_SLOTS.length === 52 && BLACK_COUNT === 36, '88-key layout sai: cần 52 trắng + 36 đen');

// Phím máy tính → số nửa cung tính từ nốt C của quãng tám đang chọn
export const COMPUTER_KEYS = new Map([
  ['KeyA', 0], ['KeyW', 1], ['KeyS', 2], ['KeyE', 3], ['KeyD', 4],
  ['KeyF', 5], ['KeyT', 6], ['KeyG', 7], ['KeyY', 8], ['KeyH', 9],
  ['KeyU', 10], ['KeyJ', 11], ['KeyK', 12], ['KeyO', 13], ['KeyL', 14],
  ['KeyP', 15], ['Semicolon', 16],
]);