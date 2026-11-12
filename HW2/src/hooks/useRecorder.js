import { useCallback, useEffect, useRef, useState } from 'react';
import { midiToFreq } from '../data/keyboard.js';

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export function useRecorder({ voiceOn, voiceOff, allNotesOff }) {
  const [mode, setModeState] = useState('IDLE'); // IDLE | RECORDING | PLAYING
  const [take, setTake] = useState([]); // FIFO: { id, midi, freqHz, durationMs, deltaMs }[]
  const modeRef = useRef('IDLE');
  const bufferRef = useRef([]);
  const pendingRef = useRef(new Map()); // midi -> event chưa có duration
  const lastStartRef = useRef(null);
  const abortRef = useRef(null);

  const setMode = useCallback((next) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const startRecording = useCallback(() => {
    if (modeRef.current !== 'IDLE') return;
    bufferRef.current = [];
    pendingRef.current = new Map();
    lastStartRef.current = null;
    setMode('RECORDING');
  }, [setMode]);

  const captureOn = useCallback((midi) => {
    if (modeRef.current !== 'RECORDING') return;
    const now = performance.now();
    const event = {
      id: crypto.randomUUID(),
      midi,
      freqHz: midiToFreq(midi),
      deltaMs: lastStartRef.current === null ? 0 : now - lastStartRef.current,
      durationMs: 0,
      startedAt: now,
    };
    lastStartRef.current = now;
    bufferRef.current.push(event); // enqueue
    pendingRef.current.set(midi, event);
  }, []);

  const captureOff = useCallback((midi) => {
    const event = pendingRef.current.get(midi);
    if (!event) return;
    event.durationMs = performance.now() - event.startedAt;
    pendingRef.current.delete(midi);
  }, []);

  const finishRecording = useCallback(() => {
    const now = performance.now();
    for (const event of pendingRef.current.values()) event.durationMs = now - event.startedAt;
    pendingRef.current.clear();
    setTake(bufferRef.current.map(({ startedAt, ...event }) => event)); // snapshot immutable
    setMode('IDLE');
  }, [setMode]);

  const play = useCallback(
    async (speed) => {
      if (modeRef.current !== 'IDLE' || take.length === 0) return;
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;
      setMode('PLAYING');

      const releases = [];
      try {
        for (const event of take) {
          // dequeue theo thứ tự FIFO
          await sleep(event.deltaMs / speed, signal);
          voiceOn(event.midi);
          releases.push(
            sleep(event.durationMs / speed, signal).then(
              () => voiceOff(event.midi),
              () => {}, // bị abort → Stop đã tắt hết tiếng
            ),
          );
        }
        await Promise.all(releases);
      } catch (err) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setMode('IDLE');
        }
      }
    },
    [take, voiceOn, voiceOff, setMode],
  );

  const stop = useCallback(() => {
    if (modeRef.current === 'RECORDING') {
      finishRecording();
      return;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    allNotesOff();
    setMode('IDLE');
  }, [finishRecording, allNotesOff, setMode]);

  const clearTake = useCallback(() => setTake([]), []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return { mode, take, startRecording, captureOn, captureOff, play, stop, clearTake };
}