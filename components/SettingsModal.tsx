
import React from 'react';
import { 
  X, Shield, Bell, User, Lock, Globe, 
  CreditCard, LogOut, ChevronRight, Zap, 
  Eye, Heart, Sparkles, MessageSquare, 
  Smartphone, Share2
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  theme: 'midnight' | 'forest' | 'rose' | 'lavender';
  onThemeChange: (theme: 'midnight' | 'forest' | 'rose' | 'lavender') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, user, onUpdate, onLogout, theme, onThemeChange 
}) => {
  if (!isOpen) return null;

  const themes: { id: 'midnight' | 'forest' | 'rose' | 'lavender'; label: string; color: string }[] = [
    { id: 'midnight', label: 'MIDNIGHT', color: '#22d3ee' },
    { id: 'forest', label: 'FOREST', color: '#065f46' },
    { id: 'rose', label: 'ROSE', color: '#881337' },
    { id: 'lavender', label: 'LAVENDER', color: '#4c1d95' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] flex flex-col max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">Account Center</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Settings & Preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-12">
          
          {/* THEME SWITCHER - AS PER SCREENSHOT */}
          <section className="space-y-6">
            <div className="border border-indigo-300/40 rounded-sm p-8 bg-slate-950/20">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">CHOOSE YOUR ATMOSPHERE</h3>
              <div className="flex justify-center items-end gap-6 md:gap-8">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className="flex flex-col items-center gap-3 transition-all group"
                  >
                    <div 
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] transition-all duration-300 ${theme === t.id ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: t.color }}
                    />
                    <span className={`text-[10px] font-black tracking-widest text-center transition-colors ${theme === t.id ? 'text-white' : 'text-slate-600'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* DISCOVERY SETTINGS */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Discovery & Presence</h3>
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 divide-y divide-white/5">
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Public Profile</h4>
                    <p className="text-xs text-slate-500">Allow others to see your growth stats</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate({ isPrivate: !user.isPrivate })}
                  className={`w-12 h-6 rounded-full transition-all relative ${!user.isPrivate ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!user.isPrivate ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">AI Active Coaching</h4>
                    <p className="text-xs text-slate-500">Enable proactive AI suggestions</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdate({ aiCoachingEnabled: !user.aiCoachingEnabled })}
                  className={`w-12 h-6 rounded-full transition-all relative ${user.aiCoachingEnabled ? 'bg-violet-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.aiCoachingEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* SUBSCRIPTION */}
          <section className="space-y-6">
            <div className="p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl border border-amber-500/30 flex items-center justify-between group cursor-pointer hover:border-amber-400 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Nova Premium</h4>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-1">Unlock Unlimited Deep Reflection</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Upgrade</button>
            </div>
          </section>

          {/* ACCOUNT SECURITY */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Account Security</h3>
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
              {[
                { icon: <Lock size={18} />, label: 'Two-Factor Authentication', status: 'Enabled', color: 'text-emerald-400' },
                { icon: <Smartphone size={18} />, label: 'Device Management', status: '1 Active', color: 'text-slate-400' },
                { icon: <Shield size={18} />, label: 'Privacy Policy & Terms', status: 'Verified', color: 'text-slate-400' }
              ].map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500 group-hover:text-primary transition-colors">{item.icon}</div>
                    <span className="text-sm font-bold text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                    <ChevronRight size={16} className="text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="pt-8 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onLogout}
                className="p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout Session
              </button>
              <button className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Trash2 size={18} /> Delete Identity
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-8">NOVA CARE VERSION 3.2.0 • BUILT WITH RADICAL EMPATHY</p>
          </section>

        </div>
      </div>
    </div>
  );
};

const Trash2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 9 2 2 4-4" />
  </svg>
);
