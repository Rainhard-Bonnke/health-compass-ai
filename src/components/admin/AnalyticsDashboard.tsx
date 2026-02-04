import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAppointments, useWalkInQueue, useStaffProfiles, useDepartments } from '@/hooks/useHospital';
import { Calendar, Users, Clock, Activity, Loader2 } from 'lucide-react';

const COLORS = ['hsl(210, 100%, 40%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export function AnalyticsDashboard() {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments({});
  const { data: queue, isLoading: queueLoading } = useWalkInQueue();
  const { data: staff, isLoading: staffLoading } = useStaffProfiles();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const isLoading = appointmentsLoading || queueLoading || staffLoading || departmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const todayAppointments = appointments?.filter(a => 
    a.appointment_date === new Date().toISOString().split('T')[0]
  ).length || 0;

  const completedToday = appointments?.filter(a => 
    a.appointment_date === new Date().toISOString().split('T')[0] && 
    a.status === 'completed'
  ).length || 0;

  const currentlyWaiting = queue?.filter(q => q.status === 'waiting').length || 0;
  const avgWaitTime = queue?.reduce((acc, q) => acc + (q.estimated_wait_minutes || 0), 0) / (queue?.length || 1);

  // Appointment status breakdown
  const appointmentsByStatus = [
    { name: 'Scheduled', value: appointments?.filter(a => a.status === 'scheduled').length || 0 },
    { name: 'Completed', value: appointments?.filter(a => a.status === 'completed').length || 0 },
    { name: 'Cancelled', value: appointments?.filter(a => a.status === 'cancelled').length || 0 },
    { name: 'No Show', value: appointments?.filter(a => a.status === 'no_show').length || 0 },
  ].filter(s => s.value > 0);

  // Staff by role
  const staffByRole = [
    { name: 'Doctors', count: staff?.filter(s => s.staff_role === 'doctor').length || 0 },
    { name: 'Nurses', count: staff?.filter(s => s.staff_role === 'nurse').length || 0 },
    { name: 'Receptionists', count: staff?.filter(s => s.staff_role === 'receptionist').length || 0 },
    { name: 'Lab Technicians', count: staff?.filter(s => s.staff_role === 'lab_technician').length || 0 },
  ];

  // Appointments per department
  const appointmentsByDept = departments?.map(dept => ({
    name: dept.name.substring(0, 10),
    appointments: appointments?.filter(a => a.department_id === dept.id).length || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Appointments</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {todayAppointments}
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {completedToday} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Currently Waiting</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {currentlyWaiting}
              <Users className="h-5 w-5 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In walk-in queue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Wait Time</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {Math.round(avgWaitTime || 0)}m
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estimated wait
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Staff</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {staff?.length || 0}
              <Activity className="h-5 w-5 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {departments?.length || 0} departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution</CardTitle>
            <CardDescription>Staff members by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={staffByRole}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(210, 100%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {appointmentsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No appointment data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appointments by Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsByDept}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No department data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
