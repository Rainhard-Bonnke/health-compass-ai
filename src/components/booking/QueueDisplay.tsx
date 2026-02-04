import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useWalkInQueue, useUpdateQueueStatus, useDepartments } from '@/hooks/useHospital';
import { useState } from 'react';
import type { QueueStatus } from '@/types/hospital';

const STATUS_CONFIG: Record<QueueStatus, { label: string; color: string }> = {
  waiting: { label: 'Waiting', color: 'bg-muted text-muted-foreground' },
  called: { label: 'Called', color: 'bg-warning text-warning-foreground' },
  serving: { label: 'Serving', color: 'bg-primary text-primary-foreground' },
  completed: { label: 'Completed', color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' }
};

export function QueueDisplay({ isStaffView = false }: { isStaffView?: boolean }) {
  const { data: departments } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const { data: queue, isLoading } = useWalkInQueue(selectedDepartment || undefined);
  const updateStatus = useUpdateQueueStatus();

  const handleCallNext = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'called' });
  };

  const handleStartServing = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'serving' });
  };

  const handleComplete = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'completed' });
  };

  const handleNoShow = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'cancelled' });
  };

  const waitingQueue = queue?.filter(q => q.status === 'waiting') || [];
  const calledQueue = queue?.filter(q => q.status === 'called') || [];
  const servingQueue = queue?.filter(q => q.status === 'serving') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {waitingQueue.length} waiting • {calledQueue.length} called • {servingQueue.length} serving
        </div>
      </div>

      {/* Queue Display Board */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Currently Serving */}
        <Card className="border-primary">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Now Serving
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {servingQueue.length > 0 ? (
              <div className="space-y-3">
                {servingQueue.map((item) => (
                  <div key={item.id} className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-primary">
                        #{item.queue_number}
                      </span>
                      <Badge className="bg-primary">Serving</Badge>
                    </div>
                    <p className="font-medium">{item.patient?.full_name || 'Patient'}</p>
                    <p className="text-sm text-muted-foreground">{item.department?.name}</p>
                    {isStaffView && (
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleComplete(item.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No one being served
              </p>
            )}
          </CardContent>
        </Card>

        {/* Called */}
        <Card className="border-warning">
          <CardHeader className="bg-warning text-warning-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Called - Please Proceed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {calledQueue.length > 0 ? (
              <div className="space-y-3">
                {calledQueue.map((item) => (
                  <div key={item.id} className="p-4 bg-warning/10 rounded-lg animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-warning">
                        #{item.queue_number}
                      </span>
                    </div>
                    <p className="font-medium">{item.patient?.full_name || 'Patient'}</p>
                    <p className="text-sm text-muted-foreground">{item.department?.name}</p>
                    {isStaffView && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleStartServing(item.id)}
                        >
                          Start
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleNoShow(item.id)}
                        >
                          No Show
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No one called
              </p>
            )}
          </CardContent>
        </Card>

        {/* Waiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waiting
            </CardTitle>
            <CardDescription>
              {waitingQueue.length} in queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {waitingQueue.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {waitingQueue.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      index === 0 ? 'bg-muted' : 'border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">#{item.queue_number}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {item.patient?.full_name || 'Patient'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.department?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.estimated_wait_minutes && (
                        <p className="text-sm text-muted-foreground">
                          ~{item.estimated_wait_minutes} min
                        </p>
                      )}
                      {isStaffView && index === 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mt-1"
                          onClick={() => handleCallNext(item.id)}
                        >
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Queue is empty
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
