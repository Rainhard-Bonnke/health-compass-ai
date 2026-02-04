// Hospital Management System Types

export type StaffRole = 'doctor' | 'nurse' | 'receptionist' | 'lab_technician';
export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type QueueStatus = 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  staff_role: StaffRole;
  department_id: string | null;
  specialization: string | null;
  license_number: string | null;
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface DoctorTimeOff {
  id: string;
  doctor_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctor?: StaffProfile;
  department?: Department;
  patient?: {
    full_name: string | null;
    email: string;
  };
}

export interface WalkInQueue {
  id: string;
  patient_id: string;
  department_id: string;
  doctor_id: string | null;
  queue_number: number;
  status: QueueStatus;
  check_in_time: string;
  called_time: string | null;
  completed_time: string | null;
  reason: string | null;
  estimated_wait_minutes: number | null;
  created_at: string;
  department?: Department;
  patient?: {
    full_name: string | null;
    email: string;
  };
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: PrescriptionItem[];
  doctor?: StaffProfile;
  patient?: {
    full_name: string | null;
    email: string;
  };
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
  quantity: number | null;
  created_at: string;
}

export interface LabResult {
  id: string;
  patient_id: string;
  ordered_by: string;
  uploaded_by: string | null;
  test_name: string;
  test_date: string;
  result_data: Record<string, unknown> | null;
  notes: string | null;
  file_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Day of week helper
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;
