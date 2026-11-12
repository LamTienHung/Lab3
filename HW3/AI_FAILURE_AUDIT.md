# AI_FAILURE_AUDIT.md — HW 3: KRAFTON × PUBG Vietnam Arena

**Công cụ AI đã dùng:** Claude (chat)
**Đã nạp project-rules.md:** Có

---

## Failure #01: Đếm ngược kiểu `setSeconds(s => s - 1)` → drift khi tab chạy nền

- **Task:** T4
- **Phát hiện:** Review code trước khi commit (đối chiếu slide "Why setInterval(s ⇒ s − 1) Fails").
- **AI Code (bản nháp):**
  ```js
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  ```
- **Bug:** Chrome throttle tab nền còn ~1 tick/phút → mỗi phút ở nền chỉ trừ 1 giây → đồng hồ chậm hàng phút. Ngoài ra không tính độ lệch đồng hồ server → nút "Nhận ngay" mở sớm 2,5s, server trả 425.
- **Engineering Fix:** Tính `remaining = target − (anchorServerMs + performance.now() − anchorPerf)` mỗi 250ms, resync ngay khi `visibilitychange` → `visible`, dừng interval khi về 0.
  Commit: `feat(hw3): add zero-drift usePubgAirdropTimer with visibility resync`
- **Verify sau fix:** Mở thẻ "Thùng Contraband G-Coin", chuyển tab 60s, quay lại → số giây khớp với đồng hồ hệ thống (trừ độ lệch hiển thị ở header).

---

## Failure #02: Double-click gửi 2 request claim

- **Task:** T5
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  const claim = async (crate) => {
    if (state.inFlight[crate.id]) return; // đọc state của lần render trước
    dispatch({ type: 'CLAIM_START', crateId: crate.id });
    await claimCrate(crate.id);
  };
  ```
- **Bug:** Hai click trong cùng một frame đều đọc `inFlight` cũ (chưa render lại) → 2 request, trừ kho 2 lần. Không có idempotency key nên retry cũng bị tính 2 lần.
- **Engineering Fix:** `lockRef` (Set) kiểm tra và khoá đồng bộ ngay trong handler; mỗi claim có `claimId = crypto.randomUUID()`, server lưu `claimsById` để trả lại cùng kết quả.
  Commit: `feat(hw3): add optimistic crate claim with lock & 409 rollback`
- **Verify sau fix:** Double-click nhanh "Nhận ngay" → "Còn lại" chỉ giảm 1, chỉ 1 đơn trong "Vật phẩm đã nhận".

---

## Failure #03: Rollback bằng snapshot cũ ghi đè thay đổi mới

- **Task:** T5
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  const snapshot = crates; // chụp toàn bộ mảng trước khi claim
  setCrates(optimistic);
  try { await claimCrate(...) } catch { setCrates(snapshot); }
  ```
- **Bug:** Khi 2 thẻ được claim song song, rollback thẻ A khôi phục snapshot cũ → xoá luôn kết quả thành công của thẻ B. Ngoài ra với 409, kho thật đã về 0 nhưng snapshot lại hiện số cũ → người dùng bấm tiếp và lại bị 409.
- **Engineering Fix:** Reducer `CLAIM_ROLLBACK` chỉ sửa đúng thẻ bị lỗi; dùng `remainingStock` server trả về, nếu không có (lỗi mạng) thì `+1` tương đối.
  Commit: `feat(hw3): add optimistic crate claim with lock & 409 rollback`
- **Verify sau fix:** Bật "Mô phỏng vét sạch kho" → claim → thẻ chuyển "Hết hàng", các thẻ khác giữ nguyên.

---

## Failure #04: Hạng thay đổi khi lọc bảng xếp hạng

- **Task:** T7
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```jsx
  {standings.filter(match).toSorted(byTotal).map((s, i) => (
    <tr key={s.squadId}><td>{i + 1}</td>...</tr>
  ))}
  ```
- **Bug:** Hạng lấy từ vị trí sau khi lọc → lọc "Roy" thì Roy Esports hiện hạng 1, sai so với bảng tổng.
- **Engineering Fix:** Tính `rank` trên toàn bộ đội theo tổng điểm (có tiebreaker WWCD, điểm hạng) trước, sau đó mới lọc/sắp xếp để hiển thị.
  Commit: `feat(hw3): add live PVS leaderboard with filter & multi-key sort`
- **Verify sau fix:** Gõ "Roy" → hạng hiển thị vẫn là hạng trong bảng tổng.

---

## Failure #05: Render toàn bộ 2.000+ dòng kill feed

- **Task:** T8
- **Phát hiện:** Review code trước khi commit (đối chiếu slide "Virtual Scroller" Lab 2).
- **AI Code (bản nháp):**
  ```jsx
  <ol>{visible.map((ev) => <li key={ev.id}>...</li>)}</ol>
  ```
- **Bug:** Mỗi 1,5s có sự kiện mới → React diff và trình duyệt layout lại 2.000+ `<li>` → giật khi gõ bộ lọc, DOM nặng.
- **Engineering Fix:** `VirtualList` chỉ render các dòng nằm trong khung nhìn + overscan 6, vị trí truyền qua CSS custom property `--row-top`, chiều cao cuộn qua `::after` tại `--total-height`; `aria-setsize` / `aria-posinset` giữ ngữ cảnh cho screen reader.
  Commit: `feat(hw3): add virtualized kill feed with squad/player/headshot filter`
- **Verify sau fix:** Elements → `<ol>` kill feed chỉ chứa khoảng 20 `<li>` dù tổng là 2.000+.

---

## Tổng kết

| # | Lỗi | Phát hiện bằng | Commit fix |
|---|-----|----------------|------------|
| 01 | Countdown drift ở tab nền | Review + chuyển tab | `feat(hw3): add zero-drift usePubgAirdropTimer with visibility resync` |
| 02 | Double-click gửi 2 claim | Review + double-click | `feat(hw3): add optimistic crate claim with lock & 409 rollback` |
| 03 | Rollback snapshot ghi đè | Review + mô phỏng 409 | `feat(hw3): add optimistic crate claim with lock & 409 rollback` |
| 04 | Hạng đổi khi lọc | Review + lọc tên | `feat(hw3): add live PVS leaderboard with filter & multi-key sort` |
| 05 | Render 2.000+ dòng | Review + Elements | `feat(hw3): add virtualized kill feed with squad/player/headshot filter` |

**Bài học:** Với hệ thống thời gian thực và tranh chấp tài nguyên, AI thường viết đúng cho một người dùng, một tab, một request. Lỗi chỉ lộ ra khi có tab nền, click trùng, nhiều request song song hoặc dữ liệu lớn. Các rule 7, 8, 10 trong `project-rules.md` được thêm để chặn nhóm lỗi này.