// Máy trạng thái hữu hạn — thay cho isDating / isLoved / hasTitle (boolean soup)
export const PHASE_LABEL = {
  FRIENDS: 'Bạn bè',
  DATING_NO_LOVE: 'Hẹn hò nhưng không yêu',
  OFFICIAL_LOVE: 'Yêu chính thức',
  GHOSTED_EXIT: 'Đã rời đi · bộ nhớ đã giải phóng',
};

export const TRANSITIONS = {
  FRIENDS: { START_DATING: 'DATING_NO_LOVE' },
  DATING_NO_LOVE: { CONFIRM_LOVE: 'OFFICIAL_LOVE', WALK_AWAY: 'GHOSTED_EXIT', GHOSTED: 'GHOSTED_EXIT' },
  OFFICIAL_LOVE: { BREAK_UP: 'GHOSTED_EXIT' },
  GHOSTED_EXIT: { RESET: 'FRIENDS' },
};

export const EVENT_LABEL = {
  START_DATING: 'Bắt đầu hẹn hò',
  CONFIRM_LOVE: 'Xác nhận tình cảm hai chiều',
  WALK_AWAY: 'Dừng lại vì tự trọng',
  BREAK_UP: 'Chia tay',
  RESET: 'Làm lại từ đầu',
};

const EXIT_REASON = {
  WALK_AWAY: 'Em chọn tự trọng và dừng lại.',
  BREAK_UP: 'Hai người chia tay.',
};

export const MULTIPLIER = { EM: 0.1, AI_DO: 50 };
export const GHOST_LIMIT = 3;
export const REPLY_TIMEOUT_MS = 5000;
const GHOST_STATUSES = new Set(['SEEN_NO_REPLY', 'IGNORED']);

export const INITIAL_STATE = {
  phase: 'FRIENDS',
  signals: [], // EffortSignal[] — log bất biến
  messages: [], // { id, text, status, sentAt }[]
  attention: 'EM', // người ấy đang để ý: 'EM' | 'AI_DO'
  exitReason: null,
};

// Selector thuần: mọi số liệu dẫn xuất tính từ state, không lưu riêng
export function selectStats(state) {
  let emImpact = 0;
  let rivalImpact = 0;
  let emSteps = 0;
  let rivalSteps = 0;
  for (const s of state.signals) {
    const impact = s.steps * s.multiplier;
    if (s.actor === 'EM') {
      emImpact += impact;
      emSteps += s.steps;
    } else {
      rivalImpact += impact;
      rivalSteps += s.steps;
    }
  }

  const replied = state.messages.filter((m) => m.status === 'REPLIED').length;
  const ghosted = state.messages.filter((m) => GHOST_STATUSES.has(m.status)).length;
  const total = emImpact + rivalImpact;
  const rivalShare = total === 0 ? 0 : rivalImpact / total;

  const reasons = [];
  if (state.phase === 'DATING_NO_LOVE') {
    if (rivalImpact > emImpact) reasons.push('Một chút quan tâm của ai đó nặng hơn mọi nỗ lực của em');
    if (ghosted >= 2) reasons.push(`${ghosted} tin nhắn không được hồi âm`);
    if (state.attention === 'AI_DO') reasons.push('Người ấy đang để ý ai đó');
  }

  const isRedFlag = reasons.length > 0;
  return {
    emImpact,
    rivalImpact,
    emSteps,
    rivalSteps,
    replied,
    ghosted,
    rivalShare,
    reasons,
    isRedFlag,
    isMutual: replied >= 1 && !isRedFlag,
  };
}

export function canTransition(state, event) {
  if (!TRANSITIONS[state.phase][event]) return false;
  if (event === 'CONFIRM_LOVE') return selectStats(state).isMutual; // guard
  return true;
}

function transition(state, event, reason) {
  if (!canTransition(state, event)) return state; // event không hợp lệ → giữ nguyên reference
  const phase = TRANSITIONS[state.phase][event];

  if (phase === 'FRIENDS') return INITIAL_STATE; // RESET: bỏ toàn bộ log → GC thu hồi

  if (phase === 'GHOSTED_EXIT') {
    return {
      ...state,
      phase,
      exitReason: reason ?? EXIT_REASON[event] ?? null,
      messages: state.messages.map((m) => (m.status === 'PENDING' ? { ...m, status: 'CANCELLED' } : m)),
    };
  }

  return { ...state, phase };
}

function settlePending(state, predicate, status) {
  let changed = false;
  const messages = state.messages.map((m) => {
    if (m.status !== 'PENDING' || !predicate(m)) return m;
    changed = true;
    return { ...m, status };
  });
  if (!changed) return state; // kết quả đến muộn cho tin đã xử lý → bỏ qua

  const next = { ...state, messages };
  const ghosted = messages.filter((m) => GHOST_STATUSES.has(m.status)).length;
  if (next.phase === 'DATING_NO_LOVE' && ghosted >= GHOST_LIMIT) {
    return transition(next, 'GHOSTED', `${ghosted} tin nhắn không được hồi âm — tự thoát.`);
  }
  return next;
}

export function relationshipReducer(state, action) {
  switch (action.type) {
    case 'EVENT':
      return transition(state, action.event);

    case 'LOG_EFFORT':
      if (state.phase === 'GHOSTED_EXIT' || action.steps <= 0) return state;
      return {
        ...state,
        signals: [
          ...state.signals,
          { id: action.id, actor: action.actor, steps: action.steps, multiplier: MULTIPLIER[action.actor] },
        ],
      };

    case 'SET_ATTENTION': {
      const next = { ...state, attention: action.attention };
      if (action.attention !== 'AI_DO') return next;
      return settlePending(next, () => true, 'IGNORED'); // chuyển sang ai đó → tin đang chờ bị bỏ qua
    }

    case 'SEND_MESSAGE': {
      const canChat = state.phase === 'DATING_NO_LOVE' || state.phase === 'OFFICIAL_LOVE';
      const hasPending = state.messages.some((m) => m.status === 'PENDING');
      if (!canChat || hasPending) return state;
      return {
        ...state,
        messages: [...state.messages, { id: action.id, text: action.text, status: 'PENDING', sentAt: action.sentAt }],
      };
    }

    case 'MESSAGE_RESOLVED':
      return settlePending(state, (m) => m.id === action.id, action.status);

    default:
      return state;
  }
}