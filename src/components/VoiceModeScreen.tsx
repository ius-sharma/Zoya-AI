'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Keyboard, Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';
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
  const { voiceState, setVoiceState, closeVoiceMode, sendMessage } = useChat();
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
    error: audioError,
  } = useAudioAnalyser();

  // Web Speech synthesis for AI audio voice
  const { speak, cancel: cancelTTS, isSpeaking } = useSpeechSynthesis();

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
    isListening: isRecListening,
    startListening: startSpeechRec,
    stopListening: stopSpeechRec,
    resetTranscript,
  } = useSpeechRecognition({
    onInterimTranscript: (interim) => {
      handleInterrupt();
      setInterimTranscript(interim);
      // Clear silence timer while talking
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    },
    onFinalTranscript: (final) => {
      handleInterrupt();
      setUserTranscript(final);
      setInterimTranscript('');
      
      // Auto-trigger response after short pause
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

  // Amplitude-based interrupt detection (in case browser STT event has latency)
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
      // Send message to chatbot backend
      const response = await sendMessage(spokenText);
      const aiReply = response || "I'm ready for your next question.";

      setAiResponseText(aiReply);
      setStatus('speaking');

      // Speak response out loud
      speak(
        aiReply,
        () => {
          // Finished speaking
          setStatus('listening');
          setUserTranscript('');
          setInterimTranscript('');
          isProcessingRef.current = false;
        },
        () => {
          // Started speaking
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] text-white select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar Takeover */}
      <TopBar isVoiceMode={true} />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-4 max-w-4xl mx-auto w-full overflow-visible">
        {/* Upper Area: Live User Transcript */}
        <div className="w-full flex-1 flex flex-col items-center justify-end pb-2 min-h-[70px] text-center">
          {interimTranscript || userTranscript ? (
            <div className="max-w-md px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <p className="text-sm sm:text-base font-medium text-gray-200 leading-relaxed">
                {userTranscript}
                <span className="text-amber-400 font-semibold">{interimTranscript}</span>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Tap the mic or speak naturally</span>
            </div>
          )}
        </div>

        {/* Center: Exact ChatGPT Liquid Gradient Circle */}
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
              className={`text-sm font-medium tracking-wide transition-colors ${
                status === 'speaking'
                  ? 'text-amber-300 font-semibold animate-pulse'
                  : status === 'thinking'
                  ? 'text-yellow-200'
                  : 'text-gray-300'
              }`}
            >
              {getStatusText()}
            </span>
          </div>

          {micPermissionDenied && (
            <div className="mt-2 text-xs text-amber-400/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Mic permission needed for real voice. Running in interactive simulator mode.
            </div>
          )}
        </div>

        {/* Lower Area: AI Streamed Response Transcript */}
        <div className="w-full flex-1 flex flex-col items-center justify-start pt-4 min-h-[100px] text-center">
          {aiResponseText && (
            <div className="max-w-lg px-4 py-3 rounded-2xl bg-[#141414]/90 border border-amber-500/25 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-4">
                {aiResponseText}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Control Row (3 buttons: Keyboard, Large Amber Mic, X) */}
        <div className="w-full flex items-center justify-center gap-8 pt-6 pb-4">
          {/* 1. Keyboard Icon (Left: Exits back to text chat) */}
          <button
            onClick={closeVoiceMode}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white border border-white/[0.08] transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/40"
            title="Switch to Text Chat"
            aria-label="Exit voice mode to keyboard"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* 2. Large Amber Mic Button (Center: Tap to mute/pause mic) */}
          <div className="relative">
            {/* Pulsing ring when active listening */}
            {!isMuted && status === 'listening' && (
              <span className="absolute -inset-2 rounded-full bg-amber-400/25 animate-ping pointer-events-none" />
            )}
            <button
              onClick={handleToggleMute}
              className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 ${
                isMuted
                  ? 'bg-neutral-800 text-gray-400 border border-white/[0.1] shadow-black/50'
                  : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white shadow-amber-500/40 hover:shadow-amber-500/60'
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
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white border border-white/[0.08] transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/40"
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
