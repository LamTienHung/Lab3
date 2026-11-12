# AI_FAILURE_AUDIT.md — HW 1: Production Studio Drum Kit

**Công cụ AI đã dùng:** <ChatGPT / Claude / Cursor / Copilot>
**Đã nạp project-rules.md:** <có / không>

## Failure #01: Dùng `keyCode` / `e.key` thay vì `e.code`
- **Task:** T3
- **Prompt:** <prompt của bạn>
- **AI Code:**
  ```js
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 87) playSound('tom-1');
  });
  ```
- **Bug:** `keyCode` deprecated; `e.key` đổi giá trị khi bật UniKey/Caps Lock → pad không kêu.
- **DevTools Proof:** <ảnh Console log e.key vs e.code khi bật UniKey>
- **Fix (Commit <hash>):** tra `PAD_BY_CODE.get(e.code)` với `'KeyW'`, `'KeyA'`, …

## Failure #02: Listener bị gỡ/gắn lại sau mỗi render
- **Task:** T3 / T6
- **Prompt:** <prompt>
- **AI Code:**
  ```jsx
  const padMap = new Map(PADS.map((p) => [p.code, p])); // tạo mới mỗi render
  const handleTrigger = (id) => { play(id); setHits(...); }; // không useCallback
  useDrumKeyboard(padMap, handleTrigger);
  ```
- **Bug:** deps của useEffect luôn đổi → mỗi hit lại remove + add listener.
- **DevTools Proof:** <console.count('bind keyboard') tăng theo mỗi hit>
- **Fix (Commit <hash>):** `PAD_BY_CODE` lên cấp module; `useCallback` cho `padDown`/`padUp`.

## Failure #03: Tạo AudioContext trước user gesture
- **Task:** T2
- **Prompt:** <prompt>
- **AI Code:**
  ```js
  const ctx = new AudioContext(); // cấp module hoặc useEffect mount
  ```
- **Bug:** Console warning "The AudioContext was not allowed to start" → vi phạm zero warning.
- **DevTools Proof:** <ảnh Console khi load trang>
- **Fix (Commit <hash>):** chỉ tạo context trong `start()` gọi từ nút "Bật Studio".

## Failure #04 (tuỳ chọn): Không bỏ qua Ctrl/Cmd
- **Bug:** Ctrl+S / Ctrl+D vẫn kêu, `preventDefault` chặn phím tắt trình duyệt.
- **Fix (Commit <hash>):** `if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;`

## Failure #05 (tuỳ chọn): aria-live trên cả danh sách / thiếu cancel rAF
- **Bug:** screen reader đọc lặp; rAF chạy tiếp sau unmount.
- **Fix (Commit <hash>):** aria-live chỉ trên `<output>` hit mới nhất; `return () => cancelAnimationFrame(rafId)`.

## Tổng kết

| # | Lỗi | Phát hiện bằng | Commit fix |
|---|-----|----------------|------------|
| 01 | keyCode / e.key | | |
| 02 | Listener re-bind | | |
| 03 | AudioContext trước gesture | | |

**Bài học:** <bạn đã thêm gì vào project-rules.md>