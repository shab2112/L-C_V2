import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../../components/ChangePassword';
import { User } from '../../types';

interface ChangePasswordPageProps {
  currentUser: User | null;
  onSuccess: () => void;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({
  currentUser,
  onSuccess,
}) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    onSuccess();
    navigate('/dashboard');
  };

  if (!currentUser) {
    navigate('/auth/login');
    return null;
  }

  return (
    <ChangePassword
      userId={currentUser.id}
      email={currentUser.email}
      onSuccess={handleSuccess}
    />
  );
};

export default ChangePasswordPage;
