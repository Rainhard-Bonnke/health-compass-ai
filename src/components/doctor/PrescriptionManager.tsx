import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pill, FileText, Loader2, User } from 'lucide-react';
import { usePrescriptions, useCreatePrescription, useCurrentStaffProfile } from '@/hooks/useHospital';
import { format } from 'date-fns';

interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function PrescriptionManager() {
  const { data: staffProfile } = useCurrentStaffProfile();
  const { data: prescriptions, isLoading } = usePrescriptions(undefined, staffProfile?.id);
  const createPrescription = useCreatePrescription();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const addMedicationRow = () => {
    setItems([...items, { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicationRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffProfile) return;

    const validItems = items.filter(item => 
      item.medication_name && item.dosage && item.frequency
    );

    await createPrescription.mutateAsync({
      prescription: {
        patient_id: patientId,
        doctor_id: staffProfile.id,
        diagnosis,
        notes
      },
      items: validItems
    });

    setIsDialogOpen(false);
    setPatientId('');
    setDiagnosis('');
    setNotes('');
    setItems([{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
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
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescriptions
          </CardTitle>
          <CardDescription>
            Create and manage patient prescriptions
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
              <DialogDescription>
                Create a new prescription for a patient
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient ID</Label>
                    <Input
                      id="patient_id"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="Enter patient UUID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Medications</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMedicationRow}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 p-3 bg-muted/50 rounded-lg">
                        <Input
                          placeholder="Medication"
                          value={item.medication_name}
                          onChange={(e) => updateItem(index, 'medication_name', e.target.value)}
                          className="col-span-2"
                          required
                        />
                        <Input
                          placeholder="Dosage"
                          value={item.dosage}
                          onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                          required
                        />
                        <Input
                          placeholder="Frequency"
                          value={item.frequency}
                          onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                          required
                        />
                        <Input
                          placeholder="Duration"
                          value={item.duration}
                          onChange={(e) => updateItem(index, 'duration', e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Instructions"
                            value={item.instructions}
                            onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                            className="flex-1"
                          />
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedicationRow(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional instructions or notes"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createPrescription.isPending}>
                  {createPrescription.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Prescription
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {prescriptions && prescriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medications</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    {format(new Date(prescription.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs">
                        {prescription.patient_id.slice(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {prescription.diagnosis || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prescription.items?.slice(0, 3).map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {item.medication_name}
                        </Badge>
                      ))}
                      {prescription.items && prescription.items.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{prescription.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No prescriptions yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first prescription
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
