
import React, { useState, useMemo } from 'react';
import { Book, Save, Trash2, Calendar, TrendingUp, Sparkles, Brain, Loader2 } from 'lucide-react';
import { JournalEntry } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const moodToValue: Record<string, number> = {
  '😊': 5, '😐': 3, '😔': 2, '😫': 1, '😡': 1, '😴': 2,
};

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('nova_journal');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [mood, setMood] = useState('😊');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalInsights, setGlobalInsights] = useState(localStorage.getItem('nova_global_insights') || '');

  const analyzeJourney = async () => {
    if (entries.length < 3) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze these journal entries and provide high-level emotional insights. What triggers do you see? What growth is happening? Be empathetic and professional. Entries: ${JSON.stringify(entries.map(e => e.note))}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
      setGlobalInsights(response.text || '');
      localStorage.setItem('nova_global_insights', response.text || '');
    } catch (e) {} finally { setIsAnalyzing(false); }
  };

  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(entry => ({
        date: entry.date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: moodToValue[entry.mood] || 3, mood: entry.mood, timestamp: entry.date.getTime()
      }));
  }, [entries]);

  const saveEntry = () => {
    if (!newNote.trim()) return;
    const entry: JournalEntry = { id: Date.now().toString(), date: new Date(), mood, note: newNote };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('nova_journal', JSON.stringify(updated));
    setNewNote('');
  };

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#22d3ee';

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <Book className="text-cyan-400" size={48} /> Reflection Lab
          </h2>
          <p className="text-slate-400 text-lg">Document the chaos. Nova extracts the clarity. Your journal is a living map of your recovery.</p>
        </div>
        <button 
          onClick={analyzeJourney} 
          disabled={entries.length < 3 || isAnalyzing}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-cyan-400 font-bold hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-20"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" /> : <Brain size={24} />}
          AI Pattern Recognition
        </button>
      </div>

      {globalInsights && (
        <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[3rem] animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-cyan-400 font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-2">
            <Sparkles size={16} /> Nova's Synthesis
          </h3>
          <p className="text-slate-200 text-lg leading-relaxed italic">"{globalInsights}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Current Emotional Frequency</label>
            <div className="flex flex-wrap gap-4">
              {['😊', '😐', '😔', '😫', '😡', '😴'].map(m => (
                <button key={m} onClick={() => setMood(m)} className={`text-3xl p-4 rounded-2xl transition-all ${mood === m ? 'bg-cyan-500/20 ring-2 ring-cyan-500' : 'bg-white/5 hover:bg-white/10'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="What's floating in your mind? Let it spill onto the page..."
            className="w-full h-64 p-8 bg-white/5 border border-white/10 rounded-[2rem] text-white text-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none transition-all"
          />
          <button onClick={saveEntry} className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-tighter rounded-[2rem] hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3">
            <Save size={24} /> Seal this moment
          </button>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <TrendingUp size={16} /> Mood Volatility Graph
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={[0, 6]} />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl">
                      <p className="text-2xl">{payload[0].payload.mood}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{payload[0].payload.date}</p>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
            {entries.map(e => (
              <div key={e.id} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] group relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl bg-black/40 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner">{e.mood}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase">{e.date.toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-700">{e.date.toLocaleTimeString()}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed">{e.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
