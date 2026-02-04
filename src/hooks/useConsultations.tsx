import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useConsultations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching consultations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useProviderConsultations() {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['provider-consultations', user?.id],
    queryFn: async () => {
      if (!user || userRole !== 'provider') return [];

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles:patient_id(full_name, email)
        `)
        .eq('assigned_provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider consultations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && userRole === 'provider',
  });
}

type ConsultationStatus = 'pending' | 'in_review' | 'completed' | 'escalated';

export function useAllConsultations(statusFilter?: ConsultationStatus | 'all') {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['all-consultations', user?.id, statusFilter],
    queryFn: async () => {
      if (!user || userRole !== 'admin') return [];

      let query = supabase
        .from('consultations')
        .select(`
          *,
          patient:patient_id(full_name, email),
          provider:assigned_provider_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ConsultationStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all consultations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && userRole === 'admin',
  });
}
