import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Activity, User, LogOut, Settings, MessageSquare, LayoutDashboard, Calendar, Stethoscope } from 'lucide-react';

export function Header() {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'provider':
        return '/provider';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">MediAssist AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/booking" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Book Appointment
          </Link>
          <Link to="/symptom-checker" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Symptom Checker
          </Link>
          {(userRole === 'provider' || userRole === 'admin') && (
            <Link to="/doctor" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Doctor Dashboard
            </Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole || 'Patient'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/booking')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/symptom-checker')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Symptom Checker
                </DropdownMenuItem>
                {(userRole === 'provider' || userRole === 'admin') && (
                  <DropdownMenuItem onClick={() => navigate('/doctor')}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Doctor Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
