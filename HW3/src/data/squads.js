// Số liệu giả lập cho bài tập — không phải kết quả thi đấu thật
export const SQUADS = [
  { squadId: 'te', squadName: 'The Expendables', tag: 'TE', wwcdCount: 4, placementPts: 62, killPts: 71 },
  { squadId: 'ces', squadName: 'Cerberus Esports', tag: 'CES', wwcdCount: 3, placementPts: 58, killPts: 66 },
  { squadId: 'roy', squadName: 'Roy Esports', tag: 'ROY', wwcdCount: 2, placementPts: 49, killPts: 54 },
  { squadId: 'agg', squadName: 'AGG', tag: 'AGG', wwcdCount: 2, placementPts: 44, killPts: 57 },
  { squadId: 'ge', squadName: 'Genius Esports', tag: 'GE', wwcdCount: 1, placementPts: 41, killPts: 39 },
  { squadId: 'sgp', squadName: 'Saigon Phantoms', tag: 'SGP', wwcdCount: 1, placementPts: 37, killPts: 42 },
  { squadId: 'hnr', squadName: 'Hanoi Raptors', tag: 'HNR', wwcdCount: 0, placementPts: 33, killPts: 35 },
  { squadId: 'dnv', squadName: 'Da Nang Vipers', tag: 'DNV', wwcdCount: 0, placementPts: 28, killPts: 31 },
];

export const SQUAD_BY_ID = new Map(SQUADS.map((s) => [s.squadId, s]));

const CALLSIGNS = ['Ghost', 'Viper', 'Hawk', 'Storm'];
const PLAYERS = SQUADS.flatMap((s) => CALLSIGNS.map((c) => ({ ign: `${s.tag}.${c}`, squadId: s.squadId })));
const WEAPONS = ['M416', 'AKM', 'Beryl M762', 'Kar98k', 'AWM', 'Mini14', 'UMP45', 'Lựu đạn'];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
let seq = 0;

export function createKillEvent(timeMs) {
  const killer = pick(PLAYERS);
  let victim = pick(PLAYERS);
  while (victim.squadId === killer.squadId) victim = pick(PLAYERS);
  seq += 1;
  return {
    id: `k-${timeMs}-${seq}`,
    time: timeMs,
    killer: killer.ign,
    killerSquadId: killer.squadId,
    victim: victim.ign,
    victimSquadId: victim.squadId,
    weapon: pick(WEAPONS),
    headshot: Math.random() < 0.3,
  };
}

// Lịch sử kill feed, mới nhất đứng đầu
export function generateHistory(count, nowMs = Date.now()) {
  const events = [];
  let t = nowMs;
  for (let i = 0; i < count; i += 1) {
    t -= 2000 + Math.random() * 8000;
    events.push(createKillEvent(Math.round(t)));
  }
  return events;
}