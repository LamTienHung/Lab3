# AI_FAILURE_AUDIT.md — HW 1: Production Studio Drum Kit

**Công cụ AI đã dùng:** Claude (chat)
**Đã nạp project-rules.md:** Có (rules được viết cùng lúc với code, mục 1–9)

---

## Failure #01: Thiếu favicon → Console báo lỗi 404

- **Task:** T0 — Init project
- **Prompt:** "ghi lại toàn bộ các file cho tôi đi"
- **AI Code:**
  ```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Production Studio Drum Kit – React 19, WCAG 2.2 AA" />
    <title>Studio Drum Kit</title>
    <!-- không khai báo <link rel="icon"> -->
  </head>
  ```
- **Bug:** Trình duyệt tự động request `/favicon.ico`. Project không có file này → server trả 404 → Console xuất hiện lỗi đỏ, vi phạm tiêu chí D8 "zero Console error/warning".
- **DevTools Proof:** Console hiển thị 2 lần:
  `Failed to load resource: the server responded with a status of 404 (Not Found) — :5173/favicon.ico:1`
  (ảnh chụp: `docs/failure-01-favicon-404.png`)
- **Engineering Fix:** Thêm favicon dạng SVG data URI ngay trong `index.html`, không cần file tĩnh:
  ```html
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥁</text></svg>" />
  ```
  Commit: `fix(hw1): add inline favicon to remove 404 console error`
- **Verify sau fix:** Ctrl+Shift+R → Console sạch, tab hiển thị icon 🥁.

---

## Failure #02: AI bỏ sót file cấu hình → project không chạy được

- **Task:** T0 — Init project
- **Prompt:** "ghi lại toàn bộ các file cho tôi đi"
- **AI Output:** Liệt kê đầy đủ `src/` và các file `.md`, nhưng ghi chú *"package.json và vite.config.js do Vite tự tạo"* và không đưa nội dung. AI giả định project được tạo bằng `npm create vite`, trong khi thư mục HW1 được tạo thủ công.
- **Bug:** Thiếu `package.json`, `vite.config.js`, `.gitignore` → không có script `dev`, không có dependency React/Vite → `npm run dev` không chạy được.
- **DevTools / Terminal Proof:** Terminal báo:
  `npm error code EJSONPARSE — Invalid package.json: Unexpected end of JSON input while parsing empty string`
  (ảnh chụp: `docs/failure-02-ejsonparse.png`)
  *Ghi chú:* lỗi EJSONPARSE cụ thể xuất hiện vì file `package.json` tạo tay chưa được lưu (lỗi thao tác của em); nguyên nhân gốc là AI không cung cấp file cấu hình ngay từ đầu.
- **Engineering Fix:** Tự viết đủ 3 file cấu hình, cài dependency, bật Auto Save trong VS Code:
  ```json
  {
    "name": "hw1-drum-kit",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }
  }
  ```
  ```bash
  npm install react react-dom
  npm install -D vite @vitejs/plugin-react
  ```
  Commit: `chore(hw1): init react19 vite project & rules`
- **Verify sau fix:** `npm run dev` chạy, trang mở tại `localhost:5173`.

---

## Failure #03: Phụ thuộc cứng vào file âm thanh không có trong repo

- **Task:** T1 / T2 — Pad config + Audio engine
- **Prompt:** "đọc slide này và hướng dẫn tôi làm hw 1"
- **AI Code:**
  ```js
  // pads.js — giả định có sẵn mp3 từ drum kit cũ (slide 26)
  { id: 'tom1', code: 'KeyW', ..., src: '/sounds/tom-1.mp3' }

  // useDrumAudio.js — thiếu file là cả studio sập
  const res = await fetch(p.src, { signal: controller.signal });
  if (!res.ok) throw new Error(`${p.name}: HTTP ${res.status}`);
  const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
  ```
- **Bug:** Em không có các file mp3 của bộ drum kit cũ. Chỉ cần 1 file thiếu (hoặc dev server trả về nội dung không phải audio) thì `Promise.all` reject → toàn bộ app rơi vào trạng thái `ERROR`, không pad nào dùng được.
- **DevTools Proof:** Tab Network → các request `/sounds/*.mp3` không trả về file audio hợp lệ; bản code cũ hiển thị `<section role="alert">Không tải được âm thanh…</section>`.
  (ảnh chụp: `docs/failure-03-missing-sounds.png`)
- **Engineering Fix:** Thêm `src/audio/synthDrums.js` tổng hợp tiếng trống bằng Web Audio API; mỗi pad tự fallback khi load file thất bại, vẫn giữ `AbortError` để huỷ khi unmount:
  ```js
  async function loadPadBuffer(ctx, pad, signal) {
    if (pad.src) {
      try {
        const res = await fetch(pad.src, { signal });
        if (res.ok) return await ctx.decodeAudioData(await res.arrayBuffer());
      } catch (err) {
        if (err.name === 'AbortError') throw err;
      }
    }
    return synthesize(ctx, pad.synth);
  }
  ```
  Commit: `feat(hw1): add useDrumAudio 4-state loader with synth fallback`
- **Verify sau fix:** Không có thư mục `public/sounds/` → bấm "Bật Studio" → trạng thái READY, cả 7 pad đều kêu.

---

## Failure #04: Guard "đang gõ" chặn cả checkbox và thanh trượt

- **Task:** T3 — Keyboard hook
- **Prompt:** "đọc slide này và hướng dẫn tôi làm hw 1, trước tiên là hw 1 trước"
- **AI Code (bản đầu, giống code mẫu trên slide):**
  ```js
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  ```
- **Bug:** Sau khi click checkbox "Phím tắt bàn phím" hoặc kéo thanh "Âm lượng", focus vẫn nằm trên `<input>` đó → mọi phím W A S D J K L bị bỏ qua cho đến khi click ra chỗ khác. Người dùng tưởng phím tắt bị hỏng.
- **DevTools Proof:** Click checkbox → nhấn W → hit log không đổi. Gõ `document.activeElement` trong Console → trả về `<input type="checkbox">`.
  (ảnh chụp: `docs/failure-04-checkbox-focus.png`)
- **Engineering Fix:** Chỉ bỏ qua các ô nhập **văn bản**:
  ```js
  const NON_TEXT_INPUTS = new Set(['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color']);

  function isTyping(target) {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
    return target.tagName === 'INPUT' && !NON_TEXT_INPUTS.has(target.type);
  }
  ```
  Thêm ô text "Ghi chú buổi tập" để kiểm chứng D3. Lỗi được phát hiện khi review trước khi commit, nên bản fix nằm trong commit `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards`.
- **Verify sau fix:** Click checkbox → nhấn W → kêu. Click ô "Ghi chú buổi tập" → gõ "wasd" → không kêu.

---

## Tổng kết

| # | Lỗi | Phát hiện bằng | Commit fix |
|---|-----|----------------|------------|
| 01 | Thiếu favicon → 404 | Console | `fix(hw1): add inline favicon to remove 404 console error` |
| 02 | Thiếu package.json / vite.config.js | Terminal (EJSONPARSE) | `chore(hw1): init react19 vite project & rules` |
| 03 | Phụ thuộc cứng file mp3 | Network + role="alert" | `feat(hw1): add useDrumAudio 4-state loader with synth fallback` |
| 04 | Guard chặn checkbox/range | Console `document.activeElement` | `feat(hw1): add useDrumKeyboard with e.code, repeat & modifier guards` |

**Bài học:** AI hay *giả định môi trường* (có sẵn scaffold Vite, có sẵn file âm thanh, có sẵn favicon) và hay *copy nguyên code mẫu* mà không xét ngữ cảnh UI thật. Em đã bổ sung vào `project-rules.md`:

```
10. COMPLETE OUTPUT: Luôn xuất đủ package.json, vite.config.js, .gitignore, index.html.
11. ZERO 404: index.html phải khai báo favicon (data URI nếu không có file).
12. NO HARD ASSET DEPENDENCY: Asset ngoài repo phải có fallback.
13. TYPING GUARD: Chỉ bỏ qua input dạng văn bản; checkbox/range/button vẫn nhận phím tắt.
```