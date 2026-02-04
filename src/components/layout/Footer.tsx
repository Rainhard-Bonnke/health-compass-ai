import { Link } from 'react-router-dom';
import { Activity, Shield, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        {/* Medical Disclaimer */}
        <div className="medical-disclaimer mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Important Medical Disclaimer</p>
              <p className="text-muted-foreground">
                MediAssist AI provides informational suggestions only, not medical diagnoses. 
                Always consult a qualified healthcare professional for medical advice. 
                In case of emergency, call emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MediAssist AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered healthcare guidance connecting patients with providers.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>HIPAA-Ready Infrastructure</span>
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Patients</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/symptom-checker" className="text-muted-foreground hover:text-foreground transition-colors">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">For Providers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/provider" className="text-muted-foreground hover:text-foreground transition-colors">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/auth?role=provider" className="text-muted-foreground hover:text-foreground transition-colors">
                  Provider Sign Up
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/hipaa" className="text-muted-foreground hover:text-foreground transition-colors">
                  HIPAA Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MediAssist AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
