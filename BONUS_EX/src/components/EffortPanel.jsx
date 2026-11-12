import { useId, useState } from 'react';
import styles from './Situationship.module.css';

const ACTOR_LABEL = { EM: 'Em', AI_DO: 'Ai đó' };

function readSteps(e, setter) {
  const v = e.target.valueAsNumber;
  setter(Number.isNaN(v) ? 0 : Math.max(0, Math.round(v)));
}

export function EffortPanel({ signals, stats, disabled, dispatch }) {
  const emId = useId();
  const rivalId = useId();
  const [emSteps, setEmSteps] = useState(100);
  const [rivalSteps, setRivalSteps] = useState(1);

  const logEffort = (actor, steps) => {
    dispatch({ type: 'LOG_EFFORT', id: crypto.randomUUID(), actor, steps });
  };

  return (
    <section aria-labelledby="effort-title" className={styles.section}>
      <h2 id="effort-title" className={styles.sectionTitle}>Nỗ lực bất cân xứng</h2>

      <form className={styles.effortForm} onSubmit={(e) => e.preventDefault()}>
        <p className={styles.field}>
          <label htmlFor={emId}>Số lần em cố gắng (× 0,1)</label>
          <input
            id={emId}
            type="number"
            min={0}
            className={styles.input}
            value={emSteps}
            disabled={disabled}
            onChange={(e) => readSteps(e, setEmSteps)}
          />
          <button
            type="button"
            className={styles.button}
            disabled={disabled || emSteps <= 0}
            onClick={() => logEffort('EM', emSteps)}
          >
            Ghi nỗ lực của em
          </button>
        </p>
        <p className={styles.field}>
          <label htmlFor={rivalId}>Mức quan tâm của ai đó (× 50)</label>
          <input
            id={rivalId}
            type="number"
            min={0}
            className={styles.input}
            value={rivalSteps}
            disabled={disabled}
            onChange={(e) => readSteps(e, setRivalSteps)}
          />
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            disabled={disabled || rivalSteps <= 0}
            onClick={() => logEffort('AI_DO', rivalSteps)}
          >
            Ghi quan tâm của ai đó
          </button>
        </p>
      </form>

      <dl className={styles.stats}>
        <dt>Em</dt>
        <dd>
          {stats.emSteps} lần → tác động {stats.emImpact.toFixed(1)}
        </dd>
        <dt>Ai đó</dt>
        <dd>
          {stats.rivalSteps} lần → tác động {stats.rivalImpact.toFixed(1)}
        </dd>
      </dl>

      {signals.length > 0 && (
        <ol className={styles.log} aria-label="Nhật ký nỗ lực, mới nhất trước">
          {signals
            .slice(-8)
            .toReversed()
            .map((s) => (
              <li key={s.id}>
                {ACTOR_LABEL[s.actor]}: {s.steps} × {s.multiplier} = {(s.steps * s.multiplier).toFixed(1)}
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}