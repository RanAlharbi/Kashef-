/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, Lock, X, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: { email: string; name: string; role: 'registered' | 'admin' }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t, isRtl } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: 'user' | 'admin') => {
    setError('');
    if (type === 'admin') {
      setEmail('admin@kashef.ai');
      setPassword('admin123');
    } else {
      setEmail('user@kashef.ai');
      setPassword('user123');
    }
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="login-modal-card"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-2xl overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button 
          id="close-login-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-500 mb-3 shadow-inner">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isRegister ? (isRtl ? 'إنشاء حساب جديد' : 'Create Security Account') : t.navLogin}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {isRegister 
              ? (isRtl ? 'انضم إلى شبكة الدفاع لحماية غير محدودة' : 'Join Kashef network for advanced security analytics') 
              : (isRtl ? 'أدخل معلومات المرور للوصول للوحة المراقبة والتحكم' : 'Access advanced real-time cybersecurity dashboards')
            }
          </p>
        </div>

        {/* Demo Credentials Presets */}
        {!isRegister && (
          <div className="mb-6 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="text-xs text-zinc-400 mb-2 font-medium text-center">
              {isRtl ? 'للتجربة السريعة (اضغط للتعبئة التلقائية):' : 'Demo Presets (Click to autofill):'}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                id="preset-user-btn"
                type="button"
                onClick={() => fillCredentials('user')}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-lg border border-zinc-700 transition"
              >
                Ahmed (User)
              </button>
              <button
                id="preset-admin-btn"
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg border border-zinc-700 transition"
              >
                Kashef (Admin)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                {isRtl ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  id="register-name-input"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl text-white text-sm transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl text-white text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl text-white text-sm transition"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 font-bold rounded-xl text-sm transition text-white shadow-lg disabled:opacity-50"
          >
            {loading ? (isRtl ? 'جاري التحقق...' : 'Authenticating Secure Node...') : (isRegister ? (isRtl ? 'تسجيل جديد' : 'Sign Up') : (isRtl ? 'تسجيل دخول آمن' : 'Establish Secure Connection'))}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {isRegister ? (
            <span>
              {isRtl ? 'لديك حساب بالفعل؟' : 'Already have a secure node? '}{' '}
              <button 
                id="toggle-login-btn"
                type="button" 
                onClick={() => setIsRegister(false)} 
                className="text-indigo-400 font-semibold hover:underline"
              >
                {isRtl ? 'سجل دخولك الآن' : 'Sign In'}
              </button>
            </span>
          ) : (
            <span>
              {isRtl ? 'ليس لديك حساب مسبق؟' : 'New to Kashef? '}{' '}
              <button 
                id="toggle-register-btn"
                type="button" 
                onClick={() => setIsRegister(true)} 
                className="text-indigo-400 font-semibold hover:underline"
              >
                {isRtl ? 'أنشئ حسابك الرقمي' : 'Create Free Account'}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
