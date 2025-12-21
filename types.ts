
export interface Project {
  id: string;
  name: string;
  description: string;
  track: string;
  techStack: string[];
  teamSize: number;
  // Enriched fields from CSV
  hasDemo: boolean;
  hasGithub: boolean;
  hasVideo: boolean;
  contentLength: number;
  keywords: string[];
  githubUrl?: string;
  demoUrl?: string;
  youtubeUrl?: string;
  // Computed fields
  category?: string;
  effortScore?: number;
}

// Category definitions for auto-tagging
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Health': ['medical', 'doctor', 'health', 'patient', 'diagnosis', 'triage', 'mental', 'therapy', 'hospital', 'clinic', 'wellness'],
  'Education': ['tutor', 'learning', 'student', 'study', 'course', 'quiz', 'teach', 'school', 'education', 'classroom'],
  'Finance': ['crypto', 'stock', 'invest', 'finance', 'budget', 'trading', 'bank', 'payment', 'money'],
  'Accessibility': ['blind', 'deaf', 'sign language', 'disability', 'braille', 'accessible', 'impair'],
  'DevTools': ['code', 'debug', 'ide', 'terminal', 'sql', 'cloud', 'developer', 'api', 'github', 'programming'],
  'Legal': ['legal', 'law', 'lawyer', 'attorney', 'court', 'rights', 'contract', 'compliance'],
  'Creative': ['art', 'music', 'design', 'creative', 'image', 'video', 'photo', 'story', 'write', 'content'],
  'Productivity': ['automation', 'workflow', 'productivity', 'task', 'schedule', 'organize', 'assistant'],
  'Social': ['social', 'community', 'chat', 'connect', 'network', 'friend', 'family'],
};

export interface AIState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
  mode: 'idle' | 'synthesis' | 'vc' | 'chat' | 'prd';
}

export type TabView = 'dashboard' | 'discovery' | 'ai-lab';

export interface ChartData {
  name: string;
  value: number;
}

export type Language = 'en' | 'es';