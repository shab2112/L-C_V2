import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { User, UserRole } from '../../types';

interface ProtectedLayoutProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  isLoggedIn,
  currentUser,
  onLogout,
}) => {
  const navigate = useNavigate();

  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isClient = currentUser.role === UserRole.Client;

  if (isClient) {
    return (
      <div className="h-screen w-screen bg-brand-primary text-brand-text flex flex-col">
        <Header
          currentUser={currentUser}
          setCurrentUser={() => {}}
          onLogout={handleLogout}
          onReturnToMarketing={() => {}}
        />
        <div className="flex flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-brand-primary text-brand-text flex flex-col overflow-hidden">
      <Header
        currentUser={currentUser}
        setCurrentUser={() => {}}
        onLogout={handleLogout}
        onReturnToMarketing={() => {}}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentUser={currentUser} />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
