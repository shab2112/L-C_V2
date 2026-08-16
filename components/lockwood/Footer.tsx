import React, { useState } from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const footerLinkClass = 'inline-flex min-h-11 items-center text-left text-sm text-[#292B2D]/75 transition-colors hover:text-[#6D2636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]';

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNav = (page: Page) => {
    onNavigate(page);
    window.scrollTo(0, 0);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration error: Missing Supabase credentials');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thank you for subscribing!' });
        setEmail('');
      } else {
        const errorMsg = data.details || data.error || 'Failed to subscribe. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred. Please try again later.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-[#E6DED0] bg-[#F5F0E6] pb-8 pt-16 font-sans text-[#122238] sm:pt-20">
      <div className="absolute left-0 top-0 h-px w-full bg-[#B49A68]/45" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.85fr_1.05fr] lg:gap-12">
          <div className="max-w-md space-y-6">
            <button
              type="button"
              className="inline-flex items-center p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B49A68]"
              onClick={() => handleNav('HOME')}
              aria-label="Lockwood & Carter home"
            >
              <img
                src="/lockwood-assets/general/brand/lockwood-carter-final-logo-transparent.png"
                alt="Lockwood & Carter"
                className="h-auto w-44 max-w-full object-contain sm:w-52"
              />
            </button>

            <p className="max-w-sm text-sm leading-relaxed text-[#292B2D]/75">
              The premier AI-driven real estate consultancy in Dubai. <br />
              <span className="font-serif italic text-[#6F5A35]">Investments guided by intelligence.</span>
            </p>

            <div className="flex gap-3 pt-2">
              <a href="https://www.instagram.com/lockwoodandcarter/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#122238] transition-colors hover:border-[#B49A68] hover:text-[#6D2636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61586060181219" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#122238] transition-colors hover:border-[#B49A68] hover:text-[#6D2636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://www.youtube.com/@LockwoodandCarterRealEstate" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#122238] transition-colors hover:border-[#B49A68] hover:text-[#6D2636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <nav aria-label="Footer quick links">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[#122238]">Quick Links</h4>
            <ul className="m-0 list-none space-y-1 p-0">
              {['Home', 'Projects', 'About Us', 'Blogs'].map((item) => (
                <li key={item}>
                  <button onClick={() => handleNav(item.toUpperCase().replace(' ', '_') as Page)} className={footerLinkClass}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer support links">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[#122238]">Support</h4>
            <ul className="m-0 list-none space-y-1 p-0">
              <li>
                <button onClick={() => handleNav('CONTACT_US')} className={footerLinkClass}>
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('PRIVACY_POLICY')} className={footerLinkClass}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className={footerLinkClass}>
                  Terms of Service
                </a>
              </li>
            </ul>
            <div className="mt-6 border-l border-[#B49A68]/50 pl-4 text-sm font-bold text-[#292B2D]/70">
              <p>RERA ORN: 53772</p>
            </div>
          </nav>

          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[#122238]">Stay Updated</h4>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-[#292B2D]/75">
              Receive exclusive off-plan offers and market insights directly to your inbox.
            </p>
            <form className="flex max-w-sm flex-col gap-3" onSubmit={handleSubscribe}>
              <label htmlFor="footer-newsletter-email" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6F5A35]">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="min-h-12 rounded-[2px] border border-[#E6DED0] bg-white px-4 py-3 text-sm text-[#122238] transition-all placeholder:text-[#292B2D]/45 focus:border-[#B49A68] focus:outline-none focus:ring-1 focus:ring-[#B49A68]/30 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="min-h-12 rounded-[2px] bg-[#122238] py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#1D334E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
              {message && (
                <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`} aria-live="polite">
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-[#E6DED0] pt-8 md:flex-row">
          <div className="max-w-3xl space-y-2 text-xs leading-relaxed text-[#292B2D]/65">
            <p>&copy; {new Date().getFullYear()} Lockwood & Carter Real Estate. All rights reserved.</p>
            <p>
              Property information is sourced primarily from Dubai Land Department (DLD) Open Data and other official channels.
              While every effort is made to ensure accuracy, registry updates may be subject to reporting delays. AI-powered
              features provide informational assistance only and do not replace advice from licensed real estate professionals.
              Property details, pricing, and availability are subject to change.
            </p>
          </div>

          <p className="whitespace-nowrap text-[10px] uppercase tracking-widest text-[#6F5A35]">
            Designed for Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
