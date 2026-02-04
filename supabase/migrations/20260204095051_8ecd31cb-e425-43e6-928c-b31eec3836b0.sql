-- Create enum for staff roles (extending existing app_role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE public.staff_role AS ENUM ('doctor', 'nurse', 'receptionist', 'lab_technician');
  END IF;
END
$$;

-- Create enum for appointment status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');
  END IF;
END
$$;

-- Create enum for queue status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'queue_status') THEN
    CREATE TYPE public.queue_status AS ENUM ('waiting', 'called', 'serving', 'completed', 'cancelled');
  END IF;
END
$$;

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff profiles (extends user_roles for medical staff)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  staff_role staff_role NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  specialization TEXT,
  license_number TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Doctor availability schedules
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, day_of_week)
);

-- Doctor time off / breaks
CREATE TABLE IF NOT EXISTS public.doctor_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id),
  department_id UUID REFERENCES public.departments(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Walk-in queue
CREATE TABLE IF NOT EXISTS public.walk_in_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  doctor_id UUID REFERENCES public.staff_profiles(id),
  queue_number INTEGER NOT NULL,
  status queue_status DEFAULT 'waiting',
  check_in_time TIMESTAMPTZ DEFAULT now(),
  called_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  reason TEXT,
  estimated_wait_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id),
  appointment_id UUID REFERENCES public.appointments(id),
  diagnosis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prescription items (medications)
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lab results
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  ordered_by UUID NOT NULL REFERENCES public.staff_profiles(id),
  uploaded_by UUID REFERENCES public.staff_profiles(id),
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  result_data JSONB,
  notes TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hospital settings (system configuration)
CREATE TABLE IF NOT EXISTS public.hospital_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_in_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Block anonymous access to all new tables
CREATE POLICY "anon_departments_deny" ON public.departments FOR SELECT TO anon USING (false);
CREATE POLICY "anon_staff_profiles_deny" ON public.staff_profiles FOR SELECT TO anon USING (false);
CREATE POLICY "anon_doctor_schedules_deny" ON public.doctor_schedules FOR SELECT TO anon USING (false);
CREATE POLICY "anon_doctor_time_off_deny" ON public.doctor_time_off FOR SELECT TO anon USING (false);
CREATE POLICY "anon_appointments_deny" ON public.appointments FOR SELECT TO anon USING (false);
CREATE POLICY "anon_walk_in_queue_deny" ON public.walk_in_queue FOR SELECT TO anon USING (false);
CREATE POLICY "anon_prescriptions_deny" ON public.prescriptions FOR SELECT TO anon USING (false);
CREATE POLICY "anon_prescription_items_deny" ON public.prescription_items FOR SELECT TO anon USING (false);
CREATE POLICY "anon_lab_results_deny" ON public.lab_results FOR SELECT TO anon USING (false);
CREATE POLICY "anon_hospital_settings_deny" ON public.hospital_settings FOR SELECT TO anon USING (false);

-- Departments policies
CREATE POLICY "departments_select_authenticated" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments_admin_all" ON public.departments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Staff profiles policies
CREATE POLICY "staff_profiles_select_authenticated" ON public.staff_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_profiles_own" ON public.staff_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "staff_profiles_admin_all" ON public.staff_profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Doctor schedules policies
CREATE POLICY "schedules_select_authenticated" ON public.doctor_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedules_own_doctor" ON public.doctor_schedules FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = doctor_id AND user_id = auth.uid()));
CREATE POLICY "schedules_admin_all" ON public.doctor_schedules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Doctor time off policies
CREATE POLICY "time_off_select_authenticated" ON public.doctor_time_off FOR SELECT TO authenticated USING (true);
CREATE POLICY "time_off_own_doctor" ON public.doctor_time_off FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = doctor_id AND user_id = auth.uid()));
CREATE POLICY "time_off_admin_all" ON public.doctor_time_off FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Appointments policies
CREATE POLICY "appointments_patient_own" ON public.appointments FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "appointments_patient_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "appointments_patient_update" ON public.appointments FOR UPDATE TO authenticated 
  USING (patient_id = auth.uid() AND status = 'scheduled');
CREATE POLICY "appointments_doctor_view" ON public.appointments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = doctor_id AND user_id = auth.uid()));
CREATE POLICY "appointments_doctor_update" ON public.appointments FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = doctor_id AND user_id = auth.uid()));
CREATE POLICY "appointments_staff_view" ON public.appointments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid() AND staff_role IN ('nurse', 'receptionist')));
CREATE POLICY "appointments_admin_all" ON public.appointments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Walk-in queue policies
CREATE POLICY "queue_patient_own" ON public.walk_in_queue FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "queue_patient_insert" ON public.walk_in_queue FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "queue_staff_view" ON public.walk_in_queue FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid()));
CREATE POLICY "queue_staff_update" ON public.walk_in_queue FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid()));
CREATE POLICY "queue_admin_all" ON public.walk_in_queue FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Prescriptions policies
CREATE POLICY "prescriptions_patient_own" ON public.prescriptions FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "prescriptions_doctor_own" ON public.prescriptions FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = doctor_id AND user_id = auth.uid()));
CREATE POLICY "prescriptions_admin_all" ON public.prescriptions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Prescription items policies
CREATE POLICY "prescription_items_via_prescription" ON public.prescription_items FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions p 
    WHERE p.id = prescription_id AND (p.patient_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.staff_profiles WHERE id = p.doctor_id AND user_id = auth.uid()
    ))
  ));
CREATE POLICY "prescription_items_doctor" ON public.prescription_items FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions p 
    JOIN public.staff_profiles sp ON sp.id = p.doctor_id 
    WHERE p.id = prescription_id AND sp.user_id = auth.uid()
  ));
CREATE POLICY "prescription_items_admin_all" ON public.prescription_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Lab results policies
CREATE POLICY "lab_results_patient_own" ON public.lab_results FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "lab_results_doctor_ordered" ON public.lab_results FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = ordered_by AND user_id = auth.uid()));
CREATE POLICY "lab_results_lab_tech" ON public.lab_results FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid() AND staff_role = 'lab_technician'));
CREATE POLICY "lab_results_admin_all" ON public.lab_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Hospital settings policies (admin only)
CREATE POLICY "settings_select_authenticated" ON public.hospital_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_all" ON public.hospital_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_profiles_updated_at BEFORE UPDATE ON public.staff_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON public.lab_results 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hospital_settings_updated_at BEFORE UPDATE ON public.hospital_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check staff role
CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid, _staff_role staff_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_profiles
    WHERE user_id = _user_id
      AND staff_role = _staff_role
      AND is_active = true
  )
$$;

-- Helper function to get next queue number for a department
CREATE OR REPLACE FUNCTION public.get_next_queue_number(_department_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(queue_number), 0) + 1
  FROM public.walk_in_queue
  WHERE department_id = _department_id
    AND DATE(created_at) = CURRENT_DATE
$$;