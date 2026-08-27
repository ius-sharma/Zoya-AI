import { useEffect, useRef, useState, useCallback } from 'react';

// Type definitions for Web Speech API SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onSpeechDetected?: () => void;
  lang?: string;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onFinalTranscript,
  onInterimTranscript,
  onSpeechDetected,
  lang = 'en-US',
  continuous = true,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const onSpeechDetectedRef = useRef(onSpeechDetected);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
    onSpeechDetectedRef.current = onSpeechDetected;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onspeechstart = () => {
        if (onSpeechDetectedRef.current) {
          onSpeechDetectedRef.current();
        }
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            currentFinal += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          const cleanedFinal = currentFinal.trim();
          setTranscript((prev) => (prev ? `${prev} ${cleanedFinal}` : cleanedFinal));
          setInterimTranscript('');
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(cleanedFinal);
          }
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          if (onInterimTranscriptRef.current) {
            onInterimTranscriptRef.current(currentInterim);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('SpeechRecognition error:', event.error);
          setError(event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if continuous and wasn't manually stopped
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        isManuallyStoppedRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [lang, continuous]);

  const startListening = useCallback(() => {
    isManuallyStoppedRef.current = false;
    setError(null);
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // Might already be active
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (e) {}
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
