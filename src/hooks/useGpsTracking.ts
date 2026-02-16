import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GpsState {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  error: string | null;
  isTracking: boolean;
  lastUpdated: Date | null;
}

interface UseGpsTrackingOptions {
  busId: string | null;
  enabled: boolean;
}

export function useGpsTracking({ busId, enabled }: UseGpsTrackingOptions) {
  const { toast } = useToast();
  const [state, setState] = useState<GpsState>({
    latitude: null,
    longitude: null,
    speed: null,
    error: null,
    isTracking: false,
    lastUpdated: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  const calculateSpeed = useCallback((
    lat1: number, lng1: number, time1: number,
    lat2: number, lng2: number, time2: number
  ): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    const timeDiff = (time2 - time1) / 1000 / 3600;
    if (timeDiff <= 0) return 0;
    return Math.round((distance / timeDiff) * 10) / 10;
  }, []);

  const updateBusLocation = useCallback(async (lat: number, lng: number, speed: number | null) => {
    if (!busId) return;
    try {
      const { error } = await supabase
        .from('buses')
        .update({
          current_lat: lat,
          current_lng: lng,
          speed: speed !== null ? Math.round(speed) : 0,
          last_updated: new Date().toISOString(),
        })
        .eq('id', busId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        speed,
        lastUpdated: new Date(),
        error: null,
      }));
    } catch (err) {
      console.error('Failed to update bus location:', err);
      setState(prev => ({ ...prev, error: 'Failed to update location in database' }));
    }
  }, [busId]);

  const handlePosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const timestamp = position.timestamp;

    let speed = position.coords.speed !== null
      ? Math.round(position.coords.speed * 3.6 * 10) / 10
      : null;

    if (speed === null && lastPositionRef.current) {
      speed = calculateSpeed(
        lastPositionRef.current.lat, lastPositionRef.current.lng, lastPositionRef.current.timestamp,
        latitude, longitude, timestamp
      );
    }

    lastPositionRef.current = { lat: latitude, lng: longitude, timestamp };
    updateBusLocation(latitude, longitude, speed);
  }, [calculateSpeed, updateBusLocation]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let msg = 'Failed to get location';
    if (error.code === error.PERMISSION_DENIED) msg = 'Location permission denied.';
    else if (error.code === error.POSITION_UNAVAILABLE) msg = 'Location unavailable.';
    else if (error.code === error.TIMEOUT) msg = 'Location request timed out.';

    setState(prev => ({ ...prev, error: msg, isTracking: false }));
    toast({ variant: "destructive", title: "GPS Error", description: `${msg} GPS may not work in browser previews.` });
  }, [toast]);

  useEffect(() => {
    if (!enabled || !busId || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (!enabled) {
        lastPositionRef.current = null;
        setState(prev => ({ ...prev, isTracking: false }));
      }
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      lastPositionRef.current = null;
      setState(prev => ({ ...prev, isTracking: false }));
    };
  }, [enabled, busId, handlePosition, handleError]);

  return state;
}
