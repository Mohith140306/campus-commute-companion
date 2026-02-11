import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Bus } from './useBuses';
import type { EmergencyReport } from './useEmergencyReports';
import type { Feedback } from './useFeedback';

export function useAllBuses() {
  return useQuery({
    queryKey: ['admin-buses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('bus_number');
      if (error) throw error;
      return data as Bus[];
    },
    refetchInterval: 5000, // Live refresh every 5s
  });
}

export function useAllEmergencyReports() {
  return useQuery({
    queryKey: ['admin-emergencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmergencyReport[];
    },
    refetchInterval: 10000,
  });
}

export function useAllFeedback() {
  return useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Feedback[];
    },
    refetchInterval: 15000,
  });
}

export function useUpdateBusStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ busId, status }: { busId: string; status: string }) => {
      const { error } = await supabase
        .from('buses')
        .update({ status, last_updated: new Date().toISOString() })
        .eq('id', busId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-buses'] });
    },
  });
}
