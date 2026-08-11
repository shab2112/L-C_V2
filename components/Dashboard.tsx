
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { supabase } from '../lib/supabase';
import StaffAIView from './StaffAIView';

interface DashboardProps {
  currentUser: User;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-brand-secondary p-6 rounded-xl shadow-lg flex items-center gap-4">
        <div className="bg-brand-primary p-3 rounded-lg">
            <Icon className="w-8 h-8 text-brand-gold" />
        </div>
        <div>
            <p className="text-sm text-brand-light font-medium">{title}</p>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [clientCount, setClientCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Client');

        if (error) throw error;
        setClientCount(count || 0);
      } catch (error) {
        console.error('Error fetching client count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientCount();

    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'role=eq.Client'
        },
        () => {
          fetchClientCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Welcome back, {currentUser.name}!</h1>
          <p className="text-brand-light mt-1">Here's a snapshot of your agency's performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Registered Clients"
            value={loading ? '...' : clientCount.toString()}
            icon={UsersIcon}
          />
          <StatCard title="Content Pieces Published" value="18" icon={DocumentTextIcon} />
          <StatCard title="Market Reports Generated" value="7" icon={ChartBarIcon} />
        </div>

        <div className="flex-1 bg-brand-secondary p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-brand-text mb-4">Recent Activity</h2>
          <div className="text-brand-light space-y-4">
            <p><span className="font-semibold text-brand-text">Fatima Al-Fahim</span> approved a new post for Dubai Hills Estate.</p>
            <p><span className="font-semibold text-brand-text">Liam Chen</span> added a new client: 'Aarav Sharma'.</p>
            <p><span className="font-semibold text-brand-text">You</span> generated a market report for 'Dubai vs. London'.</p>
            <p><span className="font-semibold text-brand-text">Sarah Williams</span> uploaded new property photos to vault.</p>
            <p><span className="font-semibold text-brand-text">Omar Hassan</span> created a new contract for Avior Tower.</p>
          </div>
        </div>
      </div>

      <div className="w-[600px] flex-shrink-0">
        <StaffAIView currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Dashboard;
