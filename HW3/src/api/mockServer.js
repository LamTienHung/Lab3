// Mock server KRAFTON — chạy trong trình duyệt, mô phỏng độ trễ, lệch đồng hồ, tranh chấp kho
const SERVER_SKEW_MS = 2500; // đồng hồ server nhanh hơn máy người chơi 2.5s
const serverNow = () => Date.now() + SERVER_SKEW_MS;
const latency = () => 250 + Math.random() * 450;

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

const T0 = serverNow();
const MINUTE = 60_000;

const inventory = new Map(
  [
    {
      id: 'pvs-vip',
      kind: 'TICKET',
      title: 'Vé VIP Chung kết PVS + 5.000 G-Coin',
      priceVnd: 1_490_000,
      remainingStock: 5,
      dropEpochMs: T0 + 20_000,
      closeEpochMs: T0 + 20_000 + 3 * MINUTE,
    },
    {
      id: 'gcoin-crate',
      kind: 'CRATE',
      title: 'Thùng Contraband G-Coin',
      priceVnd: 199_000,
      remainingStock: 12,
      dropEpochMs: T0 + 45_000,
      closeEpochMs: T0 + 45_000 + 3 * MINUTE,
    },
    {
      id: 'pvs-standard',
      kind: 'TICKET',
      title: 'Vé phổ thông Chung kết PVS',
      priceVnd: 290_000,
      remainingStock: 40,
      dropEpochMs: T0 - 5_000,
      closeEpochMs: T0 + 5 * MINUTE,
    },
    {
      id: 'early-skin',
      kind: 'CRATE',
      title: 'Thùng skin PVS (đợt 1)',
      priceVnd: 99_000,
      remainingStock: 3,
      dropEpochMs: T0 - 2 * MINUTE,
      closeEpochMs: T0 - 1_000,
    },
  ].map((crate) => [crate.id, crate]),
);

const claimsById = new Map(); // idempotency: cùng claimId → trả lại đúng kết quả cũ
let forceConflict = false;

export function setForceConflict(value) {
  forceConflict = value;
}

export async function fetchServerTime({ signal } = {}) {
  const half = latency() / 2;
  await delay(half, signal);
  const serverEpochMs = serverNow(); // đóng dấu giữa đường truyền
  await delay(half, signal);
  return { serverEpochMs };
}

export async function fetchCrates({ signal } = {}) {
  await delay(latency(), signal);
  if (Math.random() < 0.1) throw new Error('Mất kết nối máy chủ KRAFTON');
  return [...inventory.values()].map((crate) => ({ ...crate }));
}

export async function claimCrate(crateId, claimId, { signal } = {}) {
  await delay(latency(), signal);

  if (claimsById.has(claimId)) return claimsById.get(claimId);
  if (Math.random() < 0.05) throw new Error('Mất tín hiệu vệ tinh'); // lỗi mạng: không lưu → retry an toàn

  const crate = inventory.get(crateId);
  const now = serverNow();
  let result;

  if (!crate) {
    result = { ok: false, status: 404, code: 'NOT_FOUND' };
  } else if (now < crate.dropEpochMs) {
    result = { ok: false, status: 425, code: 'TOO_EARLY', remainingStock: crate.remainingStock };
  } else if (now > crate.closeEpochMs) {
    result = { ok: false, status: 410, code: 'EXPIRED', remainingStock: crate.remainingStock };
  } else {
    // Người chơi khác cũng đang cướp
    if (forceConflict) crate.remainingStock = 0;
    else if (Math.random() < 0.25) crate.remainingStock = Math.max(0, crate.remainingStock - 1);

    if (crate.remainingStock === 0) {
      result = { ok: false, status: 409, code: 'LOOTED_OUT', remainingStock: 0 };
    } else {
      crate.remainingStock -= 1;
      result = {
        ok: true,
        status: 201,
        remainingStock: crate.remainingStock,
        order: { claimId, crateId, priceVnd: crate.priceVnd, claimedAt: now },
      };
    }
  }

  claimsById.set(claimId, result);
  return result;
}