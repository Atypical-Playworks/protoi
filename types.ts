
export interface Project {
  id: string;
  name: string;
  description: string;
  track: string; // e.g., Health, Fintech, Edu
  techStack: string[];
  teamSize: number;
}

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