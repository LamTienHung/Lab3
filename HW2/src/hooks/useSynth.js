import { useCallback, useEffect, useRef, useState } from 'react';
import { PolyphonicSynth } from '../audio/PolyphonicSynth.js';

export function useSynth(maxVoices = 8) {
  const synthRef = useRef(null);
  const heldRef = useRef(new Set()); // nốt người dùng đang giữ thật
  const sustainRef = useRef(false);
  const [active, setActive] = useState(() => new Set()); // nốt đang vang
  const [sustain, setSustainState] = useState(false);

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new PolyphonicSynth({
        maxVoices,
        onChange: (midis) => setActive(new Set(midis)),
      });
    }
    return synthRef.current;
  }, [maxVoices]);

  // Dành cho người chơi: tôn trọng sustain pedal
  const noteOn = useCallback(
    (midi) => {
      heldRef.current.add(midi);
      getSynth().noteOn(midi);
    },
    [getSynth],
  );

  const noteOff = useCallback((midi) => {
    if (!heldRef.current.delete(midi)) return; // không giữ nốt này → bỏ qua
    if (!sustainRef.current) synthRef.current?.noteOff(midi);
  }, []);

  // Dành cho replay: điều khiển voice trực tiếp
  const voiceOn = useCallback((midi) => getSynth().noteOn(midi), [getSynth]);
  const voiceOff = useCallback((midi) => synthRef.current?.noteOff(midi), []);

  const allNotesOff = useCallback(() => {
    heldRef.current.clear();
    synthRef.current?.allNotesOff();
  }, []);

  const setSustain = useCallback((on) => {
    sustainRef.current = on;
    setSustainState(on);
    if (on || !synthRef.current) return;
    for (const midi of synthRef.current.activeMidis()) {
      if (!heldRef.current.has(midi)) synthRef.current.noteOff(midi); // nhả pedal → tắt nốt không còn giữ
    }
  }, []);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  return { active, sustain, setSustain, noteOn, noteOff, voiceOn, voiceOff, allNotesOff, maxVoices };
}