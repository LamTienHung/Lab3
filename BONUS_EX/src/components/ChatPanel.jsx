import { useId, useState } from 'react';
import { REPLY_TIMEOUT_MS } from '../fsm/relationshipMachine.js';
import styles from './Situationship.module.css';

const STATUS_LABEL = {
  PENDING: 'Đang chờ…',
  REPLIED: 'Đã trả lời',
  SEEN_NO_REPLY: 'Seen không rep',
  IGNORED: 'Bị bỏ qua vì ai đó',
  CANCELLED: 'Đã huỷ khi rời đi',
};

export function ChatPanel({ phase, messages, attention, hasPending, dispatch }) {
  const attentionId = useId();
  const messageId = useId();
  const [draft, setDraft] = useState('');

  const canChat = phase === 'DATING_NO_LOVE' || phase === 'OFFICIAL_LOVE';
  const canSend = canChat && !hasPending && draft.trim() !== '';

  const handleSend = (e) => {
    e.preventDefault();
    if (!canSend) return;
    dispatch({ type: 'SEND_MESSAGE', id: crypto.randomUUID(), text: draft.trim(), sentAt: Date.now() });
    setDraft('');
  };

  return (
    <section aria-labelledby="chat-title" className={styles.section}>
      <h2 id="chat-title" className={styles.sectionTitle}>Seen không rep</h2>

      <p className={styles.field}>
        <label htmlFor={attentionId}>Người ấy đang để ý</label>
        <select
          id={attentionId}
          className={styles.input}
          value={attention}
          disabled={phase === 'GHOSTED_EXIT'}
          onChange={(e) => dispatch({ type: 'SET_ATTENTION', attention: e.target.value })}
        >
          <option value="EM">Em</option>
          <option value="AI_DO">Ai đó</option>
        </select>
      </p>

      <form className={styles.field} onSubmit={handleSend}>
        <label htmlFor={messageId}>Tin nhắn</label>
        <input
          id={messageId}
          type="text"
          maxLength={120}
          className={`${styles.input} ${styles.grow}`}
          value={draft}
          disabled={!canChat}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className={styles.button} disabled={!canSend}>
          Gửi
        </button>
      </form>

      {!canChat && <p className={styles.hint}>Chỉ nhắn tin được khi đang hẹn hò hoặc yêu chính thức.</p>}
      {hasPending && (
        <p role="status" className={styles.hint}>
          Đang chờ trả lời (tối đa {REPLY_TIMEOUT_MS / 1000} giây)…
        </p>
      )}

      {messages.length > 0 && (
        <ol className={styles.messages} aria-label="Tin nhắn đã gửi">
          {messages.map((m) => (
            <li key={m.id} className={styles.message} data-status={m.status}>
              <span>{m.text}</span>
              <span className={styles.messageStatus}>{STATUS_LABEL[m.status]}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}