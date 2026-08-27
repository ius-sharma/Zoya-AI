'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Keyboard, Mic, MicOff, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { TopBar } from './TopBar';
import { useChat } from '@/context/ChatContext';

const ParticleOrb = dynamic(() => import('./ParticleOrb').then((mod) => mod.ParticleOrb), {
  ssr: false,
});
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { VoiceStatus } from '@/types/chat';

export const VoiceModeScreen: React.FC = () => {
  const { voiceState, closeVoiceMode, sendMessage } = useChat();
  const [status, setStatus] = useState<VoiceStatus>('listening');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Web Audio analyser for real mic amplitude & frequencies
  const {
    amplitude,
    frequencies,
    start: startAudioAnalyser,
    stop: stopAudioAnalyser,
  } = useAudioAnalyser();

  // Web Speech synthesis for AI audio voice
  const { speak, cancel: cancelTTS } = useSpeechSynthesis();

  // Interrupt-to-speak handler
  const handleInterrupt = useCallback(() => {
    if (status === 'speaking' || status === 'thinking') {
      console.log('[Zoya Voice] Interrupt detected: User spoke during AI speech. Halting TTS.');
      cancelTTS();
      setStatus('listening');
      setAiResponseText('');
      isProcessingRef.current = false;
    }
  }, [status, cancelTTS]);

  // Web Speech recognition for user voice input
  const {
    startListening: startSpeechRec,
    stopListening: stopSpeechRec,
  } = useSpeechRecognition({
    onInterimTranscript: (interim) => {
      handleInterrupt();
      setInterimTranscript(interim);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    },
    onFinalTranscript: (final) => {
      handleInterrupt();
      setUserTranscript(final);
      setInterimTranscript('');
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = setTimeout(() => {
        handleUserSpeechCompleted(final);
      }, 1100);
    },
    onSpeechDetected: () => {
      handleInterrupt();
    },
  });

  // Amplitude-based interrupt detection
  useEffect(() => {
    if (status === 'speaking' && amplitude > 0.22) {
      handleInterrupt();
    }
  }, [status, amplitude, handleInterrupt]);

  // Execute AI response when user speech completes
  const handleUserSpeechCompleted = async (spokenText: string) => {
    if (!spokenText.trim() || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setStatus('thinking');
    setAiResponseText('');

    try {
      const response = await sendMessage(spokenText);
      const aiReply = response || "I'm ready for your next question.";

      setAiResponseText(aiReply);
      setStatus('speaking');

      speak(
        aiReply,
        () => {
          setStatus('listening');
          setUserTranscript('');
          setInterimTranscript('');
          isProcessingRef.current = false;
        },
        () => {
          setStatus('speaking');
        }
      );
    } catch (err) {
      console.error('Failed to handle voice response:', err);
      setStatus('listening');
      isProcessingRef.current = false;
    }
  };

  // Start mic and recognition on screen mount
  useEffect(() => {
    if (voiceState.isOpen) {
      setStatus('listening');
      startAudioAnalyser().then((success) => {
        if (!success) {
          setMicPermissionDenied(true);
        }
      });
      startSpeechRec();
    }

    return () => {
      stopAudioAnalyser();
      stopSpeechRec();
      cancelTTS();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [voiceState.isOpen, startAudioAnalyser, stopAudioAnalyser, startSpeechRec, stopSpeechRec, cancelTTS]);

  // Toggle Mute / Pause Mic
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startAudioAnalyser();
      startSpeechRec();
      setStatus('listening');
    } else {
      setIsMuted(true);
      stopAudioAnalyser();
      stopSpeechRec();
      cancelTTS();
      setStatus('paused');
    }
  };

  // Get status badge text
  const getStatusText = () => {
    if (isMuted) return 'Voice mode paused';
    switch (status) {
      case 'listening':
        return interimTranscript || userTranscript ? 'Listening..' : "I'm Listening...";
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'paused':
        return 'Voice mode paused';
      default:
        return 'Listening...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF6F0] text-[#292524] select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar Takeover */}
      <TopBar isVoiceMode={true} />

      {/* Main Content Area in Warm Satin Cream */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-4 max-w-4xl mx-auto w-full overflow-visible">
        {/* Upper Area: Live User Transcript */}
        <div className="w-full flex-1 flex flex-col items-center justify-end pb-2 min-h-[70px] text-center">
          {interimTranscript || userTranscript ? (
            <div className="max-w-md px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] shadow-md shadow-stone-200/50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm sm:text-base font-semibold text-[#292524] leading-relaxed">
                {userTranscript}
                <span className="text-[#9C4A1A] font-bold">{interimTranscript}</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#786A5E] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C4A1A] animate-ping" />
              <span>Tap the mic or speak naturally</span>
            </div>
          )}
        </div>

        {/* Center: Exact ChatGPT Liquid Gradient Circle in Light Cream + Rust Brown */}
        <div className="relative w-full flex flex-col items-center justify-center my-auto px-2 overflow-visible">
          <ParticleOrb
            state={isMuted ? 'idle' : status === 'speaking' ? 'speaking' : status === 'thinking' ? 'thinking' : status === 'listening' ? 'listening' : 'idle'}
            audioLevel={isMuted ? 0 : amplitude}
            frequencies={frequencies}
            size={320}
          />

          {/* Status Text Below Circle */}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`text-sm font-bold tracking-wide transition-colors ${
                status === 'speaking'
                  ? 'text-[#7C3512] font-extrabold animate-pulse'
                  : status === 'thinking'
                  ? 'text-[#9C4A1A]'
                  : 'text-[#574E45]'
              }`}
            >
              {getStatusText()}
            </span>
          </div>

          {micPermissionDenied && (
            <div className="mt-2 text-xs text-[#7C3512] bg-[#9C4A1A]/10 px-3.5 py-1.5 rounded-full border border-[#9C4A1A]/30 font-medium">
              Mic permission needed for real voice. Running in interactive simulator mode.
            </div>
          )}
        </div>

        {/* Lower Area: AI Streamed Response Transcript */}
        <div className="w-full flex-1 flex flex-col items-center justify-start pt-4 min-h-[100px] text-center">
          {aiResponseText && (
            <div className="max-w-lg px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E8D8C8] shadow-xl shadow-stone-200/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs sm:text-sm text-[#292524] font-medium leading-relaxed line-clamp-4">
                {aiResponseText}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Control Row (3 buttons: Keyboard, Large Rust Brown Mic, X) */}
        <div className="w-full flex items-center justify-center gap-8 pt-6 pb-4">
          {/* 1. Keyboard Icon (Left: Exits back to text chat) */}
          <button
            onClick={closeVoiceMode}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFFFF] hover:bg-[#F5EBE0] text-[#574E45] hover:text-[#292524] border border-[#E8D8C8] transition-all hover:scale-105 active:scale-95 shadow-md shadow-stone-200/60"
            title="Switch to Text Chat"
            aria-label="Exit voice mode to keyboard"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* 2. Large Rust Brown Mic Button (Center: Tap to mute/pause mic) */}
          <div className="relative">
            {/* Pulsing ring when active listening */}
            {!isMuted && status === 'listening' && (
              <span className="absolute -inset-2 rounded-full bg-[#9C4A1A]/20 animate-ping pointer-events-none" />
            )}
            <button
              onClick={handleToggleMute}
              className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${
                isMuted
                  ? 'bg-[#EFE6DD] text-[#786A5E] border border-[#E0D0BE] shadow-stone-300/40'
                  : 'bg-gradient-to-tr from-[#7C3512] via-[#9C4A1A] to-[#B85D19] text-white shadow-[#9C4A1A]/35 hover:shadow-[#9C4A1A]/55'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute / pause microphone'}
              aria-label="Toggle voice listening"
            >
              {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7 text-white" />}
            </button>
          </div>

          {/* 3. X Icon (Right: Closes voice mode entirely) */}
          <button
            onClick={closeVoiceMode}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFFFF] hover:bg-[#F5EBE0] text-[#574E45] hover:text-[#292524] border border-[#E8D8C8] transition-all hover:scale-105 active:scale-95 shadow-md shadow-stone-200/60"
            title="Close Voice Mode"
            aria-label="Close voice mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};
