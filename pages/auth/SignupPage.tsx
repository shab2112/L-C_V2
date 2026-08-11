import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientOTPLogin from '../../components/ClientOTPLogin';
import { User, UserRole } from '../../types';
import { useAuthStore } from '../../lib/state';

interface SignupPageProps {
  onSuccess: (user: User) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();

  const handleSuccess = async (userId: string, email: string) => {
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

      // Update global store
      const setGlobalUser = useAuthStore.getState().setUser;
      setGlobalUser(clientUser);

      onSuccess(clientUser);
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
      onSuccess(clientUser);
      navigate('/dashboard');
    }
  };

  return (
    <ClientOTPLogin
      onSuccess={handleSuccess}
      onBack={() => navigate('/auth/login')}
    />
  );
};

export default SignupPage;
