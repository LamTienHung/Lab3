import { useEffect } from 'react';
import { sleep, waitForReply } from '../api/mockCrush.js';
import { REPLY_TIMEOUT_MS } from '../fsm/relationshipMachine.js';

export function useSeenNoReplyTimer({ pendingId, attention, dispatch }) {
  useEffect(() => {
    if (!pendingId) return undefined;
    const controller = new AbortController();
    const { signal } = controller;

    Promise.race([
      waitForReply(attention, signal),
      sleep(REPLY_TIMEOUT_MS, signal).then(() => 'SEEN_NO_REPLY'),
    ])
      .then((status) => dispatch({ type: 'MESSAGE_RESOLVED', id: pendingId, status }))
      .catch((err) => {
        if (err.name !== 'AbortError') throw err;
      })
      .finally(() => controller.abort()); // huỷ nhánh thua của race → timer được giải phóng ngay

    // Đổi tin / chuyển sang ai đó / rời đi / unmount → huỷ mọi promise đang chờ
    return () => controller.abort();
  }, [pendingId, attention, dispatch]);
}