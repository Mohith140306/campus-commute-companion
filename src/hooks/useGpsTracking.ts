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
  intervalMs?: number; // Default 5000ms (5 seconds)
}

export function useGpsTracking({ busId, enabled, intervalMs = 5000 }: UseGpsTrackingOptions) {
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  // Calculate speed in km/h from two positions
  const calculateSpeed = useCallback((
    lat1: number, lng1: number, time1: number,
    lat2: number, lng2: number, time2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    const timeDiff = (time2 - time1) / 1000 / 3600; // Time in hours
    if (timeDiff <= 0) return 0;
    
    const speed = distance / timeDiff;
    return Math.round(speed * 10) / 10; // Round to 1 decimal
  }, []);

  // Update bus location in database
  const updateBusLocation = useCallback(async (lat: number, lng: number, speed: number | null) => {
    if (!busId) return;

    try {
      const { error } = await supabase
        .from('buses')
        .update({
          current_lat: lat,
          current_lng: lng,
          speed: speed,
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
      setState(prev => ({
        ...prev,
        error: 'Failed to update location in database',
      }));
    }
  }, [busId]);

  // Handle position update
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const timestamp = position.timestamp;

    // Calculate speed from movement if device doesn't provide it
    let speed = position.coords.speed !== null 
      ? Math.round(position.coords.speed * 3.6 * 10) / 10 // m/s to km/h
      : null;

    if (speed === null && lastPositionRef.current) {
      speed = calculateSpeed(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        lastPositionRef.current.timestamp,
        latitude,
        longitude,
        timestamp
      );
    }

    // Update last position reference
    lastPositionRef.current = { lat: latitude, lng: longitude, timestamp };

    // Update database
    updateBusLocation(latitude, longitude, speed);
  }, [calculateSpeed, updateBusLocation]);

  // Handle geolocation error
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isTracking: false,
    }));

    toast({
      variant: "destructive",
      title: "GPS Error",
      description: errorMessage,
    });
  }, [toast]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isTracking: false,
      }));
      return;
    }

    if (!busId) {
      setState(prev => ({
        ...prev,
        error: 'No bus assigned',
        isTracking: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isTracking: true, error: null }));

    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Set up interval for continuous updates
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }, intervalMs);

    // Also use watchPosition for more responsive updates when moving
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      }
    );
  }, [busId, intervalMs, handlePositionUpdate, handlePositionError]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    lastPositionRef.current = null;

    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  }, []);

  // Effect to start/stop tracking based on enabled prop
  useEffect(() => {
    if (enabled && busId) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [enabled, busId, startTracking, stopTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
