import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedLogin from '../../components/UnifiedLogin';
import { User, UserRole } from '../../types';

interface LoginPageProps {
  onClientSuccess: (user: User) => void;
  onStaffSuccess: (user: User) => void;
  requiresPasswordChange: boolean;
  setRequiresPasswordChange: (value: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onClientSuccess,
  onStaffSuccess,
  requiresPasswordChange,
  setRequiresPasswordChange,
}) => {
  const navigate = useNavigate();

  const handleClientLoginSuccess = async (userId: string, email: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/client_preferences?user_id=eq.${userId}`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      let displayName = email.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      let avatar = displayName.substring(0, 2).toUpperCase();

      if (response.ok) {
        const profiles = await response.json();
        if (profiles.length > 0) {
          const profile = profiles[0];
          displayName = `${profile.first_name} ${profile.last_name}`;
          avatar = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
        }
      }

      const clientUser: User = {
        id: userId,
        name: displayName,
        email,
        role: UserRole.Client,
        avatar: avatar,
      };
      onClientSuccess(clientUser);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error loading client profile:', error);
      const namePart = email.split('@')[0];
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      const clientUser: User = {
        id: userId,
        name: displayName,
        email,
        role: UserRole.Client,
        avatar: displayName.substring(0, 2).toUpperCase(),
      };
      onClientSuccess(clientUser);
      navigate('/dashboard');
    }
  };

  const handleStaffLoginSuccess = (
    userId: string,
    email: string,
    requiresChange: boolean,
    name?: string,
    role?: UserRole
  ) => {
    const user: User = {
      id: userId,
      email,
      name: name || email,
      role: role || UserRole.PropertyAdvisor,
    };

    if (requiresChange) {
      setRequiresPasswordChange(true);
      onStaffSuccess(user);
      navigate('/auth/change-password');
    } else {
      onStaffSuccess(user);
      navigate('/dashboard');
    }
  };

  return (
    <UnifiedLogin
      onClientSuccess={handleClientLoginSuccess}
      onStaffSuccess={handleStaffLoginSuccess}
      onBack={() => navigate('/')}
      onForgotPassword={() => navigate('/auth/forgot-password')}
      onSignup={() => navigate('/auth/signup')}
    />
  );
};

export default LoginPage;
