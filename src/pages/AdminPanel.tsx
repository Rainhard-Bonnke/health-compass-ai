import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Activity, 
  FileText, 
  Shield,
  Loader2,
  UserPlus,
  Stethoscope,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  id: string;
  user_id: string;
  role: 'admin' | 'provider' | 'patient';
  specialty?: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

export default function AdminPanel() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      navigate('/auth');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchUsers();
    }
  }, [user, userRole]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch user_roles first
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Then fetch profiles for each user
      const usersWithProfiles = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', role.user_id)
            .single();
          
          return {
            ...role,
            profiles: profile || undefined
          };
        })
      );

      setUsers(usersWithProfiles as UserWithRole[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary">Admin</Badge>;
      case 'provider':
        return <Badge className="bg-success text-success-foreground">Provider</Badge>;
      case 'patient':
        return <Badge variant="outline">Patient</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    providers: users.filter(u => u.role === 'provider').length,
    patients: users.filter(u => u.role === 'patient').length,
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
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.totalUsers}
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Administrators</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.admins}
                <Shield className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Providers</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.providers}
                <Stethoscope className="h-5 w-5 text-success" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Patients</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.patients}
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and role assignments
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {userItem.profiles?.full_name || 'Unnamed User'}
                              </p>
                              {getRoleBadge(userItem.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {userItem.profiles?.email}
                            </p>
                            {userItem.specialty && (
                              <p className="text-xs text-muted-foreground">
                                Specialty: {userItem.specialty}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Role
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No users found</h3>
                    <p className="text-sm text-muted-foreground">
                      Users will appear here once they sign up.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  Monitor usage patterns and AI performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed analytics and reporting will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Settings Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    System configuration options will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
