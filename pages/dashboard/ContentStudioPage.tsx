import React from 'react';
import ContentStudio from '../../components/ContentStudio';
import { User } from '../../types';

interface ContentStudioPageProps {
  currentUser: User | null;
}

const ContentStudioPage: React.FC<ContentStudioPageProps> = ({ currentUser }) => {
  return <ContentStudio currentUser={currentUser} />;
};

export default ContentStudioPage;
