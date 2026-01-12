import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Bus {
  id: string;
  bus_number: string;
  route_name: string;
  driver_name: string | null;
  status: 'active' | 'delayed' | 'maintenance';
  current_lat: number | null;
  current_lng: number | null;
  eta: string | null;
  speed: number | null;
  last_updated: string | null;
  created_at: string;
}

export function useBuses() {
  return useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('bus_number');
      
      if (error) throw error;
      return data as Bus[];
    },
  });
}

export function useBusByNumber(busNumber: string | null) {
  return useQuery({
    queryKey: ['bus', busNumber],
    queryFn: async () => {
      if (!busNumber) return null;
      
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('bus_number', busNumber)
        .maybeSingle();
      
      if (error) throw error;
      return data as Bus | null;
    },
    enabled: !!busNumber,
  });
}

// Helper functions for UI
export function getStatusColor(status: Bus['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'delayed':
      return 'bg-orange-500';
    case 'maintenance':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}

export function getStatusText(status: Bus['status']): string {
  switch (status) {
    case 'active':
      return 'On Route';
    case 'delayed':
      return 'Delayed';
    case 'maintenance':
      return 'Maintenance';
    default:
      return 'Unknown';
  }
}
