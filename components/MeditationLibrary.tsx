import React from 'react';
import { meditations } from '../services/meditationService';
import { Meditation } from '../types';
import { Play, Clock, Sparkles, Moon, Zap } from 'lucide-react';

interface MeditationLibraryProps {
  onSelect: (meditation: Meditation) => void;
}

export const MeditationLibrary: React.FC<MeditationLibraryProps> = ({ onSelect }) => {
  const categories = [
    { id: 'relaxation', icon: <Sparkles size={18} />, label: 'Relaxation', color: 'text-cyan-400' },
    { id: 'focus', icon: <Zap size={18} />, label: 'Focus', color: 'text-amber-400' },
    { id: 'sleep', icon: <Moon size={18} />, label: 'Sleep', color: 'text-indigo-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Guided <span className="text-primary">Meditations</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Select a journey to ground your mind and restore your emotional balance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {meditations.map((meditation) => (
          <div 
            key={meditation.id}
            className="glass-panel rounded-[2.5rem] overflow-hidden group hover:border-primary/40 transition-all duration-500 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={meditation.image} 
                alt={meditation.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5 ${
                  meditation.category === 'relaxation' ? 'text-cyan-400' : 
                  meditation.category === 'focus' ? 'text-amber-400' : 'text-indigo-400'
                }`}>
                  {categories.find(c => c.id === meditation.category)?.icon}
                  {meditation.category}
                </span>
              </div>
            </div>

            <div className="p-8 flex-grow flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
                <Clock size={14} /> {meditation.duration}
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{meditation.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                {meditation.description}
              </p>
              
              <button 
                onClick={() => onSelect(meditation)}
                className="w-full py-4 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary rounded-2xl font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Play size={18} className="fill-current" />
                Begin Journey
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
