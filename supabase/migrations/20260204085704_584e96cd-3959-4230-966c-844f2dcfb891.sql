-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'provider', 'patient');

-- Create triage_level enum for medical urgency
CREATE TYPE public.triage_level AS ENUM ('emergency', 'urgent', 'routine', 'self_care');

-- Create consultation_status enum
CREATE TYPE public.consultation_status AS ENUM ('pending', 'in_review', 'completed', 'escalated');

-- Create confidence_level enum
CREATE TYPE public.confidence_level AS ENUM ('low', 'medium', 'high');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    specialty TEXT, -- For providers: cardiology, general practice, etc.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create patient_profiles table for medical information
CREATE TABLE public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    medical_history TEXT[],
    current_medications TEXT[],
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table for symptom submissions
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status public.consultation_status NOT NULL DEFAULT 'pending',
    triage_level public.triage_level,
    chief_complaint TEXT NOT NULL,
    symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_analysis JSONB,
    ai_confidence public.confidence_level,
    ai_suggested_conditions JSONB,
    ai_recommended_actions TEXT[],
    provider_diagnosis TEXT,
    provider_notes TEXT,
    provider_recommendations TEXT[],
    is_emergency_detected BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create consultation_messages table for chat history
CREATE TABLE public.consultation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for provider-patient communication
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table for compliance tracking
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_keys table for external integrations
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view patient profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'provider') OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Patient profiles policies
CREATE POLICY "Patients can view own medical profile"
ON public.patient_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own medical profile"
ON public.patient_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own medical profile"
ON public.patient_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view assigned patient profiles"
ON public.patient_profiles FOR SELECT
USING (
    public.has_role(auth.uid(), 'provider') AND EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.patient_id = patient_profiles.user_id
          AND consultations.assigned_provider_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all patient profiles"
ON public.patient_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Consultations policies
CREATE POLICY "Patients can view own consultations"
ON public.consultations FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create consultations"
ON public.consultations FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own pending consultations"
ON public.consultations FOR UPDATE
USING (auth.uid() = patient_id AND status = 'pending');

CREATE POLICY "Providers can view assigned consultations"
ON public.consultations FOR SELECT
USING (
    public.has_role(auth.uid(), 'provider') AND (
        assigned_provider_id = auth.uid() OR assigned_provider_id IS NULL
    )
);

CREATE POLICY "Providers can update assigned consultations"
ON public.consultations FOR UPDATE
USING (
    public.has_role(auth.uid(), 'provider') AND assigned_provider_id = auth.uid()
);

CREATE POLICY "Admins can manage all consultations"
ON public.consultations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Consultation messages policies
CREATE POLICY "Users can view messages of their consultations"
ON public.consultation_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.id = consultation_messages.consultation_id
          AND (consultations.patient_id = auth.uid() OR consultations.assigned_provider_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages to their consultations"
ON public.consultation_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.consultations
        WHERE consultations.id = consultation_messages.consultation_id
          AND consultations.patient_id = auth.uid()
    )
);

-- Messages policies
CREATE POLICY "Users can view own messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message read status"
ON public.messages FOR UPDATE
USING (auth.uid() = recipient_id);

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- API keys policies
CREATE POLICY "Admins can manage api keys"
ON public.api_keys FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for new user
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Default role is patient
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'patient');
    
    -- Create empty patient profile
    INSERT INTO public.patient_profiles (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_consultations_provider_id ON public.consultations(assigned_provider_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);