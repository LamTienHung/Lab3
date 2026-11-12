import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { claimCrate, fetchCrates } from '../api/mockServer.js';
import { vnd } from '../utils/format.js';

const REASONS = {
  LOOTED_OUT: 'Hết hàng! Người chơi khác nhanh tay hơn (409) — đã hoàn tác.',
  TOO_EARLY: 'Airdrop chưa mở theo giờ máy chủ (425) — đã hoàn tác.',
  EXPIRED: 'Airdrop đã đóng (410) — đã hoàn tác.',
  NOT_FOUND: 'Không tìm thấy vật phẩm (404) — đã hoàn tác.',
};

const INITIAL = { status: 'LOADING', crates: [], inFlight: {}, orders: [], notice: null, error: null };

function withoutKey(record, key) {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'LOADING', error: null, inFlight: {} };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'SUCCESS', crates: action.crates };
    case 'LOAD_ERROR':
      return { ...state, status: 'ERROR', error: action.error };
    case 'CLAIM_START':
      return {
        ...state,
        notice: null,
        inFlight: { ...state.inFlight, [action.crateId]: action.claimId },
        crates: state.crates.map((c) =>
          c.id === action.crateId ? { ...c, remainingStock: c.remainingStock - 1 } : c,
        ),
      };
    case 'CLAIM_SUCCESS':
      return {
        ...state,
        inFlight: withoutKey(state.inFlight, action.crateId),
        crates: state.crates.map((c) =>
          c.id === action.crateId ? { ...c, remainingStock: action.remainingStock } : c,
        ),
        orders: [action.order, ...state.orders],
        notice: { type: 'success', text: `Đã nhận: ${action.order.title} — ${vnd.format(action.order.priceVnd)}` },
      };
    case 'CLAIM_ROLLBACK':
      return {
        ...state,
        inFlight: withoutKey(state.inFlight, action.crateId),
        crates: state.crates.map((c) =>
          c.id === action.crateId
            ? { ...c, remainingStock: action.remainingStock ?? c.remainingStock + 1 } // ưu tiên số liệu server
            : c,
        ),
        notice: { type: 'error', text: action.reason },
      };
    default:
      return state;
  }
}

export function useCrateInventory() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [reloadTick, setReloadTick] = useState(0);
  const abortRef = useRef(null);
  const lockRef = useRef(new Set()); // khoá đồng bộ: chặn double-click trước khi React kịp render

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: 'LOAD_START' });

    fetchCrates({ signal: controller.signal })
      .then((crates) => dispatch({ type: 'LOAD_SUCCESS', crates }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        dispatch({ type: 'LOAD_ERROR', error: err.message });
      });

    return () => controller.abort();
  }, [reloadTick]);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  const claim = useCallback(async (crate) => {
    if (lockRef.current.has(crate.id) || crate.remainingStock <= 0) return;
    lockRef.current.add(crate.id);
    const claimId = crypto.randomUUID(); // idempotency key
    dispatch({ type: 'CLAIM_START', crateId: crate.id, claimId });

    try {
      const res = await claimCrate(crate.id, claimId, { signal: abortRef.current?.signal });
      if (res.ok) {
        dispatch({
          type: 'CLAIM_SUCCESS',
          crateId: crate.id,
          remainingStock: res.remainingStock,
          order: { ...res.order, title: crate.title },
        });
      } else {
        dispatch({
          type: 'CLAIM_ROLLBACK',
          crateId: crate.id,
          remainingStock: res.remainingStock,
          reason: REASONS[res.code] ?? `Lỗi ${res.status} — đã hoàn tác.`,
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      dispatch({ type: 'CLAIM_ROLLBACK', crateId: crate.id, reason: `${err.message} — đã hoàn tác, hãy thử lại.` });
    } finally {
      lockRef.current.delete(crate.id);
    }
  }, []);

  return { ...state, claim, reload };
}