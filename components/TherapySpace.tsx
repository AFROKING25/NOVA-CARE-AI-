
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { 
  Send, User, Sparkles, Loader2, Mic, MicOff, Settings2, Upload, Volume2, 
  CheckCircle2, AlertCircle, Play, Square, UserCircle, ShieldAlert, 
  ChevronRight, Info, X, Heart, UserPlus, ArrowRight, History, Plus, 
  MessageSquare, ChevronDown, ChevronUp, Layers, TrendingUp, BarChart3,
  AudioLines, Wind, Eye, Video, Download, RefreshCw, Zap, Brain, Activity,
  Globe, BrainCircuit, Headphones, Compass, Leaf, PencilLine, Mountain, Camera,
  Clock
} from 'lucide-react';
import { decode, encode, decodeAudioData, createPcmBlob } from '../utils/audio';
import { SessionControls } from './SessionControls';
import { CrisisModal } from './CrisisModal';
import { Message, UserProfile, IntensityStage, TherapySession, JournalEntry, ZenVideo } from '../types';

const BASE_INSTRUCTION = `You are NOVA CARE AI — a psychological first-aid AI designed to provide immediate emotional support, grounding, and clarity.
Your role is to stabilize users emotionally. You provide "First Aid" for the mind.
You act with radical empathy, using CBT and grounding techniques.
If you notice high distress (Stage 4), escalate immediately.
You are equipped with "Zen Vision" (visual generation) and "Interactive Exercises".`;

const GROUNDING_STEPS = [
  { title: "5 THINGS YOU SEE", prompt: "Acknowledge 5 things you see around you. Maybe a bird, a clock, or a spot on the wall." },
  { title: "4 THINGS YOU FEEL", prompt: "Acknowledge 4 things you can touch. Your hair, a chair, or the ground under your feet." },
  { title: "3 THINGS YOU HEAR", prompt: "Acknowledge 3 things you hear. Traffic, a fan, or your own breath." },
  { title: "2 THINGS YOU SMELL", prompt: "Acknowledge 2 things you can smell. Coffee, fresh air, or even your own shirt." },
  { title: "1 THING YOU TASTE", prompt: "Acknowledge 1 thing you can taste. Mint, your last meal, or just the inside of your mouth." }
];

export const TherapySpace: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nova_auth_session');
    return saved ? JSON.parse(saved) : {};
  });

  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showMoodInsights, setShowMoodInsights] = useState(false);
  const [showZenVision, setShowZenVision] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoricalSession, setSelectedHistoricalSession] = useState<TherapySession | null>(null);
  const [groundingStep, setGroundingStep] = useState(0);
  const [zenPrompt, setZenPrompt] = useState('');
  const [zenImage, setZenImage] = useState<string | null>(null);
  const [isGeneratingZen, setIsGeneratingZen] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  
  const [thinkingMode, setThinkingMode] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', content: `Hello ${userProfile.displayName || 'there'}. I'm Nova. I'm here to listen. How intense is your distress right now?`, timestamp: new Date() }
  ]);

  const [sessions, setSessions] = useState<TherapySession[]>(() => {
    const saved = localStorage.getItem('nova_sessions');
    return saved ? JSON.parse(saved).map((s: any) => ({ ...s, date: new Date(s.date) })) : [];
  });

  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [auraColor, setAuraColor] = useState('rgba(34, 211, 238, 0.05)');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  const [hasCompletedTriage, setHasCompletedTriage] = useState(false);
  const [intensity, setIntensity] = useState<IntensityStage | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedHistoricalSession]);

  const getSystemInstruction = useCallback(() => {
    let context = `\n\nUSER IDENTITY:\n- Name: ${userProfile.displayName}\n- Handle: @${userProfile.handle}\n`;
    if (intensity) context += `- Current Distress Intensity: Stage ${intensity}\n`;
    return BASE_INSTRUCTION + context;
  }, [userProfile, intensity]);

  const handleTriageResponse = async (level: IntensityStage) => {
    setIntensity(level);
    setHasCompletedTriage(true);
    const label = level === 1 ? "Manageable" : level === 2 ? "Moderate" : "Heavy";
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: label, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    await sendToModel(userMsg.content, [...messages, userMsg]);
  };

  const sendToModel = async (content: string, currentMessages: Message[]) => {
    setIsTyping(true);
    setAuraColor(thinkingMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(34, 211, 238, 0.1)');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = thinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const config: any = { systemInstruction: getSystemInstruction() };
      if (thinkingMode) config.thinkingConfig = { thinkingBudget: 16000 };
      if (searchMode && !thinkingMode) config.tools = [{ googleSearch: {} }];

      const response = await ai.models.generateContent({ model, contents: content, config });
      
      let finalContent = response.text || "I'm with you.";
      
      if (searchMode && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const links = response.candidates[0].groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web)
          .filter((web: any) => web && web.uri)
          .map((web: any) => `\n- [${web.title || 'Source'}](${web.uri})`)
          .join('');
        
        if (links) {
          finalContent += `\n\nSources:${links}`;
        }
      }

      const modelMsg: Message = { id: Date.now().toString(), role: 'model', content: finalContent, timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setAuraColor('rgba(34, 211, 238, 0.05)');
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim() || isTyping || !hasCompletedTriage) return;
    const content = textInput.trim();
    setTextInput('');
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content, 
      timestamp: new Date() 
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    await sendToModel(content, updatedMessages);
  };

  const startLiveVoice = async () => {
    if (isActive) return;
    setIsActive(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputAudioContextRef.current = outputAudioContext;
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputAudioContext.createMediaStreamSource(stream);
          const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const pcmBlob = createPcmBlob(e.inputBuffer.getChannelData(0));
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: () => setIsActive(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: getSystemInstruction() + " You are in a Live Voice Session. Be brief and warm."
      }
    });
    sessionPromiseRef.current = sessionPromise;
  };

  const stopLiveVoice = () => {
    setIsActive(false);
    sessionPromiseRef.current?.then(s => s.close());
    outputAudioContextRef.current?.close();
  };

  const generateZen = async () => {
    if (!zenPrompt.trim()) return;
    setIsGeneratingZen(true);
    setZenImage(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `A hyper-realistic, meditative, calming zen masterpiece of: ${zenPrompt}. Soft lighting, detailed textures, high resolution, 4k.`,
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) setZenImage(`data:image/png;base64,${part.inlineData.data}`);
    } catch (e) { console.error(e); } finally { setIsGeneratingZen(false); }
  };

  const saveCurrentSession = async () => {
    if (messages.length < 2 || isSavingSession) return;
    setIsSavingSession(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Summarize this therapeutic session in 1-2 sentences. Focus on the core concern and the progress made. Messages: ${JSON.stringify(messages.map(m => m.content))}`;
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: { systemInstruction: "You are a concise medical scribe." }
      });

      const newSession: TherapySession = {
        id: Date.now().toString(),
        date: new Date(),
        messages: messages,
        intensity: intensity,
        summary: response.text || "Session completed."
      };

      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem('nova_sessions', JSON.stringify(updated));
      
      // Reset for new session
      setMessages([{ id: 'welcome', role: 'model', content: `Session saved. How are you feeling now?`, timestamp: new Date() }]);
      setHasCompletedTriage(false);
      setIntensity(null);
    } catch (e) {
      console.error("Failed to save session", e);
    } finally {
      setIsSavingSession(false);
    }
  };

  const deleteSessionFromHistory = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('nova_sessions', JSON.stringify(updated));
    if (selectedHistoricalSession?.id === id) setSelectedHistoricalSession(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 relative">
      <div className="fixed inset-0 pointer-events-none transition-colors duration-1000 z-0" style={{ backgroundColor: auraColor }} />
      <div className="w-full glass-panel rounded-[3rem] border border-white/10 flex flex-col h-[85vh] relative overflow-hidden shadow-2xl z-10">
        
        {/* Navigation Bar */}
        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md">
          <div className="flex gap-2">
            <button onClick={() => setShowZenVision(true)} className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl hover:bg-cyan-500/20 transition-all text-cyan-400 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <Eye size={18} /> Zen Vision
            </button>
            <button onClick={() => setShowGrounding(true)} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all text-emerald-400 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <Wind size={18} /> Grounding
            </button>
            <button onClick={() => setShowHistory(true)} className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl hover:bg-violet-500/20 transition-all text-violet-400 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <History size={18} /> Session History
            </button>
          </div>
          <div className="flex items-center gap-3">
             {messages.length > 2 && !isActive && (
               <button 
                onClick={saveCurrentSession}
                disabled={isSavingSession}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
               >
                 {isSavingSession ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save
               </button>
             )}
             <SessionControls isActive={isActive} isListening={isListening} onStartVoice={startLiveVoice} onStop={stopLiveVoice} onShowCrisis={() => setShowCrisis(true)} />
          </div>
        </div>

        {/* History UI */}
        {showHistory && (
          <div className="absolute inset-0 z-[70] bg-slate-950/98 backdrop-blur-3xl flex animate-in fade-in duration-300">
            {/* Session List */}
            <div className={`w-full ${selectedHistoricalSession ? 'md:w-1/3' : 'w-full'} border-r border-white/5 flex flex-col`}>
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase"><Clock className="text-violet-400" /> History</h3>
                <button onClick={() => { setShowHistory(false); setSelectedHistoricalSession(null); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={24}/></button>
              </div>
              <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-4">
                {sessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
                    <History size={48} className="mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">No saved sessions yet</p>
                  </div>
                ) : (
                  sessions.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setSelectedHistoricalSession(s)}
                      className={`w-full p-6 text-left rounded-[2rem] border transition-all group ${selectedHistoricalSession?.id === s.id ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(s.date).toLocaleDateString()}</span>
                        {s.intensity && <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-black rounded-md uppercase">Stage {s.intensity}</span>}
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-relaxed mb-4">{s.summary}</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{s.messages.length} exchanges</span>
                         <div onClick={(e) => { e.stopPropagation(); deleteSessionFromHistory(s.id); }} className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                         </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Session Detail (Historical View) */}
            {selectedHistoricalSession && (
              <div className="hidden md:flex flex-grow flex-col animate-in slide-in-from-right duration-500">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                  <div>
                    <h4 className="text-xs font-black text-violet-400 uppercase tracking-[0.2em]">Archived Reflection</h4>
                    <p className="text-slate-500 text-sm font-bold">{new Date(selectedHistoricalSession.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedHistoricalSession(null)} className="md:hidden p-2 text-slate-400"><X size={24}/></button>
                </div>
                <div className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/20">
                  <div className="p-8 bg-violet-500/5 border border-violet-500/20 rounded-[2.5rem] mb-12">
                     <h5 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Core Summary</h5>
                     <p className="text-xl text-slate-200 font-medium leading-relaxed italic">"{selectedHistoricalSession.summary}"</p>
                  </div>
                  {selectedHistoricalSession.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10 text-slate-400' : 'bg-violet-500/10 text-violet-400'}`}>
                          {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                        </div>
                        <div className={`p-5 rounded-[1.5rem] text-sm ${msg.role === 'user' ? 'bg-white text-black font-medium' : 'bg-white/5 text-slate-300 border border-white/5'}`}>
                          <p className="leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zen Vision UI */}
        {showZenVision && (
          <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl p-10 flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3"><Eye className="text-cyan-400" /> Zen Vision</h3>
              <button onClick={() => { setShowZenVision(false); setZenImage(null); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={24}/></button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center gap-8">
              {zenImage ? (
                <div className="w-full max-w-4xl animate-in zoom-in-95 duration-1000">
                   <img src={zenImage} className="w-full rounded-[2.5rem] shadow-[0_0_50px_rgba(34,211,238,0.2)] border border-white/10" alt="Zen" />
                   <button onClick={() => setZenImage(null)} className="mt-6 mx-auto flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase tracking-widest text-xs">New Vision</button>
                </div>
              ) : (
                <div className="max-w-xl w-full space-y-8 text-center">
                  <p className="text-slate-400 text-lg">Describe a place where your mind finds complete silence.</p>
                  <div className="relative">
                    <input 
                      value={zenPrompt}
                      onChange={e => setZenPrompt(e.target.value)}
                      placeholder="e.g. A bioluminescent forest after rain..."
                      className="w-full bg-white/5 border border-white/10 rounded-full py-6 px-10 text-white text-xl outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button 
                      onClick={generateZen}
                      disabled={isGeneratingZen || !zenPrompt}
                      className="absolute right-3 top-3 bottom-3 px-8 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-all disabled:opacity-20"
                    >
                      {isGeneratingZen ? <Loader2 className="animate-spin" /> : 'Manifest'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grounding UI */}
        {showGrounding && (
          <div className="absolute inset-0 z-[60] bg-emerald-950/95 backdrop-blur-3xl p-10 flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3"><Wind className="text-emerald-400" /> Sensory Grounding</h3>
              <button onClick={() => { setShowGrounding(false); setGroundingStep(0); }} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={24}/></button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-10">
              <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center text-4xl text-emerald-400 font-black animate-pulse">
                {5 - groundingStep}
              </div>
              <div className="space-y-4">
                <h4 className="text-4xl font-bold text-white">{GROUNDING_STEPS[groundingStep].title}</h4>
                <p className="text-xl text-slate-300 leading-relaxed">{GROUNDING_STEPS[groundingStep].prompt}</p>
              </div>
              <button 
                onClick={() => groundingStep < 4 ? setGroundingStep(s => s + 1) : setShowGrounding(false)}
                className="px-16 py-5 bg-white text-emerald-900 rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 transition-all shadow-2xl"
              >
                {groundingStep === 4 ? "I feel centered" : "I've found it"}
              </button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-8 pt-24 space-y-8 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10 text-slate-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                  {msg.role === 'user' ? <User size={24} /> : <Sparkles size={24} />}
                </div>
                <div className={`p-6 rounded-[2rem] ${msg.role === 'user' ? 'bg-white text-black font-medium' : 'bg-white/5 text-slate-200 border border-white/10'}`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.id === 'welcome' && !hasCompletedTriage && (
                    <div className="mt-6 grid grid-cols-1 gap-2">
                      {[1, 2, 3].map(l => (
                        <button key={l} onClick={() => handleTriageResponse(l as IntensityStage)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all flex justify-between items-center group">
                          <span className="text-sm font-bold">Stage {l}: {l === 1 ? 'Mild' : l === 2 ? 'Moderate' : 'Heavy'}</span>
                          <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="flex gap-2 px-12"><div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" /></div>}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white/5 backdrop-blur-2xl border-t border-white/5 flex flex-col gap-4">
          <div className="flex gap-4">
            <button onClick={() => setThinkingMode(!thinkingMode)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${thinkingMode ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-white/5 text-slate-500 border-transparent'}`}>DEEP REFLECTION {thinkingMode ? 'ON' : 'OFF'}</button>
            <button onClick={() => setSearchMode(!searchMode)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${searchMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-slate-500 border-transparent'}`}>WEB GROUNDING {searchMode ? 'ON' : 'OFF'}</button>
          </div>
          <form onSubmit={e => { e.preventDefault(); handleSendText(); }} className="flex gap-4 max-w-6xl mx-auto w-full">
            <input 
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Share your thoughts..."
              disabled={isActive || !hasCompletedTriage || isTyping}
              className="flex-grow bg-black/30 border border-white/10 rounded-full py-5 px-8 text-white outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-30"
            />
            <button type="submit" disabled={!textInput.trim() || isTyping} className="p-5 bg-cyan-500 text-black rounded-full hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-20">
              <Send size={28} />
            </button>
          </form>
        </div>
      </div>
      <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
    </div>
  );
};

const Trash2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 9 2 2 4-4" />
  </svg>
);
