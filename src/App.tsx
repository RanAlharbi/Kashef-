/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LoginModal } from './components/LoginModal';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SecurityAnalyzer } from './components/SecurityAnalyzer';
import { SecurityChat } from './components/SecurityChat';
import { LearningCenter } from './components/LearningCenter';
import { AdminPanel } from './components/AdminPanel';
import { 
  ShieldAlert, 
  Globe, 
  LayoutDashboard, 
  BookOpen, 
  Bot, 
  Terminal, 
  LogIn, 
  LogOut,
  User,
  Activity,
  Menu,
  X
} from 'lucide-react';

type NavigationTab = 'landing' | 'dashboard' | 'analyzer' | 'chat' | 'academy' | 'admin';

function AppContent() {
  const { t, language, toggleLanguage, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kashef_token'));
  const [user, setUser] = useState<{ email: string; name: string; role: 'registered' | 'admin' } | null>(() => {
    const saved = localStorage.getItem('kashef_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (newToken: string, newUser: { email: string; name: string; role: 'registered' | 'admin' }) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('kashef_token', newToken);
    localStorage.setItem('kashef_user', JSON.stringify(newUser));
    setActiveTab('dashboard'); // Redirect directly to core panel
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kashef_token');
    localStorage.removeItem('kashef_user');
    setActiveTab('landing');
  };

  // Auto load profile on session resume
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(userData => {
        setUser(userData);
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, [token]);

  return (
    <div className={`min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100 flex flex-col lg:flex-row ${isRtl ? 'lg:flex-row-reverse' : ''} selection:bg-indigo-500 selection:text-white`}>
      
      {/* Dynamic Security Grid Accent Line */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 w-full z-50 fixed top-0 left-0" />

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className={`hidden lg:flex flex-col w-64 bg-zinc-950 border-zinc-900 p-6 shrink-0 relative z-30 ${isRtl ? 'border-l' : 'border-r'}`}>
        {/* Subtle top glow overlay */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div 
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-2 cursor-pointer group mb-10 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
        >
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-300">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-black text-xl text-white tracking-tight">
              Kashef<span className="text-indigo-500">.كاشف</span>
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
              {isRtl ? 'الوقاية السيبرانية' : 'Cyber-Defense System'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1.5">
          <button
            id="sidebar-nav-landing"
            onClick={() => setActiveTab('landing')}
            className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
              isRtl ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              activeTab === 'landing' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">{t.navLanding}</span>
          </button>

          <button
            id="sidebar-nav-dashboard"
            onClick={() => {
              if (!token) {
                setAuthModalOpen(true);
              } else {
                setActiveTab('dashboard');
              }
            }}
            className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
              isRtl ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">{t.navDashboard}</span>
          </button>

          <button
            id="sidebar-nav-analyzer"
            onClick={() => setActiveTab('analyzer')}
            className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
              isRtl ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              activeTab === 'analyzer' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">{t.navAnalyzer}</span>
          </button>

          <button
            id="sidebar-nav-academy"
            onClick={() => setActiveTab('academy')}
            className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
              isRtl ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              activeTab === 'academy' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">{t.navLearning}</span>
          </button>

          <button
            id="sidebar-nav-chat"
            onClick={() => {
              if (!token) {
                setAuthModalOpen(true);
              } else {
                setActiveTab('chat');
              }
            }}
            className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
              isRtl ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              activeTab === 'chat' 
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1">{t.navChat}</span>
          </button>

          {user && user.role === 'admin' && (
            <button
              id="sidebar-nav-admin"
              onClick={() => setActiveTab('admin')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-3 ${
                isRtl ? 'flex-row-reverse text-right' : 'text-left'
              } ${
                activeTab === 'admin' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="flex-1">{t.navAdmin}</span>
            </button>
          )}
        </nav>

        {/* Footer info/controls */}
        <div className="border-t border-zinc-900 pt-6 mt-auto flex flex-col gap-3">
          <button
            id="sidebar-lang-btn"
            onClick={toggleLanguage}
            className={`w-full px-4 py-2.5 text-xs font-bold border border-zinc-850 hover:border-zinc-750 bg-zinc-900/40 rounded-xl transition flex items-center justify-between cursor-pointer ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </div>
          </button>

          {token && user ? (
            <div className="flex flex-col gap-2">
              <div className={`px-4 py-2 bg-zinc-900/50 border border-zinc-850 rounded-xl flex items-center gap-2 text-xs text-zinc-300 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate flex-1">{user.name}</span>
              </div>
              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                className="w-full py-2.5 text-xs font-bold border border-indigo-500/25 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.navLogout}</span>
              </button>
            </div>
          ) : (
            <button
              id="sidebar-login-btn"
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.navLogin}</span>
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden sticky top-0.5 z-40 w-full px-4 py-3.5 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900/60 transition-all">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-2 cursor-pointer group ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition duration-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-extrabold text-base text-white tracking-tight">
                Kashef<span className="text-indigo-500">.كاشف</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="mobile-language-toggle-btn"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 text-xs font-bold border border-zinc-800 bg-zinc-900 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-indigo-500 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN PANEL */}
        {mobileMenuOpen && (
          <div className="mt-3 p-4 bg-zinc-900/95 border border-zinc-800 rounded-2xl flex flex-col gap-2.5 animate-fade-in text-left">
            <button
              id="mobile-nav-landing"
              onClick={() => { setActiveTab('landing'); setMobileMenuOpen(false); }}
              className={`p-3 text-sm font-semibold rounded-xl text-left ${activeTab === 'landing' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400'}`}
            >
              {t.navLanding}
            </button>
            <button
              id="mobile-nav-dashboard"
              onClick={() => { 
                setMobileMenuOpen(false);
                if (!token) setAuthModalOpen(true); 
                else setActiveTab('dashboard'); 
              }}
              className={`p-3 text-sm font-semibold rounded-xl text-left flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400'}`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <span>{t.navDashboard}</span>
            </button>
            <button
              id="mobile-nav-analyzer"
              onClick={() => { setActiveTab('analyzer'); setMobileMenuOpen(false); }}
              className={`p-3 text-sm font-semibold rounded-xl text-left flex items-center gap-2 ${activeTab === 'analyzer' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400'}`}
            >
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>{t.navAnalyzer}</span>
            </button>
            <button
              id="mobile-nav-academy"
              onClick={() => { setActiveTab('academy'); setMobileMenuOpen(false); }}
              className={`p-3 text-sm font-semibold rounded-xl text-left flex items-center gap-2 ${activeTab === 'academy' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400'}`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>{t.navLearning}</span>
            </button>
            <button
              id="mobile-nav-chat"
              onClick={() => { 
                setMobileMenuOpen(false);
                if (!token) setAuthModalOpen(true); 
                else setActiveTab('chat'); 
              }}
              className={`p-3 text-sm font-semibold rounded-xl text-left flex items-center gap-2 ${activeTab === 'chat' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-400'}`}
            >
              <Bot className="w-4 h-4 text-indigo-500" />
              <span>{t.navChat}</span>
            </button>

            {user && user.role === 'admin' && (
              <button
                id="mobile-nav-admin"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`p-3 text-sm font-semibold rounded-xl text-left flex items-center gap-2 ${activeTab === 'admin' ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400'}`}
              >
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>{t.navAdmin}</span>
              </button>
            )}

            {/* Authentication state responsive row */}
            <div className="border-t border-zinc-800 pt-3 mt-1.5 flex flex-col gap-2">
              {token && user ? (
                <div className="flex items-center justify-between p-2">
                  <span className="text-xs text-zinc-400 font-bold">{user.name}</span>
                  <button
                    id="mobile-sign-out"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg"
                  >
                    {t.navLogout}
                  </button>
                </div>
              ) : (
                <button
                  id="mobile-sign-in"
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.navLogin}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CORE ROUTING AND CHASSIS CONTAINER */}
      <main className="flex-1 w-full flex flex-col relative min-h-[calc(100vh-60px)] lg:min-h-screen overflow-y-auto">
        {activeTab === 'landing' && (
          <LandingPage 
            onStartScanner={() => setActiveTab('analyzer')} 
            onStartAcademy={() => setActiveTab('academy')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            token={token} 
            onNavigateToScanner={() => setActiveTab('analyzer')} 
            userEmail={user?.email}
          />
        )}

        {activeTab === 'analyzer' && (
          <SecurityAnalyzer 
            token={token} 
            onScanCompleted={() => {}} 
          />
        )}

        {activeTab === 'chat' && (
          <SecurityChat />
        )}

        {activeTab === 'academy' && (
          <LearningCenter />
        )}

        {activeTab === 'admin' && (
          <AdminPanel token={token} />
        )}
      </main>

      {/* SECURE MODAL WINDOW */}
      <LoginModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
