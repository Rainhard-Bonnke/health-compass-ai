import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { 
  Activity, 
  MessageSquare, 
  Shield, 
  Users, 
  Brain, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Stethoscope,
  FileText
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Symptom Checker',
      description: 'Describe your symptoms naturally and receive intelligent health guidance with triage recommendations.'
    },
    {
      icon: Brain,
      title: 'Medical AI Analysis',
      description: 'Advanced AI trained on medical knowledge provides condition suggestions with confidence levels.'
    },
    {
      icon: Users,
      title: 'Provider Review',
      description: 'Healthcare professionals review AI suggestions and provide verified diagnoses and treatment plans.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and HIPAA-ready infrastructure.'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access health guidance anytime, anywhere. No waiting rooms or appointment scheduling.'
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Track your symptom history, consultations, and receive downloadable health reports.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Describe Your Symptoms',
      description: 'Use our conversational AI to describe what you\'re experiencing in your own words.'
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Our medical AI analyzes your symptoms and provides possible conditions with confidence levels.'
    },
    {
      step: 3,
      title: 'Provider Review',
      description: 'A healthcare provider reviews the AI suggestions and provides verified recommendations.'
    },
    {
      step: 4,
      title: 'Get Your Plan',
      description: 'Receive personalized next steps: self-care guidance, lab tests, or specialist referrals.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-medical py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Activity className="h-4 w-4" />
              AI-Powered Healthcare Guidance
            </div>
            
            <h1 className="mb-6 text-foreground">
              Intelligent Health Assessment <br className="hidden sm:inline" />
              <span className="text-primary">When You Need It</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms to our AI-powered system and receive intelligent health guidance. 
              Get triage recommendations, possible conditions, and connect with healthcare providers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/symptom-checker">
                  Start Symptom Check
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?role=provider">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  For Providers
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>HIPAA-Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Provider Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Comprehensive Health Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for intelligent health assessment and provider collaboration.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get from symptoms to care plan in four simple steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    {item.step}
                  </div>
                  <h4 className="mb-2 font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-primary-foreground">Ready to Get Started?</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of patients using AI-powered health guidance. 
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth?mode=signup">
                Create Free Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/symptom-checker">
                Try Without Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
