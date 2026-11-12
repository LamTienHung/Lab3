# TASK_DECOMPOSITION.md — HW 2: 88-Key Polyphonic Piano & FIFO Sequencer

> Lab 3 · React 19 + Vite · Project riêng: `HW2/`
> Quy trình 4 bước: **Slice → Contract → Atomic Generation → Verify & Commit**

## 0. Definition of Done

| # | Tiêu chí | Cách kiểm chứng |
|---|----------|-----------------|
| D1 | 88 phím (A0–C8) sinh bằng thuật toán, 52 trắng + 36 đen, không hardcode | `console.assert` trong `keyboard.js` không báo lỗi |
| D2 | Tần số đúng `f = 440 · 2^((midi − 69)/12)` | `midiToFreq(69) === 440`, `midiToFreq(60) ≈ 261.63` |
| D3 | Tối đa 8 voice; nốt thứ 9 cướp voice cũ nhất (FIFO) | Bật Sustain, bấm lần lượt 9 phím → "Đang vang 8/8", phím đầu tiên tắt sáng |
| D4 | Không có tiếng "pop" khi nhả phím | Nghe khi nhả phím, release ramp 0.25s |
| D5 | Bấm 1 phím → chỉ 1 PianoKey re-render | React DevTools Profiler |
| D6 | Ghi FIFO `{ midi, freqHz, durationMs, deltaMs }`, phát lại ×0.5 / ×1 / ×2 | Ghi một đoạn, phát lại ở 3 tốc độ |
| D7 | Dừng → huỷ mọi nốt đang chờ, tắt tiếng ngay; unmount không rò | Bấm Dừng giữa lúc phát lại; Console không có `Uncaught (in promise)` |
| D8 | Mọi phím là `<button aria-pressed>`, Tab + Enter/Space chơi được; mọi input có label | Bàn phím + Lighthouse |
| D9 | 375px: trang không cuộn ngang, chỉ vùng phím cuộn | DevTools iPhone SE |
| D10 | Zero `<div>` trong component, zero Console error, Lighthouse A11y = 100 | `grep -rn '<div' src/`, Console, Lighthouse |

## 1. WBS

```
HW2
├── T0  Init project + rules          (package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css)
├── T1  Keyboard data                 (src/data/keyboard.js)
├── T2  Polyphonic synth engine       (src/audio/PolyphonicSynth.js)
├── T3  Synth hook + sustain          (src/hooks/useSynth.js)
├── T4  PianoKey component            (src/components/PianoKey.jsx)
├── T5  Computer keyboard hook        (src/hooks/usePianoKeyboard.js)
├── T6  FIFO recorder + replay        (src/hooks/useRecorder.js)
├── T7  GrandPiano composition        (src/components/GrandPiano.jsx)
├── T8  Styling                       (src/components/GrandPiano.module.css)
└── T9  Docs                          (TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md)
```

## 2. Chi tiết task

### T0 — Init project
- **Nội dung:** `package.json`, `vite.config.js`, `index.html` (`lang="vi"`, favicon data URI), `main.jsx` (createRoot + StrictMode), `project-rules.md`.
- **Verify:** `npm run dev` chạy, Console sạch.
- **Commit:** `chore(hw2): init react19 vite project & rules`

### T1 — Keyboard data
- **Contract:**
  ```ts
  interface PianoKeyInfo { midi: number; noteName: string; isBlack: boolean; isC: boolean; freqHz: number }
  export const PIANO_KEYS: readonly PianoKeyInfo[];                     // 88 phím
  export const WHITE_SLOTS: { white: PianoKeyInfo; black: PianoKeyInfo | null }[]; // 52 slot
  export const KEY_BY_MIDI: Map<number, PianoKeyInfo>;
  export const COMPUTER_KEYS: Map<string, number>;                       // e.code → nửa cung
  export function midiToFreq(midi: number): number;
  ```
- **Ràng buộc:** hằng cấp module; DOM theo thứ tự chromatic (trắng, đen kế tiếp).
- **Commit:** `feat(hw2): generate 88 keys algorithmically from MIDI 21-108`

### T2 — Polyphonic synth
- **Contract:**
  ```ts
  class PolyphonicSynth {
    constructor(opts: { maxVoices?: number; onChange?: (midis: number[]) => void });
    noteOn(midi: number): void;   // cướp voice cũ nhất khi đủ maxVoices
    noteOff(midi: number): void;  // ramp release rồi stop
    allNotesOff(): void;
    activeMidis(): number[];
    dispose(): void;
  }
  ```
- **Ràng buộc:** `Map` giữ thứ tự FIFO; AudioContext tạo lazy trong `noteOn`; attack/decay/release bằng `exponentialRampToValueAtTime`; `osc.onended` → disconnect.
- **Commit:** `feat(hw2): add 8-voice PolyphonicSynth with FIFO stealing & ADSR`

### T3 — Synth hook
- **Contract:** `useSynth(maxVoices) → { active: Set<number>, sustain, setSustain, noteOn, noteOff, voiceOn, voiceOff, allNotesOff }`
- **Ràng buộc:** `noteOff` chỉ nhả nốt đang thực sự giữ; sustain giữ nốt đến khi nhả pedal; cleanup `dispose()`.
- **Commit:** `feat(hw2): add useSynth hook with sustain pedal`

### T4 — PianoKey
- **Contract:** `{ keyInfo, isActive, onNoteOn(midi), onNoteOff(midi) }`
- **Ràng buộc:** `memo`; `aria-pressed`; pointer + Enter/Space; chỉ nhả nốt chính nó đã nhấn (`downRef`).
- **Verify:** Profiler: bấm 1 phím → chỉ phím đó render.
- **Commit:** `feat(hw2): add memoized PianoKey with pointer & keyboard input`

### T5 — Computer keyboard
- **Contract:** `usePianoKeyboard({ baseMidi, onNoteOn, onNoteOff, onOctaveShift, isEnabled })`
- **Ràng buộc:** `e.code`; guard repeat/modifier/typing; keyup tra midi đã lưu lúc nhấn (không tính lại theo quãng tám mới); blur → nhả hết; cleanup 3 listener.
- **Commit:** `feat(hw2): add computer keyboard mapping with octave shift`

### T6 — FIFO recorder
- **Contract:**
  ```ts
  type Mode = 'IDLE' | 'RECORDING' | 'PLAYING';
  interface NoteEvent { id: string; midi: number; freqHz: number; durationMs: number; deltaMs: number }
  useRecorder({ voiceOn, voiceOff, allNotesOff }) → {
    mode: Mode; take: NoteEvent[];
    startRecording(); captureOn(midi); captureOff(midi);
    play(speed: 0.5 | 1 | 2): Promise<void>; stop(); clearTake();
  }
  ```
- **Ràng buộc:** phát lại tuần tự theo FIFO; mọi chờ đợi dùng `sleep(ms, signal)`; Stop → `abort()` + `allNotesOff()`; không để promise reject không được xử lý.
- **Commit:** `feat(hw2): add FIFO recorder with abortable variable-speed replay`

### T7 — GrandPiano
- **Ràng buộc:** handler bọc `useCallback`; derived state (danh sách nốt đang vang, tóm tắt bản ghi) tính trong render; mọi input/select có label `useId`; `<output role="status" aria-live="polite">` cho trạng thái recorder.
- **Commit:** `feat(hw2): compose GrandPiano with controls and recorder UI`

### T8 — Styling
- **Ràng buộc:** phím đen đặt `absolute` trong slot phím trắng; vùng phím `overflow-x: auto`, section `min-width: 0`; target ≥ 24px; focus-visible; reduced-motion.
- **Commit:** `style(hw2): add piano layout with scrollable keybed at 375px`

### T9 — Docs
- **Commit:** `docs(hw2): add task decomposition and AI failure audit`

## 3. Task → Commit

| Task | Commit |
|------|--------|
| T0 | `chore(hw2): init react19 vite project & rules` |
| T1 | `feat(hw2): generate 88 keys algorithmically from MIDI 21-108` |
| T2 | `feat(hw2): add 8-voice PolyphonicSynth with FIFO stealing & ADSR` |
| T3 | `feat(hw2): add useSynth hook with sustain pedal` |
| T4 | `feat(hw2): add memoized PianoKey with pointer & keyboard input` |
| T5 | `feat(hw2): add computer keyboard mapping with octave shift` |
| T6 | `feat(hw2): add FIFO recorder with abortable variable-speed replay` |
| T7 | `feat(hw2): compose GrandPiano with controls and recorder UI` |
| T8 | `style(hw2): add piano layout with scrollable keybed at 375px` |
| T9 | `docs(hw2): add task decomposition and AI failure audit` |