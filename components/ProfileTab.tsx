
import React, { useState } from 'react';
import { 
  User, Mail, AtSign, Calendar, Edit3, Shield, 
  Target, Award, BookOpen, Activity, Settings, 
  Camera, CheckCircle, Lock, Share2, Globe, 
  Instagram, Linkedin, Twitter
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileTabProps {
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const stats = [
    { label: 'Deep Sessions', value: user.sessionsCount, icon: <Activity size={18} />, color: 'text-cyan-400' },
    { label: 'Growth Streak', value: `${user.streakDays}d`, icon: <Award size={18} />, color: 'text-amber-400' },
    { label: 'Exercises', value: user.exercisesCompleted, icon: <BookOpen size={18} />, color: 'text-emerald-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cover and Avatar Section */}
      <div className="relative mb-20">
        <div className="h-48 md:h-64 w-full rounded-[2.5rem] bg-gradient-to-r from-cyan-900/40 via-slate-900 to-indigo-900/40 border border-white/5 overflow-hidden">
          {user.coverUrl ? (
            <img src={user.coverUrl} className="w-full h-full object-cover opacity-60" alt="Cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Camera size={48} />
            </div>
          )}
        </div>
        
        <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-950 border-4 border-slate-950 overflow-hidden shadow-2xl">
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`} 
                className="w-full h-full object-cover" 
                alt="Avatar" 
              />
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-slate-950 rounded-full" />
          </div>
          
          <div className="pb-4 hidden md:block">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {user.displayName} <CheckCircle className="text-cyan-400" size={20} />
            </h2>
            <p className="text-slate-400 font-medium">@{user.handle}</p>
          </div>
        </div>

        <div className="absolute -bottom-12 right-8 flex gap-3">
          <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full font-bold text-sm transition-all flex items-center gap-2">
            <Edit3 size={16} /> Edit Profile
          </button>
          <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        {/* Bio and Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">About</h3>
            <p className="text-slate-200 leading-relaxed mb-6">
              {user.bio || "Crafting clarity through Nova Care. Every reflection is a step toward balance."}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={16} /> {user.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Calendar size={16} /> Joined {new Date(user.joinDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Lock size={16} /> {user.isPrivate ? 'Protected' : 'Public'} Identity
              </div>
              
              {/* Social Link Display */}
              <div className="flex gap-4 pt-2">
                <Globe size={18} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
                <Linkedin size={18} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
                <Instagram size={18} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
                <Twitter size={18} className="text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Mindfulness Metrics</h3>
            <div className="grid grid-cols-1 gap-4">
              {stats.map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={s.color}>{s.icon}</div>
                    <span className="text-xs font-bold text-slate-300">{s.label}</span>
                  </div>
                  <span className="text-lg font-black text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Identity Vault Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield size={24} className="text-cyan-400" /> Identity Vault
                </h3>
                <p className="text-xs text-slate-500 font-medium">Psychological context used for personalized care.</p>
              </div>
              <Share2 size={20} className="text-slate-600 cursor-pointer hover:text-white transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Role</span>
                <p className="text-white font-bold">{user.primaryRole || "Not Specified"}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus Areas</span>
                <div className="flex flex-wrap gap-2">
                  {user.stressFocus?.length ? user.stressFocus.map(f => (
                    <span key={f} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-md text-[10px] font-black border border-cyan-500/20">{f}</span>
                  )) : <p className="text-white font-bold">Generic Wellness</p>}
                </div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Age Bracket</span>
                <p className="text-white font-bold">{user.ageRange || "Undisclosed"}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Work Ecosystem</span>
                <p className="text-white font-bold">{user.workType || "Self-Empowered"}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Growth Target</h4>
                  <p className="text-xs text-slate-400">Consistently complete 3 sessions per week to reach 'Clarity Mastery'.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
