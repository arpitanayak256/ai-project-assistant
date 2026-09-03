'use client';

import React, { useState } from 'react';
import { LogIn, UserPlus, Key, Mail, User as UserIcon, Lock, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const { login, register, loading: authLoading, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [customError, setCustomError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{ accessToken: string; refreshToken: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    try {
      const loggedUser = isLogin
        ? await login(email, password)
        : await register(name || 'New User', email, password);

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

      setTokenInfo({
        accessToken: token || '',
        refreshToken: 'refresh_token_rot_jwt_' + Math.random().toString(36).substring(2),
      });

      setTimeout(() => {
        onLogin(loggedUser);
      }, 1200);
    } catch (err: any) {
      setCustomError(err.message || 'Authentication failed');
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setCustomError('');
    try {
      const loggedUser = await login('alex@example.com', 'password123');
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      setTokenInfo({
        accessToken: token || '',
        refreshToken: 'refresh_token_rot_jwt_' + Math.random().toString(36).substring(2),
      });
      setTimeout(() => {
        onLogin(loggedUser);
      }, 1200);
    } catch (err: any) {
      setCustomError(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT PANEL: Himalayas Style Brand Showcase & Feature Preview */}
      <div className="lg:w-[58%] bg-zinc-950 border-r border-zinc-800/60 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Ambient Neon Lighting Background */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        {/* Top Brand Navigation Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-600/20 border border-white/10">
              C
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Clutch AI
              </span>
              <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-widest">
                Project Assistant
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Sprint Planner v2.4</span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-auto max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Turn unstructured product ideas into <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">automated execution plans</span>.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            Upload your PRDs or paste raw requirements. Clutch AI automatically synthesizes epics, breaks down subtasks, and resolves dependency networks in seconds.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Himalayas Sign Up / Sign In Form */}
      <div className="lg:w-[42%] bg-zinc-900/40 backdrop-blur-2xl p-8 lg:p-14 flex flex-col justify-between relative shrink-0">
        {/* Top Header Mode Toggle Link */}
        <div className="flex items-center justify-between text-xs font-semibold mb-8">
          <span className="text-zinc-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setCustomError('');
              setTokenInfo(null);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline underline-offset-4"
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        {/* Center Auth Form Container */}
        <div className="max-w-sm w-full mx-auto my-auto space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">
              {isLogin
                ? 'Enter your credentials to access your project workspace'
                : 'Start organizing your requirements with AI execution plans'}
            </p>
          </div>

          {tokenInfo ? (
            /* JWT Token Success Animation Card */
            <div className="space-y-4 text-center py-6 bg-zinc-950/80 border border-zinc-800 p-6 rounded-2xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Key className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm font-bold text-white">JWT Access Handshake Token</h3>
              <p className="text-xs text-zinc-400 font-mono bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-zinc-300 break-all select-all">
                {tokenInfo.accessToken}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                Redirecting to project workspace dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Social Login Buttons (Himalayas Style) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('GitHub')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-all shadow-sm active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-zinc-800" />
                <span className="absolute bg-zinc-950 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Or email
                </span>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to your email.')}
                        className="text-[11px] text-zinc-500 hover:text-indigo-400 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {(authError || customError) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center font-semibold animate-shake">
                    {authError || customError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl py-3 text-xs shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Legal Terms Notice */}
        <div className="text-[11px] text-zinc-600 text-center mt-8 font-medium">
          By continuing, you agree to Clutch AI&apos;s{' '}
          <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and{' '}
          <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
