import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmergencyReport {
  id: string;
  emergency_type: 'breakdown' | 'accident' | 'medical' | 'safety';
  message: string | null;
  reference_id: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyReport {
  emergency_type: 'breakdown' | 'accident' | 'medical' | 'safety';
  message?: string;
}

function generateReferenceId(): string {
  return `EMG-${Date.now().toString().slice(-6)}`;
}

export function useCreateEmergencyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: CreateEmergencyReport) => {
      const { data, error } = await supabase
        .from('emergency_reports')
        .insert({
          emergency_type: report.emergency_type,
          message: report.message || null,
          reference_id: generateReferenceId(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as EmergencyReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency_reports'] });
    },
  });
}
