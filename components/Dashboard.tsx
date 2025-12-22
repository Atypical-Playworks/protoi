
import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../types';
import { Card } from './Card';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  CartesianGrid
} from 'recharts';
import { 
  Rocket, Code, TrendingUp, Target, AlertTriangle, 
  CheckCircle, Github, Video, X, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Modal types for KPI cards
type ModalType = 'demo' | 'github' | 'video' | 'elite' | 'category' | null;

interface DashboardProps {
  projects: Project[];
}

// Brutalist color palette
const COLORS = {
  yellow: '#facc15',
  green: '#4ade80',
  orange: '#f97316',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  cyan: '#22d3ee',
  pink: '#ec4899',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Health': COLORS.red,
  'Education': COLORS.blue,
  'Finance': COLORS.green,
  'Accessibility': COLORS.purple,
  'DevTools': COLORS.yellow,
  'Legal': COLORS.orange,
  'Creative': COLORS.pink,
  'Productivity': COLORS.cyan,
  'Social': '#818cf8',
  'Other': '#6b7280',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-basalt-900 border-2 border-basalt-700 p-3 z-50">
        <p className="text-white font-mono text-xs mb-1 font-bold uppercase">{label}</p>
        <p className="text-yellow-400 font-mono text-sm">
          {payload[0].value} {payload[0].value === 1 ? 'Project' : 'Projects'}
        </p>
      </div>
    );
  }
  return null;
};

// Projects List Modal Component
interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  projects: Project[];
  t: any; // translations object
}

const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, title, projects, t }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  // Use portal to render modal at document.body level
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="relative bg-basalt-900 border-2 border-yellow-400 w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[60vw] max-w-2xl mx-4 flex flex-col animate-fade-in"
        style={{ 
          maxHeight: 'calc(100dvh - 2rem)' // Dynamic viewport height for mobile
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b-2 border-basalt-700">
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-sm sm:text-lg font-bold text-yellow-400 uppercase truncate">{title}</h2>
            <p className="font-mono text-[10px] sm:text-xs text-gray-500">
              {projects.length} {t.dashboard.projects}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-2 hover:bg-basalt-800 transition-colors border border-basalt-700 hover:border-yellow-400"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-yellow-400" />
          </button>
        </div>
        
        {/* Projects List - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4"
          style={{ minHeight: 0 }} // Important for flex scroll
        >
          {projects.length === 0 ? (
            <p className="text-gray-500 font-mono text-sm text-center py-8">
              {t.dashboard.noProjectsCategory}
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {projects.map((project, idx) => (
                <div 
                  key={project.id || idx}
                  className="bg-basalt-800 border border-basalt-700 p-2 sm:p-3 hover:border-yellow-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono text-xs sm:text-sm font-bold text-white truncate">{project.name}</h3>
                      <p className="font-mono text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        {project.hasDemo && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-[8px] sm:text-[10px] font-mono">DEMO</span>
                        )}
                        {project.hasGithub && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-[8px] sm:text-[10px] font-mono">GITHUB</span>
                        )}
                        {project.hasVideo && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-pink-500/20 border border-pink-500/50 text-pink-400 text-[8px] sm:text-[10px] font-mono">VIDEO</span>
                        )}
                        {project.category && project.category !== 'Other' && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-basalt-700 text-gray-400 text-[8px] sm:text-[10px] font-mono">{project.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-0.5 sm:gap-1">
                      {project.demoUrl && (
                        <a 
                          href={project.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 sm:p-1.5 hover:bg-cyan-500/20 transition-colors"
                          title="Demo"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 sm:p-1.5 hover:bg-purple-500/20 transition-colors"
                          title="GitHub"
                        >
                          <Github className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        </a>
                      )}
                      {project.youtubeUrl && (
                        <a 
                          href={project.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 sm:p-1.5 hover:bg-pink-500/20 transition-colors"
                          title="Video"
                        >
                          <Video className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer hint */}
        <div className="flex-shrink-0 border-t border-basalt-700 p-2 text-center">
          <p className="font-mono text-[9px] sm:text-[10px] text-gray-600">
            {t.dashboard.escToClose}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  
  // Debug log to verify data structure
  React.useEffect(() => {
    if (projects.length > 0) {
      console.log('Dashboard received projects:', projects.length);
      console.log('Sample project fields:', {
        hasDemo: projects[0].hasDemo,
        hasGithub: projects[0].hasGithub,
        hasVideo: projects[0].hasVideo,
        category: projects[0].category,
        effortScore: projects[0].effortScore
      });
    }
  }, [projects]);
  
  // ==================== COMPUTED METRICS ====================
  
  // Deployment Rate (% with demo) - with fallback for old data
  const deploymentRate = useMemo(() => {
    if (projects.length === 0) return 0;
    const withDemo = projects.filter(p => p.hasDemo === true).length;
    return Math.round((withDemo / projects.length) * 100);
  }, [projects]);
  
  // GitHub Rate - with fallback
  const githubRate = useMemo(() => {
    if (projects.length === 0) return 0;
    const withGithub = projects.filter(p => p.hasGithub === true).length;
    return Math.round((withGithub / projects.length) * 100);
  }, [projects]);
  
  // Video Rate - with fallback
  const videoRate = useMemo(() => {
    if (projects.length === 0) return 0;
    const withVideo = projects.filter(p => p.hasVideo === true).length;
    return Math.round((withVideo / projects.length) * 100);
  }, [projects]);
  
  // Elite Projects (Demo + GitHub + Video)
  const eliteProjects = useMemo(() => {
    return projects.filter(p => p.hasDemo && p.hasGithub && p.hasVideo);
  }, [projects]);
  const eliteCount = eliteProjects.length;
  
  // Filtered project lists for modals
  const demoProjects = useMemo(() => projects.filter(p => p.hasDemo === true), [projects]);
  const githubProjects = useMemo(() => projects.filter(p => p.hasGithub === true), [projects]);
  const videoProjects = useMemo(() => projects.filter(p => p.hasVideo === true), [projects]);
  
  // Get projects by category
  const getProjectsByCategory = (category: string) => {
    return projects.filter(p => p.category === category);
  };
  
  // Get current modal projects and title
  const getModalData = (): { projects: Project[], title: string } => {
    switch (activeModal) {
      case 'demo':
        return { projects: demoProjects, title: t.dashboard.projectsWithDemo };
      case 'github':
        return { projects: githubProjects, title: t.dashboard.projectsWithGithub };
      case 'video':
        return { projects: videoProjects, title: t.dashboard.projectsWithVideo };
      case 'elite':
        return { projects: eliteProjects, title: t.dashboard.eliteProjects };
      case 'category':
        if (modalCategory) {
          return { projects: getProjectsByCategory(modalCategory), title: modalCategory };
        }
        return { projects: [], title: '' };
      default:
        return { projects: [], title: '' };
    }
  };
  
  const modalData = getModalData();
  
  // Stack Dominant (ignoring "Gemini")
  const stackDominant = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      p.techStack.forEach(tech => {
        const t = tech.toLowerCase().trim();
        if (t && !t.includes('gemini')) {
          counts[tech] = (counts[tech] || 0) + 1;
        }
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'N/A';
  }, [projects]);
  
  // Average Effort Score
  const avgEffortScore = useMemo(() => {
    const total = projects.reduce((acc, p) => acc + (p.effortScore || 0), 0);
    return Math.round(total / projects.length) || 0;
  }, [projects]);
  
  // Category Distribution (inferred, not from track)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const cat = p.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] || COLORS.yellow }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);
  
  // Tech Stack Distribution (excluding Gemini)
  const techData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      p.techStack.forEach(tech => {
        const t = tech.toLowerCase().trim();
        if (t && !t.includes('gemini')) {
          counts[tech] = (counts[tech] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({ 
        name, 
        value,
        fill: Object.values(COLORS)[i % Object.values(COLORS).length]
      }));
  }, [projects]);
  
  // Keywords Cloud (top 20)
  const keywordsCloud = useMemo(() => {
    const counts: Record<string, number> = {};
    const stopwords = ['gemini', 'ai', 'app', 'application', 'built', 'using', 'the', 'and', 'for', 'with'];
    projects.forEach(p => {
      p.keywords?.forEach(kw => {
        const k = kw.toLowerCase().trim();
        if (k.length > 2 && !stopwords.includes(k)) {
          counts[k] = (counts[k] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([word, count]) => ({ word, count }));
  }, [projects]);
  
  // Gap Analysis: Categories with low competition
  const gapAnalysis = useMemo(() => {
    const sorted = [...categoryData].sort((a, b) => a.value - b.value);
    return sorted.slice(0, 5); // Top 5 underserved
  }, [categoryData]);

  // Use translations from i18n
  const labels = t.dashboard;

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      
      {/* Projects Modal */}
      <ProjectsModal 
        isOpen={activeModal !== null}
        onClose={() => { setActiveModal(null); setModalCategory(null); }}
        title={modalData.title}
        projects={modalData.projects}
        t={t}
      />

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-shrink-0">
        
        {/* Deployment Rate */}
        <div 
          className="basalt-block p-4 cursor-pointer hover:border-cyan-400 transition-colors group"
          onClick={() => setActiveModal('demo')}
        >
          <span className="font-mono text-[10px] text-cyan-400 block mb-1">// LIVE_DEMOS</span>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white font-mono tracking-tighter">{deploymentRate}%</div>
            <div className="bg-cyan-500/20 border border-cyan-500/50 p-2 group-hover:bg-cyan-500/30">
              <Rocket className="text-cyan-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.deploymentRateDesc}</p>
          <p className="text-cyan-400/60 text-[9px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {labels.clickToSeeList}
          </p>
        </div>
        
        {/* GitHub Rate */}
        <div 
          className="basalt-block p-4 cursor-pointer hover:border-purple-400 transition-colors group"
          onClick={() => setActiveModal('github')}
        >
          <span className="font-mono text-[10px] text-purple-400 block mb-1">// CODE_OPEN</span>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white font-mono tracking-tighter">{githubRate}%</div>
            <div className="bg-purple-500/20 border border-purple-500/50 p-2 group-hover:bg-purple-500/30">
              <Github className="text-purple-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.githubRateDesc}</p>
          <p className="text-purple-400/60 text-[9px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {labels.clickToSeeList}
          </p>
        </div>
        
        {/* Video Rate */}
        <div 
          className="basalt-block p-4 cursor-pointer hover:border-pink-400 transition-colors group"
          onClick={() => setActiveModal('video')}
        >
          <span className="font-mono text-[10px] text-pink-400 block mb-1">// DEMO_VIDS</span>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white font-mono tracking-tighter">{videoRate}%</div>
            <div className="bg-pink-500/20 border border-pink-500/50 p-2 group-hover:bg-pink-500/30">
              <Video className="text-pink-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.videoRateDesc}</p>
          <p className="text-pink-400/60 text-[9px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {labels.clickToSeeList}
          </p>
        </div>

        {/* Elite Projects */}
        <div 
          className="basalt-block p-4 cursor-pointer hover:border-yellow-400 transition-colors group"
          onClick={() => setActiveModal('elite')}
        >
          <span className="font-mono text-[10px] text-yellow-400 block mb-1">// ELITE_TIER</span>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white font-mono tracking-tighter">{eliteCount}</div>
            <div className="bg-yellow-400/20 border border-yellow-400/50 p-2 group-hover:bg-yellow-400/30">
              <CheckCircle className="text-yellow-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.eliteProjectsDesc}</p>
          <p className="text-yellow-400/60 text-[9px] font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {labels.clickToSeeList}
          </p>
        </div>
        
        {/* Avg Effort Score */}
        <div className="basalt-block p-4">
          <span className="font-mono text-[10px] text-gray-500 block mb-1">// MATURITY</span>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-white font-mono tracking-tighter">{avgEffortScore}</div>
            <div className="bg-basalt-800 border border-basalt-700 p-2">
              <TrendingUp className="text-green-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.avgEffortDesc}</p>
        </div>
        
        {/* Stack Dominant */}
        <div className="basalt-block p-4">
          <span className="font-mono text-[10px] text-gray-500 block mb-1">// TOP_STACK</span>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-white font-mono truncate max-w-[80px]" title={stackDominant}>
              {stackDominant}
            </div>
            <div className="bg-basalt-800 border border-basalt-700 p-2">
              <Code className="text-purple-400 w-4 h-4" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mt-2">{labels.stackDominantDesc}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
      
          {/* Category Distribution - Horizontal Bar */}
          <Card title={labels.categoryBreakdown} subtitle={labels.categoryBreakdownDesc} className="h-[380px]">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={categoryData} 
                    layout="vertical" 
                    margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
                    onClick={(data) => {
                      if (data && data.activeLabel) {
                        setModalCategory(data.activeLabel);
                        setActiveModal('category');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(250, 204, 21, 0.1)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={90} 
                      tick={{fill: '#9ca3af', fontSize: 10, fontFamily: 'Space Mono'}}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 2, 2, 0]} 
                      barSize={20}
                      animationDuration={1500}
                      className="cursor-pointer"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="flex-shrink-0 text-gray-600 text-[9px] font-mono text-center pt-2">
                {labels.clickBarToSee}
              </p>
            </div>
          </Card>

          {/* Gap Opportunities */}
          <Card title={labels.gapOpportunities} subtitle={labels.gapOpportunitiesDesc} className="h-[380px]">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3 p-2">
                {gapAnalysis.map((gap, i) => (
                  <div 
                    key={gap.name} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-basalt-800/50 p-2 -m-2 transition-colors"
                    onClick={() => {
                      setModalCategory(gap.name);
                      setActiveModal('category');
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-basalt-800 border border-basalt-700">
                      <span className="font-mono text-xs text-yellow-400">#{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm text-white">{gap.name}</span>
                        <span className="font-mono text-xs text-gray-500">{gap.value} {labels.projectsLower}</span>
                      </div>
                      <div className="h-2 bg-basalt-800 rounded-none overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.max(5, (gap.value / categoryData[0]?.value) * 100)}%`,
                            backgroundColor: gap.fill
                          }}
                        />
                      </div>
                    </div>
                    {gap.value < 10 && (
                      <Target className="w-4 h-4 text-green-400 flex-shrink-0" title="Low competition!" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Insight Box - Always visible at bottom */}
              <div className="flex-shrink-0 mt-3 p-3 border-l-4 border-yellow-400 bg-yellow-400/5">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="font-mono text-[10px] text-yellow-400 uppercase">{labels.insight}</span>
                </div>
                <p className="font-mono text-xs text-gray-400">
                  {gapAnalysis.some(g => g.name === 'Legal') ? labels.insightLegal : labels.insightAccessibility}
                </p>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card title={labels.techStack} subtitle={labels.techStackDesc} className="h-[380px]">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={techData} 
                    layout="vertical" 
                    margin={{ top: 10, right: 40, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(250, 204, 21, 0.1)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{fill: '#9ca3af', fontSize: 10, fontFamily: 'Space Mono'}}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 2, 2, 0]} 
                      barSize={20}
                      animationDuration={1500}
                    >
                      {techData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Keywords Cloud - Terminal Style */}
          <Card title={labels.keywordsCloud} subtitle={labels.keywordsCloudDesc} className="h-[380px]">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-wrap gap-2 content-start p-2">
                  {keywordsCloud.map(({ word, count }, i) => {
                    // Size based on frequency
                    const maxCount = keywordsCloud[0]?.count || 1;
                    const ratio = count / maxCount;
                    const size = ratio > 0.7 ? 'text-lg' : ratio > 0.4 ? 'text-sm' : 'text-xs';
                    const opacity = ratio > 0.5 ? 'opacity-100' : ratio > 0.3 ? 'opacity-80' : 'opacity-60';
                    const color = i < 3 ? 'text-yellow-400' : i < 8 ? 'text-green-400' : 'text-gray-400';
                    
                    return (
                      <span 
                        key={word}
                        className={`font-mono ${size} ${color} ${opacity} hover:text-white transition-colors cursor-default`}
                        title={`${count} projects`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Terminal prompt style */}
              <div className="flex-shrink-0 pt-3 border-t border-basalt-700">
                <div className="font-mono text-xs text-gray-500 flex items-center gap-2">
                  <span className="text-green-400">$</span>
                  <span className="animate-pulse">_</span>
                  <span className="text-gray-600">
                    {labels.analyzingProjects.replace('{count}', String(projects.length))}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
