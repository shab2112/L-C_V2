import React from 'react';
import Contracts from '../../components/Contracts';
import { User } from '../../types';

interface ContractsPageProps {
  currentUser: User | null;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ currentUser }) => {
  return <Contracts currentUser={currentUser} />;
};

export default ContractsPage;
