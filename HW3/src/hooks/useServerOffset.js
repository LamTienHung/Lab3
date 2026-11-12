import { useCallback, useEffect, useState } from 'react';
import { fetchServerTime } from '../api/mockServer.js';

export function useServerOffset() {
  const [state, setState] = useState({ status: 'LOADING', offsetMs: 0, error: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: 'LOADING', error: null }));
    const t0 = Date.now();

    fetchServerTime({ signal: controller.signal })
      .then(({ serverEpochMs }) => {
        const t1 = Date.now();
        // NTP đơn giản: server đóng dấu ở giữa đường truyền
        setState({ status: 'SUCCESS', offsetMs: Math.round(serverEpochMs - (t0 + t1) / 2), error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState((prev) => ({ ...prev, status: 'ERROR', error: err.message }));
      });

    return () => controller.abort();
  }, [retryTick]);

  const resync = useCallback(() => setRetryTick((t) => t + 1), []);

  return { ...state, resync };
}