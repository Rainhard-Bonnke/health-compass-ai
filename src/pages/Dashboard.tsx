import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  FileText, 
  User, 
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
    // Redirect providers and admins to their dashboards
    if (!isLoading && userRole === 'provider') {
      navigate('/provider');
    }
    if (!isLoading && userRole === 'admin') {
      navigate('/admin');
    }
  }, [user, userRole, isLoading, navigate]);

  if (isLoading) {
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
      link: '/consultations',
      primary: false,
    },
    {
      icon: User,
      title: 'Medical Profile',
      description: 'Update your health information',
      link: '/profile',
      primary: false,
    },
    {
      icon: Calendar,
      title: 'Messages',
      description: 'View messages from providers',
      link: '/messages',
      primary: false,
    },
  ];

  // Placeholder data - will be replaced with real data
  const recentConsultations = [
    {
      id: '1',
      date: '2024-01-15',
      chiefComplaint: 'Headache and fatigue',
      status: 'completed',
      triageLevel: 'routine',
    },
    {
      id: '2',
      date: '2024-01-10',
      chiefComplaint: 'Sore throat',
      status: 'in_review',
      triageLevel: 'self_care',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_review':
        return 'Under Review';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/consultations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentConsultations.length > 0 ? (
              <div className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div 
                    key={consultation.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/consultation/${consultation.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(consultation.status)}
                      </div>
                      <div>
                        <p className="font-medium">{consultation.chiefComplaint}</p>
                        <p className="text-sm text-muted-foreground">{consultation.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(consultation.status)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
