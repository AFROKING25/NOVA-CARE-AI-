
export enum SessionType {
  VOICE = 'VOICE',
  TEXT = 'TEXT'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  date: Date;
  mood: string;
  note: string;
  insights?: string;
}

export interface VoiceSessionState {
  isActive: boolean;
  isListening: boolean;
  transcription: string;
}

export type IntensityStage = 1 | 2 | 3 | 4;

export interface TherapySession {
  id: string;
  date: Date;
  messages: Message[];
  intensity: IntensityStage | null;
  summary?: string;
}

export interface SocialLink {
  platform: 'X' | 'Instagram' | 'LinkedIn' | 'Web' | 'Snapchat';
  url: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  joinDate: string;
  
  // Psychological Metadata
  ageRange?: string;
  primaryRole?: string;
  educationLevel?: string;
  workType?: string;
  careRole?: string;
  stressFocus?: string[];
  additionalContext?: string;
  hasCompletedSetup?: boolean;
  
  // Metrics
  sessionsCount: number;
  streakDays: number;
  exercisesCompleted: number;

  // Professional/Social
  socialLinks?: SocialLink[];
  isPrivate: boolean;
  isDiscoveryEnabled: boolean;
  aiCoachingEnabled: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface ZenVideo {
  id: string;
  prompt: string;
  url: string;
  date: Date;
}
