import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Loader2, Check, Users } from 'lucide-react';
import { useDepartments, useStaffProfiles, useDoctorSchedules, useCreateAppointment, useJoinQueue } from '@/hooks/useHospital';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays } from 'date-fns';
import type { StaffProfile } from '@/types/hospital';

type BookingMode = 'department' | 'doctor' | 'walk-in';

export function BookingSystem() {
  const { user } = useAuth();
  const { data: departments } = useDepartments();
  const { data: doctors } = useStaffProfiles('doctor');
  const createAppointment = useCreateAppointment();
  const joinQueue = useJoinQueue();

  const [mode, setMode] = useState<BookingMode>('department');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<StaffProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: doctorSchedules } = useDoctorSchedules(selectedDoctor?.id);

  const filteredDoctors = selectedDepartment 
    ? doctors?.filter(d => d.department_id === selectedDepartment)
    : doctors;

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  const getAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate || !doctorSchedules) return [];

    const dayOfWeek = new Date(selectedDate).getDay();
    const schedule = doctorSchedules.find(s => s.day_of_week === dayOfWeek && s.is_active);

    if (!schedule) return [];

    const slots: string[] = [];
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);
    const slotDuration = schedule.slot_duration_minutes;

    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (currentTime + slotDuration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentTime += slotDuration;
    }

    return slots;
  };

  const handleBookAppointment = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedTime) return;

    const schedule = doctorSchedules?.find(s => s.day_of_week === new Date(selectedDate).getDay());
    const endTime = calculateEndTime(selectedTime, schedule?.slot_duration_minutes || 30);

    await createAppointment.mutateAsync({
      patient_id: user.id,
      doctor_id: selectedDoctor.id,
      department_id: selectedDoctor.department_id || undefined,
      appointment_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      reason
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const handleJoinQueue = async () => {
    if (!selectedDepartment) return;

    await joinQueue.mutateAsync({
      departmentId: selectedDepartment,
      reason
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setSelectedDepartment('');
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
  };

  const availableSlots = getAvailableSlots();

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${mode === 'department' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setMode('department')}
        >
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">By Department</h3>
            <p className="text-sm text-muted-foreground">Choose a department first</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${mode === 'doctor' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setMode('doctor')}
        >
          <CardContent className="pt-6 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">By Doctor</h3>
            <p className="text-sm text-muted-foreground">Book a specific doctor</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${mode === 'walk-in' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setMode('walk-in')}
        >
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
            <h3 className="font-medium">Walk-in Queue</h3>
            <p className="text-sm text-muted-foreground">Join today's queue</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'walk-in' ? 'Join Walk-in Queue' : 'Book Appointment'}
          </CardTitle>
          <CardDescription>
            {mode === 'walk-in' 
              ? 'Join the queue and wait for your turn'
              : 'Select your preferred date and time'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Department Selection */}
          {(mode === 'department' || mode === 'walk-in') && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Doctor Selection */}
          {mode !== 'walk-in' && (
            <div className="space-y-2">
              <Label>Doctor</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(mode === 'doctor' ? doctors : filteredDoctors)?.map((doctor) => (
                  <Card 
                    key={doctor.id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {doctor.profiles?.full_name || 'Dr. Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doctor.specialization || doctor.department?.name || 'General'}
                          </p>
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          {mode !== 'walk-in' && selectedDoctor && (
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'outline'}
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-center">
                      <div className="text-xs">{format(new Date(date), 'EEE')}</div>
                      <div className="font-bold">{format(new Date(date), 'd MMM')}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Time Slots */}
          {mode !== 'walk-in' && selectedDate && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No available slots for this date
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for Visit (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for visit"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full"
            disabled={
              mode === 'walk-in' 
                ? !selectedDepartment || joinQueue.isPending
                : !selectedDoctor || !selectedDate || !selectedTime || createAppointment.isPending
            }
            onClick={mode === 'walk-in' ? handleJoinQueue : handleBookAppointment}
          >
            {(createAppointment.isPending || joinQueue.isPending) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {mode === 'walk-in' ? 'Join Queue' : 'Book Appointment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
