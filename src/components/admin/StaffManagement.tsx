import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Stethoscope, User, FlaskConical, ClipboardList, Loader2 } from 'lucide-react';
import { useStaffProfiles, useDepartments, useCreateStaffProfile } from '@/hooks/useHospital';
import type { StaffRole } from '@/types/hospital';

const STAFF_ROLE_CONFIG: Record<StaffRole, { label: string; icon: React.ElementType; color: string }> = {
  doctor: { label: 'Doctor', icon: Stethoscope, color: 'bg-primary' },
  nurse: { label: 'Nurse', icon: User, color: 'bg-success' },
  receptionist: { label: 'Receptionist', icon: ClipboardList, color: 'bg-warning' },
  lab_technician: { label: 'Lab Technician', icon: FlaskConical, color: 'bg-accent' }
};

export function StaffManagement() {
  const { data: allStaff, isLoading } = useStaffProfiles();
  const { data: departments } = useDepartments();
  const createStaffProfile = useCreateStaffProfile();

  const [activeTab, setActiveTab] = useState<StaffRole | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    staff_role: 'doctor' as StaffRole,
    department_id: '',
    specialization: '',
    license_number: ''
  });

  const filteredStaff = activeTab === 'all' 
    ? allStaff 
    : allStaff?.filter(s => s.staff_role === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createStaffProfile.mutateAsync({
      ...formData,
      department_id: formData.department_id || null
    });
    
    setIsDialogOpen(false);
    setFormData({
      user_id: '',
      staff_role: 'doctor',
      department_id: '',
      specialization: '',
      license_number: ''
    });
  };

  const getRoleBadge = (role: StaffRole) => {
    const config = STAFF_ROLE_CONFIG[role];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>
            Manage doctors, nurses, and other hospital staff
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Add a user as a hospital staff member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="Enter user UUID"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The user must already have an account
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff_role">Role</Label>
                  <Select
                    value={formData.staff_role}
                    onValueChange={(value: StaffRole) => setFormData({ ...formData, staff_role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STAFF_ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
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
                {formData.staff_role === 'doctor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        placeholder="Medical license number"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createStaffProfile.isPending}>
                  {createStaffProfile.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add Staff Member
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StaffRole | 'all')}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({allStaff?.length || 0})</TabsTrigger>
            {Object.entries(STAFF_ROLE_CONFIG).map(([role, config]) => (
              <TabsTrigger key={role} value={role}>
                {config.label}s ({allStaff?.filter(s => s.staff_role === role).length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredStaff && filteredStaff.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => {
                    const config = STAFF_ROLE_CONFIG[staff.staff_role];
                    const Icon = config.icon;
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${config.color}/10 flex items-center justify-center`}>
                              <Icon className={`h-5 w-5 text-${config.color.replace('bg-', '')}`} />
                            </div>
                            <div>
                              <p className="font-medium">
                                {staff.profiles?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {staff.profiles?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(staff.staff_role)}</TableCell>
                        <TableCell>
                          {staff.department?.name || '—'}
                        </TableCell>
                        <TableCell>
                          {staff.specialization || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                            {staff.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No staff members yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add staff members to your hospital
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
