import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/lockwood/Navbar';
import { PrivacyPolicy } from '../components/lockwood/PrivacyPolicy';
import { Footer } from '../components/lockwood/Footer';
import { Page } from '../lockwood-types';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (page: Page) => {
    switch (page) {
      case 'LOGIN':
        navigate('/auth/login');
        break;
      case 'REGISTER':
        navigate('/auth/signup');
        break;
      case 'HOME':
        navigate('/');
        break;
      case 'PROJECTS':
        navigate('/projects');
        break;
      case 'ABOUT_US':
        navigate('/about');
        break;
      case 'BLOGS':
        navigate('/blogs');
        break;
      case 'CONTACT_US':
        navigate('/contact');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Navbar onNavigate={handleNavigation} currentPage="PRIVACY_POLICY" />
      <PrivacyPolicy onNavigate={handleNavigation} />
      <Footer onNavigate={handleNavigation} />
    </>
  );
};

export default PrivacyPage;
