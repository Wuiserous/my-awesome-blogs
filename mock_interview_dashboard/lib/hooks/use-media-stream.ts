import { useState, useEffect, useRef } from 'react';

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const initStream = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        setStream(activeStream);
      } catch (err) {
        setError(err as Error);
      }
    };

    initStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { stream, error };
}
