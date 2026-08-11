import React from 'react';
import Dashboard from '../../components/Dashboard';
import ClientDashboard from '../../components/ClientDashboard';
import { User, UserRole } from '../../types';

interface DashboardPageProps {
  currentUser: User | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  if (!currentUser) return null;

  if (currentUser.role === UserRole.Client) {
    return <ClientDashboard currentUser={currentUser} />;
  }

  return <Dashboard currentUser={currentUser} />;
};

export default DashboardPage;
