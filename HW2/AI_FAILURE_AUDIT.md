# AI_FAILURE_AUDIT.md — HW 2: 88-Key Polyphonic Piano & FIFO Sequencer

**Công cụ AI đã dùng:** Claude (chat)
**Đã nạp project-rules.md:** Có

---

## Failure #01: Quy trình tạo package.json bằng copy-paste → EJSONPARSE (lặp lại từ HW1)

- **Task:** T0 — Init project
- **Prompt:** "ok qua hw2 đi"
- **AI Output:** Đưa nội dung `package.json` để copy-paste thủ công vào editor, dù lỗi này đã xảy ra ở HW1.
- **Bug:** File `package.json` được tạo nhưng chưa lưu → nội dung rỗng → mọi lệnh npm đều thất bại.
- **Terminal Proof:**
  `npm error code EJSONPARSE — Invalid package.json: JSONParseError: Unexpected end of JSON input while parsing empty string`
  (xuất hiện 3 lần liên tiếp tại `Lab3\HW2>`)
- **Engineering Fix:** Tạo file bằng CLI thay vì copy-paste, bật File → Auto Save:
  ```powershell
  Remove-Item package.json
  npm init -y
  npm pkg set name=hw2-grand-piano type=module scripts.dev=vite "scripts.build=vite build" "scripts.preview=vite preview"
  ```
  Commit: `chore(hw2): init react19 vite project & rules`
- **Verify sau fix:** `npm run dev` chạy, trang mở tại `localhost:5173`.

---

## Failure #02: Callback inline làm `memo` vô dụng → 88 phím cùng re-render

- **Task:** T4 / T7
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```jsx
  <PianoKey keyInfo={white} isActive={...}
    onNoteOn={(midi) => synth.noteOn(midi)}
    onNoteOff={(midi) => synth.noteOff(midi)} />
  ```
- **Bug:** Mỗi lần GrandPiano render tạo arrow function mới → props của cả 88 PianoKey đổi → `memo` không chặn được re-render.
- **Engineering Fix:** `handleNoteOn` / `handleNoteOff` bọc `useCallback`; `keyInfo` là object hằng từ `WHITE_SLOTS` (cấp module).
  Commit: `feat(hw2): compose GrandPiano with controls and recorder UI`
- **Verify sau fix:** React DevTools Profiler → bấm 1 phím → chỉ 1 PianoKey render.

---

## Failure #03: Bấm Dừng khi đang phát lại → `Uncaught (in promise) AbortError`

- **Task:** T6
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  releases.push(sleep(event.durationMs / speed, signal).then(() => voiceOff(event.midi)));
  ```
- **Bug:** Khi abort, các promise trong `releases` reject sau khi vòng lặp đã thoát, trước `Promise.all` → không có handler → Console báo lỗi đỏ, vi phạm zero Console error.
- **Engineering Fix:** Thêm nhánh reject rỗng, Stop tự tắt mọi nốt:
  ```js
  releases.push(
    sleep(event.durationMs / speed, signal).then(
      () => voiceOff(event.midi),
      () => {}, // bị abort → Stop đã gọi allNotesOff()
    ),
  );
  ```
  Commit: `feat(hw2): add FIFO recorder with abortable variable-speed replay`
- **Verify sau fix:** Ghi một đoạn → phát lại ×0.5 → bấm Dừng giữa chừng → tiếng tắt ngay, Console sạch.

---

## Failure #04: Phím kẹt khi đổi quãng tám trong lúc đang giữ phím

- **Task:** T5
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  const onKeyUp = (e) => {
    const offset = COMPUTER_KEYS.get(e.code);
    if (offset !== undefined) onNoteOff(baseMidi + offset); // tính theo quãng tám MỚI
  };
  ```
- **Bug:** Giữ A (C4) → nhấn X (lên C5) → nhả A → keyup nhả C5 thay vì C4 → C4 vang mãi.
- **Engineering Fix:** Lưu `e.code → midi` lúc keydown vào `pressedRef` (giữ qua các lần re-bind effect); keyup tra lại đúng midi đã nhấn.
  Commit: `feat(hw2): add computer keyboard mapping with octave shift`
- **Verify sau fix:** Giữ A → nhấn X → nhả A → "Đang vang: 0/8".

---

## Failure #05: `osc.stop()` ngay lập tức → tiếng "pop" khi nhả phím

- **Task:** T2
- **Phát hiện:** Review code trước khi commit (đối chiếu yêu cầu "Click-Free ADSR" trên slide).
- **AI Code (bản nháp):**
  ```js
  noteOff(midi) {
    this.voices.get(midi).osc.stop();
    this.voices.delete(midi);
  }
  ```
- **Bug:** Cắt sóng đột ngột giữa chu kỳ → tiếng "tách" mỗi lần nhả phím.
- **Engineering Fix:** `cancelScheduledValues` → `setValueAtTime(gain hiện tại)` → `exponentialRampToValueAtTime(0.0001, now + 0.25)` → `osc.stop(now + 0.27)`; `osc.onended` → `disconnect()`.
  Commit: `feat(hw2): add 8-voice PolyphonicSynth with FIFO stealing & ADSR`
- **Verify sau fix:** Nhả phím A1, A2 (nốt trầm) không còn tiếng tách.

---

## Tổng kết

| # | Lỗi | Phát hiện bằng | Commit fix |
|---|-----|----------------|------------|
| 01 | package.json rỗng (EJSONPARSE) | Terminal | `chore(hw2): init react19 vite project & rules` |
| 02 | memo vô dụng do callback inline | Review + Profiler | `feat(hw2): compose GrandPiano with controls and recorder UI` |
| 03 | Unhandled AbortError khi Stop | Review + Console | `feat(hw2): add FIFO recorder with abortable variable-speed replay` |
| 04 | Phím kẹt khi đổi quãng tám | Review + output "Đang vang" | `feat(hw2): add computer keyboard mapping with octave shift` |
| 05 | Tiếng pop khi nhả phím | Review + nghe | `feat(hw2): add 8-voice PolyphonicSynth with FIFO stealing & ADSR` |

**Bài học:** AI viết đúng luồng chính (bấm → kêu → nhả) nhưng dễ bỏ qua các tình huống chồng chéo: đổi trạng thái giữa chừng, huỷ tác vụ bất đồng bộ, reference không ổn định. Ngoài ra, khi một lỗi môi trường đã xảy ra (EJSONPARSE ở HW1), AI vẫn lặp lại cùng quy trình thay vì đổi sang cách an toàn hơn. Em bổ sung vào `project-rules.md`:

```
14. CLI FIRST: Tạo package.json bằng npm init -y + npm pkg set, không copy-paste thủ công.
```