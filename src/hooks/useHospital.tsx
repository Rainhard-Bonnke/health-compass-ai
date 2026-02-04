import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { 
  Department, 
  StaffProfile, 
  DoctorSchedule, 
  Appointment, 
  WalkInQueue,
  Prescription,
  StaffRole
} from '@/types/hospital';

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Department[];
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (department: { name: string; description?: string; location?: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([department])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create department: ' + error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Department> & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update department: ' + error.message);
    },
  });
}

// Staff Profiles
export function useStaffProfiles(role?: StaffRole) {
  return useQuery({
    queryKey: ['staff-profiles', role],
    queryFn: async () => {
      let query = supabase
        .from('staff_profiles')
        .select(`
          *,
          department:departments(*)
        `)
        .eq('is_active', true);

      if (role) {
        query = query.eq('staff_role', role);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each staff member
      const staffWithProfiles = await Promise.all(
        (data || []).map(async (staff) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', staff.user_id)
            .single();

          return { ...staff, profiles: profile || undefined };
        })
      );

      return staffWithProfiles as StaffProfile[];
    },
  });
}

export function useCreateStaffProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staff: { user_id: string; staff_role: StaffRole; department_id?: string | null; specialization?: string; license_number?: string }) => {
      const { data, error } = await supabase
        .from('staff_profiles')
        .insert([staff])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add staff member: ' + error.message);
    },
  });
}

// Doctor Schedules
export function useDoctorSchedules(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-schedules', doctorId],
    queryFn: async () => {
      let query = supabase
        .from('doctor_schedules')
        .select('*')
        .eq('is_active', true);

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query.order('day_of_week');

      if (error) throw error;
      return data as DoctorSchedule[];
    },
    enabled: !!doctorId || doctorId === undefined,
  });
}

export function useUpsertDoctorSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schedule: { doctor_id: string; day_of_week: number; start_time: string; end_time: string; slot_duration_minutes?: number; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .upsert([schedule], { onConflict: 'doctor_id,day_of_week' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      toast.success('Schedule updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update schedule: ' + error.message);
    },
  });
}

// Appointments
export function useAppointments(filters?: { doctorId?: string; patientId?: string; date?: string; status?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          department:departments(*)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters?.date) {
        query = query.eq('appointment_date', filters.date);
      }
      if (filters?.status && ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(filters.status)) {
        query = query.eq('status', filters.status as 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch patient and doctor profiles
      const appointmentsWithProfiles = await Promise.all(
        (data || []).map(async (apt) => {
          const [patientRes, doctorRes] = await Promise.all([
            supabase.from('profiles').select('full_name, email').eq('user_id', apt.patient_id).single(),
            supabase.from('staff_profiles').select('*, department:departments(*)').eq('id', apt.doctor_id).single()
          ]);

          let doctorProfile = null;
          if (doctorRes.data) {
            const { data: dProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', doctorRes.data.user_id)
              .single();
            doctorProfile = { ...doctorRes.data, profiles: dProfile };
          }

          return {
            ...apt,
            patient: patientRes.data || undefined,
            doctor: doctorProfile || undefined
          };
        })
      );

      return appointmentsWithProfiles as Appointment[];
    },
    enabled: !!user,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: { patient_id: string; doctor_id: string; department_id?: string; appointment_date: string; start_time: string; end_time: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to book appointment: ' + error.message);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update appointment: ' + error.message);
    },
  });
}

// Walk-in Queue
export function useWalkInQueue(departmentId?: string) {
  return useQuery({
    queryKey: ['walk-in-queue', departmentId],
    queryFn: async () => {
      let query = supabase
        .from('walk_in_queue')
        .select(`
          *,
          department:departments(*)
        `)
        .in('status', ['waiting', 'called', 'serving'])
        .order('queue_number');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch patient profiles
      const queueWithPatients = await Promise.all(
        (data || []).map(async (item) => {
          const { data: patient } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', item.patient_id)
            .single();

          return { ...item, patient: patient || undefined };
        })
      );

      return queueWithPatients as WalkInQueue[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useJoinQueue() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ departmentId, reason }: { departmentId: string; reason?: string }) => {
      // Get next queue number
      const { data: queueData } = await supabase
        .rpc('get_next_queue_number', { _department_id: departmentId });

      const { data, error } = await supabase
        .from('walk_in_queue')
        .insert({
          patient_id: user?.id,
          department_id: departmentId,
          queue_number: queueData || 1,
          reason,
          estimated_wait_minutes: (queueData || 1) * 15 // Estimate 15 min per patient
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walk-in-queue'] });
      toast.success('You have joined the queue');
    },
    onError: (error: Error) => {
      toast.error('Failed to join queue: ' + error.message);
    },
  });
}

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'called') {
        updates.called_time = new Date().toISOString();
      } else if (status === 'completed' || status === 'cancelled') {
        updates.completed_time = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('walk_in_queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walk-in-queue'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update queue: ' + error.message);
    },
  });
}

// Prescriptions
export function usePrescriptions(patientId?: string, doctorId?: string) {
  return useQuery({
    queryKey: ['prescriptions', patientId, doctorId],
    queryFn: async () => {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          items:prescription_items(*)
        `)
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Prescription[];
    },
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      prescription, 
      items 
    }: { 
      prescription: { patient_id: string; doctor_id: string; appointment_id?: string; diagnosis?: string; notes?: string }; 
      items: { medication_name: string; dosage: string; frequency: string; duration?: string; instructions?: string; quantity?: number }[] 
    }) => {
      // Create prescription
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert([prescription])
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // Create prescription items
      if (items.length > 0) {
        const itemsWithPrescriptionId = items.map(item => ({
          ...item,
          prescription_id: prescriptionData.id
        }));

        const { error: itemsError } = await supabase
          .from('prescription_items')
          .insert(itemsWithPrescriptionId);

        if (itemsError) throw itemsError;
      }

      return prescriptionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Prescription created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create prescription: ' + error.message);
    },
  });
}

// Current staff profile for logged in user
export function useCurrentStaffProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-staff-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          department:departments(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data as StaffProfile;
    },
    enabled: !!user,
  });
}

// Hospital Settings
export function useHospitalSettings() {
  return useQuery({
    queryKey: ['hospital-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospital_settings')
        .select('*');

      if (error) throw error;

      // Convert to key-value object
      const settings: Record<string, unknown> = {};
      (data || []).forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return settings;
    },
  });
}

export function useUpdateHospitalSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: Record<string, unknown>; description?: string }) => {
      const { data, error } = await supabase
        .from('hospital_settings')
        .upsert([{
          setting_key: key,
          setting_value: value as unknown as import('@/integrations/supabase/types').Json,
          description,
          updated_by: user?.id
        }], { onConflict: 'setting_key' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });
}
