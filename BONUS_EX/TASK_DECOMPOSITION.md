# TASK_DECOMPOSITION.md — Bonus: Situationship Analyzer (FSM)

> Lab 3 · React 19 + Vite · Project riêng: `Bonus/`
> Lấy cảm hứng từ tên bài hát "Hẹn Hò Nhưng Không Yêu"; không chép lời bài hát vào UI/code.

## 0. Definition of Done

| # | Tiêu chí | Cách kiểm chứng |
|---|----------|-----------------|
| D1 | Không boolean soup: 1 union `FRIENDS \| DATING_NO_LOVE \| OFFICIAL_LOVE \| GHOSTED_EXIT` | Đọc `relationshipMachine.js` |
| D2 | Chuyển pha chỉ qua bảng `TRANSITIONS`; event không hợp lệ không đổi state | Nút không hợp lệ bị disabled; reducer trả lại state cũ |
| D3 | Guard: chỉ `CONFIRM_LOVE` khi có ≥ 1 tin được trả lời và không red flag | Thử khi chưa có tin trả lời → nút disabled |
| D4 | Effort log bất biến: em × 0,1, ai đó × 50 | Ghi 100 lần em vs 1 lần ai đó → 10 vs 50 |
| D5 | Red flag, tỷ trọng, điểm tác động là derived state | Không có useEffect + setState cho các số này |
| D6 | Gửi tin → chờ tối đa 5s; quá hạn = "Seen không rep"; 3 lần → tự thoát | Gửi 3 tin khi người ấy để ý "Ai đó" |
| D7 | Chuyển sang "Ai đó" / rời đi / unmount → abort promise đang chờ | Chuyển "Ai đó" khi đang chờ → tin chuyển "Bị bỏ qua" ngay |
| D8 | `<output role="status" aria-live="polite">` cho red flag; label `useId`; 375px | Lighthouse + DevTools |
| D9 | Zero `<div>`, zero Console error | `grep -rn '<div' src/`, Console |

## 1. WBS

```
Bonus
├── T0  Init project + rules       (vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css)
├── T1  FSM + reducer + selector   (src/fsm/relationshipMachine.js)
├── T2  Mock reply + timer hook    (src/api/mockCrush.js, src/hooks/useSeenNoReplyTimer.js)
├── T3  UI + red-flag meter        (src/components/SituationshipAnalyzer.jsx, EffortPanel.jsx, ChatPanel.jsx)
├── T4  Styling                    (src/components/Situationship.module.css)
└── T5  Docs                       (TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md)
```

## 2. Chi tiết task

### T0 — Init project
- **Commit:** `chore(bonus): init react19 vite project & rules`

### T1 — FSM
- **Contract:**
  ```ts
  type RelationshipPhase = 'FRIENDS' | 'DATING_NO_LOVE' | 'OFFICIAL_LOVE' | 'GHOSTED_EXIT';
  interface EffortSignal { readonly id: string; readonly actor: 'EM' | 'AI_DO'; readonly steps: number; readonly multiplier: number }
  type MessageStatus = 'PENDING' | 'REPLIED' | 'SEEN_NO_REPLY' | 'IGNORED' | 'CANCELLED';
  type Action =
    | { type: 'EVENT'; event: 'START_DATING' | 'CONFIRM_LOVE' | 'WALK_AWAY' | 'BREAK_UP' | 'RESET' }
    | { type: 'LOG_EFFORT'; id: string; actor: 'EM' | 'AI_DO'; steps: number }
    | { type: 'SET_ATTENTION'; attention: 'EM' | 'AI_DO' }
    | { type: 'SEND_MESSAGE'; id: string; text: string; sentAt: number }
    | { type: 'MESSAGE_RESOLVED'; id: string; status: MessageStatus };
  function relationshipReducer(state, action): State;
  function selectStats(state): { emImpact; rivalImpact; rivalShare; ghosted; replied; reasons; isRedFlag; isMutual };
  function canTransition(state, event): boolean;
  ```
- **Ràng buộc:** reducer thuần, immutable; `GHOSTED` chỉ hệ thống kích (3 tin không hồi âm); `RESET` trả `INITIAL_STATE` (bỏ log → GC); kết quả đến muộn cho tin đã xử lý bị bỏ qua.
- **Commit:** `feat(fsm): model HenHoKhongYeu state machine`

### T2 — Seen-no-reply timer
- **Contract:** `useSeenNoReplyTimer({ pendingId, attention, dispatch })`
- **Ràng buộc:** `Promise.race(waitForReply, sleep(5000))` dùng chung 1 AbortController; `finally` abort nhánh thua; cleanup abort khi đổi `pendingId`/`attention` hoặc unmount; promise "không bao giờ trả lời" vẫn huỷ được.
- **Commit:** `feat(fsm): add abortable seen-no-reply timer`

### T3 — UI
- **Ràng buộc:** nút event sinh từ `TRANSITIONS[phase]`, disabled theo `canTransition`; guard hint gắn `aria-describedby`; `<meter>` tỷ trọng ảnh hưởng; red flag trong `<output role="status" aria-live="polite">`; input number đọc `valueAsNumber`; form gửi tin `type="submit"`, các nút khác `type="button"`.
- **Commit:** `feat(ui): add derived red-flag meter & ghosting cleanup`

### T4 — Styling
- **Ràng buộc:** custom properties; target ≥ 44px; style theo `data-phase` / `data-status` / `data-flag`; 375px không cuộn ngang.
- **Commit:** `style(ui): add responsive 375px layout`

### T5 — Docs
- **Commit:** `docs(bonus): add task decomposition and AI failure audit`

## 3. Task → Commit

| Task | Commit |
|------|--------|
| T0 | `chore(bonus): init react19 vite project & rules` |
| T1 | `feat(fsm): model HenHoKhongYeu state machine` |
| T2 | `feat(fsm): add abortable seen-no-reply timer` |
| T3 | `feat(ui): add derived red-flag meter & ghosting cleanup` |
| T4 | `style(ui): add responsive 375px layout` |
| T5 | `docs(bonus): add task decomposition and AI failure audit` |