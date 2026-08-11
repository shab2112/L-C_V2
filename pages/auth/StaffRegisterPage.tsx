import React from 'react';
import { useNavigate } from 'react-router-dom';
import StaffRegister from '../../components/StaffRegister';
import { User, UserRole } from '../../types';

interface StaffRegisterPageProps {
  onSuccess: (user: User) => void;
}

const StaffRegisterPage: React.FC<StaffRegisterPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();

  const handleSuccess = (userId: string, email: string) => {
    const user: User = {
      id: userId,
      email,
      name: email,
      role: UserRole.PropertyAdvisor,
    };
    onSuccess(user);
    navigate('/dashboard');
  };

  return (
    <StaffRegister
      onSuccess={handleSuccess}
      onBack={() => navigate('/auth/login')}
    />
  );
};

export default StaffRegisterPage;
