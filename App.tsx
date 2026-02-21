
import React, { useState, useEffect } from 'react';
import { TherapySpace } from './components/TherapySpace';
import { Journal } from './components/Journal';
import { ProfileTab } from './components/ProfileTab';
import { MeditationLibrary } from './components/MeditationLibrary';
import { MeditationPlayer } from './components/MeditationPlayer';
import { ProfileSetupWizard } from './components/ProfileSetupWizard';
import { SettingsModal } from './components/SettingsModal';
import { Logo } from './components/Logo';
import { 
  Brain, Sparkles, Heart, Menu, X, BookHeart, 
  Shield, Lock, UserCheck, Palette, ShieldAlert,
  ArrowRight, Mail, Key, User as UserIcon, LogOut,
  ChevronRight, Fingerprint, Settings
} from 'lucide-react';
import { UserProfile, AuthState, Meditation } from './types';

type Tab = 'home' | 'session' | 'journal' | 'profile' | 'meditation';
type Theme = 'midnight' | 'forest' | 'rose' | 'lavender';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('nova_auth_session');
    return {
      user: saved ? JSON.parse(saved) : null,
      isLoading: false,
      error: null
    };
  });
  
  const [authView, setAuthView] = useState<'login' | 'signup' | 'landing'>('landing');
  const [authData, setAuthData] = useState({ email: '', password: '', displayName: '', handle: '' });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nova_theme') as Theme) || 'midnight';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('nova_theme', theme);
  }, [theme]);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuth(prev => ({ ...prev, isLoading: true }));
    
    // Simulate Backend Call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      email: authData.email || 'user@nova.ai',
      displayName: authData.displayName || 'Nova Voyager',
      handle: authData.handle || 'explorer_' + Math.floor(Math.random() * 1000),
      joinDate: new Date().toISOString(),
      sessionsCount: 0,
      streakDays: 1,
      exercisesCompleted: 0,
      hasCompletedSetup: false,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.handle || 'explorer'}`,
      stressFocus: [],
      isPrivate: true,
      socialLinks: [],
      isDiscoveryEnabled: false,
      aiCoachingEnabled: true
    };

    setAuth({ user: newUser, isLoading: false, error: null });
    localStorage.setItem('nova_auth_session', JSON.stringify(newUser));
    setActiveTab('home');
  };

  const logout = () => {
    setAuth({ user: null, isLoading: false, error: null });
    localStorage.removeItem('nova_auth_session');
    setActiveTab('home');
    setAuthView('landing');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!auth.user) return;
    const updated = { ...auth.user, ...updates };
    setAuth({ ...auth, user: updated });
    localStorage.setItem('nova_auth_session', JSON.stringify(updated));
  };

  const finalizeSetup = (finalProfile: UserProfile) => {
    setAuth({ ...auth, user: finalProfile });
    localStorage.setItem('nova_auth_session', JSON.stringify(finalProfile));
    setActiveTab('home');
  };

  const renderContent = () => {
    if (!auth.user?.hasCompletedSetup) {
      return <ProfileSetupWizard user={auth.user!} onComplete={finalizeSetup} />;
    }

    switch (activeTab) {
      case 'session': return <TherapySpace />;
      case 'journal': return <Journal />;
      case 'meditation': return <MeditationLibrary onSelect={(m) => setSelectedMeditation(m)} />;
      case 'profile': return <ProfileTab user={auth.user} onUpdate={updateProfile} />;
      default:
        return (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold mb-6 text-primary theme-transition">
                <Sparkles size={16} /> Welcome back, {auth.user.displayName.split(' ')[0]}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Stabilize Your <br />
                <span className="text-primary theme-transition">Mental Frequency</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                Professional tools for emotional first-aid. Ground your mind, reflect on your patterns, and build lasting resilience.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <button
                  onClick={() => setActiveTab('session')}
                  className="px-10 py-5 rounded-[2rem] font-black text-lg transition-all transform hover:scale-105 shadow-2xl bg-primary theme-transition text-black uppercase tracking-tighter"
                >
                  ENTER SESSION
                </button>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="bg-white/5 border border-white/10 px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all transform hover:scale-105 text-white"
                >
                  Open Reflection Lab
                </button>
              </div>

              {/* Home shortcut to sessions */}
              <div className="mt-20 flex justify-center">
                <div className="p-8 max-w-lg w-full bg-slate-950/20 backdrop-blur-sm rounded-[3rem] border border-white/5 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Brain size={24} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Immediate Support</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed text-center">Ready to start your psychological first-aid session. Nova is standing by.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                { icon: <Brain />, title: "Severity Staging", desc: "Nova assesses your distress level to provide precision care." },
                { icon: <Shield />, title: "Identity Vault", desc: "Your psychological context is protected by military-grade privacy." },
                { icon: <ShieldAlert />, title: "Bridge to Care", desc: "We identify when you need human clinical support." }
              ].map((card, i) => (
                <div key={i} className="glass-panel p-10 rounded-[3rem] hover:border-primary/30 theme-transition transition-all duration-300 group">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary theme-transition group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen auth-gradient flex items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="w-full max-w-xl glass-panel rounded-[3rem] p-12 relative z-10 animate-in fade-in zoom-in-95 duration-700 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          {authView === 'landing' ? (
            <div className="text-center">
              <Logo size={100} className="mx-auto mb-8" />
              <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 text-primary theme-transition">NOVA CARE</h1>
              <p className="text-slate-400 text-lg mb-12 font-medium">Professional Psychological First Aid.</p>
              
              <div className="space-y-4">
                <button onClick={() => setAuthView('signup')} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3">
                  Get Started <ArrowRight size={20} />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleAuth} className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-bold transition-all flex items-center justify-center gap-2">
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" /> Google
                  </button>
                  <button onClick={handleAuth} className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl font-bold transition-all flex items-center justify-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 invert" alt="Apple" /> Apple ID
                  </button>
                </div>
                <button onClick={() => setAuthView('login')} className="w-full py-4 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mt-4">
                  I have an account
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right duration-300">
              <button onClick={() => setAuthView('landing')} className="text-slate-500 hover:text-white mb-8 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors">
                <ArrowRight size={14} className="rotate-180" /> Back
              </button>
              <h2 className="text-4xl font-bold mb-2">{authView === 'login' ? 'Welcome Back' : 'Create Identity'}</h2>
              <p className="text-slate-500 mb-10">{authView === 'login' ? 'Continue your journey to clarity.' : 'Build your private reflection space.'}</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                {authView === 'signup' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={authData.displayName}
                        onChange={e => setAuthData({...authData, displayName: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">@Handle</label>
                      <input 
                        type="text" 
                        required
                        value={authData.handle}
                        onChange={e => setAuthData({...authData, handle: e.target.value})}
                        placeholder="johndoe"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={authData.email}
                      onChange={e => setAuthData({...authData, email: e.target.value})}
                      placeholder="name@company.com"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
                  <div className="relative">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      required
                      value={authData.password}
                      onChange={e => setAuthData({...authData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                
                <button type="submit" disabled={auth.isLoading} className="w-full py-5 bg-primary theme-transition text-black font-black uppercase tracking-widest rounded-2xl mt-8 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  {auth.isLoading ? <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" /> : <Fingerprint size={20} />}
                  {authView === 'login' ? 'Verify Identity' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 opacity-50">
            <Shield size={20} /> <Lock size={20} /> <UserCheck size={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col theme-transition">
      <nav className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Logo size={40} />
            <span className="text-2xl font-black tracking-[0.2em] text-lg hidden sm:block">NOVA CARE</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('home')} className={`font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'home' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>Home</button>
            <button onClick={() => setActiveTab('session')} className={`font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'session' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>Sessions</button>
            <button onClick={() => setActiveTab('meditation')} className={`font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'meditation' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>Meditations</button>
            <button onClick={() => setActiveTab('journal')} className={`font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === 'journal' ? 'text-white' : 'text-slate-500 hover:text-white'}`}>Reflections</button>
            
            <div className="h-6 w-px bg-white/10" />

            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"
            >
                <Settings size={20} />
            </button>

            <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 p-1.5 pl-4 pr-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
              <span className="text-xs font-bold text-slate-300">@{auth.user?.handle}</span>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                 <img src={auth.user?.avatarUrl} className="w-full h-full object-cover" />
              </div>
            </button>
          </div>

          <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-8 pb-24">
        {renderContent()}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={auth.user!} 
        onUpdate={updateProfile} 
        onLogout={logout} 
        theme={theme} 
        onThemeChange={(t) => { setTheme(t); }} 
      />

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-50">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-primary' : 'text-slate-500'}><Logo size={24} /></button>
        <button onClick={() => setActiveTab('session')} className={activeTab === 'session' ? 'text-primary' : 'text-slate-500'}><Brain size={24} /></button>
        <button onClick={() => setActiveTab('meditation')} className={activeTab === 'meditation' ? 'text-primary' : 'text-slate-500'}><Sparkles size={24} /></button>
        <button onClick={() => setActiveTab('journal')} className={activeTab === 'journal' ? 'text-primary' : 'text-slate-500'}><BookHeart size={24} /></button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-primary' : 'text-slate-500'}><UserIcon size={24} /></button>
      </div>

      {/* Meditation Player Overlay */}
      {selectedMeditation && (
        <MeditationPlayer 
          meditation={selectedMeditation} 
          onClose={() => setSelectedMeditation(null)} 
        />
      )}
    </div>
  );
};

export default App;
