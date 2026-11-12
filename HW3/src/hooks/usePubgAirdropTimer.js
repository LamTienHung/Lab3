import { useEffect, useState } from 'react';

// Tiến hoá từ createAntiDriftTimer (Lab 2 HW3): không đếm lùi, luôn tính lại từ epoch đích
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs)),
  );

  useEffect(() => {
    // Neo đồng hồ đơn điệu: đổi giờ hệ thống giữa chừng cũng không làm lệch
    const anchorServerMs = Date.now() + serverOffsetMs;
    const anchorPerf = performance.now();
    const serverNow = () => anchorServerMs + (performance.now() - anchorPerf);

    let intervalId = 0;
    const sync = () => {
      const ms = Math.max(0, targetEpochMs - serverNow());
      setRemainingMs(ms === 0 ? 0 : Math.ceil(ms / 100) * 100);
      if (ms === 0 && intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
    };

    intervalId = window.setInterval(sync, 250);
    sync();

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync(); // tab nền bị throttle → sync ngay khi quay lại
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [targetEpochMs, serverOffsetMs]);

  return { remainingMs, isLive: remainingMs === 0 };
}