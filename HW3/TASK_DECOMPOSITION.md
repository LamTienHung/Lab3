# TASK_DECOMPOSITION.md — HW 3: KRAFTON × PUBG Vietnam Championship & Airdrop Arena

> Lab 3 · React 19 + Vite · Project riêng: `HW3/`
> Quy trình 4 bước: **Slice → Contract → Atomic Generation → Verify & Commit**
> Toàn bộ dữ liệu là mô phỏng (mock server trong `src/api/mockServer.js`).

## 0. Definition of Done

| # | Tiêu chí | Cách kiểm chứng |
|---|----------|-----------------|
| D1 | Đếm ngược không drift: tính từ epoch đích + server offset, neo `performance.now()` | Chuyển sang tab khác 1 phút rồi quay lại → số giây khớp đồng hồ thật |
| D2 | Đồng bộ đồng hồ server (NTP đơn giản), hiển thị độ lệch | Header hiện "Lệch đồng hồ máy chủ: +2.50 s" (±) |
| D3 | 4 pha `WARMUP → AIRDROP_LIVE → LOOTED_OUT / EXPIRED` là derived state | Quan sát 4 thẻ ở 4 pha khác nhau |
| D4 | Claim optimistic: trừ kho ngay, khoá double-click, idempotency key | Double-click "Nhận ngay" → chỉ 1 request |
| D5 | Rollback khi 409/410/425/lỗi mạng, ưu tiên số tồn kho từ server | Bật "Mô phỏng vét sạch kho" → claim → kho về 0, thông báo 409 |
| D6 | Giá hiển thị VND qua `Intl.NumberFormat('vi-VN')` | "1.490.000 ₫" |
| D7 | Bảng xếp hạng: lọc tên, WWCD tối thiểu, sắp xếp 4 tiêu chí; hạng không đổi khi lọc | Lọc "Roy" → hạng vẫn là hạng tổng |
| D8 | Kill feed ≥ 2.000 sự kiện, virtualize, lọc đội / người chơi / headshot, tạm dừng được | Elements: chỉ ~20 `<li>` trong DOM |
| D9 | Mọi effect có cleanup (timer, visibilitychange, fetch, interval feed) | StrictMode + Console sạch |
| D10 | Zero `<div>`, label `useId`, 375px không cuộn ngang, Lighthouse A11y = 100 | `grep -rn '<div' src/`, DevTools, Lighthouse |

## 1. WBS

```
HW3
├── T0   Init project + rules        (vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css)
├── T1   Mock KRAFTON server         (src/api/mockServer.js)
├── T2   Domain data + formatters    (src/data/squads.js, src/utils/format.js)
├── T3   Server clock offset         (src/hooks/useServerOffset.js)
├── T4   Zero-drift airdrop timer    (src/hooks/usePubgAirdropTimer.js)
├── T5   Optimistic inventory        (src/hooks/useCrateInventory.js)
├── T6   Airdrop UI                  (src/components/CrateCard.jsx, src/components/AirdropSection.jsx)
├── T7   Leaderboard                 (src/components/Leaderboard.jsx)
├── T8   Kill feed + virtual list    (src/hooks/useKillFeed.js, src/components/VirtualList.jsx, src/components/KillFeed.jsx)
├── T9   Composition + styling       (src/components/ArenaApp.jsx, src/components/Arena.module.css)
└── T10  Docs                        (TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md)
```

## 2. Chi tiết task

### T0 — Init project
- package.json tạo bằng `npm init -y` + `npm pkg set` (rule 14).
- **Commit:** `chore(hw3): init react19 vite project & rules`

### T1 — Mock server
- **Contract:**
  ```ts
  fetchServerTime(opts: { signal }): Promise<{ serverEpochMs: number }>;
  fetchCrates(opts: { signal }): Promise<PubgCrateDrop[]>;               // 10% lỗi mạng
  claimCrate(crateId, claimId, opts: { signal }): Promise<
    | { ok: true; status: 201; remainingStock: number; order: Order }
    | { ok: false; status: 409 | 410 | 425 | 404; code: string; remainingStock?: number }
  >;
  setForceConflict(on: boolean): void;
  ```
- **Ràng buộc:** server lệch +2.5s; mọi delay hỗ trợ AbortSignal; `claimsById` đảm bảo idempotent; không dùng timer toàn cục.
- **Commit:** `feat(hw3): add mock KRAFTON server with clock skew, 409 & idempotency`

### T2 — Domain data + formatters
- **Contract:** `SQUADS: PubgVnSquadStanding[]`, `createKillEvent(timeMs)`, `generateHistory(count)`, `vnd`, `clockTime`, `formatCountdown(ms)`, `formatOffset(ms)`.
- **Ràng buộc:** formatter Intl ở cấp module; dữ liệu ghi rõ là giả lập.
- **Commit:** `feat(hw3): add squad data, kill event generator & vi-VN formatters`

### T3 — Server offset
- **Contract:** `useServerOffset() → { status, offsetMs, error, resync() }`
- **Ràng buộc:** `offset = serverTime − (t0 + t1) / 2`; AbortController; bỏ qua AbortError.
- **Commit:** `feat(hw3): add useServerOffset with NTP-style clock sync`

### T4 — Airdrop timer
- **Contract:** `usePubgAirdropTimer(targetEpochMs, serverOffsetMs) → { remainingMs, isLive }`
- **Ràng buộc:** tính từ epoch đích, neo `performance.now()`; resync khi `visibilitychange`; dừng interval khi về 0; cleanup interval + listener.
- **Commit:** `feat(hw3): add zero-drift usePubgAirdropTimer with visibility resync`

### T5 — Optimistic inventory
- **Contract:**
  ```ts
  useCrateInventory() → {
    status: 'LOADING' | 'SUCCESS' | 'ERROR'; crates; inFlight: Record<crateId, claimId>;
    orders; notice: { type: 'success' | 'error'; text } | null; error;
    claim(crate): Promise<void>; reload(): void;
  }
  ```
- **Ràng buộc:** `useReducer`; `lockRef` chặn double-click đồng bộ; `claimId = crypto.randomUUID()`; rollback = số tồn kho server trả về, nếu không có thì +1 tương đối; `LOAD_START` xoá `inFlight`.
- **Commit:** `feat(hw3): add optimistic crate claim with lock & 409 rollback`

### T6 — Airdrop UI
- **Ràng buộc:** `CrateCard` bọc `memo`, phase là derived; `<dl>` cho thông tin; `<time dateTime>`; skeleton cùng kích thước thẻ (`aria-busy`); thông báo trong `<output role="status">`; lỗi tải trong `role="alert"` + nút Kết nối lại.
- **Commit:** `feat(hw3): add airdrop cards with 4-phase state & skeleton loader`

### T7 — Leaderboard
- **Ràng buộc:** `<table>` có `<caption>`, `th scope`, `aria-sort`; hạng tính trước khi lọc; `.toSorted()` + tiebreaker; WWCD đọc `valueAsNumber`; không useEffect.
- **Commit:** `feat(hw3): add live PVS leaderboard with filter & multi-key sort`

### T8 — Kill feed
- **Ràng buộc:** 2.000 sự kiện lịch sử + 1 sự kiện mới / 1,5s (interval có cleanup, tạm dừng được); `VirtualList` chỉ render dòng trong khung nhìn + overscan; `aria-setsize` / `aria-posinset`; reset scroll trong event handler khi đổi bộ lọc; React 19 `ref` là prop.
- **Commit:** `feat(hw3): add virtualized kill feed with squad/player/headshot filter`

### T9 — Composition + styling
- **Ràng buộc:** kill mới cộng `killPts` cho đội (immutable, `useCallback`); section `min-width: 0`; card grid `auto-fill`; reduced-motion tắt shimmer.
- **Commit:** `feat(hw3): compose ArenaApp with clock header and responsive styles`

### T10 — Docs
- **Commit:** `docs(hw3): add task decomposition and AI failure audit`

## 3. Task → Commit

| Task | Commit |
|------|--------|
| T0 | `chore(hw3): init react19 vite project & rules` |
| T1 | `feat(hw3): add mock KRAFTON server with clock skew, 409 & idempotency` |
| T2 | `feat(hw3): add squad data, kill event generator & vi-VN formatters` |
| T3 | `feat(hw3): add useServerOffset with NTP-style clock sync` |
| T4 | `feat(hw3): add zero-drift usePubgAirdropTimer with visibility resync` |
| T5 | `feat(hw3): add optimistic crate claim with lock & 409 rollback` |
| T6 | `feat(hw3): add airdrop cards with 4-phase state & skeleton loader` |
| T7 | `feat(hw3): add live PVS leaderboard with filter & multi-key sort` |
| T8 | `feat(hw3): add virtualized kill feed with squad/player/headshot filter` |
| T9 | `feat(hw3): compose ArenaApp with clock header and responsive styles` |
| T10 | `docs(hw3): add task decomposition and AI failure audit` |