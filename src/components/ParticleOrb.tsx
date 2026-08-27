'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceStatus } from '@/types/chat';

export interface ParticleOrbProps {
  state?: 'idle' | 'listening' | 'generating' | 'speaking' | 'thinking' | 'paused';
  audioLevel?: number;
  status?: VoiceStatus;
  amplitude?: number;
  frequencies?: number[];
  size?: number;
}

export const ParticleOrb: React.FC<ParticleOrbProps> = ({
  state,
  audioLevel,
  status,
  amplitude = 0,
  frequencies = [],
  size = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedAmpRef = useRef<number>(0);

  // Normalize voice state
  const activeState =
    state ||
    (status === 'speaking'
      ? 'speaking'
      : status === 'thinking'
      ? 'thinking'
      : status === 'listening'
      ? 'listening'
      : status === 'paused'
      ? 'idle'
      : 'idle');

  const activeAudioLevel = audioLevel !== undefined ? audioLevel : amplitude;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.022;

      // Smooth amplitude tracking (exponential lerp)
      const targetAmp = Math.max(activeAudioLevel, 0);
      smoothedAmpRef.current += (targetAmp - smoothedAmpRef.current) * 0.18;
      const smoothAmp = smoothedAmpRef.current;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const renderSize = size;

      if (canvas.width !== renderSize * dpr || canvas.height !== renderSize * dpr) {
        canvas.width = renderSize * dpr;
        canvas.height = renderSize * dpr;
        canvas.style.width = `${renderSize}px`;
        canvas.style.height = `${renderSize}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, renderSize, renderSize);

      const centerX = renderSize / 2;
      const centerY = renderSize / 2;

      // Dynamic parameters based on voice state
      let speedFactor = 1.0;
      let pulseScale = 1.0;
      let swirlSpeed = 1.0;
      let glowIntensity = 1.0;

      if (activeState === 'listening') {
        speedFactor = 1.2 + smoothAmp * 2.2;
        swirlSpeed = 1.3 + smoothAmp * 2.5;
        pulseScale = 1.0 + smoothAmp * 0.18;
        glowIntensity = 1.0 + smoothAmp * 1.2;
      } else if (activeState === 'speaking' || activeState === 'generating') {
        speedFactor = 1.6;
        swirlSpeed = 1.8;
        const synthRhythm = Math.sin(time * 4.2) * 0.08 + Math.cos(time * 2.5) * 0.05;
        pulseScale = 1.06 + synthRhythm;
        glowIntensity = 1.5;
      } else if (activeState === 'thinking') {
        speedFactor = 2.6;
        swirlSpeed = 3.2; // Rapid vortex spin
        pulseScale = 0.96 + Math.sin(time * 6) * 0.04;
        glowIntensity = 1.3;
      } else {
        // Idle Breathing
        speedFactor = 0.85;
        swirlSpeed = 0.9;
        const breathing = Math.sin(time * 1.5) * 0.03;
        pulseScale = 1.0 + breathing;
        glowIntensity = 0.85;
      }

      const circleRadius = (renderSize * 0.36) * pulseScale;

      // --- 1. CLIP TO PERFECT CRISP CIRCLE (Pure Clean Edge, Zero Outer Glow) ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.clip();

      // BASE: Pure Radiant Warm White Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(centerX - circleRadius - 5, centerY - circleRadius - 5, (circleRadius + 5) * 2, (circleRadius + 5) * 2);

      // --- 3. INTERNAL LIQUID GRADIENT SWIRL (Fluid Golden Amber Clouds) ---
      const t = time * swirlSpeed;

      // Fluid Node 1: Top/Right Golden Amber Cloud (Matches Reference Photo)
      const n1Angle = t * 0.9;
      const n1Dist = circleRadius * (0.38 + Math.sin(t * 1.4) * 0.15);
      const n1X = centerX + Math.cos(n1Angle) * n1Dist;
      const n1Y = centerY + Math.sin(n1Angle) * n1Dist - circleRadius * 0.12;
      const n1R = circleRadius * (1.1 + Math.sin(t * 1.8) * 0.2 + smoothAmp * 0.3);

      const grad1 = ctx.createRadialGradient(n1X, n1Y, 0, n1X, n1Y, n1R);
      grad1.addColorStop(0, 'rgba(245, 158, 11, 0.95)'); // Warm Amber
      grad1.addColorStop(0.35, 'rgba(251, 191, 36, 0.85)'); // Bright Gold
      grad1.addColorStop(0.70, 'rgba(254, 240, 138, 0.45)'); // Light Cream Yellow
      grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(n1X, n1Y, n1R, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Node 2: Secondary Vibrant Orange/Gold Swirl
      const n2Angle = -t * 1.1 + Math.PI * 0.75;
      const n2Dist = circleRadius * (0.42 + Math.cos(t * 1.2) * 0.18);
      const n2X = centerX + Math.cos(n2Angle) * n2Dist;
      const n2Y = centerY + Math.sin(n2Angle) * n2Dist + circleRadius * 0.08;
      const n2R = circleRadius * (0.95 + Math.cos(t * 1.5) * 0.18 + smoothAmp * 0.25);

      const grad2 = ctx.createRadialGradient(n2X, n2Y, 0, n2X, n2Y, n2R);
      grad2.addColorStop(0, 'rgba(234, 88, 12, 0.88)'); // Deep Warm Orange
      grad2.addColorStop(0.40, 'rgba(245, 158, 11, 0.75)'); // Amber Gold
      grad2.addColorStop(0.75, 'rgba(253, 224, 71, 0.30)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(n2X, n2Y, n2R, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Node 3: Bright Sunbeam Yellow Center Swirl
      const n3Angle = t * 1.4 + Math.PI * 1.35;
      const n3Dist = circleRadius * (0.28 + Math.sin(t * 1.9) * 0.12);
      const n3X = centerX + Math.cos(n3Angle) * n3Dist;
      const n3Y = centerY + Math.sin(n3Angle) * n3Dist;
      const n3R = circleRadius * 0.85;

      const grad3 = ctx.createRadialGradient(n3X, n3Y, 0, n3X, n3Y, n3R);
      grad3.addColorStop(0, 'rgba(253, 224, 71, 0.80)'); // Sun Yellow
      grad3.addColorStop(0.50, 'rgba(254, 240, 138, 0.40)');
      grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(n3X, n3Y, n3R, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Node 4: Soft Pure White Internal Luminous Core (Creates Liquid Light Contrast)
      const coreX = centerX - circleRadius * 0.18 + Math.cos(t * 0.7) * 12;
      const coreY = centerY + circleRadius * 0.18 + Math.sin(t * 0.8) * 12;
      const coreR = circleRadius * (0.75 + smoothAmp * 0.2);

      const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreR);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // Pearl White
      coreGrad.addColorStop(0.45, 'rgba(255, 253, 245, 0.70)');
      coreGrad.addColorStop(0.80, 'rgba(254, 243, 199, 0.25)');
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Node 5: Secondary Pure White Highlight Edge
      const hlX = centerX + circleRadius * 0.22 + Math.sin(t * 1.1) * 8;
      const hlY = centerY - circleRadius * 0.28 + Math.cos(t * 1.1) * 8;
      const hlR = circleRadius * 0.55;

      const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR);
      hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.90)');
      hlGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.40)');
      hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = hlGrad;
      ctx.beginPath();
      ctx.arc(hlX, hlY, hlR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore clip

      // --- 4. CRISP CLEAN CIRCULAR RIM (No Shadow / No Outer Glow) ---
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeState, activeAudioLevel, frequencies, size]);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none overflow-visible">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full max-w-[300px] sm:max-w-[340px] aspect-square object-contain animate-in fade-in zoom-in-95 duration-300"
      />
    </div>
  );
};

export default ParticleOrb;
