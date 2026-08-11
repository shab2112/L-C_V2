import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, User } from 'lucide-react';
import { Page } from '../../lockwood-types';
import { Tooltip } from '../Tooltip';

interface NavbarProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dynamic Background Logic based on Tab/Scroll
  // HOME and PROJECT_DETAIL pages are DARK backgrounds -> Navbar transparent/dark.
  // PROJECTS list page is (usually) LIGHT background -> Navbar white/light.

  const isLightPage = ['PROJECTS'].includes(currentPage);
  const isDarkPage = ['HOME', 'SHAHRUKHZ', 'ALTAIR_52', 'MASAAR_3', 'ARTIZE_62', 'AVIOR', 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'CLIENT_OTP'].includes(currentPage);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine styles based on state
  // If scrolled, always go to a "Solid" state (Dark Navy Glass for premium feel).
  // If at top:
  //   - Dark Page: Transparent background, White text.
  //   - Light Page: White background, Navy text.

  let navBackgroundClass = '';
  let textColorClass = '';
  let logoClass = '';
  const transitionClass = 'transition-all duration-300';

  if (scrolled) {
    navBackgroundClass = 'bg-lc-navy/95 backdrop-blur-md shadow-lg border-b border-white/10';
    textColorClass = 'text-white';
    logoClass = ''; // Default golden/white logo handling
  } else {
    if (isLightPage) {
      navBackgroundClass = 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200';
      textColorClass = 'text-lc-navy';
      logoClass = 'brightness-0 invert-0'; // Make logo dark
    } else {
      // Dark Page (Home, etc)
      navBackgroundClass = 'bg-transparent'; // Let the Royal Blue shine through
      textColorClass = 'text-white';
      logoClass = ''; // Keep original logo
    }
  }

  const hoverColorClass = isLightPage && !scrolled ? 'hover:text-lc-gold' : 'hover:text-lc-gold';
  const activeColorClass = 'text-lc-gold font-bold';

  // Badge style
  const badgeClass = (isLightPage && !scrolled)
    ? 'bg-lc-navy/5 border-lc-navy/10 text-lc-navy/90'
    : 'bg-white/10 border-white/20 text-white/90 shadow-sm';

  const mobileButtonClass = (isLightPage && !scrolled) ? 'text-lc-navy' : 'text-white';

  const handleNav = (page: Page, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onNavigate(page);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const isProjectsActive = ['PROJECTS', 'SHAHRUKHZ', 'ALTAIR_52', 'MASAAR_3', 'ARTIZE_62', 'AVIOR'].includes(currentPage);

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] px-4 sm:px-6 py-4 sm:py-6 ${transitionClass} ${navBackgroundClass}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 z-[101] relative"
            onClick={(e) => handleNav('HOME', e)}
          >
            <img
              src="/lockwood-assets/general/logo.png"
              alt="Lockwood & Carter"
              className={`h-16 w-auto object-contain transition-all duration-300 ${logoClass}`}
            />
            {/* Restored Text Logo */}
            <span className={`font-script text-3xl pt-1 whitespace-nowrap hidden sm:block animate-handwriting ${logoClass ? 'text-lc-navy' : 'gold-text-embossed gold-text-embossed'}`}>
              Lockwood & Carter
            </span>
          </div>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center space-x-4 lg:space-x-8 text-sm font-medium transition-colors ${textColorClass}`}>
            <Tooltip content="Browse our luxury properties" position="bottom">
              <button
                onClick={(e) => handleNav('PROJECTS', e)}
                className={`transition-colors ${hoverColorClass} ${isProjectsActive ? activeColorClass : ''}`}
              >
                Projects
              </button>
            </Tooltip>

            <Tooltip content="Learn more about our agency" position="bottom">
              <button
                onClick={(e) => handleNav('ABOUT_US', e)}
                className={`transition-colors ${hoverColorClass} ${currentPage === 'ABOUT_US' ? activeColorClass : ''}`}
              >
                About Us
              </button>
            </Tooltip>

            <Tooltip content="Read our latest insights" position="bottom">
              <button
                onClick={(e) => handleNav('BLOGS', e)}
                className={`transition-colors ${hoverColorClass} ${currentPage === 'BLOGS' ? activeColorClass : ''}`}
              >
                Blogs
              </button>
            </Tooltip>

            <Tooltip content="Access your client portal" position="bottom">
              <button
                onClick={(e) => handleNav('LOGIN', e)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-lc-gold to-orange-500 hover:from-lc-goldHover hover:to-orange-600 text-white transition-all text-sm shadow-md"
              >
                <span className="whitespace-nowrap">Register / Login</span>
                <User size={14} />
              </button>
            </Tooltip>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden ${mobileButtonClass} p-2 flex-shrink-0 ml-2 z-[101] relative`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed top-[88px] left-0 right-0 z-[95] md:hidden bg-lc-navy border-t border-white/10 shadow-2xl max-h-[calc(100vh-88px)] overflow-y-auto">
          <div className="p-6 flex flex-col space-y-4">
            <button
              onClick={(e) => handleNav('PROJECTS', e)}
              className={`text-left py-3 text-base font-medium transition-colors border-b border-white/10 w-full ${isProjectsActive ? 'text-lc-gold' : 'text-white hover:text-lc-gold'}`}
            >
              Projects
            </button>
            <button
              onClick={(e) => handleNav('ABOUT_US', e)}
              className={`text-left py-3 text-base font-medium transition-colors border-b border-white/10 w-full ${currentPage === 'ABOUT_US' ? 'text-lc-gold' : 'text-white hover:text-lc-gold'}`}
            >
              About Us
            </button>
            <button
              onClick={(e) => handleNav('BLOGS', e)}
              className={`text-left py-3 text-base font-medium transition-colors border-b border-white/10 w-full ${currentPage === 'BLOGS' ? 'text-lc-gold' : 'text-white hover:text-lc-gold'}`}
            >
              Blogs
            </button>

            <button
              onClick={(e) => handleNav('LOGIN', e)}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-lc-gold hover:bg-yellow-500 text-white transition-all text-base font-medium w-full"
            >
              <span>Register / Login</span>
              <User size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
