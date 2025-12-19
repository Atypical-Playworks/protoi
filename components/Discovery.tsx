import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../types';
import { Card } from './Card';
import { Search, Monitor, Cpu, Terminal, Filter, X, Hash, Users, Code, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface DiscoveryProps {
  projects: Project[];
}

export const Discovery: React.FC<DiscoveryProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [superpowerFilter, setSuperpowerFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const SUPERPOWERS = [
    { label: t.superpowers.all, value: 'all' },
    { label: t.superpowers.reasoning, value: 'reasoning,thinking,logic,complex,solve' },
    { label: t.superpowers.vision, value: 'vision,image,video,multimodal,camera,ocr,scan' },
    { label: t.superpowers.live, value: 'live,stream,real-time,latency,voice' },
    { label: t.superpowers.audio, value: 'audio,voice,speech,sound,tts,stt' },
    { label: t.superpowers.context, value: 'context,document,pdf,long,codebase' },
    { label: t.superpowers.tools, value: 'tool,function,code,search,grounding,agent' }
  ];

  const filtered = projects.filter(p => {
    const textMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      p.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (superpowerFilter === 'all') return textMatch;

    const keywords = superpowerFilter.split(',');
    const projectContent = (p.name + p.description + p.techStack.join(' ')).toLowerCase();
    const capabilityMatch = keywords.some(k => projectContent.includes(k));

    return textMatch && capabilityMatch;
  });

  return (
    <div className="space-y-8 relative">
      {/* Search Bar & Filters: Neumorphic Style */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neu-textDim group-focus-within:text-neu-primary transition-colors w-5 h-5" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            className="w-full neu-input py-4 pl-12 pr-4 text-neu-text text-sm font-medium tracking-wide placeholder:text-neu-textDim/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-72 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-neu-textDim group-focus-within:text-neu-secondary transition-colors w-4 h-4" />
          <select
            className="w-full neu-input py-4 pl-10 pr-10 text-neu-text text-xs font-mono uppercase tracking-wide appearance-none cursor-pointer"
            value={superpowerFilter}
            onChange={(e) => setSuperpowerFilter(e.target.value)}
          >
            {SUPERPOWERS.map(sp => (
              <option key={sp.value} value={sp.value} className="bg-neu-surface text-neu-text">{sp.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-neu-textDim pointer-events-none"></div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(project => (
          <Card 
            key={project.id} 
            onClick={() => setSelectedProject(project)}
            className="group flex flex-col h-full cursor-pointer hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="neu-flat text-neu-primary text-[10px] font-mono px-3 py-1 uppercase tracking-wider font-bold">
                {project.track}
              </span>
              <div className="flex -space-x-3">
                 {[...Array(Math.min(project.teamSize, 3))].map((_, i) => (
                   <div key={i} className="w-8 h-8 rounded-full neu-icon flex items-center justify-center text-[10px] text-neu-textDim">
                      <UsersIcon index={i} />
                   </div>
                 ))}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-neu-text mb-3 group-hover:text-neu-primary transition-colors flex items-center gap-2">
              {project.name}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-neu-primary" />
            </h3>
            <p className="text-neu-textDim text-sm mb-6 line-clamp-3 leading-relaxed flex-1 font-light">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-6 border-t border-neu-border">
              {project.techStack.slice(0, 4).map(tech => (
                <span key={tech} className="text-[10px] text-neu-text neu-flat px-2 py-1 font-mono">
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-[10px] text-neu-textDim px-2 py-1">+{project.techStack.length - 4}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-32 text-neu-textDim neu-concave rounded-3xl">
          <Terminal className="w-16 h-16 mx-auto mb-6 opacity-30 text-neu-textDim" />
          <p className="font-mono text-sm tracking-wide opacity-70">{t.noProjects}</p>
          <button 
            onClick={() => {setSearchTerm(''); setSuperpowerFilter('all');}}
            className="mt-6 text-neu-primary hover:text-neu-text text-xs font-bold uppercase tracking-widest border-b border-neu-primary/30 hover:border-neu-text transition-all pb-1"
          >
            {t.resetFilters}
          </button>
        </div>
      )}

      {/* PROJECT DETAILS MODAL - Rendered via Portal with Neumorphic style */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 ${isDark ? 'bg-[#1a1a2e]/95' : 'bg-[#e0e5ec]/95'} backdrop-blur-md animate-fade-in`}
            onClick={() => setSelectedProject(null)}
          />
          <div className="relative w-full max-w-2xl neu-card overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="p-8 border-b border-neu-border flex justify-between items-start">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-3">
                   <h2 className="text-3xl font-bold text-neu-text tracking-tight">{selectedProject.name}</h2>
                   <span className="neu-flat text-neu-primary text-[10px] font-mono px-2 py-0.5 uppercase tracking-widest">
                     {selectedProject.track}
                   </span>
                </div>
                <div className="flex items-center gap-3 text-neu-textDim text-xs font-mono">
                  <Hash className="w-3 h-3 text-neu-border" />
                  <span className="opacity-50">ID: {selectedProject.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="group neu-button p-2"
              >
                <X className="w-6 h-6 text-neu-textDim group-hover:text-neu-text transition-colors" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar text-left">
              
              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-neu-textDim mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Terminal className="w-3 h-3" />
                  {t.modal.description}
                </h3>
                <p className="text-neu-text leading-loose font-light text-base border-l-2 border-neu-primary/30 pl-6">
                  {selectedProject.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tech Stack */}
                <div>
                   <h3 className="text-xs font-bold text-neu-textDim mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Code className="w-3 h-3" />
                    {t.modal.tech}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech, i) => (
                      <span key={i} className="text-xs neu-flat text-neu-text px-3 py-1.5 font-mono hover:shadow-neu-convex transition-shadow cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Info */}
                <div>
                   <h3 className="text-xs font-bold text-neu-textDim mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Users className="w-3 h-3" />
                    {t.modal.team}
                  </h3>
                  <div className="flex items-center gap-5 p-4 neu-concave">
                    <div className="text-4xl font-light text-neu-text">{selectedProject.teamSize}</div>
                    <div className="text-[10px] uppercase tracking-wider text-neu-textDim leading-relaxed">
                      Active<br/>Contributors
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neu-border flex justify-end">
              <button 
                onClick={() => setSelectedProject(null)}
                className="px-8 py-3 neu-button-primary font-bold text-xs uppercase tracking-widest"
              >
                {t.modal.close}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const UsersIcon = ({ index }: { index: number }) => {
    if (index === 0) return <Monitor size={12} />;
    if (index === 1) return <Cpu size={12} />;
    return <Terminal size={12} />;
}
