const abortError = () => new DOMException('Aborted', 'AbortError');

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(abortError());
      },
      { once: true },
    );
  });
}

// Promise không bao giờ resolve, nhưng vẫn huỷ được → không rò bộ nhớ
function waitForever(signal) {
  return new Promise((_, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    signal.addEventListener('abort', () => reject(abortError()), { once: true });
  });
}

// Mô phỏng người ấy: đang để ý ai đó thì không bao giờ trả lời
export function waitForReply(attention, signal) {
  if (attention === 'AI_DO' || Math.random() < 0.4) return waitForever(signal);
  return sleep(1000 + Math.random() * 3000, signal).then(() => 'REPLIED');
}