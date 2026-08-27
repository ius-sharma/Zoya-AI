'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceStatus } from '@/types/chat';

interface VoiceWaveVisualizerProps {
  status: VoiceStatus;
  amplitude: number; // 0 to 1
  frequencies?: number[];
  width?: number;
  height?: number;
}

interface Particle {
  x: number;
  y: number;
  baseYOffset: number;
  speed: number;
  size: number;
  alpha: number;
  layer: number;
  phase: number;
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  status,
  amplitude,
  frequencies = [],
  width = 640,
  height = 280,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedAmpRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize floating energy particles
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: height / 2,
        baseYOffset: (Math.random() - 0.5) * 50,
        speed: 0.3 + Math.random() * 0.8,
        size: 0.8 + Math.random() * 2.2,
        alpha: 0.2 + Math.random() * 0.7,
        layer: Math.floor(Math.random() * 3),
        phase: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current = particles;
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.022;

      // Smooth amplitude tracking (exponential response)
      const targetAmp = Math.max(amplitude, 0);
      smoothedAmpRef.current += (targetAmp - smoothedAmpRef.current) * 0.22;
      const smoothAmp = smoothedAmpRef.current;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;

      // Status-based dynamic parameters
      let speedFactor = 1.0;
      let ampMultiplier = 1.0;
      let glowMultiplier = 1.0;
      let centerEnergy = 1.0;

      if (status === 'listening') {
        speedFactor = 1.1 + smoothAmp * 1.5;
        ampMultiplier = 0.8 + smoothAmp * 2.6;
        glowMultiplier = 1.0 + smoothAmp * 1.8;
        centerEnergy = 1.0 + smoothAmp * 1.5;
      } else if (status === 'thinking') {
        speedFactor = 2.4;
        ampMultiplier = 1.2 + Math.sin(time * 6) * 0.35;
        glowMultiplier = 1.4 + Math.sin(time * 8) * 0.4;
        centerEnergy = 1.6;
      } else if (status === 'speaking') {
        speedFactor = 1.6;
        const synthPulse = Math.sin(time * 4.5) * 0.35 + Math.cos(time * 2.2) * 0.2;
        ampMultiplier = 1.35 + synthPulse;
        glowMultiplier = 1.5 + Math.sin(time * 4) * 0.3;
        centerEnergy = 1.8;
      } else {
        // Idle/Paused breathing
        speedFactor = 0.7;
        const breathing = Math.sin(time * 1.8) * 0.12;
        ampMultiplier = 0.85 + breathing;
        glowMultiplier = 0.8;
        centerEnergy = 0.9;
      }

      // Smooth Hann Window / Taper function: 0 at edges, 1 in center
      const getTaper = (x: number) => {
        const norm = x / width; // 0 to 1
        // Smooth sine bell envelope
        const sinVal = Math.sin(Math.PI * norm);
        return Math.pow(sinVal, 1.7);
      };

      // Frequencies helper
      const freq0 = frequencies[1] || 0;
      const freq1 = frequencies[4] || 0;
      const freq2 = frequencies[8] || 0;

      // Blend Mode for intense luminous holographic glow
      ctx.globalCompositeOperation = 'screen';

      // --- LAYER 1: Deep Violet Ambient Glow Core ---
      const coreGlow = ctx.createRadialGradient(
        width / 2,
        centerY,
        15,
        width / 2,
        centerY,
        width * 0.42
      );
      coreGlow.addColorStop(0, `rgba(168, 85, 247, ${0.45 * glowMultiplier})`);
      coreGlow.addColorStop(0.35, `rgba(139, 92, 246, ${0.25 * glowMultiplier})`);
      coreGlow.addColorStop(0.7, `rgba(99, 102, 241, ${0.08 * glowMultiplier})`);
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.ellipse(width / 2, centerY, width * 0.45, height * 0.48 * ampMultiplier, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- MULTI-LAYER WAVE RIBBONS DEFINITION ---
      // Each ribbon has specific harmonic frequencies, phases and vertical displacements
      const ribbons = [
        {
          baseAmp: 34 * ampMultiplier,
          freq: 0.011,
          speed: 1.1 * speedFactor,
          phase: 0,
          harmonics: [
            { f: 0.024, a: 12, s: 1.4 },
            { f: 0.006, a: 18, s: 0.8 },
          ],
          color1: 'rgba(192, 132, 252, 0.45)', // Lighter purple
          color2: 'rgba(126, 34, 206, 0.15)', // Deep violet
          strokeColor: 'rgba(216, 180, 254, 0.85)',
          thickness: 38 * ampMultiplier,
          hasFilaments: true,
        },
        {
          baseAmp: 28 * ampMultiplier,
          freq: 0.014,
          speed: -1.3 * speedFactor,
          phase: Math.PI * 0.45,
          harmonics: [
            { f: 0.031, a: 9, s: -1.6 },
            { f: 0.008, a: 14, s: 0.9 },
          ],
          color1: 'rgba(168, 85, 247, 0.4)',
          color2: 'rgba(91, 33, 182, 0.12)',
          strokeColor: 'rgba(192, 132, 252, 0.75)',
          thickness: 28 * ampMultiplier,
          hasFilaments: true,
        },
        {
          baseAmp: 22 * ampMultiplier,
          freq: 0.018,
          speed: 1.6 * speedFactor,
          phase: Math.PI * 0.85,
          harmonics: [
            { f: 0.038, a: 7, s: 2.0 },
            { f: 0.012, a: 10, s: -1.1 },
          ],
          color1: 'rgba(232, 121, 249, 0.35)', // Bright Fuchsia / Violet
          color2: 'rgba(109, 40, 217, 0.1)',
          strokeColor: 'rgba(240, 171, 252, 0.8)',
          thickness: 20 * ampMultiplier,
          hasFilaments: false,
        },
        {
          baseAmp: 40 * ampMultiplier,
          freq: 0.009,
          speed: -0.9 * speedFactor,
          phase: Math.PI * 1.3,
          harmonics: [
            { f: 0.019, a: 15, s: -1.2 },
            { f: 0.005, a: 22, s: 0.7 },
          ],
          color1: 'rgba(147, 51, 234, 0.35)',
          color2: 'rgba(76, 29, 149, 0.08)',
          strokeColor: 'rgba(168, 85, 247, 0.7)',
          thickness: 44 * ampMultiplier,
          hasFilaments: true,
        },
      ];

      // Calculate Wave points for each ribbon
      const step = 4;
      const pointCount = Math.ceil(width / step) + 1;

      ribbons.forEach((ribbon) => {
        const topPoints: Array<{ x: number; y: number }> = [];
        const botPoints: Array<{ x: number; y: number }> = [];

        const t = time * ribbon.speed;

        for (let i = 0; i <= pointCount; i++) {
          const x = Math.min(i * step, width);
          const taper = getTaper(x);

          // Base primary wave
          let wave = Math.sin(x * ribbon.freq + t + ribbon.phase) * ribbon.baseAmp;

          // Add harmonic sub-waves
          ribbon.harmonics.forEach((h) => {
            wave += Math.sin(x * h.f + time * h.s + ribbon.phase) * (h.a * ampMultiplier);
          });

          // Extra audio frequency ripple
          if (status === 'listening' || status === 'speaking') {
            const freqRipple =
              Math.sin(x * 0.04 + time * 4) * (freq0 * 14) +
              Math.cos(x * 0.07 - time * 3) * (freq1 * 10) +
              Math.sin(x * 0.12 + time * 5) * (freq2 * 6);
            wave += freqRipple;
          }

          const currentY = centerY + wave * taper;
          const currentHalfThick = (ribbon.thickness / 2) * taper;

          topPoints.push({ x, y: currentY - currentHalfThick });
          botPoints.push({ x, y: currentY + currentHalfThick });
        }

        // Draw Ribbon Gradient Area (Between topPoints & botPoints)
        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }
        for (let i = botPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(botPoints[i].x, botPoints[i].y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, centerY - 60, 0, centerY + 60);
        grad.addColorStop(0, ribbon.color1);
        grad.addColorStop(0.5, 'rgba(216, 180, 254, 0.28)');
        grad.addColorStop(1, ribbon.color2);

        ctx.fillStyle = grad;
        ctx.fill();

        // Draw upper and lower luminous contour boundary lines
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = ribbon.strokeColor;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 8 * glowMultiplier;

        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(botPoints[0].x, botPoints[0].y);
        for (let i = 1; i < botPoints.length; i++) {
          ctx.lineTo(botPoints[i].x, botPoints[i].y);
        }
        ctx.stroke();

        // --- FILAMENT / PARTICLE MESH LINES (Striations like in reference photo) ---
        if (ribbon.hasFilaments) {
          ctx.lineWidth = 0.75;
          const filamentStep = 8;
          ctx.strokeStyle = `rgba(192, 132, 252, ${0.28 * glowMultiplier})`;

          ctx.beginPath();
          for (let i = 0; i < topPoints.length; i += filamentStep) {
            const tp = topPoints[i];
            const bp = botPoints[i];
            // Only draw if there is noticeable thickness
            if (Math.abs(bp.y - tp.y) > 4) {
              ctx.moveTo(tp.x, tp.y);
              ctx.lineTo(bp.x, bp.y);
            }
          }
          ctx.stroke();
        }
      });

      // --- CENTER LUMINOUS BEAM / WHITE-VIOLET CORE STRAND ---
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#d8b4fe';
      ctx.shadowBlur = 18 * glowMultiplier;

      ctx.beginPath();
      for (let i = 0; i <= pointCount; i++) {
        const x = Math.min(i * step, width);
        const taper = getTaper(x);
        const wave =
          Math.sin(x * 0.012 + time * 1.5 * speedFactor) * (20 * ampMultiplier) +
          Math.cos(x * 0.025 - time * 2.2 * speedFactor) * (10 * ampMultiplier);

        const y = centerY + wave * taper;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary Bright Violet Glow Core Line
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 25 * glowMultiplier;
      ctx.stroke();

      // --- FLOATING AMBIENT ENERGY PARTICLES ---
      const particles = particlesRef.current;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#e9d5ff';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speed * (0.8 + speedFactor * 0.5);
        if (p.x > width) {
          p.x = 0;
          p.y = centerY;
          p.baseYOffset = (Math.random() - 0.5) * 60;
        }

        const taper = getTaper(p.x);
        const waveOffset =
          Math.sin(p.x * 0.015 + time * 2 + p.phase) * (24 * ampMultiplier) * taper;

        const py = centerY + p.baseYOffset * taper + waveOffset;

        ctx.beginPath();
        ctx.arc(p.x, py, p.size * (1 + smoothAmp * 0.5), 0, Math.PI * 2);
        ctx.fillStyle =
          i % 3 === 0
            ? '#ffffff'
            : i % 2 === 0
            ? 'rgba(232, 121, 249, 0.9)'
            : 'rgba(192, 132, 252, 0.85)';
        ctx.globalAlpha = p.alpha * Math.max(0.2, taper) * centerEnergy;
        ctx.fill();
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, width, height, amplitude, frequencies]);

  return (
    <div className="relative w-full flex items-center justify-center select-none pointer-events-none overflow-visible">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-[700px] h-[240px] sm:h-[280px] object-contain"
      />
    </div>
  );
};
