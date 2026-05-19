'use client';

import { useEffect, useRef, useCallback } from 'react';

interface WaterPhysicsCanvasProps {
  fillPercent: number;      // 0 to 1
  tiltAngle: number;        // degrees: -30 to 30
  width?: number;
  height?: number;
}

const NUM_POINTS = 80;        // surface resolution
const SPRING_K = 0.025;       // spring stiffness between adjacent points
const DAMPING = 0.985;        // velocity damping (1 = no damping, 0 = instant stop)
const SPREAD = 0.18;          // how fast waves propagate sideways
const GRAVITY_SCALE = 0.006;  // how strongly tilt pulls the surface level

export function WaterPhysicsCanvas({ fillPercent, tiltAngle, width = 200, height = 120 }: WaterPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    heights: new Float32Array(NUM_POINTS),     // displacement from rest level
    velocities: new Float32Array(NUM_POINTS),  // vertical velocity at each point
    prevFill: fillPercent,
    prevTilt: tiltAngle,
    animId: 0,
  });

  // Splash a point with an impulse — call this on tilt change or fill change
  const splash = useCallback((x: number, strength: number) => {
    const s = stateRef.current;
    const idx = Math.floor((x / width) * NUM_POINTS);
    const clamped = Math.max(0, Math.min(NUM_POINTS - 1, idx));
    s.velocities[clamped] += strength;
    // Small neighbouring splash
    if (clamped > 0) s.velocities[clamped - 1] += strength * 0.4;
    if (clamped < NUM_POINTS - 1) s.velocities[clamped + 1] += strength * 0.4;
  }, [width]);

  useEffect(() => {
    const s = stateRef.current;

    // Detect fill change → splash on fill
    if (Math.abs(fillPercent - s.prevFill) > 0.01) {
      const fillChange = fillPercent - s.prevFill;
      splash(width * 0.5, fillChange * 60);   // centre splash
      s.prevFill = fillPercent;
    }

    // Detect tilt change → splash on edge being tilted down
    if (Math.abs(tiltAngle - s.prevTilt) > 0.5) {
      const delta = tiltAngle - s.prevTilt;
      // Tilt right → water rushes right → splash right edge
      const edge = delta > 0 ? width * 0.85 : width * 0.15;
      splash(edge, Math.abs(delta) * 0.8);
      s.prevTilt = tiltAngle;
    }
  }, [fillPercent, tiltAngle, splash, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // ---- Physics step ----
      // Apply gravity/tilt: tilt tilts the equilibrium surface linearly
      const tiltRad = (tiltAngle * Math.PI) / 180;
      const totalTiltDisp = Math.tan(tiltRad) * W * GRAVITY_SCALE;

      const t = performance.now() / 1000; // seconds

      for (let i = 0; i < NUM_POINTS; i++) {
        // Rest position offset due to tilt
        const tiltOffset = ((i / (NUM_POINTS - 1)) - 0.5) * totalTiltDisp * H;

        // ---- Ambient idle wave perturbation ----
        // Two sine oscillators at different frequencies/phases for a natural, non-repeating look
        const x01 = i / (NUM_POINTS - 1);
        const ambientWave =
          Math.sin(x01 * Math.PI * 2.5 + t * 0.9)  * 1.8 +   // slow primary swell
          Math.sin(x01 * Math.PI * 5.0 + t * 1.6)  * 0.9 +   // faster secondary ripple
          Math.sin(x01 * Math.PI * 1.2 - t * 0.55) * 1.2;    // long counter-travelling wave

        const force = -SPRING_K * (s.heights[i] - tiltOffset - ambientWave);
        s.velocities[i] += force;
        s.velocities[i] *= DAMPING;
      }

      // Wave propagation between neighbours (spread energy laterally)
      const newHeights = new Float32Array(s.heights);
      for (let i = 1; i < NUM_POINTS - 1; i++) {
        newHeights[i] += SPREAD * (s.heights[i - 1] + s.heights[i + 1] - 2 * s.heights[i]);
      }
      for (let i = 0; i < NUM_POINTS; i++) {
        s.heights[i] = newHeights[i] + s.velocities[i];
      }

      // ---- Render ----
      ctx.clearRect(0, 0, W, H);

      const baseY = H * (1 - fillPercent);  // the flat rest water level

      // Gradient fill
      const grad = ctx.createLinearGradient(0, baseY, 0, H);
      grad.addColorStop(0,   'rgba(96, 165, 250, 0.75)');
      grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.85)');
      grad.addColorStop(1,   'rgba(29,  78, 216, 0.95)');

      ctx.beginPath();
      ctx.moveTo(0, H);

      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * W;
        const y = baseY + s.heights[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Glossy surface highlight line
      ctx.beginPath();
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * W;
        const y = baseY + s.heights[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Subtle inner highlight (glass glow at the surface)
      const highlightGrad = ctx.createLinearGradient(0, baseY, 0, baseY + 18);
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      for (let i = 0; i < NUM_POINTS; i++) {
        const x = (i / (NUM_POINTS - 1)) * W;
        const y = baseY + s.heights[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, baseY + 18);
      ctx.lineTo(0, baseY + 18);
      ctx.closePath();
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      s.animId = requestAnimationFrame(draw);
    };

    s.animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(s.animId);
  }, [fillPercent, tiltAngle]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }}
    />
  );
}
