import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentStaffProfile } from '@/hooks/useHospital';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorAppointments } from '@/components/doctor/DoctorAppointments';
import { DoctorAvailability } from '@/components/doctor/DoctorAvailability';
import { PrescriptionManager } from '@/components/doctor/PrescriptionManager';
import { QueueDisplay } from '@/components/booking/QueueDisplay';
import { 
  Calendar, 
  Clock, 
  Pill, 
  Users,
  Loader2,
  Stethoscope
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { data: staffProfile, isLoading: profileLoading } = useCurrentStaffProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!staffProfile || staffProfile.staff_role !== 'doctor') {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Doctor Access Required</h2>
              <p className="text-muted-foreground">
                This dashboard is only available for registered doctors.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Dr. {staffProfile.profiles?.full_name?.split(' ').pop() || 'Doctor'}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{staffProfile.specialization || 'General'}</Badge>
                {staffProfile.department && (
                  <Badge variant="secondary">{staffProfile.department.name}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="queue">
              <Users className="h-4 w-4 mr-2" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="h-4 w-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Clock className="h-4 w-4 mr-2" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <DoctorAppointments />
          </TabsContent>

          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Walk-in Queue</CardTitle>
                <CardDescription>
                  Manage walk-in patients for your department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QueueDisplay isStaffView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <PrescriptionManager />
          </TabsContent>

          <TabsContent value="availability">
            <DoctorAvailability />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
