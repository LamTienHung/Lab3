# UIT S3T - LAB 3 AI GOVERNANCE RULES (HW1 Drum Kit)

1. STACK: React 19 + Vite + ES2024. Chỉ import hook cụ thể từ 'react'.
2. NO LEGACY APIS: Cấm class extends React.Component, ReactDOM.render,
   defaultProps, keyCode, keypress, window.alert.
3. ZERO DIV-SOUP: Dùng <main>, <section>, <article>, <header>, <ul>, <li>,
   <dl>, <output>, <meter>, <kbd>.
4. A11Y FORMS: Mọi <input>/<select> có <label htmlFor={id}> với useId().
5. STATE HYGIENE: Chỉ cập nhật immutable. Không đồng bộ derived state trong useEffect.
6. EFFECT CLEANUP: Mọi timer, listener, fetch, rAF, AudioContext trong useEffect
   PHẢI có cleanup / AbortController.
7. KEYBOARD: Chỉ dùng e.code. Guard e.repeat, ctrl/meta/alt, và ô nhập văn bản.
8. AUDIO: Chỉ tạo AudioContext sau user gesture. Không tạo ở cấp module.
9. STABLE REFS: Map/hằng cấu hình đặt ở cấp module; callback truyền xuống
   hook/memo component phải bọc useCallback.
10. COMPLETE OUTPUT: Luôn xuất đủ package.json, vite.config.js, .gitignore, index.html.
11. ZERO 404: index.html phải khai báo favicon (data URI nếu không có file).
12. NO HARD ASSET DEPENDENCY: Asset ngoài repo phải có fallback.
13. TYPING GUARD: Chỉ bỏ qua input dạng văn bản; checkbox/range/button vẫn nhận phím tắt.