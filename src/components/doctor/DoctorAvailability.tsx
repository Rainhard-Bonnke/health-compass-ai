import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Clock, Calendar } from 'lucide-react';
import { useDoctorSchedules, useUpsertDoctorSchedule, useCurrentStaffProfile } from '@/hooks/useHospital';
import { DAYS_OF_WEEK } from '@/types/hospital';

interface ScheduleForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export function DoctorAvailability() {
  const { data: staffProfile } = useCurrentStaffProfile();
  const { data: schedules, isLoading } = useDoctorSchedules(staffProfile?.id);
  const upsertSchedule = useUpsertDoctorSchedule();

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [form, setForm] = useState<ScheduleForm>({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    is_active: true
  });

  const getScheduleForDay = (day: number) => {
    return schedules?.find(s => s.day_of_week === day);
  };

  const handleEditDay = (day: number) => {
    const existing = getScheduleForDay(day);
    if (existing) {
      setForm({
        day_of_week: day,
        start_time: existing.start_time.slice(0, 5),
        end_time: existing.end_time.slice(0, 5),
        slot_duration_minutes: existing.slot_duration_minutes,
        is_active: existing.is_active
      });
    } else {
      setForm({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: 30,
        is_active: true
      });
    }
    setEditingDay(day);
  };

  const handleSave = async () => {
    if (!staffProfile || editingDay === null) return;

    await upsertSchedule.mutateAsync({
      doctor_id: staffProfile.id,
      ...form
    });

    setEditingDay(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Availability
        </CardTitle>
        <CardDescription>
          Set your working hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((dayName, index) => {
            const schedule = getScheduleForDay(index);
            const isEditing = editingDay === index;

            return (
              <div key={dayName}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-28">
                      <p className="font-medium">{dayName}</p>
                    </div>
                    {schedule && schedule.is_active ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {schedule.slot_duration_minutes} min slots
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditDay(index)}
                  >
                    {schedule ? 'Edit' : 'Set Hours'}
                  </Button>
                </div>

                {isEditing && (
                  <div className="ml-4 p-4 bg-muted/50 rounded-lg space-y-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Available</Label>
                        <p className="text-sm text-muted-foreground">
                          Accept appointments on this day
                        </p>
                      </div>
                      <Switch
                        checked={form.is_active}
                        onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                      />
                    </div>

                    {form.is_active && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={form.start_time}
                              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={form.end_time}
                              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Slot Duration (min)</Label>
                            <Input
                              type="number"
                              min={15}
                              max={120}
                              step={15}
                              value={form.slot_duration_minutes}
                              onChange={(e) => setForm({ ...form, slot_duration_minutes: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingDay(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSave}
                        disabled={upsertSchedule.isPending}
                      >
                        {upsertSchedule.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {index < DAYS_OF_WEEK.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
