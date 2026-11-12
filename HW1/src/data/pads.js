export const PADS = [
  { id: 'tom1', code: 'KeyW', label: 'W', name: 'Tom 1', src: '/sounds/tom-1.mp3', synth: { type: 'tom', freq: 220 } },
  { id: 'tom2', code: 'KeyA', label: 'A', name: 'Tom 2', src: '/sounds/tom-2.mp3', synth: { type: 'tom', freq: 180 } },
  { id: 'tom3', code: 'KeyS', label: 'S', name: 'Tom 3', src: '/sounds/tom-3.mp3', synth: { type: 'tom', freq: 140 } },
  { id: 'tom4', code: 'KeyD', label: 'D', name: 'Tom 4', src: '/sounds/tom-4.mp3', synth: { type: 'tom', freq: 110 } },
  { id: 'snare', code: 'KeyJ', label: 'J', name: 'Snare', src: '/sounds/snare.mp3', synth: { type: 'snare' } },
  { id: 'crash', code: 'KeyK', label: 'K', name: 'Crash', src: '/sounds/crash.mp3', synth: { type: 'crash' } },
  { id: 'kick', code: 'KeyL', label: 'L', name: 'Kick', src: '/sounds/kick-bass.mp3', synth: { type: 'kick' } },
];

// Hằng cấp module → reference không đổi giữa các lần render
export const PAD_BY_CODE = new Map(PADS.map((p) => [p.code, p]));
export const PAD_BY_ID = new Map(PADS.map((p) => [p.id, p]));