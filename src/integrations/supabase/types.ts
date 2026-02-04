export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[]
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          department_id: string | null
          doctor_id: string
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          department_id?: string | null
          doctor_id: string
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          department_id?: string | null
          doctor_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consultation_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          ai_analysis: Json | null
          ai_confidence: Database["public"]["Enums"]["confidence_level"] | null
          ai_recommended_actions: string[] | null
          ai_suggested_conditions: Json | null
          assigned_provider_id: string | null
          chief_complaint: string
          completed_at: string | null
          created_at: string
          id: string
          is_emergency_detected: boolean | null
          patient_id: string
          provider_diagnosis: string | null
          provider_notes: string | null
          provider_recommendations: string[] | null
          status: Database["public"]["Enums"]["consultation_status"]
          symptoms: Json
          triage_level: Database["public"]["Enums"]["triage_level"] | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_confidence?: Database["public"]["Enums"]["confidence_level"] | null
          ai_recommended_actions?: string[] | null
          ai_suggested_conditions?: Json | null
          assigned_provider_id?: string | null
          chief_complaint: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_emergency_detected?: boolean | null
          patient_id: string
          provider_diagnosis?: string | null
          provider_notes?: string | null
          provider_recommendations?: string[] | null
          status?: Database["public"]["Enums"]["consultation_status"]
          symptoms?: Json
          triage_level?: Database["public"]["Enums"]["triage_level"] | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_confidence?: Database["public"]["Enums"]["confidence_level"] | null
          ai_recommended_actions?: string[] | null
          ai_suggested_conditions?: Json | null
          assigned_provider_id?: string | null
          chief_complaint?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_emergency_detected?: boolean | null
          patient_id?: string
          provider_diagnosis?: string | null
          provider_notes?: string | null
          provider_recommendations?: string[] | null
          status?: Database["public"]["Enums"]["consultation_status"]
          symptoms?: Json
          triage_level?: Database["public"]["Enums"]["triage_level"] | null
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean | null
          slot_duration_minutes: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_time_off: {
        Row: {
          created_at: string | null
          doctor_id: string
          end_datetime: string
          id: string
          reason: string | null
          start_datetime: string
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          end_datetime: string
          id?: string
          reason?: string | null
          start_datetime: string
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          end_datetime?: string
          id?: string
          reason?: string | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_time_off_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          notes: string | null
          ordered_by: string
          patient_id: string
          result_data: Json | null
          status: string | null
          test_date: string
          test_name: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          ordered_by: string
          patient_id: string
          result_data?: Json | null
          status?: string | null
          test_date: string
          test_name: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string
          patient_id?: string
          result_data?: Json | null
          status?: string | null
          test_date?: string
          test_name?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          consultation_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          consultation_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          consultation_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          allergies: string[] | null
          chronic_conditions: string[] | null
          created_at: string
          current_medications: string[] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_history: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_history?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          created_at: string | null
          dosage: string
          duration: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          prescription_id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          prescription_id: string
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          prescription_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string | null
          department_id: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          specialization: string | null
          staff_role: Database["public"]["Enums"]["staff_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          specialization?: string | null
          staff_role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          specialization?: string | null
          staff_role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          specialty: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          user_id?: string
        }
        Relationships: []
      }
      walk_in_queue: {
        Row: {
          called_time: string | null
          check_in_time: string | null
          completed_time: string | null
          created_at: string | null
          department_id: string
          doctor_id: string | null
          estimated_wait_minutes: number | null
          id: string
          patient_id: string
          queue_number: number
          reason: string | null
          status: Database["public"]["Enums"]["queue_status"] | null
        }
        Insert: {
          called_time?: string | null
          check_in_time?: string | null
          completed_time?: string | null
          created_at?: string | null
          department_id: string
          doctor_id?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          patient_id: string
          queue_number: number
          reason?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Update: {
          called_time?: string | null
          check_in_time?: string | null
          completed_time?: string | null
          created_at?: string | null
          department_id?: string
          doctor_id?: string | null
          estimated_wait_minutes?: number | null
          id?: string
          patient_id?: string
          queue_number?: number
          reason?: string | null
          status?: Database["public"]["Enums"]["queue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "walk_in_queue_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_in_queue_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_queue_number: {
        Args: { _department_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_staff_role: {
        Args: {
          _staff_role: Database["public"]["Enums"]["staff_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "patient"
      appointment_status:
        | "scheduled"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      confidence_level: "low" | "medium" | "high"
      consultation_status: "pending" | "in_review" | "completed" | "escalated"
      queue_status: "waiting" | "called" | "serving" | "completed" | "cancelled"
      staff_role: "doctor" | "nurse" | "receptionist" | "lab_technician"
      triage_level: "emergency" | "urgent" | "routine" | "self_care"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "provider", "patient"],
      appointment_status: [
        "scheduled",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      confidence_level: ["low", "medium", "high"],
      consultation_status: ["pending", "in_review", "completed", "escalated"],
      queue_status: ["waiting", "called", "serving", "completed", "cancelled"],
      staff_role: ["doctor", "nurse", "receptionist", "lab_technician"],
      triage_level: ["emergency", "urgent", "routine", "self_care"],
    },
  },
} as const
