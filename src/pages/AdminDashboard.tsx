import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminData } from '@/hooks/useAdminData';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarSpacer } from '@/components/ui/sidebar';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Target, Zap, Shield, RefreshCw, LayoutDashboard, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyCompact, formatDate } from '@/utils/dateFormatter';
import { LoadingScreen } from '@/components/ui/loader';
import { UsersManagement } from '@/components/admin/UsersManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { users, stats, loading: dataLoading, refetch } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, user, navigate]);

  if (authLoading || roleLoading || dataLoading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarSpacer />
        <div className="flex-1 flex flex-col min-w-0">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Monitor all users and platform statistics
                </p>
              </div>
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Manage Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        Total Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Users size={16} className="text-green-500" />
                        Active Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.activeUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        Total Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatCurrencyCompact(stats.totalSavings)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Target size={16} className="text-secondary" />
                        Total Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.totalGoals}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" />
                        Active Auto-Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.totalAutoSavings}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Users Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      All Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Total Savings</TableHead>
                            <TableHead className="text-center">Goals</TableHead>
                            <TableHead className="text-center">Auto-Savings</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                No users found
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell className="font-medium">
                                  {u.full_name || 'Unknown'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {u.email || 'N/A'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {u.created_at ? formatDate(u.created_at) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right font-medium text-primary">
                                  {formatCurrencyCompact(u.total_savings)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary">{u.goals_count}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline">{u.auto_savings_count}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={u.total_savings > 0 || u.goals_count > 0 ? 'default' : 'secondary'}
                                    className={u.total_savings > 0 || u.goals_count > 0 ? 'bg-green-500/20 text-green-500 border-green-500/20' : ''}
                                  >
                                    {u.total_savings > 0 || u.goals_count > 0 ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <UsersManagement />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
