import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

interface AuthLayoutProps {
  isLoggedIn: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ isLoggedIn }) => {
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
