export const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export const clockTime = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const pad = (n) => String(n).padStart(2, '0');

export function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatOffset(ms) {
  return `${ms >= 0 ? '+' : '−'}${(Math.abs(ms) / 1000).toFixed(2)} s`;
}