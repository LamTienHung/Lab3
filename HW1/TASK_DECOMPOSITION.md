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
| D8 | Zero `<div>` trong component, zero Console warning, mọi effect có cleanup | `grep -rn '<div' src/`, Console, StrictMode |
| D9 | Lighthouse Accessibility = 100 | Audit trên `npm run build && npm run preview` |

## 1. WBS

```
hw1-drum-kit
├── T0  Init project + rules
├── T1  Pad config            (src/data/pads.js)
├── T2  Audio engine hook     (src/hooks/useDrumAudio.js)
├── T3  Keyboard hook         (src/hooks/useDrumKeyboard.js)
├── T4  DrumPad component     (src/components/DrumPad.jsx)
├── T5  Hit log + Level meter (src/components/LevelMeter.jsx)
├── T6  Controls              (src/components/DrumMachine.jsx)
├── T7  Styling               (src/components/DrumMachine.module.css, src/index.css)
└── T8  Audit & docs          (AI_FAILURE_AUDIT.md)
```

## 2. Chi tiết task

### T0 — Init project
- Tạo Vite React, xoá file mẫu, thêm `project-rules.md`, `index.html` (`lang="vi"`, title, description), `main.jsx` (createRoot + StrictMode).
- **Commit:** `chore(hw1): init react19 vite project & rules`

### T1 — Pad config
- **Contract:**
  ```ts
  interface Pad { id: string; code: `Key${string}`; label: string; name: string; src: string }
  export const PADS: readonly Pad[];
  export const PAD_BY_CODE: Map<string, Pad>; // hằng cấp module → reference ổn định
  export const PAD_BY_ID: Map<string, Pad>;
  ```
- **Verify:** `PAD_BY_CODE.size === 7`; mọi `src` trả HTTP 200.
- **Commit:** `feat(hw1): add pad config with stable code/id maps`

### T2 — Audio engine
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
  ```
- **Ràng buộc:** không tạo AudioContext ở cấp module; fetch có AbortController; bỏ qua AbortError; cleanup `abort()` + `ctx.close()`.
- **Verify:** Console không warning autoplay; Slow 3G thấy LOADING; src sai → `role="alert"` + nút Thử lại.
- **Commit:** `feat(hw1): add useDrumAudio 4-state loader with AbortController`

### T3 — Keyboard hook
- **Contract:**
  ```ts
  function useDrumKeyboard(padMap: Map<string, Pad>, onPadDown: (id: string) => void,
                           onPadUp: (id: string) => void, isEnabled?: boolean): void;
  ```
- **Ràng buộc:** `e.code`; guard `e.repeat`; bỏ qua ctrl/meta/alt; chỉ bỏ qua input dạng văn bản (không bỏ qua checkbox/range); có keyup; cleanup gỡ cả 2 listener.
- **Verify:** Elements → Event Listeners trên `window`: đúng 1 keydown + 1 keyup, không tăng khi chơi.
- **Commit:** `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards`

### T4 — DrumPad
- **Contract:** `{ pad, isPressed, disabled, onDown(id), onUp(id) }`
- **Ràng buộc:** `memo`; `aria-pressed`, `aria-keyshortcuts`; pointerdown + Enter/Space keydown; nhả ở pointerup/leave/cancel/keyup; window `blur` → nhả hết pad.
- **Verify:** Profiler: bấm 1 pad → chỉ pad đó re-render.
- **Commit:** `feat(hw1): render memoized DrumPad grid with aria-pressed`

### T5 — Hit log + Level meter
- **Contract:** `hits: { id, padId }[]` immutable, tối đa 8; `<output aria-live="polite">` = hit mới nhất (derived); `<LevelMeter getAnalyser isActive />` → `<meter min=-60 max=0>`.
- **Ràng buộc:** rAF có `cancelAnimationFrame`; meter không có aria-live; state meter cục bộ, dB làm tròn.
- **Verify:** Khi im lặng LevelMeter không render liên tục; screen reader chỉ đọc 1 dòng/hit.
- **Commit:** `feat(hw1): add aria-live hit log and <meter> level meter`

### T6 — Controls
- **Contract:** checkbox `shortcutsOn` → `isEnabled`; range volume đọc `valueAsNumber`; ô text "Ghi chú buổi tập".
- **Ràng buộc:** mọi input có `<label htmlFor={useId()}>`.
- **Commit:** `feat(hw1): add shortcut toggle (WCAG 2.1.4) and volume control`

### T7 — Styling
- **Ràng buộc:** custom properties; `repeat(auto-fit, minmax(88px, 1fr))`; style theo `[aria-pressed='true']`; `:focus-visible` 3px; `prefers-reduced-motion`; không inline style.
- **Commit:** `style(hw1): responsive 375px module, focus-visible, reduced motion`

### T8 — Audit & docs
- **Verify:** ≥ 3 lỗi AI thật có bằng chứng DevTools + commit fix; ảnh Lighthouse 100.
- **Commit:** `docs(hw1): record AI failures in AI_FAILURE_AUDIT.md`

## 3. Task → Commit

| Task | Commit | Hash |
|------|--------|------|
| T0 | `chore(hw1): init react19 vite project & rules` | |
| T1 | `feat(hw1): add pad config with stable code/id maps` | |
| T2 | `feat(hw1): add useDrumAudio 4-state loader with AbortController` | |
| T3 | `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards` | |
| T4 | `feat(hw1): render memoized DrumPad grid with aria-pressed` | |
| T5 | `feat(hw1): add aria-live hit log and <meter> level meter` | |
| T6 | `feat(hw1): add shortcut toggle (WCAG 2.1.4) and volume control` | |
| T7 | `style(hw1): responsive 375px module, focus-visible, reduced motion` | |
| T8 | `docs(hw1): record AI failures in AI_FAILURE_AUDIT.md` | |