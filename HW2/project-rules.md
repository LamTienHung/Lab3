# UIT S3T - LAB 3 AI GOVERNANCE RULES (HW2 Grand Piano)

1. STACK: React 19 + Vite + ES2024. Chỉ import hook cụ thể từ 'react'.
2. NO LEGACY APIS: Cấm class component, ReactDOM.render, defaultProps, keyCode, window.alert.
3. ZERO DIV-SOUP: Dùng <main>, <section>, <header>, <ul>, <li>, <ol>, <output>.
4. A11Y FORMS: Mọi <input>/<select> có <label htmlFor={id}> với useId().
5. STATE HYGIENE: Chỉ cập nhật immutable. Không đồng bộ derived state trong useEffect.
6. EFFECT CLEANUP: Mọi timer, listener, AudioContext, replay trong useEffect PHẢI có cleanup / AbortController.
7. KEYBOARD: Chỉ dùng e.code. Guard e.repeat, ctrl/meta/alt, ô nhập văn bản.
8. AUDIO: Chỉ tạo AudioContext sau user gesture. Tối đa 8 voice, cướp voice cũ nhất theo FIFO.
9. NO CLICK: Mọi note-off phải ramp gain về 0.0001 trước osc.stop().
10. ALGORITHMIC KEYS: 88 phím sinh bằng f = 440 · 2^((midi − 69) / 12). Cấm hardcode 88 thẻ.
11. RENDER ISOLATION: PianoKey bọc memo; mọi callback truyền xuống bọc useCallback; data phím là hằng module.
12. COMPLETE OUTPUT: Luôn xuất đủ package.json, vite.config.js, index.html (có favicon).
13. TYPING GUARD: Chỉ bỏ qua input dạng văn bản; checkbox/range/select/button vẫn nhận phím tắt.