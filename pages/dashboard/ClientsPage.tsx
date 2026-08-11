import React from 'react';
import Clients from '../../components/Clients';
import { User } from '../../types';

interface ClientsPageProps {
  currentUser: User | null;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ currentUser }) => {
  return <Clients currentUser={currentUser} />;
};

export default ClientsPage;
