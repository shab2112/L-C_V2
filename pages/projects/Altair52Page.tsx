import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/lockwood/Navbar';
import { Altair52 } from '../../components/lockwood/Altair52';
import { Footer } from '../../components/lockwood/Footer';
import { Page } from '../../lockwood-types';

const Altair52Page: React.FC = () => {
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
      case 'PRIVACY_POLICY':
        navigate('/privacy');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Navbar onNavigate={handleNavigation} currentPage="ALTAIR_52" />
      <Altair52 onNavigate={handleNavigation} />
      <Footer onNavigate={handleNavigation} />
    </>
  );
};

export default Altair52Page;
