
import React, { useState } from 'react';
import { 
  User, Camera, Shield, ArrowRight, ArrowLeft, 
  Check, Sparkles, Globe, Heart, Briefcase, 
  UserCircle, Image as ImageIcon, AtSign
} from 'lucide-react';
import { UserProfile, SocialLink } from '../types';

interface ProfileSetupWizardProps {
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({ ...user });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = () => {
    onComplete({ ...profile, hasCompletedSetup: true });
  };

  const steps = [
    { id: 1, title: 'Identity', icon: <AtSign size={20} /> },
    { id: 2, title: 'Aesthetic', icon: <Camera size={20} /> },
    { id: 3, title: 'The Vault', icon: <Shield size={20} /> },
    { id: 4, title: 'Connections', icon: <Globe size={20} /> }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl bg-slate-900/50 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`flex flex-col items-center gap-2 group transition-all`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= s.id ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-white/10 text-slate-500'
                }`}>
                  {step > s.id ? <Check size={20} /> : s.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-white' : 'text-slate-600'}`}>
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 rounded-full transition-all ${step > s.id ? 'bg-cyan-500' : 'bg-white/5'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Claim Your Voice</h2>
                <p className="text-slate-400">How should Nova and the world recognize you?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.displayName}
                    onChange={e => setProfile({...profile, displayName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Bio / Philosophy</label>
                  <textarea 
                    value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    placeholder="E.g. Seeking balance in a digital world."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Visual Aura</h2>
                <p className="text-slate-400">Personalize your space with professional imagery.</p>
              </div>
              <div className="flex flex-col items-center gap-10">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-900 overflow-hidden relative">
                    <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-cyan-500 text-black rounded-xl shadow-lg">
                    <Sparkles size={16} />
                  </button>
                </div>

                <div className="w-full space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Cover Canvas</label>
                  <div className="h-32 w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Upload Landscape Art</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">The Identity Vault</h2>
                <p className="text-slate-400">This metadata helps Nova specialize your care.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Primary Role', key: 'primaryRole', options: ['Professional', 'Student', 'Creative', 'Parent'] },
                  { label: 'Age Bracket', key: 'ageRange', options: ['18-24', '25-34', '35-44', '45+'] },
                  { label: 'Work Environment', key: 'workType', options: ['Remote', 'Office', 'Hybrid', 'Freelance'] },
                  { label: 'Focus Priority', key: 'careRole', options: ['Self-Care', 'Anxiety', 'Performance', 'Rest'] }
                ].map(field => (
                  <div key={field.label} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{field.label}</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                      onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                    >
                      {field.options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Digital Footprint</h2>
                <p className="text-slate-400">Bridge your profile with your professional presence.</p>
              </div>
              <div className="space-y-4">
                {['LinkedIn', 'Instagram', 'X', 'Web'].map(platform => (
                  <div key={platform} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl group focus-within:border-cyan-500/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center text-slate-400 group-focus-within:text-cyan-400">
                      <Globe size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder={`${platform} URL...`}
                      className="flex-grow bg-transparent outline-none text-white text-sm"
                    />
                  </div>
                ))}
                
                <div className="pt-6 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Shield className="text-emerald-500" size={20} />
                    <span className="text-xs font-bold text-slate-200">Private Profile Mode</span>
                  </div>
                  <button 
                    onClick={() => setProfile({...profile, isPrivate: !profile.isPrivate})}
                    className={`w-12 h-6 rounded-full transition-all relative ${profile.isPrivate ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.isPrivate ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className={`flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-all disabled:opacity-0`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < 4 ? (
            <button 
              onClick={nextStep}
              className="px-10 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Enter Nova Space <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
