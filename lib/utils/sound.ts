'use client';

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * Synthesizes a crisp, satisfying mechanical switch click (like a high-fidelity key click).
 */
export const playMechanicalClick = () => {
  if (typeof window === 'undefined') return;
  
  // Check store preferences to ensure sound is enabled
  try {
    const { useAppStore } = require('@/store/useAppStore');
    const state = useAppStore.getState();
    if (state && state.soundEnabled === false) return;
  } catch (e) {
    // Fallback if store is not initialized yet
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // 1. Tactile click body
    const osc = ctx.createOscillator();
    const gainOsc = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.02);
    
    gainOsc.gain.setValueAtTime(0.2, now);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    
    osc.connect(gainOsc);
    gainOsc.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.04);
    
    // 2. High-frequency switch metallic release "tick"
    const tick = ctx.createOscillator();
    const gainTick = ctx.createGain();
    
    tick.type = 'triangle';
    tick.frequency.setValueAtTime(6500, now);
    tick.frequency.exponentialRampToValueAtTime(2500, now + 0.01);
    
    gainTick.gain.setValueAtTime(0.12, now);
    gainTick.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
    
    tick.connect(gainTick);
    gainTick.connect(ctx.destination);
    
    tick.start(now);
    tick.stop(now + 0.015);
  } catch (err) {
    console.warn("Audio click synthesis failed", err);
  }
};

/**
 * Synthesizes a beautiful perfect-fifth crystal chime bell (perfect for goal completion or quests).
 */
export const playCrystalChime = () => {
  if (typeof window === 'undefined') return;

  // Check store preferences to ensure sound is enabled
  try {
    const { useAppStore } = require('@/store/useAppStore');
    const state = useAppStore.getState();
    if (state && state.soundEnabled === false) return;
  } catch (e) {
    // Fallback if store is not initialized yet
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Fundamental note E6 (1318.51 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.9);
    
    // Harmonious perfect fifth overtone B6 (1975.53 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now);
    
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn("Audio chime synthesis failed", err);
  }
};
