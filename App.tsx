import React, { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { User } from './types';
import { useAuthStore } from './lib/state';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const setGlobalUser = useAuthStore(state => state.setUser);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setGlobalUser(user); // Sync with global store
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGlobalUser(null); // Sync with global store
    setIsLoggedIn(false);
    setRequiresPasswordChange(false);
  };

  const router = createAppRouter(
    currentUser,
    isLoggedIn,
    handleLogin,
    handleLogout,
    requiresPasswordChange,
    setRequiresPasswordChange
  );

  return <RouterProvider router={router} />;
};

export default App;
