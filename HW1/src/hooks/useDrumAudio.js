import { useCallback, useEffect, useRef, useState } from 'react';
import { synthesize } from '../audio/synthDrums.js';

// Có file mp3 → dùng file; thiếu file / lỗi decode → tự tổng hợp
async function loadPadBuffer(ctx, pad, signal) {
  if (pad.src) {
    try {
      const res = await fetch(pad.src, { signal });
      if (res.ok) return await ctx.decodeAudioData(await res.arrayBuffer());
    } catch (err) {
      if (err.name === 'AbortError') throw err; // unmount → dừng hẳn
    }
  }
  return synthesize(ctx, pad.synth);
}

export function useDrumAudio(pads) {
  const [status, setStatus] = useState('IDLE'); // IDLE | LOADING | READY | ERROR
  const [error, setError] = useState(null);
  const engineRef = useRef(null); // { ctx, master, analyser, buffers }
  const abortRef = useRef(null);

  const start = useCallback(async () => {
    if (engineRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setStatus('LOADING');

    let ctx;
    try {
      ctx = new AudioContext(); // chỉ chạy sau click → không warning autoplay
      const master = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      master.connect(analyser);
      analyser.connect(ctx.destination);

      const entries = await Promise.all(
        pads.map(async (p) => [p.id, await loadPadBuffer(ctx, p, controller.signal)]),
      );
      engineRef.current = { ctx, master, analyser, buffers: new Map(entries) };
      setStatus('READY');
    } catch (err) {
      ctx?.close();
      if (err.name === 'AbortError') return;
      setError(err.message);
      setStatus('ERROR');
    }
  }, [pads]);

  const play = useCallback((padId) => {
    const eng = engineRef.current;
    const buffer = eng?.buffers.get(padId);
    if (!buffer) return;
    if (eng.ctx.state === 'suspended') eng.ctx.resume();
    const source = eng.ctx.createBufferSource(); // mỗi hit 1 source → đánh chồng được
    source.buffer = buffer;
    source.connect(eng.master);
    source.start();
  }, []);

  const setVolume = useCallback((value) => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.master.gain.setTargetAtTime(value, eng.ctx.currentTime, 0.01);
  }, []);

  const getAnalyser = useCallback(() => engineRef.current?.analyser ?? null, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      engineRef.current?.ctx.close();
      engineRef.current = null;
    };
  }, []);

  return { status, error, start, play, setVolume, getAnalyser };
}