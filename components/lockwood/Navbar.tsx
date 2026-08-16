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
  const isDarkPage = ['HOME', 'ABOUT_US', 'BLOGS', 'SHAHRUKHZ', 'ALTAIR_52', 'MASAAR_3', 'ARTIZE_62', 'AVIOR', 'LOGIN', 'REGISTER', 'FORGOT_PASSWORD', 'CLIENT_OTP'].includes(currentPage);

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
  const transitionClass = 'transition-all duration-300';

  if (scrolled) {
    navBackgroundClass = 'bg-[#F5F0E6]/95 backdrop-blur-md shadow-lg border-b border-[#E6DED0]';
    textColorClass = 'text-[#122238]';
  } else {
    if (isLightPage) {
      navBackgroundClass = 'bg-[#F5F0E6]/95 backdrop-blur-md shadow-sm border-b border-[#E6DED0]';
      textColorClass = 'text-lc-navy';
    } else {
      // Dark Page (Home, etc)
      navBackgroundClass = 'bg-transparent'; // Let the Royal Blue shine through
      textColorClass = 'text-white';
    }
  }

  const hoverColorClass = 'hover:text-[#6D2636]';
  const activeColorClass = 'text-[#6D2636] font-bold';
  const showLogoRibbon = isDarkPage && !scrolled;

  // Badge style
  const badgeClass = (isLightPage && !scrolled)
    ? 'bg-lc-navy/5 border-lc-navy/10 text-lc-navy/90'
    : 'bg-white/10 border-white/20 text-white/90 shadow-sm';

  const mobileButtonClass = (isLightPage && !scrolled) || scrolled ? 'text-[#122238]' : 'text-white';

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
      <nav className={`fixed top-0 w-full z-[100] px-0 py-4 sm:py-6 ${transitionClass} ${navBackgroundClass}`}>
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="relative z-[101] flex-shrink-0">
            <button
              type="button"
              className="relative flex min-h-14 items-center p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B49A68]"
              onClick={(e) => handleNav('HOME', e)}
              aria-label="Lockwood & Carter home"
            >
              <span className="relative inline-flex flex-shrink-0 items-center justify-center">
                {showLogoRibbon && (
                  <span
                    className="pointer-events-none absolute left-1/2 top-[-16px] -z-10 h-[92px] w-[88px] -translate-x-1/2 rounded-b-full bg-[#F5F0E6]/95 backdrop-blur-sm sm:top-[-24px] sm:h-[108px] sm:w-[96px]"
                    aria-hidden="true"
                  />
                )}
                <img
                  src="/lockwood-assets/general/brand/lockwood-carter-monogram-transparent.png"
                  alt=""
                  className={`h-auto object-contain transition-all duration-300 ${scrolled ? 'w-12 md:w-14' : 'w-14 md:w-16'}`}
                />
              </span>
              <span
                className={`overflow-hidden transition-all duration-500 ease-out ${
                  scrolled
                    ? 'ml-1 max-w-[118px] translate-x-0 opacity-100 sm:max-w-[134px] md:max-w-[150px]'
                    : 'ml-0 max-w-0 -translate-x-2 opacity-0'
                }`}
                aria-hidden={!scrolled}
              >
                <img
                  src="/lockwood-assets/general/brand/lockwood-carter-wordmark.png"
                  alt=""
                  className="mt-2 h-auto w-[118px] max-w-none object-contain sm:w-[134px] md:w-[150px]"
                />
              </span>
            </button>
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
                className="flex min-h-11 items-center gap-2 border border-[#B49A68]/70 bg-[#F5F0E6] px-4 py-2 rounded-[2px] text-[#122238] transition-colors text-sm font-semibold hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]"
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
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-[2px] bg-[#F5F0E6] hover:bg-white text-[#122238] border border-[#B49A68]/70 transition-colors text-base font-semibold w-full"
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
