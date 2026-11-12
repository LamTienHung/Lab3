import { useId, useState } from 'react';
import styles from './Arena.module.css';

const SORTS = {
  total: { label: 'Tổng điểm', fn: (a, b) => b.total - a.total || b.wwcdCount - a.wwcdCount || b.placementPts - a.placementPts },
  wwcd: { label: 'WWCD', fn: (a, b) => b.wwcdCount - a.wwcdCount || b.total - a.total },
  placement: { label: 'Điểm hạng', fn: (a, b) => b.placementPts - a.placementPts || b.total - a.total },
  kills: { label: 'Điểm hạ gục', fn: (a, b) => b.killPts - a.killPts || b.total - a.total },
};

export function Leaderboard({ standings }) {
  const queryId = useId();
  const wwcdId = useId();
  const sortId = useId();
  const [query, setQuery] = useState('');
  const [minWwcd, setMinWwcd] = useState(0);
  const [sortBy, setSortBy] = useState('total');

  // Hạng chính thức tính trên TOÀN BỘ đội trước khi lọc → lọc không làm đổi hạng
  const ranked = standings
    .map((s) => ({ ...s, total: s.placementPts + s.killPts }))
    .toSorted(SORTS.total.fn)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const q = query.trim().toLowerCase();
  const rows = ranked
    .filter((s) => s.squadName.toLowerCase().includes(q) && s.wwcdCount >= minWwcd)
    .toSorted(SORTS[sortBy].fn);

  const sortAttr = (key) => (sortBy === key ? 'descending' : undefined);

  return (
    <section aria-labelledby="lb-title" className={styles.section}>
      <h2 id="lb-title" className={styles.sectionTitle}>Bảng xếp hạng PVS (live)</h2>

      <form role="search" className={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <p className={styles.field}>
          <label htmlFor={queryId}>Tên đội</label>
          <input
            id={queryId}
            type="search"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </p>
        <p className={styles.field}>
          <label htmlFor={wwcdId}>WWCD tối thiểu</label>
          <input
            id={wwcdId}
            type="number"
            min={0}
            max={10}
            className={`${styles.input} ${styles.number}`}
            value={minWwcd}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              setMinWwcd(Number.isNaN(v) ? 0 : v);
            }}
          />
        </p>
        <p className={styles.field}>
          <label htmlFor={sortId}>Sắp xếp theo</label>
          <select id={sortId} className={styles.input} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </p>
      </form>

      <output role="status" aria-live="polite" className={styles.count}>
        Hiển thị {rows.length}/{standings.length} đội
      </output>

      {rows.length === 0 ? (
        <p className={styles.empty}>Không có đội nào khớp bộ lọc.</p>
      ) : (
        <table className={styles.table}>
          <caption className={styles.srOnly}>Bảng xếp hạng PVS, sắp xếp theo {SORTS[sortBy].label}</caption>
          <thead>
            <tr>
              <th scope="col">Hạng</th>
              <th scope="col" className={styles.name}>Đội</th>
              <th scope="col" aria-sort={sortAttr('wwcd')}>
                <abbr title="Winner Winner Chicken Dinner">WWCD</abbr>
              </th>
              <th scope="col" aria-sort={sortAttr('placement')}>Điểm hạng</th>
              <th scope="col" aria-sort={sortAttr('kills')}>Hạ gục</th>
              <th scope="col" aria-sort={sortAttr('total')}>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.squadId}>
                <td>{s.rank}</td>
                <th scope="row" className={styles.name}>{s.squadName}</th>
                <td>{s.wwcdCount}</td>
                <td>{s.placementPts}</td>
                <td>{s.killPts}</td>
                <td><strong>{s.total}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}