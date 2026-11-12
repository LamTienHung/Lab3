import { memo, useId } from 'react';
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer.js';
import { formatCountdown, vnd } from '../utils/format.js';
import styles from './Arena.module.css';

const PHASE_LABEL = {
  WARMUP: 'Sắp thả',
  AIRDROP_LIVE: 'Đang mở',
  LOOTED_OUT: 'Hết hàng',
  EXPIRED: 'Đã đóng',
};

export const CrateCard = memo(function CrateCard({ crate, serverOffsetMs, isClaiming, onClaim }) {
  const titleId = useId();
  const open = usePubgAirdropTimer(crate.dropEpochMs, serverOffsetMs);
  const close = usePubgAirdropTimer(crate.closeEpochMs, serverOffsetMs);

  // Derived phase: tính trong render, không lưu state
  const phase = !open.isLive
    ? 'WARMUP'
    : close.isLive
      ? 'EXPIRED'
      : crate.remainingStock <= 0
        ? 'LOOTED_OUT'
        : 'AIRDROP_LIVE';

  const showCountdown = phase === 'WARMUP' || phase === 'AIRDROP_LIVE';
  const targetMs = phase === 'WARMUP' ? crate.dropEpochMs : crate.closeEpochMs;
  const countdownMs = phase === 'WARMUP' ? open.remainingMs : close.remainingMs;
  const canClaim = phase === 'AIRDROP_LIVE' && !isClaiming;

  return (
    <article className={styles.card} data-phase={phase} aria-labelledby={titleId}>
      <header className={styles.cardHeader}>
        <h3 id={titleId} className={styles.cardTitle}>{crate.title}</h3>
        <p className={styles.badge}>{PHASE_LABEL[phase]}</p>
      </header>

      <dl className={styles.meta}>
        <dt>Loại</dt>
        <dd>{crate.kind === 'TICKET' ? 'Vé' : 'Thùng G-Coin'}</dd>
        <dt>Giá</dt>
        <dd>{vnd.format(crate.priceVnd)}</dd>
        <dt>Còn lại</dt>
        <dd>{crate.remainingStock}</dd>
        {showCountdown && (
          <>
            <dt>{phase === 'WARMUP' ? 'Mở sau' : 'Đóng sau'}</dt>
            <dd>
              <time dateTime={new Date(targetMs).toISOString()}>{formatCountdown(countdownMs)}</time>
            </dd>
          </>
        )}
      </dl>

      <button
        type="button"
        className={`${styles.button} ${styles.claim}`}
        disabled={!canClaim}
        aria-busy={isClaiming}
        onClick={() => onClaim(crate)}
      >
        {isClaiming ? 'Đang xử lý…' : phase === 'AIRDROP_LIVE' ? 'Nhận ngay' : PHASE_LABEL[phase]}
      </button>
    </article>
  );
});