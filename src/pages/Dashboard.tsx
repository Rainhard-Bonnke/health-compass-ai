import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConsultations } from '@/hooks/useConsultations';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: consultations, isLoading: consultationsLoading } = useConsultations();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    if (!authLoading && userRole === 'provider') {
      navigate('/provider');
    }
    if (!authLoading && userRole === 'admin') {
      navigate('/admin');
    }
  }, [user, userRole, authLoading, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Start Symptom Check',
      description: 'Describe your symptoms to our AI assistant',
      link: '/symptom-checker',
      primary: true,
    },
    {
      icon: FileText,
      title: 'View History',
      description: 'Review past consultations and reports',
      link: '/dashboard',
      primary: false,
    },
    {
      icon: User,
      title: 'Medical Profile',
      description: 'Update your health information',
      link: '/dashboard',
      primary: false,
    },
    {
      icon: Calendar,
      title: 'Messages',
      description: 'View messages from providers',
      link: '/dashboard',
      primary: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'pending':
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      in_review: 'secondary',
      escalated: 'destructive',
      pending: 'outline',
    };
    const labels: Record<string, string> = {
      completed: 'Completed',
      in_review: 'Under Review',
      escalated: 'Escalated',
      pending: 'Pending',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTriageBadge = (level: string | null) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      emergency: 'bg-destructive text-destructive-foreground',
      urgent: 'bg-warning text-warning-foreground',
      routine: 'bg-primary text-primary-foreground',
      self_care: 'bg-success text-success-foreground',
    };
    const labels: Record<string, string> = {
      emergency: 'Emergency',
      urgent: 'Urgent',
      routine: 'Routine',
      self_care: 'Self-Care',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[level] || ''}`}>
        {labels[level] || level}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's your health overview. How can we help you today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className={`hover:border-primary/30 transition-colors cursor-pointer ${
                action.primary ? 'border-primary/50 bg-accent/50' : ''
              }`}
              onClick={() => navigate(action.link)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.primary ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">{action.title}</CardTitle>
                <CardDescription className="text-xs">{action.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Consultations</CardTitle>
              <CardDescription>Your latest symptom checks and consultations</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {consultationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : consultations && consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div 
                    key={consultation.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(consultation.status)}
                      </div>
                      <div>
                        <p className="font-medium">{consultation.chief_complaint}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(consultation.created_at), 'MMM d, yyyy')}
                          </p>
                          {getTriageBadge(consultation.triage_level)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(consultation.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No consultations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first symptom check to get health guidance.
                </p>
                <Button asChild>
                  <Link to="/symptom-checker">Start Symptom Check</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
