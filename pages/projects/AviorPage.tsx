import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/lockwood/Navbar';
import { Avior } from '../../components/lockwood/Avior';
import { Footer } from '../../components/lockwood/Footer';
import { Page } from '../../lockwood-types';

const AviorPage: React.FC = () => {
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
      case 'ALTAIR_52':
        navigate('/projects/altair-52');
        break;
      case 'SHAHRUKHZ':
        navigate('/projects/shahrukhz');
        break;
      case 'MASAAR_3':
        navigate('/projects/masaar-3');
        break;
      case 'ARTIZE_62':
        navigate('/projects/artize-62');
        break;
      case 'AVIOR':
        navigate('/projects/avior');
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
      <Navbar onNavigate={handleNavigation} currentPage="AVIOR" />
      <Avior onNavigate={handleNavigation} />
      <Footer onNavigate={handleNavigation} />
    </>
  );
};

export default AviorPage;