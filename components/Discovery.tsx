import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../types';
import { Search, Monitor, Cpu, Terminal, Filter, X, Hash, Users, Code, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DiscoveryProps {
  projects: Project[];
}

export const Discovery: React.FC<DiscoveryProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [superpowerFilter, setSuperpowerFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLanguage();

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
    <div className="h-full flex flex-col">
      {/* Search Bar & Filters: Brutalist Style */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 flex-shrink-0 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            className="w-full bg-basalt-900 border-2 border-basalt-800 py-4 pl-12 pr-4 text-white text-sm font-mono uppercase tracking-wide placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative w-full md:w-72 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            className="w-full bg-basalt-900 border-2 border-basalt-800 py-4 pl-10 pr-10 text-white text-xs font-mono uppercase tracking-wide appearance-none cursor-pointer focus:border-yellow-400 focus:outline-none transition-colors"
            value={superpowerFilter}
            onChange={(e) => setSuperpowerFilter(e.target.value)}
          >
            {SUPERPOWERS.map(sp => (
              <option key={sp.value} value={sp.value} className="bg-basalt-950 text-white">{sp.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-yellow-400 pointer-events-none"></div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="max-w-4xl mx-auto flex-shrink-0 mb-4">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          // FOUND: {filtered.length} PROJECTS
        </span>
      </div>

      {/* Grid - Terminal Card Style - Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {filtered.map(project => (
          <div 
            key={project.id} 
            onClick={() => setSelectedProject(project)}
            className="group basalt-block p-0 cursor-pointer hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            {/* Card Header - Terminal Style */}
            <div className="bg-basalt-900 border-b-2 border-basalt-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500"></div>
                <div className="w-2 h-2 bg-yellow-500"></div>
                <div className="w-2 h-2 bg-green-500"></div>
              </div>
              <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">
                {project.track}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors flex items-center gap-2 font-mono">
                <span className="text-yellow-400">$</span>
                {project.name}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-yellow-400" />
              </h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                {project.description}
              </p>

              {/* Team Indicator */}
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500">
                <Users className="w-3 h-3" />
                <span>{project.teamSize} CONTRIBUTORS</span>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-basalt-800">
                {project.techStack.slice(0, 4).map(tech => (
                  <span key={tech} className="text-[10px] text-green-400 bg-basalt-900 border border-basalt-800 px-2 py-1 font-mono uppercase">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="text-[10px] text-gray-500 px-2 py-1 font-mono">+{project.techStack.length - 4}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      
        {/* No Results State */}
        {filtered.length === 0 && (
          <div className="text-center py-32 basalt-block">
            <Terminal className="w-16 h-16 mx-auto mb-6 text-gray-600" />
            <p className="font-mono text-sm tracking-wide text-gray-500 uppercase">{t.noProjects}</p>
            <p className="font-mono text-xs text-gray-600 mt-2">// NO_MATCHING_RECORDS_FOUND</p>
            <button 
              onClick={() => {setSearchTerm(''); setSuperpowerFilter('all');}}
              className="mt-6 brutal-btn text-xs"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>

      {/* PROJECT DETAILS MODAL - Brutalist Style */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedProject(null)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-basalt-950 border-2 border-basalt-800 overflow-hidden animate-slide-up shadow-[8px_8px_0_0_rgba(250,204,21,0.3)]">
            {/* Modal Header - Terminal Style */}
            <div className="bg-basalt-900 border-b-2 border-basalt-800 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <div className="w-3 h-3 bg-yellow-500"></div>
                  <div className="w-3 h-3 bg-green-500"></div>
                </div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">// PROJECT_DETAILS</span>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 border-2 border-basalt-800 hover:border-yellow-400 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
              </button>
            </div>

            {/* Project Title Section */}
            <div className="p-6 border-b-2 border-basalt-800 bg-basalt-900/50">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-yellow-400 font-mono text-2xl">$</span>
                <h2 className="text-2xl font-bold text-white font-mono tracking-tight">{selectedProject.name}</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-1 uppercase tracking-widest">
                  {selectedProject.track}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  <Hash className="w-3 h-3 inline mr-1" />
                  ID: {selectedProject.id}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-left">
              
              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
                  <Terminal className="w-3 h-3" />
                  {t.modal.description}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm border-l-2 border-yellow-400 pl-4 bg-basalt-900/50 py-3">
                  {selectedProject.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <div>
                  <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
                    <Code className="w-3 h-3" />
                    {t.modal.tech}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.techStack.map((tech, i) => (
                      <span key={i} className="text-xs text-green-400 bg-basalt-900 border border-basalt-800 px-3 py-1.5 font-mono uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Info */}
                <div>
                  <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2 uppercase tracking-widest font-mono">
                    <Users className="w-3 h-3" />
                    {t.modal.team}
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-basalt-900 border border-basalt-800">
                    <div className="text-4xl font-mono font-bold text-white">{selectedProject.teamSize}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-mono leading-relaxed">
                      ACTIVE<br/>CONTRIBUTORS
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-basalt-800 bg-basalt-900 flex justify-between items-center">
              <span className="text-xs font-mono text-gray-600">// END_OF_RECORD</span>
              <button 
                onClick={() => setSelectedProject(null)}
                className="brutal-btn text-xs"
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
