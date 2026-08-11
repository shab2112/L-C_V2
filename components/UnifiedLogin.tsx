import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface UnifiedLoginProps {
  onClientSuccess: (userId: string, email: string) => void;
  onStaffSuccess: (userId: string, email: string, requiresPasswordChange: boolean, name?: string, role?: any) => void;
  onBack: () => void;
  onForgotPassword: () => void;
  onSignup?: () => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({
  onClientSuccess,
  onStaffSuccess,
  onBack,
  onForgotPassword,
  onSignup,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/unified-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      if (data.userType === 'client') {
        onClientSuccess(data.userId, data.email);
      } else if (data.userType === 'staff') {
        onStaffSuccess(data.userId, data.email, data.requiresPasswordChange || false, data.name, data.role);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-10">

      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lockwood-assets/projects/artize62-poster6.jpg"
          alt="Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-lc-navy/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Floating Elements for depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-lc-gold/10 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] opacity-40"></div>
      </div>



      {/* Premium Bright Glass Card */}
      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden">

          {/* Back Button - Top Left Internal */}
          <div className="absolute top-4 left-4 z-20">
            <Tooltip content="Return to the main homepage" position="right">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-lc-navy/40 hover:text-lc-gold transition-colors text-[10px] font-bold uppercase tracking-widest group"
              >
                <div className="p-1 rounded-full border border-lc-navy/10 group-hover:border-lc-gold/30 transition-colors">
                  <ArrowLeft size={10} />
                </div>
                Back
              </button>
            </Tooltip>
          </div>

          {/* Top Gold Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lc-navy via-lc-gold to-lc-navy"></div>

          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/lockwood-assets/general/logo.png"
                  alt="Lockwood & Carter"
                  className="h-14 w-auto object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
                <span className="font-script text-3xl text-lc-gold tracking-wide" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>Lockwood & Carter</span>
              </div>
            </div>
            <h1 className="text-xl font-serif font-bold text-lc-navy mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-xs tracking-wide">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-xs font-medium border-l-4 border-l-red-500">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group/input">
                <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group/input">
                <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="text-right pt-1">
              <Tooltip content="Reset your password via email" position="left">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-lc-gold hover:text-lc-navy transition-colors font-bold uppercase tracking-wide"
                >
                  Forgot Password?
                </button>
              </Tooltip>
            </div>

            <Tooltip content="Access your secure dashboard" position="bottom" className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lc-navy hover:bg-lc-navy/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lc-navy/20 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs mt-2 border border-white/10"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </Tooltip>
          </form>

          {/* Register Link */}
          {onSignup && (
            <div className="mt-6 text-center border-t border-slate-100 pt-4">
              <span className="text-slate-400 text-xs block">
                Don't have an account yet?{' '}
                <Tooltip content="Create a new client account" position="bottom">
                  <button
                    type="button"
                    onClick={onSignup}
                    className="text-lc-navy hover:text-lc-gold font-bold transition-colors ml-1 uppercase"
                  >
                    Register Account
                  </button>
                </Tooltip>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;