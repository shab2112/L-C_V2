import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/lockwood/Navbar';
import { Hero } from '../components/lockwood/Hero';
import { Features } from '../components/lockwood/Features';
import { About } from '../components/lockwood/About';
import { FAQ } from '../components/lockwood/FAQ';
import { CTA } from '../components/lockwood/CTA';
import { Footer } from '../components/lockwood/Footer';
import { Page } from '../lockwood-types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (page: Page) => {
    switch (page) {
      case 'LOGIN':
        navigate('/auth/login');
        break;
      case 'REGISTER':
        navigate('/auth/signup');
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
      case 'HOME':
        navigate('/');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Navbar onNavigate={handleNavigation} currentPage="HOME" />
      <Hero onNavigate={handleNavigation} />
      <Features onNavigate={handleNavigation} />
      <About onNavigate={handleNavigation} />
      <CTA />
      <FAQ onNavigate={handleNavigation} />
      <Footer onNavigate={handleNavigation} />
    </>
  );
};

export default HomePage;
