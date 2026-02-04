import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingSystem } from '@/components/booking/BookingSystem';
import { QueueDisplay } from '@/components/booking/QueueDisplay';
import { useAppointments } from '@/hooks/useHospital';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User,
  Loader2,
  CalendarPlus,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function BookingPage() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useAppointments({ 
    patientId: user?.id 
  });

  const upcomingAppointments = appointments?.filter(a => 
    a.status === 'scheduled' && new Date(a.appointment_date) >= new Date()
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Schedule a visit with our healthcare professionals
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Booking Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="book">
              <TabsList className="mb-6">
                <TabsTrigger value="book">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Book Now
                </TabsTrigger>
                <TabsTrigger value="queue">
                  <Clock className="h-4 w-4 mr-2" />
                  Live Queue
                </TabsTrigger>
              </TabsList>

              <TabsContent value="book">
                {user ? (
                  <BookingSystem />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
                      <p className="text-muted-foreground mb-4">
                        Please sign in to book an appointment
                      </p>
                      <Button asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="queue">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Queue Status</CardTitle>
                    <CardDescription>
                      See estimated wait times across departments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QueueDisplay />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Upcoming Appointments */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Your Appointments
                </CardTitle>
                <CardDescription>
                  Upcoming scheduled visits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">
                            {format(new Date(apt.appointment_date), 'EEE, MMM d')}
                          </p>
                          <Badge variant="outline">
                            {apt.start_time.slice(0, 5)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {apt.doctor?.profiles?.full_name || 'Doctor'}
                        </p>
                        {apt.department && (
                          <p className="text-xs text-muted-foreground">
                            {apt.department.name}
                          </p>
                        )}
                      </div>
                    ))}
                    {upcomingAppointments.length > 5 && (
                      <Button variant="link" className="w-full" asChild>
                        <Link to="/dashboard">View All</Link>
                      </Button>
                    )}
                  </div>
                ) : user ? (
                  <p className="text-center text-muted-foreground py-8">
                    No upcoming appointments
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Sign in to see your appointments
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
