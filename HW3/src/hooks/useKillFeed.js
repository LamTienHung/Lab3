import { useEffect, useState } from 'react';
import { createKillEvent, generateHistory } from '../data/squads.js';

const MAX_FEED = 5000;
const TICK_MS = 1500;

export function useKillFeed(onKill) {
  const [feed, setFeed] = useState(() => generateHistory(2000));
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return undefined;
    const id = window.setInterval(() => {
      const event = createKillEvent(Date.now());
      setFeed((prev) => [event, ...prev].slice(0, MAX_FEED));
      onKill(event);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [isLive, onKill]);

  return { feed, isLive, setIsLive };
}