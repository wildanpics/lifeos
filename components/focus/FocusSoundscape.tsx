'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Headphones, Music, Sparkles } from 'lucide-react';

interface SoundscapeTrack {
  id: string;
  name: string;
  desc: string;
  url: string;
  icon: string;
  accent: string;
}

const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  {
    id: 'rain',
    name: 'Hujan & Petir',
    desc: 'Fokus dalam hangatnya gemericik air',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // High-quality ambient track for testing
    icon: '🌧️',
    accent: '#3B82F6',
  },
  {
    id: 'cafe',
    name: 'Kafe Klasik',
    desc: 'Produktivitas santai ala kedai kopi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    icon: '☕',
    accent: '#F59E0B',
  },
  {
    id: 'space',
    name: 'Lofi Luar Angkasa',
    desc: 'Gelombang sintesis dalam heningnya galaksi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    icon: '🌌',
    accent: '#8B5CF6',
  },
  {
    id: 'forest',
    name: 'Angin Hutan',
    desc: 'Relaksasi desau daun & kicau burung malam',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    icon: '🌲',
    accent: '#10B981',
  },
  {
    id: 'ocean',
    name: 'Deburan Ombak',
    desc: 'Ritme tenang pasang surut air laut',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    icon: '🌊',
    accent: '#06B6D4',
  },
];

export function FocusSoundscape() {
  const [activeTrack, setActiveTrack] = useState<SoundscapeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Toggle track selection
  const handleSelectTrack = (track: SoundscapeTrack) => {
    if (activeTrack?.id === track.id) {
      // Toggle play/pause if clicking the same track
      togglePlay();
      return;
    }

    setActiveTrack(track);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      
      // Auto play on source change
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            initAudioAnalyzer();
          })
          .catch((e) => {
            console.warn('Audio auto-play prevented:', e);
            setIsPlaying(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (!activeTrack) {
      handleSelectTrack(SOUNDSCAPE_TRACKS[0]);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            initAudioAnalyzer();
          })
          .catch((e) => console.error(e));
      }
    }
  };

  // Setup Web Audio API analyzer
  const initAudioAnalyzer = () => {
    if (!audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const context = audioContextRef.current;
      if (context.state === 'suspended') {
        context.resume();
      }

      if (!analyserRef.current) {
        analyserRef.current = context.createAnalyser();
        analyserRef.current.fftSize = 128;
      }

      // Reconnect source if needed
      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(context.destination);
      }
    } catch (err) {
      console.warn('Web Audio API is restricted or not supported by browser security policy:', err);
    }
  };

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 80;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      
      // Clear background with translucent dark fill
      ctx.clearRect(0, 0, width, height);

      let bufferLength = 64;
      let dataArray = new Uint8Array(bufferLength);

      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Mock data for cool wave when idle/paused
        const time = Date.now() * 0.003;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = isPlaying
            ? Math.sin(i * 0.2 + time) * 30 + 30
            : (Math.sin(i * 0.15 + time) * 8 + 8) * (Math.cos(i * 0.05) * 0.8 + 0.2);
        }
      }

      // Draw neon wave/bars
      const barWidth = (width / bufferLength) * 1.6;
      let barHeight;
      let x = 0;

      const activeColor = activeTrack?.accent || '#6366F1';

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < bufferLength; i++) {
        // Calculate height based on frequency data
        const percent = dataArray[i] / 255;
        barHeight = percent * height * 0.85;

        // Apply fallback min height so we always see a beautiful pulsing line
        if (barHeight < 4) barHeight = 4 + Math.sin(i * 0.5 + Date.now() * 0.005) * 2;

        const y = height - barHeight;

        // Draw soft glowing connecting line
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Smooth curves instead of rigid bars
          const xc = x + barWidth / 2;
          const yc = (height - barHeight + (height - (dataArray[i - 1] / 255 * height * 0.85 || 4))) / 2;
          ctx.quadraticCurveTo(x, height - barHeight, xc, yc);
        }

        x += barWidth;
      }

      // Style wave
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = activeColor;
      ctx.stroke();

      // Draw mirrored bottom glowing reflection
      ctx.shadowBlur = 0; // reset shadow for gradient
      const grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, `${activeColor}00`);
      grad.addColorStop(0.5, `${activeColor}15`);
      grad.addColorStop(1, `${activeColor}30`);
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, activeTrack]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        loop
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header section with Equalizer Canvas */}
      <div 
        style={{ 
          background: 'rgba(17, 24, 39, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '20px 24px',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow ambient background based on active track */}
        <AnimatePresence>
          {activeTrack && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 80% 20%, ${activeTrack.accent}, transparent 60%)`,
                pointerEvents: 'none',
                filter: 'blur(20px)',
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 12, 
                background: activeTrack ? `${activeTrack.accent}15` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeTrack ? `${activeTrack.accent}30` : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Headphones size={18} style={{ color: activeTrack?.accent || 'var(--text-primary)' }} />
                </motion.div>
              ) : (
                <Music size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'white' }}>
                Focus Soundscape
                {isPlaying && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeTrack?.accent }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeTrack?.accent }}></span>
                  </span>
                )}
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {activeTrack ? activeTrack.desc : 'Pilih suasana fokusmu hari ini'}
              </p>
            </div>
          </div>

          {/* Core play/pause controller */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: activeTrack ? activeTrack.accent : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: activeTrack ? `0 4px 15px ${activeTrack.accent}40` : '0 4px 15px rgba(99,102,241,0.3)',
              transition: 'background 0.3s ease, box-shadow 0.3s ease'
            }}
          >
            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: 2 }} />}
          </motion.button>
        </div>

        {/* Real-time Canvas Equalizer */}
        <div className="relative mt-3 h-16 w-full flex items-center justify-center overflow-hidden rounded-lg">
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        {/* Volume controller */}
        <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setMuted(!muted)} 
            className="opacity-70 hover:opacity-100 transition-opacity"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {muted || volume === 0 ? <VolumeX size={15} color="#9CA3AF" /> : <Volume2 size={15} color="#9CA3AF" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (muted) setMuted(false);
            }}
            className="flex-1 accent-indigo-500 h-1 rounded-lg bg-gray-800 cursor-pointer"
            style={{
              outline: 'none',
              WebkitAppearance: 'none',
              background: `linear-gradient(to right, ${activeTrack?.accent || '#6366F1'} 0%, ${activeTrack?.accent || '#6366F1'} ${volume * 100}%, #1f2937 ${volume * 100}%, #1f2937 100%)`
            }}
          />
          <span className="text-[10px] tabular-nums font-semibold" style={{ color: 'var(--text-muted)' }}>
            {muted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Sound selector grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {SOUNDSCAPE_TRACKS.map((track) => {
          const isActive = activeTrack?.id === track.id;
          return (
            <motion.div
              key={track.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectTrack(track)}
              className="flex flex-row md:flex-col items-center gap-3"
              style={{
                background: isActive ? 'rgba(255,255,255,0.04)' : 'var(--bg-secondary)',
                border: isActive ? `1.5px solid ${track.accent}` : '1px solid var(--border)',
                borderRadius: 16,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 4px 20px ${track.accent}15` : 'none',
              }}
            >
              {/* Icon badge */}
              <div 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 10, 
                  background: isActive ? `${track.accent}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? `${track.accent}30` : 'transparent'}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 16,
                  transition: 'all 0.3s'
                }}
              >
                {track.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate" style={{ color: isActive ? 'white' : 'var(--text-primary)' }}>
                    {track.name}
                  </span>
                  {isActive && isPlaying && (
                    <span 
                      className="inline-block w-1.5 h-1.5 rounded-full" 
                      style={{ 
                        backgroundColor: track.accent,
                        boxShadow: `0 0 8px ${track.accent}`
                      }}
                    />
                  )}
                </div>
                <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {track.id === 'rain' ? 'Loop Rain & Thunder' : 
                   track.id === 'cafe' ? 'Chill Coffee House' : 
                   track.id === 'space' ? 'Galactic Deep Lofi' : 
                   track.id === 'forest' ? 'Night Woods Ambience' : 'Calm Coast Waves'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Styled inline sliders fallback */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}
