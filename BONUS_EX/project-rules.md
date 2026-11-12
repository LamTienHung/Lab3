# UIT S3T - LAB 3 AI GOVERNANCE RULES (Bonus Situationship FSM)

1. STACK: React 19 + Vite + ES2024. Chỉ import hook cụ thể từ 'react'.
2. NO LEGACY APIS: Cấm class component, ReactDOM.render, defaultProps, keyCode, window.alert.
3. ZERO DIV-SOUP: Dùng <main>, <section>, <header>, <form>, <ol>, <li>, <dl>, <output>, <meter>.
4. A11Y FORMS: Mọi <input>/<select> có <label htmlFor={id}> với useId().
5. NO BOOLEAN SOUP: Trạng thái quan hệ là 1 union duy nhất; chuyển pha chỉ qua bảng TRANSITIONS + guard.
6. PURE REDUCER: Mọi thay đổi state đi qua reducer thuần, immutable; event không hợp lệ trả về đúng state cũ.
7. DERIVED STATE: Điểm tác động, tỷ trọng, red flag tính trong render bằng selector; cấm useEffect + setState.
8. EFFECT CLEANUP: Timer chờ trả lời gắn với id tin nhắn, có AbortController; abort cả nhánh thua của Promise.race.
9. COMPLETE OUTPUT: Luôn xuất đủ vite.config.js, index.html (có favicon).
10. CLI FIRST: Tạo package.json bằng npm init -y + npm pkg set.
11. NO LYRICS: Không chép lời bài hát vào UI/code; chỉ dùng tên bài làm cảm hứng.