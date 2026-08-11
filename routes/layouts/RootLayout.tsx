import React from 'react';
import { Outlet } from 'react-router-dom';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Outlet />
    </div>
  );
};

export default RootLayout;
