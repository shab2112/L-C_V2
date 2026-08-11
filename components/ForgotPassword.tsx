import React, { useState } from 'react';
import { Mail, Phone, Lock, ArrowLeft, Hash } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOTP, setDebugOTP] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      if (data.debug) {
        setDebugOTP(data.debug.otp);
      }

      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, phone, otp: otp.trim(), newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      alert('Password reset successfully! You can now login with your new password.');
      onSuccess();
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
      <div className="relative z-10 w-full max-w-[450px] px-6">
        <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden">

          {/* Back Button - Top Left Internal */}
          <div className="absolute top-4 left-4 z-20">
            <Tooltip content="Return to the login screen" position="right">
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
            <h1 className="text-xl font-serif font-bold text-lc-navy mb-2 tracking-tight">Reset Password</h1>
            <p className="text-slate-500 text-xs tracking-wide">
              {step === 'request'
                ? 'Enter your details to receive a reset code'
                : 'Enter the code and your new password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-xs font-medium border-l-4 border-l-red-500">
              <p>{error}</p>
            </div>
          )}

          {debugOTP && step === 'verify' && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-lg mb-4 text-xs font-medium border-l-4 border-l-blue-500">
              <p className="flex justify-between items-center">
                <span>Dev Code:</span>
                <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-blue-200">{debugOTP}</span>
              </p>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="relative group/input">
                  <Phone className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                    placeholder="+971 XX XXX XXXX"
                    required
                  />
                </div>
              </div>

              <Tooltip content="Receive a verification code to reset your password" position="bottom" className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lc-navy hover:bg-lc-navy/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lc-navy/20 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs mt-2 border border-white/10"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </Tooltip>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="otp" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  Reset Code
                </label>
                <div className="relative group/input">
                  <Hash className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-center text-xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="newPassword" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                    placeholder="Min 8 chars"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  Confirm
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                    placeholder="Repeat"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Tooltip content="Confirm new password" position="bottom" className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lc-navy hover:bg-lc-navy/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lc-navy/20 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs mt-2 border border-white/10"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </Tooltip>

              <Tooltip content="If you didn't receive the code, try again" position="bottom" className="w-full">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-lc-navy/50 hover:text-lc-gold transition-colors text-xs font-medium uppercase tracking-wide"
                >
                  Resend Reset Code
                </button>
              </Tooltip>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-lc-navy transition-colors text-xs uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
