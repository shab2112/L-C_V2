import React from 'react';
import { useNavigate } from 'react-router-dom';
import DarieAssistant from '../../DarieAssistant';

const DarieAssistantPage: React.FC = () => {
  const navigate = useNavigate();

  return <DarieAssistant onClose={() => navigate('/dashboard')} />;
};

export default DarieAssistantPage;
