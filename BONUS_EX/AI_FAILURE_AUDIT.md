# AI_FAILURE_AUDIT.md — Bonus: Situationship Analyzer (FSM)

**Công cụ AI đã dùng:** Claude (chat)
**Đã nạp project-rules.md:** Có

---

## Failure #01: Boolean soup → UI mâu thuẫn

- **Task:** T1
- **Phát hiện:** Review code trước khi commit (đối chiếu slide "Banning Boolean Soup").
- **AI Code (bản nháp):**
  ```js
  const [isDating, setIsDating] = useState(true);
  const [isLoved, setIsLoved] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  ```
- **Bug:** 3 boolean cho ra 8 tổ hợp, nhiều tổ hợp vô nghĩa (`hasExited && isLoved`); mỗi nút phải tự nhớ tắt/bật đúng các cờ khác → dễ lọt trạng thái mâu thuẫn.
- **Engineering Fix:** 1 union `RelationshipPhase` + bảng `TRANSITIONS` + `canTransition` (guard). Event không hợp lệ → reducer trả lại đúng state cũ.
  Commit: `feat(fsm): model HenHoKhongYeu state machine`
- **Verify sau fix:** Ở pha "Đã rời đi" chỉ còn nút "Làm lại từ đầu"; các nút khác không tồn tại.

---

## Failure #02: Timer tự thoát reset mỗi lần ghi nỗ lực

- **Task:** T2
- **Phát hiện:** Review code mẫu trên slide trước khi dùng.
- **AI Code (bản nháp, theo slide):**
  ```js
  useEffect(() => {
    if (phase !== 'DATING_NO_LOVE') return undefined;
    const timerId = setTimeout(() => setPhase('GHOSTED_EXIT'), 5000);
    return () => clearTimeout(timerId);
  }, [phase, myTries]);
  ```
- **Bug:** Timer không gắn với tin nhắn nào: mỗi lần ghi nỗ lực lại đếm lại từ đầu; không ghi nỗ lực thì 5 giây sau tự thoát dù người ấy có trả lời. Ý nghĩa "seen không rep" bị mất.
- **Engineering Fix:** Timer gắn với `pendingId` của tin nhắn đang chờ; kết quả (`REPLIED` / `SEEN_NO_REPLY`) đi qua reducer; chỉ tự thoát sau 3 tin không hồi âm.
  Commit: `feat(fsm): add abortable seen-no-reply timer`
- **Verify sau fix:** Ghi nỗ lực liên tục không làm thay đổi trạng thái tin đang chờ.

---

## Failure #03: `Promise.race` không huỷ nhánh thua → cập nhật state muộn

- **Task:** T2
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  Promise.race([waitForReply(), sleep(5000).then(() => 'SEEN_NO_REPLY')])
    .then((status) => dispatch({ type: 'MESSAGE_RESOLVED', id, status }));
  ```
- **Bug:** Trả lời thắng thì timer 5s vẫn chạy; chuyển sang "Ai đó" hoặc rời đi thì promise cũ vẫn dispatch → tin đã "Bị bỏ qua" lại bị ghi đè thành "Seen không rep", có thể kích tự thoát sai.
- **Engineering Fix:** 1 AbortController cho cả hai nhánh; `.finally(() => controller.abort())`; cleanup effect abort; reducer chỉ cập nhật tin còn `PENDING`.
  Commit: `feat(fsm): add abortable seen-no-reply timer`
- **Verify sau fix:** Gửi tin → chuyển "Ai đó" ngay → tin chuyển "Bị bỏ qua vì ai đó" và không đổi nữa sau 5 giây.

---

## Failure #04: Red flag tính bằng useEffect + setState

- **Task:** T3
- **Phát hiện:** Review code trước khi commit.
- **AI Code (bản nháp):**
  ```js
  const [isRedFlag, setIsRedFlag] = useState(false);
  useEffect(() => {
    setIsRedFlag(myTries * 0.1 < rivalTries * 50);
  }, [myTries, rivalTries]);
  ```
- **Bug:** Render 2 lần cho mỗi thay đổi; lần render đầu hiển thị red flag cũ → `aria-live` có thể đọc sai trạng thái.
- **Engineering Fix:** `selectStats(state)` tính `emImpact`, `rivalImpact`, `rivalShare`, `reasons`, `isRedFlag` ngay trong render.
  Commit: `feat(ui): add derived red-flag meter & ghosting cleanup`
- **Verify sau fix:** Ghi nỗ lực → meter và thông báo cập nhật trong cùng một lần render (React Profiler: 1 commit).

---

## Tổng kết

| # | Lỗi | Phát hiện bằng | Commit fix |
|---|-----|----------------|------------|
| 01 | Boolean soup | Review | `feat(fsm): model HenHoKhongYeu state machine` |
| 02 | Timer reset theo nỗ lực | Review code mẫu | `feat(fsm): add abortable seen-no-reply timer` |
| 03 | Race không huỷ nhánh thua | Review + chuyển "Ai đó" | `feat(fsm): add abortable seen-no-reply timer` |
| 04 | Red flag qua useEffect | Review + Profiler | `feat(ui): add derived red-flag meter & ghosting cleanup` |

**Bài học:** FSM giúp loại bỏ trạng thái vô nghĩa ngay từ thiết kế; mọi tác vụ bất đồng bộ phải gắn với một định danh cụ thể (id tin nhắn) và có đường huỷ rõ ràng, nếu không kết quả đến muộn sẽ ghi đè trạng thái đúng.