import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Phone, MapPin, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ClientOTPLoginProps {
  onSuccess: (userId: string, email: string) => void;
  onBack: () => void;
}

const ClientOTPLogin: React.FC<ClientOTPLoginProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [developmentOTP, setDevelopmentOTP] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-client-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ firstName, lastName, email, phone, location, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyRegistered) {
          alert(data.error);
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess(data.message || 'OTP code sent successfully! Check your email.');
      if (data.developmentOTP) {
        setDevelopmentOTP(data.developmentOTP);
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-client-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ firstName, lastName, email, phone, location, password, emailOTP: emailOTP.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Failed to verify OTP');
      }

      onSuccess(data.userId, data.email);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'verify') {
      setStep('input');
      setEmailOTP('');
      setError('');
      setSuccess('');
      setAttemptsRemaining(null);
      setDevelopmentOTP(null);
    } else {
      onBack();
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
      <div className="relative z-10 w-full max-w-[500px] px-6">
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
            <h1 className="text-xl font-serif font-bold text-lc-navy mb-2 tracking-tight">Client Portal</h1>
            <p className="text-slate-500 text-xs tracking-wide">
              {step === 'input'
                ? 'Register to access your personalized real estate portal'
                : 'Enter the verification code sent to your email'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-xs font-medium border-l-4 border-l-red-500">
              <p className="flex items-center gap-2">{error}</p>
              {attemptsRemaining !== null && (
                <p className="text-xs mt-1 ml-3.5 opacity-70">Attempts remaining: {attemptsRemaining}</p>
              )}
            </div>
          )}

          {success && step === 'verify' && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 border-l-4 border-l-green-500">
              <p className="text-sm font-medium flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> {success}</p>
              {developmentOTP ? (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Development Mode - Your OTP Code:</p>
                  <p className="text-2xl font-mono font-bold text-yellow-600 text-center tracking-wider">{developmentOTP}</p>
                  <p className="text-xs text-yellow-600/70 mt-1 text-center">Copy this code to proceed</p>
                </div>
              ) : (
                <p className="text-xs mt-1 ml-6 opacity-70">Please check your email for the verification code.</p>
              )}
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                    First Name
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                    Last Name
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      placeholder="+971..."
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="location" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                    Location
                  </label>
                  <div className="relative group/input">
                    <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                      placeholder="Dubai"
                    />
                  </div>
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
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within/input:text-lc-gold transition-colors" size={16} />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-sm font-medium"
                    placeholder="Repeat password"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Tooltip content="Receive a secure 6-digit verification code" position="bottom" className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lc-navy hover:bg-lc-navy/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lc-navy/20 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs mt-4 border border-white/10"
                >
                  {loading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </Tooltip>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="emailOTP" className="text-[10px] font-bold text-lc-navy/70 uppercase tracking-widest ml-1">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  id="emailOTP"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-lc-gold focus:ring-1 focus:ring-lc-gold text-slate-800 placeholder-slate-400 transition-all outline-none text-center text-3xl font-mono tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <Tooltip content="Confirm OTP to login" position="bottom" className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lc-navy hover:bg-lc-navy/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-lc-navy/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </Tooltip>

              <Tooltip content="Resend the verification code if you didn't receive it" position="bottom" className="w-full">
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setEmailOTP('');
                    setError('');
                    setSuccess('');
                    setAttemptsRemaining(null);
                    setDevelopmentOTP(null);
                  }}
                  disabled={loading}
                  className="w-full text-slate-400 hover:text-lc-navy transition-colors text-xs font-medium uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP Code
                </button>
              </Tooltip>
            </form>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-300 text-[10px]">Secure luxury gateway by Lockwood & Carter</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOTPLogin;
