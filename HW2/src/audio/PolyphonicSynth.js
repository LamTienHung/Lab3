import { midiToFreq } from '../data/keyboard.js';

const ATTACK_S = 0.01;
const DECAY_S = 1.2;
const RELEASE_S = 0.25;
const PEAK = 0.18;
const SILENCE = 0.0001;

export class PolyphonicSynth {
  constructor({ maxVoices = 8, onChange = () => {} } = {}) {
    this.ctx = null;
    this.master = null;
    this.maxVoices = maxVoices;
    this.voices = new Map(); // midi -> { osc, gain } — Map giữ thứ tự chèn = FIFO
    this.onChange = onChange;
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext(); // chỉ gọi từ noteOn → luôn sau user gesture
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  noteOn(midi) {
    const ctx = this.ensureContext();
    if (this.voices.has(midi)) this.release(midi); // đánh lại cùng nốt
    if (this.voices.size >= this.maxVoices) {
      const oldest = this.voices.keys().next().value; // FIFO voice stealing
      this.release(oldest);
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToFreq(midi), now);
    gain.gain.setValueAtTime(SILENCE, now);
    gain.gain.exponentialRampToValueAtTime(PEAK, now + ATTACK_S);
    gain.gain.exponentialRampToValueAtTime(PEAK * 0.35, now + ATTACK_S + DECAY_S);
    osc.connect(gain).connect(this.master);
    osc.start(now);

    this.voices.set(midi, { osc, gain });
    this.emit();
  }

  noteOff(midi) {
    if (this.release(midi)) this.emit();
  }

  release(midi) {
    const voice = this.voices.get(midi);
    if (!voice) return false;
    this.voices.delete(midi);

    const now = this.ctx.currentTime;
    const { osc, gain } = voice;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, SILENCE), now);
    gain.gain.exponentialRampToValueAtTime(SILENCE, now + RELEASE_S); // ramp → không "pop"
    osc.stop(now + RELEASE_S + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    return true;
  }

  allNotesOff() {
    for (const midi of [...this.voices.keys()]) this.release(midi);
    this.emit();
  }

  activeMidis() {
    return [...this.voices.keys()];
  }

  emit() {
    this.onChange(this.activeMidis());
  }

  dispose() {
    for (const { osc, gain } of this.voices.values()) {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}