import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../../components/ForgotPassword';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ForgotPassword onBack={() => navigate('/auth/login')} />
  );
};

export default ForgotPasswordPage;
