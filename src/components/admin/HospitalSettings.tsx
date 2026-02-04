import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Clock, Calendar, Bell, Shield } from 'lucide-react';
import { useHospitalSettings, useUpdateHospitalSetting } from '@/hooks/useHospital';

interface SettingsForm {
  hospital_name: string;
  default_slot_duration: number;
  max_advance_booking_days: number;
  enable_walk_in_queue: boolean;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  working_hours_start: string;
  working_hours_end: string;
}

export function HospitalSettings() {
  const { data: settings, isLoading } = useHospitalSettings();
  const updateSetting = useUpdateHospitalSetting();

  const [form, setForm] = useState<SettingsForm>({
    hospital_name: '',
    default_slot_duration: 30,
    max_advance_booking_days: 30,
    enable_walk_in_queue: true,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    working_hours_start: '08:00',
    working_hours_end: '18:00'
  });

  useEffect(() => {
    if (settings) {
      setForm({
        hospital_name: (settings.hospital_name as { value?: string })?.value || '',
        default_slot_duration: (settings.booking as { slot_duration?: number })?.slot_duration || 30,
        max_advance_booking_days: (settings.booking as { max_advance_days?: number })?.max_advance_days || 30,
        enable_walk_in_queue: (settings.features as { walk_in_queue?: boolean })?.walk_in_queue !== false,
        enable_email_notifications: (settings.notifications as { email?: boolean })?.email !== false,
        enable_sms_notifications: (settings.notifications as { sms?: boolean })?.sms || false,
        working_hours_start: (settings.working_hours as { start?: string })?.start || '08:00',
        working_hours_end: (settings.working_hours as { end?: string })?.end || '18:00'
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting.mutateAsync({
        key: 'hospital_name',
        value: { value: form.hospital_name },
        description: 'Hospital name'
      }),
      updateSetting.mutateAsync({
        key: 'booking',
        value: { 
          slot_duration: form.default_slot_duration,
          max_advance_days: form.max_advance_booking_days
        },
        description: 'Booking settings'
      }),
      updateSetting.mutateAsync({
        key: 'features',
        value: { walk_in_queue: form.enable_walk_in_queue },
        description: 'Feature toggles'
      }),
      updateSetting.mutateAsync({
        key: 'notifications',
        value: { 
          email: form.enable_email_notifications,
          sms: form.enable_sms_notifications
        },
        description: 'Notification settings'
      }),
      updateSetting.mutateAsync({
        key: 'working_hours',
        value: { 
          start: form.working_hours_start,
          end: form.working_hours_end
        },
        description: 'Default working hours'
      })
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Basic hospital configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospital_name">Hospital Name</Label>
            <Input
              id="hospital_name"
              value={form.hospital_name}
              onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
              placeholder="Enter hospital name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Settings
          </CardTitle>
          <CardDescription>
            Configure appointment booking options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Default Slot Duration (minutes)</Label>
              <Input
                id="slot_duration"
                type="number"
                min={15}
                max={120}
                value={form.default_slot_duration}
                onChange={(e) => setForm({ ...form, default_slot_duration: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_advance_days">Max Advance Booking (days)</Label>
              <Input
                id="max_advance_days"
                type="number"
                min={1}
                max={365}
                value={form.max_advance_booking_days}
                onChange={(e) => setForm({ ...form, max_advance_booking_days: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Walk-in Queue</Label>
              <p className="text-sm text-muted-foreground">
                Allow patients to join walk-in queue
              </p>
            </div>
            <Switch
              checked={form.enable_walk_in_queue}
              onCheckedChange={(checked) => setForm({ ...form, enable_walk_in_queue: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>
            Default hospital operating hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={form.working_hours_start}
                onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={form.working_hours_end}
                onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send appointment reminders via email
              </p>
            </div>
            <Switch
              checked={form.enable_email_notifications}
              onCheckedChange={(checked) => setForm({ ...form, enable_email_notifications: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send appointment reminders via SMS
              </p>
            </div>
            <Switch
              checked={form.enable_sms_notifications}
              onCheckedChange={(checked) => setForm({ ...form, enable_sms_notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSetting.isPending}>
          {updateSetting.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
