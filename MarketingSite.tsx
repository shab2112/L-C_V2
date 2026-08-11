import React, { useState } from 'react';
import { Navbar } from './components/lockwood/Navbar';
import { Hero } from './components/lockwood/Hero';
import { Features } from './components/lockwood/Features';
import { About } from './components/lockwood/About';
import { Footer } from './components/lockwood/Footer';
import { Projects } from './components/lockwood/Projects';
import { Altair52 } from './components/lockwood/Altair52';
import { Shahrukhz } from './components/lockwood/Shahrukhz';
import { Masaar3 } from './components/lockwood/Masaar3';
import { Artize62 } from './components/lockwood/Artize62';
import { Avior } from './components/lockwood/Avior';
import { AboutUsPage } from './components/lockwood/AboutUsPage';
import { FAQ } from './components/lockwood/FAQ';
import { CTA } from './components/lockwood/CTA';
import { Blogs } from './components/lockwood/Blogs';
import { ContactUs } from './components/lockwood/ContactUs';
import { PrivacyPolicy } from './components/lockwood/PrivacyPolicy';
import { Page } from './lockwood-types';

interface MarketingSiteProps {
  onAccessPlatform: () => void;
}

export const MarketingSite: React.FC<MarketingSiteProps> = ({ onAccessPlatform }) => {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');

  const handleNavigation = (page: Page) => {
    if (page === 'LOGIN' || page === 'REGISTER') {
      onAccessPlatform();
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'PROJECTS':
        return <Projects onNavigate={handleNavigation} />;
      case 'ALTAIR_52':
        return <Altair52 onNavigate={handleNavigation} />;
      case 'SHAHRUKHZ':
        return <Shahrukhz onNavigate={handleNavigation} />;
      case 'MASAAR_3':
        return <Masaar3 onNavigate={handleNavigation} />;
      case 'ARTIZE_62':
        return <Artize62 onNavigate={handleNavigation} />;
      case 'AVIOR':
        return <Avior onNavigate={handleNavigation} />;
      case 'ABOUT_US':
        return <AboutUsPage onNavigate={handleNavigation} />;
      case 'BLOGS':
        return <Blogs onNavigate={handleNavigation} />;
      case 'CONTACT_US':
        return <ContactUs onNavigate={handleNavigation} />;
      case 'PRIVACY_POLICY':
        return <PrivacyPolicy onNavigate={handleNavigation} />;
      case 'HOME':
      default:
        return (
          <>
            <Hero onNavigate={handleNavigation} />
            <Features />
            <About />
            <FAQ onNavigate={handleNavigation} />
            <CTA />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
      <div className="pt-32 sm:pt-36 md:pt-40 lg:pt-44">
        {renderContent()}
      </div>
      <Footer onNavigate={handleNavigation} />
    </div>
  );
};
