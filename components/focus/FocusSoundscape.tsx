'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Headphones, Music, CloudRain, Coffee, Sparkles, TreePine, Waves } from 'lucide-react';

interface SoundscapeTrack {
  id: string;
  name: string;
  desc: string;
  accent: string;
  Icon: React.ElementType;
}

const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  { id: 'rain',   name: 'Hujan & Petir',     desc: 'Gemericik hujan menenangkan',       accent: '#3B82F6', Icon: CloudRain  },
  { id: 'cafe',   name: 'Kafe Klasik',        desc: 'Suasana produktif kedai kopi',      accent: '#F59E0B', Icon: Coffee     },
  { id: 'space',  name: 'Lofi Angkasa',       desc: 'Hening galaksi yang dalam',         accent: '#8B5CF6', Icon: Sparkles   },
  { id: 'forest', name: 'Angin Hutan',        desc: 'Desau daun & kicau burung malam',   accent: '#10B981', Icon: TreePine   },
  { id: 'ocean',  name: 'Deburan Ombak',      desc: 'Ritme tenang pasang surut laut',    accent: '#06B6D4', Icon: Waves      },
];

// ── Web Audio Synthesis helpers ──────────────────────────────────────────────

function createWhiteNoise(ctx: AudioContext, bufferSec = 2) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * bufferSec, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function createBrownNoise(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * w) / 1.02;
    last = data[i];
    data[i] *= 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

/** Returns a GainNode that is the final output for the given track id */
function buildTrackGraph(id: string, ctx: AudioContext): AudioNode {
  const master = ctx.createGain();
  master.gain.value = 1;

  if (id === 'rain') {
    // White noise → lowpass (rain body) + highpass (drizzle sparkle)
    const noise = createWhiteNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 1200; lp.Q.value = 0.5;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000; hp.Q.value = 0.3;
    const gLow = ctx.createGain(); gLow.gain.value = 0.6;
    const gHigh = ctx.createGain(); gHigh.gain.value = 0.12;
    noise.connect(lp); lp.connect(gLow); gLow.connect(master);
    noise.connect(hp); hp.connect(gHigh); gHigh.connect(master);
    noise.start();
  } else if (id === 'cafe') {
    // Brown noise (low room hum) + random subtle clicks via oscillator bursts
    const brown = createBrownNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain(); g.gain.value = 0.5;
    brown.connect(lp); lp.connect(g); g.connect(master);
    // Subtle high-pitched murmur layer
    const white = createWhiteNoise(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 1.5;
    const gw = ctx.createGain(); gw.gain.value = 0.04;
    white.connect(bp); bp.connect(gw); gw.connect(master);
    brown.start(); white.start();
  } else if (id === 'space') {
    // Deep drone: two detuned oscillators + slow LFO modulation
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 58;
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 8;
    const g1 = ctx.createGain(); g1.gain.value = 0.25;
    const g2 = ctx.createGain(); g2.gain.value = 0.2;
    lfo.connect(lfoGain); lfoGain.connect(osc1.frequency);
    osc1.connect(g1); g1.connect(master);
    osc2.connect(g2); g2.connect(master);
    // White noise shimmer
    const wn = createWhiteNoise(ctx);
    const wnLp = ctx.createBiquadFilter(); wnLp.type = 'lowpass'; wnLp.frequency.value = 300;
    const wnG = ctx.createGain(); wnG.gain.value = 0.03;
    wn.connect(wnLp); wnLp.connect(wnG); wnG.connect(master);
    osc1.start(); osc2.start(); lfo.start(); wn.start();
  } else if (id === 'forest') {
    // Band-passed noise (wind) + very slow LFO amplitude swells
    const noise = createWhiteNoise(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.4;
    const envGain = ctx.createGain(); envGain.gain.value = 0.4;
    // LFO for wind swell
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.25;
    lfo.connect(lfoG); lfoG.connect(envGain.gain);
    noise.connect(bp); bp.connect(envGain); envGain.connect(master);
    // High shimmer (leaves)
    const wh = createWhiteNoise(ctx);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const ghp = ctx.createGain(); ghp.gain.value = 0.07;
    wh.connect(hp); hp.connect(ghp); ghp.connect(master);
    noise.start(); lfo.start(); wh.start();
  } else {
    // ocean: low-freq modulated brown noise
    const brown = createBrownNoise(ctx);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 450;
    const waveGain = ctx.createGain(); waveGain.gain.value = 0.55;
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.3;
    lfo.connect(lfoG); lfoG.connect(waveGain.gain);
    brown.connect(lp); lp.connect(waveGain); waveGain.connect(master);
    const mid = createWhiteNoise(ctx);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 1;
    const gm = ctx.createGain(); gm.gain.value = 0.08;
    mid.connect(bp); bp.connect(gm); gm.connect(master);
    brown.start(); lfo.start(); mid.start();
  }

  return master;
}

// ── Component ────────────────────────────────────────────────────────────────

export function FocusSoundscape() {
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume]       = useState(0.55);
  const [muted, setMuted]         = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const animRef      = useRef<number | null>(null);
  const ctxRef       = useRef<AudioContext | null>(null);
  const masterRef    = useRef<GainNode | null>(null);
  const trackNodeRef = useRef<AudioNode | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);

  const activeTrack = SOUNDSCAPE_TRACKS.find(t => t.id === activeId) ?? null;

  // Volume sync
  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : volume;
  }, [volume, muted]);

  const stopCurrent = () => {
    if (trackNodeRef.current) {
      try { (trackNodeRef.current as any).disconnect?.(); } catch (_) {}
      trackNodeRef.current = null;
    }
  };

  const startTrack = (id: string) => {
    // Init AudioContext lazily
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Analyser
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 128;
    }

    // Master gain
    if (!masterRef.current) {
      masterRef.current = ctx.createGain();
      masterRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    }
    masterRef.current.gain.value = muted ? 0 : volume;

    stopCurrent();
    const node = buildTrackGraph(id, ctx);
    (node as any).connect(masterRef.current);
    trackNodeRef.current = node;
    setIsPlaying(true);
  };

  const handleSelect = (id: string) => {
    if (activeId === id) {
      // Toggle
      if (isPlaying) {
        ctxRef.current?.suspend();
        setIsPlaying(false);
      } else {
        ctxRef.current?.resume();
        setIsPlaying(true);
      }
    } else {
      setActiveId(id);
      startTrack(id);
    }
  };

  const togglePlay = () => {
    if (!activeId) { handleSelect(SOUNDSCAPE_TRACKS[0].id); return; }
    if (isPlaying) { ctxRef.current?.suspend(); setIsPlaying(false); }
    else           { ctxRef.current?.resume();  setIsPlaying(true);  }
  };

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const resize = () => { canvas.width = canvas.offsetWidth * window.devicePixelRatio; canvas.height = 64 * window.devicePixelRatio; };
    resize();
    window.addEventListener('resize', resize);

    const color = activeTrack?.accent ?? '#6366F1';
    const buf   = new Uint8Array(64);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(buf);
      } else {
        const t = Date.now() * 0.002;
        for (let i = 0; i < 64; i++) buf[i] = Math.max(0, Math.sin(i * 0.3 + t) * 18 + 18);
      }

      ctx2d.beginPath();
      const step = W / 64;
      for (let i = 0; i < 64; i++) {
        const x = i * step;
        const y = H - (buf[i] / 255) * H * 0.85 - 4;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
      }
      ctx2d.strokeStyle = color;
      ctx2d.lineWidth = 2.5 * window.devicePixelRatio;
      ctx2d.shadowBlur = 12;
      ctx2d.shadowColor = color;
      ctx2d.stroke();

      // Fill gradient under wave
      ctx2d.shadowBlur = 0;
      ctx2d.lineTo(W, H); ctx2d.lineTo(0, H);
      const g = ctx2d.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `${color}25`); g.addColorStop(1, `${color}00`);
      ctx2d.fillStyle = g;
      ctx2d.fill();
    };
    draw();
    return () => { window.removeEventListener('resize', resize); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, activeId, activeTrack]);

  // Cleanup
  useEffect(() => () => { stopCurrent(); ctxRef.current?.close(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Player Header ── */}
      <div style={{ position: 'relative', background: 'rgba(15,18,30,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(14px)', overflow: 'hidden' }}>
        <AnimatePresence>
          {activeTrack && (
            <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 30%, ${activeTrack.accent}, transparent 65%)`, pointerEvents: 'none', filter: 'blur(18px)' }} />
          )}
        </AnimatePresence>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: activeTrack ? `${activeTrack.accent}18` : 'rgba(255,255,255,0.05)', border: `1px solid ${activeTrack ? `${activeTrack.accent}30` : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              {isPlaying
                ? <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Headphones size={17} color={activeTrack?.accent ?? '#6366F1'} /></motion.div>
                : <Music size={17} color="#6B7280" />
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: 'white' }}>
                Focus Soundscape
                {isPlaying && (
                  <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                    <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: activeTrack?.accent, opacity: 0.6 }} />
                    <span style={{ position: 'relative', borderRadius: '50%', width: 8, height: 8, backgroundColor: activeTrack?.accent, display: 'inline-block' }} />
                  </span>
                )}
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                {activeTrack ? activeTrack.desc : 'Pilih suasana fokusmu hari ini'}
              </p>
            </div>
          </div>

          {/* Play / Pause button */}
          <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={togglePlay}
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: activeTrack ? activeTrack.accent : 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: `0 4px 14px ${activeTrack?.accent ?? '#6366F1'}45`, transition: 'all 0.3s' }}>
            {isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="white" style={{ marginLeft: 2 }} />}
          </motion.button>
        </div>

        {/* Canvas equalizer */}
        <div style={{ borderRadius: 10, overflow: 'hidden', height: 56, background: 'rgba(0,0,0,0.25)' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        {/* Volume row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setMuted(!muted)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.65, lineHeight: 0 }}>
            {muted || volume === 0 ? <VolumeX size={14} color="#9CA3AF" /> : <Volume2 size={14} color="#9CA3AF" />}
          </button>
          <input type="range" min="0" max="1" step="0.02" value={muted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); if (muted) setMuted(false); }}
            style={{ flex: 1, height: 3, borderRadius: 4, outline: 'none', cursor: 'pointer', WebkitAppearance: 'none', background: `linear-gradient(to right, ${activeTrack?.accent ?? '#6366F1'} ${(muted ? 0 : volume) * 100}%, #374151 ${(muted ? 0 : volume) * 100}%)` }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>
            {muted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* ── Track Selector ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SOUNDSCAPE_TRACKS.map(track => {
          const active = activeId === track.id;
          return (
            <motion.button key={track.id} onClick={() => handleSelect(track.id)}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, cursor: 'pointer', border: active ? `1.5px solid ${track.accent}` : '1px solid var(--border)', background: active ? `${track.accent}0D` : 'var(--bg-secondary)', boxShadow: active ? `0 0 18px ${track.accent}15` : 'none', transition: 'all 0.2s ease', textAlign: 'left', width: '100%' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? `${track.accent}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? `${track.accent}35` : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
                <track.Icon size={16} color={active ? track.accent : '#6B7280'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'white' : 'var(--text-primary)' }}>{track.name}</span>
                  {active && isPlaying && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: track.accent, boxShadow: `0 0 8px ${track.accent}`, display: 'inline-block' }} />}
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{track.desc}</p>
              </div>
              {active && isPlaying && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16, flexShrink: 0 }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} style={{ width: 3, borderRadius: 2, backgroundColor: track.accent }}
                      animate={{ height: ['4px', '14px', '4px'] }}
                      transition={{ duration: 0.7 + i * 0.15, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:white;box-shadow:0 0 8px rgba(255,255,255,0.5);cursor:pointer;}
        input[type=range]::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:white;border:none;cursor:pointer;}
      `}</style>
    </div>
  );
}
