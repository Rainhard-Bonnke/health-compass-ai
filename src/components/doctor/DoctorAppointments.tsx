import { useState } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar as CalendarIcon,
  Phone,
  ChevronRight
} from 'lucide-react';
import { useAppointments, useUpdateAppointment, useCurrentStaffProfile } from '@/hooks/useHospital';
import type { Appointment, AppointmentStatus } from '@/types/hospital';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', color: 'bg-primary', icon: CalendarIcon },
  checked_in: { label: 'Checked In', color: 'bg-warning', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-accent', icon: User },
  completed: { label: 'Completed', color: 'bg-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-muted', icon: XCircle }
};

export function DoctorAppointments() {
  const { data: staffProfile } = useCurrentStaffProfile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState<AppointmentStatus | ''>('');

  const { data: appointments, isLoading } = useAppointments({
    doctorId: staffProfile?.id,
    date: format(selectedDate, 'yyyy-MM-dd')
  });

  const updateAppointment = useUpdateAppointment();

  const handleOpenDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setNewStatus(appointment.status);
    setIsDialogOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    await updateAppointment.mutateAsync({
      id: selectedAppointment.id,
      status: newStatus as AppointmentStatus,
      notes
    });

    setIsDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const upcomingDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {upcomingDates.map((date) => (
          <Button
            key={date.toISOString()}
            variant={isSameDay(date, selectedDate) ? 'default' : 'outline'}
            className="flex-shrink-0"
            onClick={() => setSelectedDate(date)}
          >
            <div className="text-center">
              <div className="text-xs">{format(date, 'EEE')}</div>
              <div className="font-bold">{format(date, 'd')}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <CardDescription>
            {appointments?.length || 0} appointments scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleOpenDialog(appointment)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="font-bold text-lg">
                        {appointment.start_time.slice(0, 5)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className="h-12 border-l border-border" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {appointment.patient?.full_name || 'Unknown Patient'}
                        </p>
                        {getStatusBadge(appointment.status)}
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.reason}
                        </p>
                      )}
                      {appointment.department && (
                        <p className="text-xs text-muted-foreground">
                          {appointment.department.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No appointments</h3>
              <p className="text-sm text-muted-foreground">
                No appointments scheduled for this date
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && format(new Date(selectedAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedAppointment.patient?.full_name || 'Unknown Patient'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.patient?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {selectedAppointment.start_time.slice(0, 5)} - {selectedAppointment.end_time.slice(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {selectedAppointment.department?.name || '—'}
                  </p>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Reason for Visit</p>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as AppointmentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add consultation notes..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAppointment}
              disabled={updateAppointment.isPending}
            >
              {updateAppointment.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
