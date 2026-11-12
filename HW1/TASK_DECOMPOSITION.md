# TASK_DECOMPOSITION.md — HW 1: Production Studio Drum Kit

> Lab 3 · React 19 + Vite · Project riêng: `hw1-drum-kit/`
> Quy trình 4 bước: **Slice → Contract → Atomic Generation → Verify & Commit**
> Mỗi task = 1 prompt nhỏ (nếu dùng AI) = 1 commit.

## 0. Definition of Done

| # | Tiêu chí | Cách kiểm chứng |
|---|----------|-----------------|
| D1 | Phím `W A S D J K L` kích hoạt pad qua `e.code` | Bật UniKey (Telex) → vẫn kêu đúng |
| D2 | Giữ phím chỉ kêu 1 lần (`e.repeat`), bỏ qua Ctrl/Cmd/Alt | Giữ W; nhấn Ctrl+S |
| D3 | Không kêu khi đang gõ trong ô văn bản / textarea / select / contentEditable | Gõ "wasd" vào ô "Ghi chú buổi tập" |
| D4 | Pad là `<button type="button" aria-pressed>`, dùng được bằng chuột, cảm ứng, Tab + Enter/Space | Chơi hết chỉ bằng bàn phím |
| D5 | Hit log `aria-live="polite"` (chỉ hit mới nhất) + `<meter>` decibel | NVDA/Narrator + quan sát meter |
| D6 | Có công tắc tắt phím tắt 1 ký tự (WCAG 2.1.4) | Tắt checkbox → bấm W không kêu |
| D7 | 375px không cuộn ngang, focus-visible, target ≥ 24×24px, contrast ≥ 4.5:1, reduced-motion | DevTools iPhone SE |
| D8 | Zero `<div>` trong component, zero Console error/warning, mọi effect có cleanup | `grep -rn '<div' src/`, Console, StrictMode |
| D9 | Lighthouse Accessibility = 100 | Audit trên `npm run build && npm run preview` |

## 1. WBS

```
hw1-drum-kit
├── T0  Init project + rules        (package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css)
├── T1  Pad config                  (src/data/pads.js)
├── T2  Audio engine + synth        (src/hooks/useDrumAudio.js, src/audio/synthDrums.js)
├── T3  Keyboard hook               (src/hooks/useDrumKeyboard.js)
├── T4  DrumPad component           (src/components/DrumPad.jsx)
├── T5  Level meter                 (src/components/LevelMeter.jsx)
├── T6  DrumMachine composition     (src/components/DrumMachine.jsx)
├── T7  Styling                     (src/components/DrumMachine.module.css)
├── T8  Docs                        (TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md)
└── T9  Console fix                 (index.html favicon)
```

## 2. Chi tiết task

### T0 — Init project
- **Nội dung:** `package.json` (scripts dev/build/preview, `type: module`), `vite.config.js` (plugin react), `.gitignore`, `index.html` (`lang="vi"`, title, description), `main.jsx` (createRoot + StrictMode), `project-rules.md`.
- **Verify:** `npm run dev` chạy được.
- **Commit:** `chore(hw1): init react19 vite project & rules`

### T1 — Pad config
- **Contract:**
  ```ts
  interface Pad {
    id: string; code: `Key${string}`; label: string; name: string;
    src: string; synth: { type: 'tom' | 'snare' | 'crash' | 'kick'; freq?: number };
  }
  export const PADS: readonly Pad[];
  export const PAD_BY_CODE: Map<string, Pad>; // hằng cấp module → reference ổn định
  export const PAD_BY_ID: Map<string, Pad>;
  ```
- **Verify:** `PAD_BY_CODE.size === 7`.
- **Commit:** `feat(hw1): add pad config with stable code/id maps`

### T2 — Audio engine + synth fallback
- **Contract:**
  ```ts
  type AudioStatus = 'IDLE' | 'LOADING' | 'READY' | 'ERROR';
  function useDrumAudio(pads: readonly Pad[]): {
    status: AudioStatus; error: string | null;
    start(): Promise<void>;     // chỉ gọi từ user gesture
    play(padId: string): void;  // mỗi hit 1 BufferSource mới
    setVolume(v: number): void; // 0..1
    getAnalyser(): AnalyserNode | null;
  }
  function synthesize(ctx: BaseAudioContext, synth: Pad['synth']): AudioBuffer;
  ```
- **Ràng buộc:** không tạo AudioContext ở cấp module; fetch có AbortController; bỏ qua AbortError; thiếu file / lỗi decode → fallback `synthesize`; cleanup `abort()` + `ctx.close()`.
- **Verify:** Console không warning autoplay; không có `public/sounds/` vẫn READY và đủ 7 tiếng.
- **Commit:** `feat(hw1): add useDrumAudio 4-state loader with synth fallback`

### T3 — Keyboard hook
- **Contract:**
  ```ts
  function useDrumKeyboard(padMap: Map<string, Pad>, onPadDown: (id: string) => void,
                           onPadUp: (id: string) => void, isEnabled?: boolean): void;
  ```
- **Ràng buộc:** `e.code`; guard `e.repeat`; bỏ qua ctrl/meta/alt; chỉ bỏ qua input dạng văn bản (không bỏ qua checkbox/range); có keyup; cleanup gỡ cả 2 listener.
- **Verify:** Elements → Event Listeners trên `window`: đúng 1 keydown + 1 keyup; click checkbox rồi nhấn W vẫn kêu.
- **Commit:** `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards`

### T4 — DrumPad
- **Contract:** `{ pad, isPressed, disabled, onDown(id), onUp(id) }`
- **Ràng buộc:** `memo`; `aria-pressed`, `aria-keyshortcuts`; pointerdown + Enter/Space keydown; nhả ở pointerup/leave/cancel/keyup.
- **Verify:** Profiler: bấm 1 pad → chỉ pad đó re-render.
- **Commit:** `feat(hw1): add memoized DrumPad with aria-pressed`

### T5 — Level meter
- **Contract:** `<LevelMeter getAnalyser isActive />` → `<meter min=-60 max=0>`.
- **Ràng buộc:** state cục bộ, dB làm tròn; rAF có `cancelAnimationFrame`; không có aria-live.
- **Verify:** Khi im lặng LevelMeter không render liên tục (Profiler).
- **Commit:** `feat(hw1): add <meter> level meter with rAF cleanup`

### T6 — DrumMachine composition
- **Contract:** `hits: { id, padId }[]` immutable, tối đa 8; `<output aria-live="polite">` = hit mới nhất (derived); checkbox `shortcutsOn` → `isEnabled`; range volume đọc `valueAsNumber`; ô text "Ghi chú buổi tập"; window `blur` → nhả hết pad.
- **Ràng buộc:** mọi input có `<label htmlFor={useId()}>`; handler bọc `useCallback`.
- **Verify:** D1–D6.
- **Commit:** `feat(hw1): compose DrumMachine with hit log, shortcut toggle & volume`

### T7 — Styling
- **Ràng buộc:** custom properties; `repeat(auto-fit, minmax(88px, 1fr))`; style theo `[aria-pressed='true']`; `:focus-visible` 3px; `prefers-reduced-motion`; không inline style.
- **Verify:** D7.
- **Commit:** `style(hw1): responsive 375px module, focus-visible, reduced motion`

### T8 — Docs
- **Commit:** `docs(hw1): add task decomposition and AI failure audit`

### T9 — Console fix
- **Ràng buộc:** favicon dạng data URI trong `index.html`.
- **Verify:** Console không còn 404 `favicon.ico`.
- **Commit:** `fix(hw1): add inline favicon to remove 404 console error`

## 3. Task → Commit

| Task | Commit |
|------|--------|
| T0 | `chore(hw1): init react19 vite project & rules` |
| T1 | `feat(hw1): add pad config with stable code/id maps` |
| T2 | `feat(hw1): add useDrumAudio 4-state loader with synth fallback` |
| T3 | `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards` |
| T4 | `feat(hw1): add memoized DrumPad with aria-pressed` |
| T5 | `feat(hw1): add <meter> level meter with rAF cleanup` |
| T6 | `feat(hw1): compose DrumMachine with hit log, shortcut toggle & volume` |
| T7 | `style(hw1): responsive 375px module, focus-visible, reduced motion` |
| T8 | `docs(hw1): add task decomposition and AI failure audit` |
| T9 | `fix(hw1): add inline favicon to remove 404 console error` |