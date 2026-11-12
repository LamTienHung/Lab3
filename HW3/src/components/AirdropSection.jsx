import { useId, useState } from 'react';
import { setForceConflict } from '../api/mockServer.js';
import { useCrateInventory } from '../hooks/useCrateInventory.js';
import { clockTime, vnd } from '../utils/format.js';
import { CrateCard } from './CrateCard.jsx';
import styles from './Arena.module.css';

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'];

export function AirdropSection({ serverOffsetMs }) {
  const conflictId = useId();
  const inventory = useCrateInventory();
  const [forceConflict, setForceConflictState] = useState(false);

  const handleConflictToggle = (e) => {
    setForceConflictState(e.target.checked);
    setForceConflict(e.target.checked);
  };

  return (
    <section aria-labelledby="drops-title" className={styles.section}>
      <h2 id="drops-title" className={styles.sectionTitle}>Airdrop &amp; Vé Chung kết PVS</h2>

      <p className={styles.field}>
        <input id={conflictId} type="checkbox" checked={forceConflict} onChange={handleConflictToggle} />
        <label htmlFor={conflictId}>Mô phỏng người chơi khác vét sạch kho (409)</label>
      </p>

      <output role="status" aria-live="polite" className={styles.notice} data-type={inventory.notice?.type}>
        {inventory.notice?.text ?? ''}
      </output>

      {inventory.status === 'LOADING' && (
        <ul className={styles.cards} aria-busy="true" aria-label="Đang tải kho vật phẩm">
          {SKELETON_KEYS.map((key) => (
            <li key={key} className={styles.skeleton} />
          ))}
        </ul>
      )}

      {inventory.status === 'ERROR' && (
        <section role="alert" className={styles.alert}>
          <p>Không tải được kho: {inventory.error}</p>
          <button type="button" className={styles.button} onClick={inventory.reload}>
            Kết nối lại
          </button>
        </section>
      )}

      {inventory.status === 'SUCCESS' && (
        <ul className={styles.cards}>
          {inventory.crates.map((crate) => (
            <li key={crate.id}>
              <CrateCard
                crate={crate}
                serverOffsetMs={serverOffsetMs}
                isClaiming={crate.id in inventory.inFlight}
                onClaim={inventory.claim}
              />
            </li>
          ))}
        </ul>
      )}

      {inventory.orders.length > 0 && (
        <section aria-labelledby="orders-title" className={styles.orders}>
          <h3 id="orders-title" className={styles.subTitle}>Vật phẩm đã nhận</h3>
          <ul className={styles.orderList}>
            {inventory.orders.map((order) => (
              <li key={order.claimId}>
                {order.title} · {vnd.format(order.priceVnd)} ·{' '}
                <time dateTime={new Date(order.claimedAt).toISOString()}>
                  {clockTime.format(order.claimedAt)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}