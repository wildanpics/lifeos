'use client';

import { Star } from 'lucide-react';

export function QuoteFooter() {
  return (
    <div className="relative mt-8 rounded-2xl overflow-hidden p-6 md:p-8 border card" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      {/* Background mountains/stars using CSS gradients and SVG patterns */}
      <div className="absolute inset-0 z-0">
        {/* Abstract Mountains - faint in light mode, visible in dark mode */}
        <svg className="absolute bottom-0 w-full h-32 preserve-3d opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="var(--accent)" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="var(--accent-2)" d="M0,192L60,202.7C120,213,240,235,360,234.7C480,235,600,213,720,208C840,203,960,213,1080,224C1200,235,1320,245,1380,250.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        
        {/* Glow behind text */}
        <div className="absolute top-1/2 left-8 w-64 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-500/10 mt-1">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Kamu lebih baik dari kemarin. Pertahankan konsistensi! 🔥
          </h2>
          <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Disiplin hari ini adalah kebebasan di masa depan.
          </p>
        </div>
      </div>
    </div>
  );
}
