import { useId, useReducer } from 'react';
import {
  EVENT_LABEL,
  INITIAL_STATE,
  PHASE_LABEL,
  TRANSITIONS,
  canTransition,
  relationshipReducer,
  selectStats,
} from '../fsm/relationshipMachine.js';
import { useSeenNoReplyTimer } from '../hooks/useSeenNoReplyTimer.js';
import { ChatPanel } from './ChatPanel.jsx';
import { EffortPanel } from './EffortPanel.jsx';
import styles from './Situationship.module.css';

export function SituationshipAnalyzer() {
  const meterId = useId();
  const guardHintId = useId();
  const [state, dispatch] = useReducer(relationshipReducer, INITIAL_STATE);

  // Derived state — tính thẳng trong render
  const stats = selectStats(state);
  const pending = state.messages.find((m) => m.status === 'PENDING');
  const userEvents = Object.keys(TRANSITIONS[state.phase]).filter((e) => e !== 'GHOSTED'); // GHOSTED do hệ thống tự kích

  useSeenNoReplyTimer({ pendingId: pending?.id ?? null, attention: state.attention, dispatch });

  const statusText =
    state.phase === 'GHOSTED_EXIT'
      ? `Đã thoát: ${state.exitReason ?? ''} Mọi tác vụ chờ đã được huỷ.`
      : stats.isRedFlag
        ? `Red flag: ${stats.reasons.join(' · ')}`
        : 'Ổn định — chưa có dấu hiệu đáng lo.';

  return (
    <main className={styles.app}>
      <header>
        <h1 className={styles.title}>Situationship Analyzer</h1>
        <p className={styles.subtitle}>
          Lấy cảm hứng từ tên bài hát “Hẹn Hò Nhưng Không Yêu” — mô hình hoá mối quan hệ mập mờ bằng máy trạng thái hữu hạn.
        </p>
      </header>

      <section aria-labelledby="fsm-title" className={styles.section}>
        <h2 id="fsm-title" className={styles.sectionTitle}>Trạng thái</h2>
        <p className={styles.phase} data-phase={state.phase}>
          Pha hiện tại: <strong>{PHASE_LABEL[state.phase]}</strong>
        </p>

        <output role="status" aria-live="polite" className={styles.verdict} data-flag={stats.isRedFlag}>
          {statusText}
        </output>

        <p className={styles.field}>
          <label htmlFor={meterId}>Tỷ trọng ảnh hưởng của ai đó</label>
          <meter
            id={meterId}
            className={styles.meter}
            min={0}
            max={1}
            low={0.34}
            high={0.5}
            optimum={0}
            value={stats.rivalShare}
          >
            {Math.round(stats.rivalShare * 100)}%
          </meter>
          <span aria-hidden="true">{Math.round(stats.rivalShare * 100)}%</span>
        </p>

        <ul className={styles.actions}>
          {userEvents.map((event) => (
            <li key={event}>
              <button
                type="button"
                className={event === 'WALK_AWAY' || event === 'BREAK_UP' ? `${styles.button} ${styles.danger}` : styles.button}
                disabled={!canTransition(state, event)}
                aria-describedby={event === 'CONFIRM_LOVE' ? guardHintId : undefined}
                onClick={() => dispatch({ type: 'EVENT', event })}
              >
                {EVENT_LABEL[event]}
              </button>
            </li>
          ))}
        </ul>
        {state.phase === 'DATING_NO_LOVE' && (
          <p id={guardHintId} className={styles.hint}>
            Chỉ xác nhận được khi có ít nhất 1 tin nhắn được trả lời và không còn red flag.
          </p>
        )}
      </section>

      <EffortPanel
        signals={state.signals}
        stats={stats}
        disabled={state.phase === 'GHOSTED_EXIT'}
        dispatch={dispatch}
      />

      <ChatPanel
        phase={state.phase}
        messages={state.messages}
        attention={state.attention}
        hasPending={Boolean(pending)}
        dispatch={dispatch}
      />
    </main>
  );
}