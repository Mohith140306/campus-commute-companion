import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Feedback {
  id: string;
  category: 'bus' | 'driver' | 'app' | 'safety';
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface CreateFeedback {
  category: 'bus' | 'driver' | 'app' | 'safety';
  message: string;
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: CreateFeedback) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          category: feedback.category,
          message: feedback.message,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
