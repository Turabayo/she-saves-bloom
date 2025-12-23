import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';

interface UserSummary {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  total_savings: number;
  goals_count: number;
  auto_savings_count: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSavings: number;
  totalGoals: number;
  totalAutoSavings: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSavings: 0,
    totalGoals: 0,
    totalAutoSavings: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const fetchAdminData = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all savings goals
      const { data: allGoals, error: goalsError } = await supabase
        .from('savings_goals')
        .select('user_id, goal_amount');

      if (goalsError) throw goalsError;

      // Fetch all savings
      const { data: allSavings, error: savingsError } = await supabase
        .from('savings')
        .select('user_id, amount');

      if (savingsError) throw savingsError;

      // Fetch all topups
      const { data: allTopups, error: topupsError } = await supabase
        .from('topups')
        .select('user_id, amount, status');

      if (topupsError) throw topupsError;

      // Fetch all scheduled savings
      const { data: allScheduled, error: scheduledError } = await supabase
        .from('scheduled_savings')
        .select('user_id, is_active');

      if (scheduledError) throw scheduledError;

      // Process user summaries
      const userSummaries: UserSummary[] = (profiles || []).map(profile => {
        const userSavings = (allSavings || [])
          .filter(s => s.user_id === profile.id)
          .reduce((sum, s) => sum + Number(s.amount), 0);
        
        const userTopups = (allTopups || [])
          .filter(t => t.user_id === profile.id && t.status === 'SUCCESSFUL')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const goalsCount = (allGoals || []).filter(g => g.user_id === profile.id).length;
        const autoSavingsCount = (allScheduled || []).filter(s => s.user_id === profile.id && s.is_active).length;

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          total_savings: userSavings + userTopups,
          goals_count: goalsCount,
          auto_savings_count: autoSavingsCount
        };
      });

      setUsers(userSummaries);

      // Calculate stats
      const totalSavings = userSummaries.reduce((sum, u) => sum + u.total_savings, 0);
      const activeUsers = userSummaries.filter(u => u.total_savings > 0 || u.goals_count > 0).length;

      setStats({
        totalUsers: profiles?.length || 0,
        activeUsers,
        totalSavings,
        totalGoals: allGoals?.length || 0,
        totalAutoSavings: allScheduled?.filter(s => s.is_active).length || 0
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  return {
    users,
    stats,
    loading,
    refetch: fetchAdminData
  };
};
