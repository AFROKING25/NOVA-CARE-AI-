import React, { useState, useEffect, useRef } from 'react';
import { Meditation } from '../types';
import { generateSpeech } from '../services/meditationService';
import { X, Play, Pause, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';

interface MeditationPlayerProps {
  meditation: Meditation;
  onClose: () => void;
}

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ meditation, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playStep = async (index: number) => {
    if (index >= meditation.script.length) {
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    const audioBase64 = await generateSpeech(meditation.script[index]);
    setIsLoading(false);

    if (audioBase64) {
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.muted = isMuted;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Fallback if TTS fails - just wait a bit and move on or show text
      console.warn("TTS failed, skipping audio");
      setTimeout(() => {
        if (isPlaying) handleNext();
      }, 5000);
    }
  };

  useEffect(() => {
    if (isPlaying && !isLoading && (!audioRef.current?.src || audioRef.current.ended)) {
      playStep(currentStep);
    }
  }, [isPlaying, currentStep]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current?.src) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        playStep(currentStep);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < meditation.script.length - 1) {
      setCurrentStep(prev => prev + 1);
      audioRef.current?.pause();
      // playStep will be triggered by useEffect
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      audioRef.current?.pause();
    }
  };

  const handleAudioEnded = () => {
    if (currentStep < meditation.script.length - 1) {
      // Wait a few seconds between steps for better pacing
      setTimeout(() => {
        handleNext();
      }, 2000);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
      >
        <X size={24} />
      </button>

      <div className="max-w-3xl w-full flex flex-col items-center text-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
          <div className={`absolute inset-0 rounded-full bg-primary/20 blur-[60px] transition-all duration-1000 ${isPlaying ? 'scale-150 opacity-60' : 'scale-100 opacity-20'}`} />
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
            <img 
              src={meditation.image} 
              alt={meditation.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-12 min-h-[120px] flex items-center justify-center px-4">
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white/90 italic">
            "{meditation.script[currentStep]}"
          </p>
        </div>

        <div className="w-full bg-white/5 h-1.5 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep + 1) / meditation.script.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-4 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <button 
            onClick={handleTogglePlay}
            className="w-24 h-24 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-primary/20"
          >
            {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
          </button>

          <button 
            onClick={handleNext}
            disabled={currentStep === meditation.script.length - 1}
            className="p-4 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
            Step {currentStep + 1} of {meditation.script.length}
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </div>
  );
};
