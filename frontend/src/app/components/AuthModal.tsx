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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 relative overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Project Management
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Clutch AI
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Unstructured requirements to action items in seconds
          </p>
        </div>

        {/* Card Panel */}
        <div className="bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {tokenInfo ? (
            /* JWT Token Success Animation */
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Key className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-xl font-semibold text-emerald-400 mb-1">JWT Tokens Generated</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">Simulating secure access/refresh token handshake...</p>

              <div className="w-full text-left space-y-3 bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl font-mono text-[10px] break-all text-zinc-500 dark:text-zinc-500">
                <div>
                  <span className="text-emerald-500 font-semibold">ACCESS_TOKEN:</span>
                  <div className="text-zinc-600 dark:text-zinc-400 select-all mt-1 truncate">{tokenInfo.accessToken}</div>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2">
                  <span className="text-violet-400 font-semibold">REFRESH_TOKEN:</span>
                  <div className="text-zinc-600 dark:text-zinc-400 select-all mt-1 truncate">{tokenInfo.refreshToken}</div>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-4">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setTokenInfo(null); setCustomError(''); }}
                  className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                    isLogin ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setTokenInfo(null); setCustomError(''); }}
                  className={`flex-1 pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                    !isLogin ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {(authError || customError) && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center font-semibold">
                  {authError || customError}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Developer"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-zinc-800 dark:text-zinc-200"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-zinc-800 dark:text-zinc-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pl-9 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-zinc-800 dark:text-zinc-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl py-2 text-sm shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Register Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
