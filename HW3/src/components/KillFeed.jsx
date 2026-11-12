import { useId, useRef, useState } from 'react';
import { SQUADS, SQUAD_BY_ID } from '../data/squads.js';
import { clockTime } from '../utils/format.js';
import { VirtualList } from './VirtualList.jsx';
import styles from './Arena.module.css';

const ROW_HEIGHT = 44;
const LIST_HEIGHT = 352;

export function KillFeed({ feed, isLive, setIsLive }) {
  const squadId = useId();
  const playerId = useId();
  const headshotId = useId();
  const listRef = useRef(null);
  const [squad, setSquad] = useState('ALL');
  const [player, setPlayer] = useState('');
  const [headshotOnly, setHeadshotOnly] = useState(false);

  const resetScroll = () => {
    if (listRef.current) listRef.current.scrollTop = 0;
  };

  // Derived state: lọc trực tiếp khi render
  const q = player.trim().toLowerCase();
  const visible = feed.filter(
    (ev) =>
      (squad === 'ALL' || ev.killerSquadId === squad || ev.victimSquadId === squad) &&
      (!headshotOnly || ev.headshot) &&
      (!q || ev.killer.toLowerCase().includes(q) || ev.victim.toLowerCase().includes(q)),
  );

  return (
    <section aria-labelledby="feed-title" className={styles.section}>
      <h2 id="feed-title" className={styles.sectionTitle}>Kill feed</h2>

      <form role="search" className={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <p className={styles.field}>
          <label htmlFor={squadId}>Đội</label>
          <select
            id={squadId}
            className={styles.input}
            value={squad}
            onChange={(e) => {
              setSquad(e.target.value);
              resetScroll();
            }}
          >
            <option value="ALL">Tất cả</option>
            {SQUADS.map((s) => (
              <option key={s.squadId} value={s.squadId}>
                {s.squadName}
              </option>
            ))}
          </select>
        </p>
        <p className={styles.field}>
          <label htmlFor={playerId}>Người chơi</label>
          <input
            id={playerId}
            type="search"
            className={styles.input}
            value={player}
            onChange={(e) => {
              setPlayer(e.target.value);
              resetScroll();
            }}
          />
        </p>
        <p className={styles.field}>
          <input
            id={headshotId}
            type="checkbox"
            checked={headshotOnly}
            onChange={(e) => {
              setHeadshotOnly(e.target.checked);
              resetScroll();
            }}
          />
          <label htmlFor={headshotId}>Chỉ headshot</label>
        </p>
        <p className={styles.field}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            aria-pressed={!isLive}
            onClick={() => setIsLive((v) => !v)}
          >
            {isLive ? 'Tạm dừng feed' : 'Tiếp tục feed'}
          </button>
        </p>
      </form>

      <output className={styles.count}>
        Hiển thị {visible.length.toLocaleString('vi-VN')} / {feed.length.toLocaleString('vi-VN')} sự kiện
      </output>

      {visible.length === 0 ? (
        <p className={styles.empty}>Không có sự kiện nào khớp bộ lọc.</p>
      ) : (
        <VirtualList
          ref={listRef}
          items={visible}
          rowHeight={ROW_HEIGHT}
          height={LIST_HEIGHT}
          label="Danh sách hạ gục, mới nhất ở đầu"
          renderItem={(ev) => (
            <>
              <time className={styles.feedTime} dateTime={new Date(ev.time).toISOString()}>
                {clockTime.format(ev.time)}
              </time>
              <strong>{ev.killer}</strong>
              <span className={styles.tag}>[{SQUAD_BY_ID.get(ev.killerSquadId).tag}]</span>
              <span>hạ gục</span>
              <strong>{ev.victim}</strong>
              <span className={styles.tag}>· {ev.weapon}</span>
              {ev.headshot && <span className={styles.headshot}>· Headshot</span>}
            </>
          )}
        />
      )}
    </section>
  );
}   