import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DriverProfile {
  id: string;
  user_id: string;
  bus_id: string | null;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  bus?: {
    id: string;
    bus_number: string;
    route_name: string;
    status: string;
    current_lat: number | null;
    current_lng: number | null;
  } | null;
}

export function useDriverProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['driver-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          bus:buses(id, bus_number, route_name, status, current_lat, current_lng)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DriverProfile | null;
    },
    enabled: !!userId,
  });
}

export function useUpdateBusLocation() {
  const updateLocation = async (busId: string, lat: number, lng: number) => {
    const { data, error } = await supabase
      .from('buses')
      .update({
        current_lat: lat,
        current_lng: lng,
        last_updated: new Date().toISOString(),
      })
      .eq('id', busId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateStatus = async (busId: string, status: 'active' | 'delayed' | 'maintenance') => {
    const { data, error } = await supabase
      .from('buses')
      .update({
        status,
        last_updated: new Date().toISOString(),
      })
      .eq('id', busId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  return { updateLocation, updateStatus };
}
