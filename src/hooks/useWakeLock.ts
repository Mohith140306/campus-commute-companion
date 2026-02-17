import { useState, useCallback, useEffect, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      wakeLockRef.current.addEventListener('release', () => setIsActive(false));
    } catch {
      setIsActive(false);
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      request();
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && enabled) request();
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
        release();
      };
    } else {
      release();
    }
  }, [enabled, request, release]);

  return isActive;
}
