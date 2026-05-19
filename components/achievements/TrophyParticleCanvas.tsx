'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  spin: number;
  angle: number;
}

interface TrophyParticleCanvasProps {
  triggerCount: number;
}

export function TrophyParticleCanvas({ triggerCount }: TrophyParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerCount === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Spawn 80 golden sparks radiating from the center of the canvas
    const colors = [
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FF8C00', // DarkOrange
      '#FFF8DC', // Cornsilk (shiny white-yellow)
      '#FEE2E2', // Light gold
      '#F59E0B'  // Amber
    ];

    const newParticles: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Radial explosion speeds
      const speed = Math.random() * 5 + 3.5; 
      const size = Math.random() * 2.5 + 1.8;
      // Fast burst decay
      const decay = Math.random() * 0.016 + 0.012;
      const color = colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        // Explode slightly upwards for beautiful fountain appearance
        vy: Math.sin(angle) * speed - (Math.random() * 1.5 + 1),
        color,
        size,
        alpha: 1,
        decay,
        gravity: 0.12,  // Pull downward over time
        friction: 0.97, // Air drag
        spin: Math.random() * 0.2 - 0.1,
        angle: Math.random() * Math.PI * 2
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Play loop
    if (!animationFrameIdRef.current) {
      const render = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentParticles = particlesRef.current;
        if (currentParticles.length === 0) {
          animationFrameIdRef.current = null;
          return;
        }

        particlesRef.current = currentParticles.filter((p) => {
          // physics updates
          p.vx *= p.friction;
          p.vy *= p.friction;
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          p.angle += p.spin;

          if (p.alpha <= 0) return false;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          // Add beautiful shadow glow blur
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;

          // Draw a sparkling diamond/star shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
          return true;
        });

        animationFrameIdRef.current = requestAnimationFrame(render);
      };

      animationFrameIdRef.current = requestAnimationFrame(render);
    }
  }, [triggerCount]);

  // Resize canvas responsively and handle device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
