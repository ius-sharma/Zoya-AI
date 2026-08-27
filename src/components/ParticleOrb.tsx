'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VoiceStatus } from '@/types/chat';

// Vertex Shader with Ashima Arts 2D Simplex Noise, State Morphing & Refined Particle Scale
const vertexShader = `
uniform float uTime;
uniform float uAudioLevel;
uniform float uPixelRatio;
uniform float uState; // 0=idle, 1=listening, 2=thinking, 3=searching, 4=speaking
uniform float uWaveSpeed;
uniform float uWaveHeight;
uniform float uScanSweep;

varying float vHeight;
varying float vFalloff;
varying vec3 vPos;

// Simplex 2D noise implementation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec3 pos = position;

  // 1. Tight elliptical falloff mask: smoothstep to 0 at edges
  float distNorm = length(vec2(pos.x / 4.0, pos.z / 1.25));
  float falloff = smoothstep(0.90, 0.10, distNorm);

  // 2. Refined Harmonic Traveling Waves (sleeker, medium height)
  float t = uTime * uWaveSpeed;
  
  // Base dual harmonic crests
  float wave1 = sin(pos.x * 1.75 - t * 2.0) * 0.22;
  float wave2 = sin(pos.x * 2.6 + t * 1.4 + pos.z * 1.4) * 0.15;
  float wave3 = cos(pos.x * 1.05 - t * 0.9 + 1.2) * 0.18;

  // 3. State-Specific Morphing Displacements
  float extraStateWave = 0.0;

  // Thinking State: High-frequency neural ripple
  if (uState > 1.5 && uState < 2.5) {
    extraStateWave += sin(pos.x * 5.5 - uTime * 9.0) * 0.09 * (1.0 - distNorm);
    extraStateWave += cos(pos.z * 6.0 + uTime * 6.0) * 0.06;
  }
  // Searching State: Concentric radar sonar sweep
  else if (uState > 2.5 && uState < 3.5) {
    float sweepDist = abs(pos.x - uScanSweep);
    extraStateWave += exp(-sweepDist * 3.5) * 0.22;
    extraStateWave += sin(length(pos.xz) * 4.0 - uTime * 5.0) * 0.08;
  }
  // Listening State: Audio Reactive Frequency ripple
  else if (uState > 0.5 && uState < 1.5) {
    extraStateWave += sin(pos.x * 3.8 + uTime * 3.0) * (uAudioLevel * 0.25);
  }

  // 4. Simplex noise for fluid organic detail
  vec2 noiseCoord = vec2(pos.x * 0.38 + t * 0.15, pos.z * 0.45);
  float noiseVal = snoise(noiseCoord) * 0.18;

  // 5. Combined displacement scaled to medium elegant height
  float totalWave = (wave1 + wave2 + wave3 + extraStateWave + noiseVal);
  float dynamicAmp = uWaveHeight * (0.65 + uAudioLevel * 1.35);

  pos.y += totalWave * falloff * dynamicAmp;

  vHeight = clamp((pos.y + 0.55) / 1.1, 0.0, 1.0);
  vFalloff = falloff;
  vPos = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Micro-particle point size (refined, fine, crisp particles)
  float baseSize = 11.5 + uAudioLevel * 5.5;
  gl_PointSize = baseSize * falloff * (1.0 / -mvPosition.z) * uPixelRatio;
}
`;

// Fragment Shader with State-Adaptive Color Gradients, Soft Sprites & Additive Bloom
const fragmentShader = `
uniform vec3 uColorLow;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform vec3 uColorPeak;
uniform float uAudioLevel;
uniform float uState;

varying float vHeight;
varying float vFalloff;
varying vec3 vPos;

void main() {
  // Soft circular sprite (discard square borders)
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float pointAlpha = smoothstep(0.5, 0.03, dist);

  // Gradient color ramp mapped from vHeight
  vec3 color = mix(uColorLow, uColorMid, smoothstep(0.0, 0.40, vHeight));
  color = mix(color, uColorHigh, smoothstep(0.40, 0.74, vHeight));
  color = mix(color, uColorPeak, smoothstep(0.74, 1.0, vHeight));

  // Crest peak illumination
  float crestBloom = pow(vHeight, 2.2) * (0.8 + uAudioLevel * 0.7);
  color += uColorPeak * crestBloom * 0.42;

  // Smooth quadratic alpha falloff so the edges vanish seamlessly
  float edgeAlpha = vFalloff * vFalloff;
  float finalAlpha = pointAlpha * edgeAlpha * (0.35 + vHeight * 0.65);

  gl_FragColor = vec4(color, finalAlpha);
}
`;

interface ParticleWaveFieldProps {
  state?: string;
  audioLevel?: number;
}

const ParticleWaveField: React.FC<ParticleWaveFieldProps> = ({
  state = 'idle',
  audioLevel = 0,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentAudioRef = useRef<number>(0);
  const scanSweepRef = useRef<number>(-4.5);

  // High-density micro-particles: 175 cols x 68 rows = 11,900 points
  const geometry = useMemo(() => {
    const cols = 175;
    const rows = 68;
    const count = cols * rows;
    const positions = new Float32Array(count * 3);

    let idx = 0;
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const x = (u - 0.5) * 8.8; // -4.4 to +4.4

      for (let j = 0; j < rows; j++) {
        const v = j / (rows - 1);
        const z = (v - 0.5) * 2.8; // -1.4 to +1.4

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;
        idx++;
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  // Custom Shader Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioLevel: { value: 0 },
      uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1 },
      uState: { value: 0 },
      uWaveSpeed: { value: 1.0 },
      uWaveHeight: { value: 0.85 },
      uScanSweep: { value: -4.5 },
      uColorLow: { value: new THREE.Color('#0a0414') },
      uColorMid: { value: new THREE.Color('#7c3aed') },
      uColorHigh: { value: new THREE.Color('#c084fc') },
      uColorPeak: { value: new THREE.Color('#f3e8ff') },
    }),
    []
  );

  // Target Color References for smooth lerping
  const targetColorsRef = useRef({
    low: new THREE.Color('#0a0414'),
    mid: new THREE.Color('#7c3aed'),
    high: new THREE.Color('#c084fc'),
    peak: new THREE.Color('#f3e8ff'),
  });

  // Update target themes and parameters when state changes
  useEffect(() => {
    switch (state) {
      case 'listening':
        // Electric Cyan & Neon Violet (Active Mic Voice)
        targetColorsRef.current.low.set('#041220');
        targetColorsRef.current.mid.set('#0284c7');
        targetColorsRef.current.high.set('#818cf8');
        targetColorsRef.current.peak.set('#38bdf8');
        break;
      case 'thinking':
        // Neural Indigo & Bioluminescent Magenta (Reasoning)
        targetColorsRef.current.low.set('#18042b');
        targetColorsRef.current.mid.set('#7c3aed');
        targetColorsRef.current.high.set('#ec4899');
        targetColorsRef.current.peak.set('#fbcfe8');
        break;
      case 'searching':
        // Cosmic Sapphire Blue & Cyber Cyan (Web / Data Search)
        targetColorsRef.current.low.set('#02142e');
        targetColorsRef.current.mid.set('#0284c7');
        targetColorsRef.current.high.set('#06b6d4');
        targetColorsRef.current.peak.set('#67e8f9');
        break;
      case 'speaking':
      case 'generating':
        // Majestic Violet & Radiant Lavender-White (Harmonic AI Voice)
        targetColorsRef.current.low.set('#120726');
        targetColorsRef.current.mid.set('#7c3aed');
        targetColorsRef.current.high.set('#c084fc');
        targetColorsRef.current.peak.set('#ffffff');
        break;
      case 'idle':
      default:
        // Deep Obsidian & Zen Purple (Standby)
        targetColorsRef.current.low.set('#0a0414');
        targetColorsRef.current.mid.set('#581c87');
        targetColorsRef.current.high.set('#9333ea');
        targetColorsRef.current.peak.set('#e9d5ff');
        break;
    }
  }, [state]);

  // GPU Animation & State Interpolation Loop
  useFrame((clockState) => {
    if (!materialRef.current) return;

    const t = clockState.clock.elapsedTime;
    const u = materialRef.current.uniforms;
    u.uTime.value = t;

    // Numerical State Code
    let stateCode = 0; // idle
    let targetSpeed = 0.85;
    let targetHeight = 0.75;
    let targetAudio = 0.15;

    if (state === 'listening') {
      stateCode = 1;
      targetSpeed = 1.15;
      targetHeight = 0.90;
      targetAudio = Math.max(0.12, Math.min(1.0, audioLevel * 1.5));
    } else if (state === 'thinking') {
      stateCode = 2;
      targetSpeed = 1.85;
      targetHeight = 0.85;
      targetAudio = 0.40 + Math.sin(t * 7.5) * 0.20;
    } else if (state === 'searching') {
      stateCode = 3;
      targetSpeed = 1.40;
      targetHeight = 0.80;
      targetAudio = 0.35;
      // Radar sweep back and forth
      scanSweepRef.current += 0.085;
      if (scanSweepRef.current > 4.5) scanSweepRef.current = -4.5;
      u.uScanSweep.value = scanSweepRef.current;
    } else if (state === 'speaking' || state === 'generating') {
      stateCode = 4;
      targetSpeed = 1.35;
      targetHeight = 0.95;
      const speechPulse = Math.sin(t * 4.8) * 0.24 + Math.cos(t * 2.8) * 0.16 + 0.44;
      targetAudio = Math.max(0.30, Math.min(0.90, speechPulse));
    } else {
      // Idle breathing
      stateCode = 0;
      targetSpeed = 0.75;
      targetHeight = 0.65;
      targetAudio = 0.15 + Math.sin(t * 1.5) * 0.06;
    }

    u.uState.value = stateCode;

    // Smooth lerping of parameters
    currentAudioRef.current += (targetAudio - currentAudioRef.current) * 0.16;
    u.uAudioLevel.value = currentAudioRef.current;

    u.uWaveSpeed.value += (targetSpeed - u.uWaveSpeed.value) * 0.10;
    u.uWaveHeight.value += (targetHeight - u.uWaveHeight.value) * 0.10;

    // Smoothly blend color uniforms to target palette
    const lerpSpeed = 0.08;
    u.uColorLow.value.lerp(targetColorsRef.current.low, lerpSpeed);
    u.uColorMid.value.lerp(targetColorsRef.current.mid, lerpSpeed);
    u.uColorHigh.value.lerp(targetColorsRef.current.high, lerpSpeed);
    u.uColorPeak.value.lerp(targetColorsRef.current.peak, lerpSpeed);
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export interface ParticleOrbProps {
  state?: 'idle' | 'listening' | 'generating' | 'speaking' | 'thinking' | 'searching' | 'paused';
  audioLevel?: number;
  status?: VoiceStatus;
  amplitude?: number;
  frequencies?: number[];
  size?: 'normal' | 'compact' | 'mini';
  className?: string;
}

export const ParticleOrb: React.FC<ParticleOrbProps> = ({
  state,
  audioLevel,
  status,
  amplitude = 0,
  size = 'normal',
  className = '',
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const normalizedState =
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

  const normalizedAudioLevel = audioLevel !== undefined ? audioLevel : amplitude;

  const isMini = size === 'mini';
  const isCompact = size === 'compact';

  const containerHeight = isMini ? 'h-[70px]' : isCompact ? 'h-[180px]' : 'h-[320px] sm:h-[360px]';
  const containerMaxWidth = isMini ? 'max-w-[320px]' : isCompact ? 'max-w-[500px]' : 'max-w-[900px]';
  const cameraFov = isMini ? 48 : isCompact ? 42 : 36;
  const cameraPos: [number, number, number] = isMini ? [0, 2.0, 4.4] : [0, 2.4, 4.8];

  if (!isClient) {
    return (
      <div className={`w-full ${containerHeight} flex items-center justify-center bg-transparent ${className}`} />
    );
  }

  return (
    <div
      className={`relative w-full ${containerMaxWidth} ${containerHeight} mx-auto select-none pointer-events-none overflow-visible flex items-center justify-center ${className}`}
    >
      <Canvas
        camera={{ position: cameraPos, fov: cameraFov }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full bg-transparent overflow-visible"
      >
        <ParticleWaveField
          state={normalizedState}
          audioLevel={normalizedAudioLevel}
        />
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom
            luminanceThreshold={0.12}
            luminanceSmoothing={0.92}
            intensity={isMini ? 1.05 : 1.28}
            radius={isMini ? 0.45 : 0.65}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default ParticleOrb;
