# UIT S3T - LAB 3 AI GOVERNANCE RULES (HW3 PUBG VN Arena)

1. STACK: React 19 + Vite + ES2024. Chỉ import hook cụ thể từ 'react'.
2. NO LEGACY APIS: Cấm class component, ReactDOM.render, defaultProps, keyCode, window.alert.
3. ZERO DIV-SOUP: Dùng <main>, <section>, <article>, <header>, <ul>, <ol>, <li>, <dl>, <table>, <output>, <time>.
4. A11Y FORMS: Mọi <input>/<select> có <label htmlFor={id}> với useId().
5. STATE HYGIENE: Chỉ cập nhật immutable. Không đồng bộ derived state (filter/sort/rank/phase) trong useEffect.
6. EFFECT CLEANUP: Mọi timer, listener, fetch trong useEffect PHẢI có cleanup / AbortController.
7. ZERO-DRIFT TIMER: Đếm ngược tính từ epoch đích + server offset; cấm setInterval(s => s - 1). Resync khi visibilitychange.
8. OPTIMISTIC UI: Khoá đồng bộ bằng ref + claimId (idempotency key). Rollback theo số liệu server hoặc +1 tương đối, cấm khôi phục snapshot cũ.
9. CURRENCY: Định dạng VND bằng Intl.NumberFormat('vi-VN'), formatter đặt ở cấp module.
10. LARGE LISTS: Danh sách > 500 dòng phải virtualize. Giá trị vị trí động chỉ truyền qua CSS custom property.
11. NO DUPLICATE ALERTS: Lỗi hiển thị trong role="status"/role="alert", không dùng window.alert.
12. COMPLETE OUTPUT: Luôn xuất đủ vite.config.js, index.html (có favicon).
13. TYPING GUARD: Chỉ bỏ qua input dạng văn bản cho phím tắt.
14. CLI FIRST: Tạo package.json bằng npm init -y + npm pkg set, không copy-paste thủ công.