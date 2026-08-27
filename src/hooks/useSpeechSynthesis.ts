import { useEffect, useRef, useState, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Prefer natural/Google/English female/male smooth voices
      const preferred =
        availableVoices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        availableVoices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        availableVoices.find((v) => v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Karen')) ||
        availableVoices.find((v) => v.lang.startsWith('en')) ||
        availableVoices[0];

      if (preferred) {
        selectedVoiceRef.current = preferred;
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ') // strip big code blocks
      .replace(/`([^`]+)`/g, '$1') // remove inline code marks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links
      .replace(/[*_~#>]/g, '') // remove markdown symbols
      .replace(/\n+/g, ' ') // replace linebreaks
      .trim();
  };

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void, onStart?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        // Interrupted errors happen when user speaks or cancel is called
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        onEnd?.();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        onEnd?.();
      }
    },
    []
  );

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    cancel,
  };
}
