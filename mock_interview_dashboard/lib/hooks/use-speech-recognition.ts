import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            setText(finalTranscript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const start = () => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch(e) { /* ignore already started */ }
    }
  };

  const stop = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  };

  return { text, start, stop, isListening };
}
