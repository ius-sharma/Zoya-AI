import { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioAnalyserData {
  amplitude: number; // 0 to 1
  frequencies: number[]; // Array of 0-255 normalized values
  isActive: boolean;
  error: string | null;
  start: () => Promise<boolean>;
  stop: () => void;
}

export function useAudioAnalyser(): AudioAnalyserData {
  const [amplitude, setAmplitude] = useState<number>(0);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef<boolean>(false);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsActive(false);
    setAmplitude(0);
    setFrequencies([]);
  }, []);

  const updateAudioData = useCallback(() => {
    if (!analyserRef.current || !isActive) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate RMS/average amplitude
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avg = sum / bufferLength;
    const normalizedAmp = Math.min(1, avg / 128); // 0 to 1

    // Subsampled frequency bands (e.g. 16 bands for visualization)
    const bandSize = Math.max(1, Math.floor(bufferLength / 16));
    const bands: number[] = [];
    for (let i = 0; i < 16; i++) {
      let bandSum = 0;
      for (let j = 0; j < bandSize; j++) {
        bandSum += dataArray[i * bandSize + j] || 0;
      }
      bands.push((bandSum / bandSize) / 255);
    }

    setAmplitude(normalizedAmp);
    setFrequencies(bands);

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [isActive]);

  const start = useCallback(async (): Promise<boolean> => {
    try {
      if (isActive && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        return true;
      }

      setError(null);
      
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Web Audio API is not supported in this browser.');
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsActive(true);
      return true;
    } catch (err) {
      console.warn('Microphone access not available or denied:', err);
      setError((err as Error).message || 'Microphone access failed');
      setIsActive(false);
      return false;
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, updateAudioData]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    amplitude,
    frequencies,
    isActive,
    error,
    start,
    stop,
  };
}
