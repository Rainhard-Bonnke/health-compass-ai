import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  MessageSquare,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Consultation {
  id: string;
  patient_id: string;
  chief_complaint: string;
  status: 'pending' | 'in_review' | 'completed' | 'escalated';
  triage_level: 'emergency' | 'urgent' | 'routine' | 'self_care' | null;
  ai_confidence: 'low' | 'medium' | 'high' | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export default function ProviderDashboard() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'provider')) {
      navigate('/auth');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === 'provider') {
      fetchConsultations();
    }
  }, [user, userRole]);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      // Fetch consultations first
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;

      // Then fetch profiles for each consultation
      const consultationsWithProfiles = await Promise.all(
        (consultationsData || []).map(async (consultation) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', consultation.patient_id)
            .single();
          
          return {
            ...consultation,
            profiles: profile || undefined
          };
        })
      );

      setConsultations(consultationsWithProfiles as Consultation[]);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
      case 'in_review':
        return <Badge className="bg-warning text-warning-foreground">In Review</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'escalated':
        return <Badge className="bg-destructive text-destructive-foreground">Escalated</Badge>;
      default:
        return null;
    }
  };

  const getTriageBadge = (level: string | null) => {
    switch (level) {
      case 'emergency':
        return <Badge className="badge-emergency">Emergency</Badge>;
      case 'urgent':
        return <Badge className="badge-urgent">Urgent</Badge>;
      case 'routine':
        return <Badge className="badge-routine">Routine</Badge>;
      case 'self_care':
        return <Badge className="badge-self-care">Self-Care</Badge>;
      default:
        return <Badge variant="outline">Unassessed</Badge>;
    }
  };

  const filteredConsultations = consultations.filter(c => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  const stats = {
    pending: consultations.filter(c => c.status === 'pending').length,
    inReview: consultations.filter(c => c.status === 'in_review').length,
    completed: consultations.filter(c => c.status === 'completed').length,
    escalated: consultations.filter(c => c.status === 'escalated').length,
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Review patient cases and manage diagnoses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.pending}
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Review</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.inReview}
                <Activity className="h-5 w-5 text-warning" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Today</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.completed}
                <CheckCircle className="h-5 w-5 text-success" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Escalated</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.escalated}
                <AlertCircle className="h-5 w-5 text-destructive" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Consultations List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Cases</CardTitle>
            <CardDescription>
              Review AI assessments and provide clinical decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="in_review">In Review ({stats.inReview})</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Cases</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredConsultations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/provider/case/${consultation.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {consultation.profiles?.full_name || 'Anonymous Patient'}
                              </p>
                              {getTriageBadge(consultation.triage_level)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {consultation.chief_complaint}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(consultation.created_at).toLocaleDateString()} at{' '}
                              {new Date(consultation.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(consultation.status)}
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No cases found</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no cases matching this filter.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
