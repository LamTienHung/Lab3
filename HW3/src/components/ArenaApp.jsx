import { useCallback, useState } from 'react';
import { SQUADS } from '../data/squads.js';
import { useKillFeed } from '../hooks/useKillFeed.js';
import { useServerOffset } from '../hooks/useServerOffset.js';
import { formatOffset } from '../utils/format.js';
import { AirdropSection } from './AirdropSection.jsx';
import { KillFeed } from './KillFeed.jsx';
import { Leaderboard } from './Leaderboard.jsx';
import styles from './Arena.module.css';

export function ArenaApp() {
  const clock = useServerOffset();
  const [standings, setStandings] = useState(SQUADS);

  // Mỗi kill mới cộng 1 điểm hạ gục cho đội — cập nhật immutable
  const handleKill = useCallback((event) => {
    setStandings((prev) =>
      prev.map((s) => (s.squadId === event.killerSquadId ? { ...s, killPts: s.killPts + 1 } : s)),
    );
  }, []);

  const killFeed = useKillFeed(handleKill);

  return (
    <main className={styles.app}>
      <header>
        <h1 className={styles.title}>KRAFTON × PUBG Vietnam Arena</h1>
        <p className={styles.subtitle}>Dữ liệu mô phỏng cho bài tập Lab 3 — không phải kết quả thi đấu thật.</p>
        <p className={styles.clock}>
          {clock.status === 'LOADING' && <span role="status">Đang đồng bộ đồng hồ máy chủ…</span>}
          {clock.status === 'SUCCESS' && (
            <span>
              Lệch đồng hồ máy chủ: <output>{formatOffset(clock.offsetMs)}</output>
            </span>
          )}
          {clock.status === 'ERROR' && <span role="alert">Không đồng bộ được: {clock.error}</span>}
          <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={clock.resync}>
            Đồng bộ lại
          </button>
        </p>
      </header>

      <AirdropSection serverOffsetMs={clock.offsetMs} />
      <Leaderboard standings={standings} />
      <KillFeed {...killFeed} />
    </main>
  );
}