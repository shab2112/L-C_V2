
import React, { useState } from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

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

      console.log('Calling newsletter subscribe function...');

      const response = await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thank you for subscribing!' });
        setEmail('');
      } else {
        const errorMsg = data.details || data.error || 'Failed to subscribe. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMsg = error instanceof Error ? error.message : 'An error occurred. Please try again later.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#020617] text-white pt-20 pb-10 border-t border-white/5 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lc-gold/50 to-transparent opacity-50"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNav('HOME')}
            >
              <img
                src="/lockwood-assets/general/lc_logo_full_1.png"
                alt="Lockwood & Carter"
                className="h-28 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              {/* <span className="font-script text-3xl text-lc-gold tracking-wide" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
                Lockwood & Carter
              </span> */}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier AI-driven real estate consultancy in Dubai. <br />
              <span className="text-lc-gold font-serif italic">Investments guided by Intelligence.</span>
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/lockwoodandcarter/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-lc-gold hover:scale-110" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61586060181219" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-lc-gold hover:scale-110" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://www.youtube.com/@LockwoodandCarterRealEstate" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-gray-400 hover:text-lc-gold hover:scale-110" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 tracking-wide">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Projects', 'About Us', 'Blogs'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNav(item.toUpperCase().replace(' ', '_') as Page)}
                    className="text-slate-400 hover:text-lc-gold transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-lc-gold/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 tracking-wide">Support</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => handleNav('CONTACT_US')} className="text-slate-400 hover:text-lc-gold transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-lc-gold/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('PRIVACY_POLICY')} className="text-slate-400 hover:text-lc-gold transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-lc-gold/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-lc-gold transition-colors text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-lc-gold/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
            <div className="mt-9 text-slate-500 text-s font-bold">
              <p>RERA ORN: 53772</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Stay Updated</h4>
            <p className="text-slate-400 text-sm mb-6">Receive exclusive off-plan offers and market insights directly to your inbox.</p>
            <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lc-gold/50 focus:ring-1 focus:ring-lc-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-lc-gold hover:bg-lc-goldHover text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-lc-gold/20 hover:shadow-lc-gold/30 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start gap-6">

          {/* Legal / Disclosure block */}
          <div className="text-slate-500 text-xs leading-relaxed space-y-1 max-w-3xl">
            <p>
              © {new Date().getFullYear()} Lockwood & Carter Real Estate. All rights reserved.
            </p>
            <p>
              Property information is sourced primarily from Dubai Land Department (DLD) Open Data
              and other official channels. While every effort is made to ensure accuracy, registry
              updates may be subject to reporting delays. AI-powered features provide informational assistance only and do not replace advice
              from licensed real estate professionals. Property details, pricing, and availability
              are subject to change.
            </p>
          </div>

          {/* Tagline */}
          <p className="text-slate-600 text-[10px] uppercase tracking-widest whitespace-nowrap">
            Designed for Excellence
          </p>

        </div>
      </div>
    </footer>
  );
};
