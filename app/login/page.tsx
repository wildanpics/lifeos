'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, handleGoogleRedirectResult } from '@/lib/firebase/auth';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

type Mode = 'login' | 'signup';

const FEATURES = [
  { icon: '🕌', text: 'Prayer Time Realtime' },
  { icon: '🎮', text: 'Gamifikasi XP & Level' },
  { icon: '🎯', text: 'Focus Mode Pomodoro' },
  { icon: '📊', text: 'Analytics Produktivitas' },
  { icon: '💧', text: 'Hydration Tracker' },
  { icon: '🔒', text: 'Morning Lock System' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureIndex, setFeatureIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeatureIndex((i) => (i + 1) % FEATURES.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Handle Google redirect result (fallback from popup-blocked)
  useEffect(() => {
    handleGoogleRedirectResult().then((user) => {
      if (user) router.replace('/dashboard');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const user = await signInWithGoogle();
      if (user) router.replace('/dashboard');
      // if null = redirect mode triggered, page will navigate automatically
    } catch (e: any) {
      const msg =
        e.code === 'auth/unauthorized-domain'
          ? '⚠️ Domain ini belum diizinkan di Firebase. Tambahkan localhost ke Authorized Domains di Firebase Console.'
          : e.code === 'auth/operation-not-allowed'
          ? '⚠️ Google Sign-In belum diaktifkan. Aktifkan di Firebase Console → Authentication → Sign-in method.'
          : e.code === 'auth/network-request-failed'
          ? 'Koneksi gagal. Periksa internet kamu.'
          : e.code === 'auth/internal-error'
          ? 'Firebase error. Cek konfigurasi project.'
          : `Google sign-in gagal: ${e.message || e.code || 'unknown error'}`;
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleEmail = async () => {
    if (!email || !password) { setError('Email dan password harus diisi.'); return; }
    if (mode === 'signup' && !name) { setError('Nama harus diisi.'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'signup') await signUpWithEmail(email, password, name);
      else await signInWithEmail(email, password);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(
        e.code === 'auth/invalid-credential' ? 'Email atau password salah.' :
        e.code === 'auth/user-not-found' ? 'Akun tidak ditemukan.' :
        e.code === 'auth/email-already-in-use' ? 'Email sudah terdaftar.' :
        e.code === 'auth/weak-password' ? 'Password minimal 6 karakter.' :
        e.code === 'auth/invalid-email' ? 'Format email tidak valid.' :
        'Terjadi kesalahan. Coba lagi.'
      );
    } finally { setLoading(false); }
  };

  return (
    /* Full-screen dark container */
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0F19' }}>

      {/* ═══════════════════════════════════════════════
          LEFT PANEL — Branding  (hidden on mobile)
      ═══════════════════════════════════════════════ */}
      <div style={{
        display: 'none',
        width: '45%',
        maxWidth: 680,
        minWidth: 400,
        flexShrink: 0,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #080c14 0%, #0f1420 40%, #0d1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
        className="lg-left-panel"
      >
        {/* Purple orb top */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Violet orb bottom */}
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '10%', right: '-5%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo + Tagline */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.3)', '0 0 45px rgba(99,102,241,0.65)', '0 0 20px rgba(99,102,241,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: 48, height: 48, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              }}
            >
              <Zap size={24} color="white" />
            </motion.div>
            <div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>LIFE</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#8B5CF6' }}> OS</span>
            </div>
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
            Bangun Disiplin.<br />
            <span style={{ color: '#8B5CF6' }}>Capai Potensi</span><br />
            Tertinggimu.
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
            Sistem operasi kehidupan yang membantu kamu mengurangi adiksi dopamin,
            membangun kebiasaan baik, dan gamifikasi perjalanan hidupmu.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#374151', marginBottom: 16, textTransform: 'uppercase' }}>
            Fitur Unggulan
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FEATURES.map((f, i) => {
              const active = i === featureIndex;
              return (
                <motion.div
                  key={i}
                  animate={{ opacity: active ? 1 : 0.3, x: active ? 10 : 0 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 14px', borderRadius: 12,
                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'white', flex: 1 }}>{f.text}</span>
                  {active && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle size={15} color="#6366F1" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>
            "Setiap kebiasaan kecil adalah investasi terbesar untuk masa depanmu."
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT PANEL — Auth Form  (full-width mobile)
      ═══════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#0B0F19',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}>

        {/* Subtle background glow (mobile + desktop) */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Form card container */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
        >
          {/* Mobile only: logo */}
          <div className="lg-hide-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.3)', '0 0 40px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 56, height: 56, borderRadius: 16,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                marginBottom: 12,
              }}
            >
              <Zap size={26} color="white" />
            </motion.div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>LIFE</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#8B5CF6' }}> OS</span>
            </div>
            <p style={{ fontSize: 12, color: '#4B5563', marginTop: 4 }}>Personal Discipline & Productivity System</p>
          </div>

          {/* Desktop heading */}
          <div className="lg-show-heading" style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
              {mode === 'login' ? 'Selamat datang kembali 👋' : 'Mulai perjalananmu ⚡'}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              {mode === 'login'
                ? 'Masuk untuk melanjutkan sesi produktivitasmu.'
                : 'Buat akun gratis dan mulai bangun disiplin.'}
            </p>
          </div>

          {/* Mode switch tabs */}
          <div style={{
            display: 'flex', borderRadius: 16, padding: 4, marginBottom: 24,
            background: '#111827', border: '1px solid #1F2937',
          }}>
            {(['login', 'signup'] as Mode[]).map((m) => {
              const active = mode === m;
              return (
                <motion.button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12,
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    color: active ? 'white' : '#6B7280',
                    background: active ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                    boxShadow: active ? '0 4px 15px rgba(99,102,241,0.35)' : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </motion.button>
              );
            })}
          </div>

          {/* Form box */}
          <div style={{
            background: '#111827',
            border: '1px solid #1F2937',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Error alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 12, fontSize: 13,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#EF4444', overflow: 'hidden',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name field (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <StyledInput
                    icon={<User size={15} color="#4B5563" />}
                    type="text" value={name} onChange={setName}
                    placeholder="Nama lengkap"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <StyledInput
              icon={<Mail size={15} color="#4B5563" />}
              type="email" value={email} onChange={setEmail}
              placeholder="Alamat email"
              onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
            />

            {/* Password */}
            <StyledInput
              icon={<Lock size={15} color="#4B5563" />}
              type={showPwd ? 'text' : 'password'}
              value={password} onChange={setPassword}
              placeholder="Password"
              onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
              suffix={
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.6 }}
                >
                  {showPwd ? <EyeOff size={15} color="#9CA3AF" /> : <Eye size={15} color="#9CA3AF" />}
                </button>
              }
            />

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleEmail}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 0', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                color: 'white', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                opacity: loading ? 0.75 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <>{mode === 'login' ? 'Masuk ke LIFE OS' : 'Buat Akun Gratis'} <ArrowRight size={15} /></>
              )}
            </motion.button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#1F2937' }} />
              <span style={{ fontSize: 11, color: '#374151' }}>atau</span>
              <div style={{ flex: 1, height: 1, background: '#1F2937' }} />
            </div>

            {/* Google */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogle}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '12px 0', borderRadius: 12, cursor: 'pointer',
                background: '#1a2035', border: '1px solid #1F2937',
                color: 'white', fontWeight: 500, fontSize: 13,
                transition: 'background 0.2s',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Lanjut dengan Google
            </motion.button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 16 }}>
            Dengan masuk, kamu berkomitmen membangun disiplin diri. 💪
          </p>
        </motion.div>
      </div>

      {/* Inline styles for responsive */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Show left panel on lg screens */
        @media (min-width: 1024px) {
          .lg-left-panel { display: flex !important; }
          .lg-hide-logo { display: none !important; }
          .lg-show-heading { display: block !important; }
        }
        /* Hide on small screens */
        @media (max-width: 1023px) {
          .lg-left-panel { display: none !important; }
          .lg-hide-logo { display: block !important; }
          .lg-show-heading { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Styled Input Component ── */
interface StyledInputProps {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  suffix?: React.ReactNode;
}

function StyledInput({ icon, type, value, onChange, placeholder, onKeyDown, suffix }: StyledInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 12,
      background: '#0d1117',
      border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : '#1F2937'}`,
      boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
      transition: 'all 0.2s',
    }}>
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 14, color: 'white', minWidth: 0,
        }}
      />
      {suffix}
    </div>
  );
}
