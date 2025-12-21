
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { SAMPLE_DATA, FIXED_CSV_DATA, DATASET_URL } from './constants';
import { Project, TabView } from './types';
import { Dashboard } from './components/Dashboard';
import { Discovery } from './components/Discovery';
import { AILab } from './components/AILab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutDashboard, Compass, Cpu, CheckCircle, AlertCircle, X, Trash2, CloudDownload, FileText, Plus } from 'lucide-react';

// Supported document formats for Gemini context
const SUPPORTED_DOC_EXTENSIONS = '.pdf,.txt,.html,.css,.md,.csv,.xml,.rtf,.js,.ts,.py,.json';
const SUPPORTED_DOC_MIMES = 'application/pdf,text/plain,text/html,text/css,text/markdown,text/csv,application/xml,text/xml,application/rtf,text/javascript,application/javascript,text/x-python,application/json';

// Inner App Component to consume Context
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(SAMPLE_DATA);
  const [extraContext, setExtraContext] = useState<{name: string, content: string}[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isDataPersisted, setIsDataPersisted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showDataErrorModal, setShowDataErrorModal] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();

  // Helper to process raw CSV rows into Project objects
  const processParsedData = (data: any[]): Project[] => {
    console.log('📊 Processing CSV data. Total rows:', data.length);
    if (data.length > 0) {
      console.log('📝 Sample raw row:', data[0]);
      console.log('🔍 has_demo value:', data[0].has_demo, 'type:', typeof data[0].has_demo);
    }
    
    const result = data
      .filter((row: any) => row && typeof row === 'object' && (row.name || row.title))
      .map((row: any, idx) => {
        const name = String(row.name || row.title || 'Untitled').trim();
        const description = String(row.description || row.subtitle || 'No description provided').trim();
        const rawTech = row.techStack || row.technologies || '';
        const rawKeywords = row.keywords || '';
        
        // Parse boolean fields (CSV has "True"/"False" strings)
        const hasDemo = String(row.has_demo || row.hasDemo || 'false').toLowerCase() === 'true';
        const hasGithub = String(row.has_github || row.hasGithub || 'false').toLowerCase() === 'true';
        const hasVideo = String(row.has_video || row.hasVideo || 'false').toLowerCase() === 'true';
        const contentLength = parseInt(String(row.content_length || row.contentLength || 0)) || 0;
        
        // Parse keywords array
        const keywords = rawKeywords 
          ? String(rawKeywords).split(/[,;]/).map((s: string) => s.trim()).filter(s => s.length > 0)
          : [];
        
        // Infer category from text
        const textForCategory = `${name} ${description} ${keywords.join(' ')}`.toLowerCase();
        let category = 'Other';
        const categoryKeywords: Record<string, string[]> = {
          'Health': ['medical', 'doctor', 'health', 'patient', 'diagnosis', 'triage', 'mental', 'therapy', 'hospital', 'wellness'],
          'Education': ['tutor', 'learning', 'student', 'study', 'course', 'quiz', 'teach', 'school', 'education'],
          'Finance': ['crypto', 'stock', 'invest', 'finance', 'budget', 'trading', 'bank', 'payment'],
          'Accessibility': ['blind', 'deaf', 'sign language', 'disability', 'braille', 'accessible'],
          'DevTools': ['code', 'debug', 'ide', 'terminal', 'sql', 'developer', 'api', 'github', 'programming'],
          'Legal': ['legal', 'law', 'lawyer', 'attorney', 'court', 'rights', 'contract'],
          'Creative': ['art', 'music', 'design', 'creative', 'image', 'video', 'photo', 'story', 'write'],
          'Productivity': ['automation', 'workflow', 'productivity', 'task', 'schedule', 'assistant'],
          'Social': ['social', 'community', 'chat', 'connect', 'network'],
        };
        for (const [cat, terms] of Object.entries(categoryKeywords)) {
          if (terms.some(term => textForCategory.includes(term))) {
            category = cat;
            break;
          }
        }
        
        // Calculate effort score (0-100)
        let effortScore = 0;
        if (hasDemo) effortScore += 40;
        if (hasGithub) effortScore += 30;
        if (hasVideo) effortScore += 20;
        if (contentLength > 2000) effortScore += 10;
        
        return {
          id: String(row.id || `csv-${idx}-${Date.now()}`),
          name: name,
          description: description,
          track: String(row.track || 'General').trim(),
          techStack: rawTech 
            ? String(rawTech).split(/[,;]/).map((s: string) => s.trim()).filter(s => s.length > 0) 
            : [],
          teamSize: Math.max(1, parseInt(String(row.teamSize || 1)) || 1),
          // New fields
          hasDemo,
          hasGithub,
          hasVideo,
          contentLength,
          keywords,
          githubUrl: row.github_url || row.githubUrl || undefined,
          demoUrl: row.demo_url || row.demoUrl || undefined,
          youtubeUrl: row.youtube_url || row.youtubeUrl || undefined,
          category,
          effortScore,
        };
      });
    
    console.log('✅ Processed projects:', result.length);
    if (result.length > 0) {
      console.log('📈 Sample processed project:', {
        name: result[0].name,
        hasDemo: result[0].hasDemo,
        hasGithub: result[0].hasGithub,
        hasVideo: result[0].hasVideo,
        category: result[0].category,
        effortScore: result[0].effortScore
      });
    }
    
    return result;
  };

  // Schema version - increment when data structure changes to invalidate cache
  const SCHEMA_VERSION = 2;

  // Load Data on Mount (Priority: LocalStorage > URL > Fixed CSV > Sample)
  useEffect(() => {
    const initData = async () => {
      setIsFetching(true);

      // Check schema version - if outdated, clear cache
      const cachedVersion = localStorage.getItem('gemini_hub_schema_version');
      if (cachedVersion !== String(SCHEMA_VERSION)) {
        console.log('Schema version changed, clearing old cache...');
        localStorage.removeItem('gemini_hub_data');
        localStorage.setItem('gemini_hub_schema_version', String(SCHEMA_VERSION));
      }

      // 1. Try LocalStorage first (instant load)
      const savedData = localStorage.getItem('gemini_hub_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Validate that data has new fields (hasDemo should exist)
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].hasDemo !== 'undefined') {
            setProjects(parsed);
            setIsDataPersisted(true);
            setNotification({ 
              message: t.dashboard.datasetLoaded.replace('{count}', String(parsed.length)), 
              type: 'success' 
            });
            console.log("Loaded data from localStorage with new schema");
            setIsFetching(false);
            return; // Stop here if cached data exists
          } else {
            console.log("Cached data has old schema, fetching fresh data...");
            localStorage.removeItem('gemini_hub_data');
          }
        } catch (e) {
          console.error("Failed to load cached data", e);
          localStorage.removeItem('gemini_hub_data');
        }
      }

      // 2. Fetch from URL (first time only, then cached)
      if (DATASET_URL && DATASET_URL.startsWith('http')) {
        try {
          console.log(`Fetching dataset from: ${DATASET_URL}`);
          const response = await fetch(DATASET_URL);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const csvText = await response.text();
          
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const mapped = processParsedData(results.data);
              if (mapped.length > 0) {
                setProjects(mapped);
                setIsDataPersisted(true);
                // Save to localStorage for next time
                localStorage.setItem('gemini_hub_data', JSON.stringify(mapped));
                setNotification({
                  message: t.dashboard.projectsLoadedCached.replace('{count}', String(mapped.length)),
                  type: 'success'
                });
                console.log("Loaded data from URL and saved to cache");
              }
            }
          });
          setIsFetching(false);
          return; // Stop here if URL works
        } catch (e) {
          console.error("Fetch failed, falling back to static data", e);
          setNotification({
            message: t.dashboard.urlFetchFailed,
            type: 'error'
          });
        }
      }

      // 3. Fallback: Fixed CSV Data (The hardcoded dataset)
      if (FIXED_CSV_DATA && FIXED_CSV_DATA.length > 100) {
        Papa.parse(FIXED_CSV_DATA, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const mapped = processParsedData(results.data);
            if (mapped.length > 0) {
              setProjects(mapped);
              setIsDataPersisted(true);
              console.log("Loaded FIXED_CSV_DATA");
            }
          }
        });
        setIsFetching(false);
        return;
      }

      // 4. If all methods failed, show modal (if user hasn't dismissed it permanently)
      const dontShowAgain = localStorage.getItem('data_error_dismissed');
      if (!dontShowAgain) {
        setShowDataErrorModal(true);
      }

      setIsFetching(false);
    };

    initData();
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load extra context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('gemini_extra_context');
    if (savedContext) {
      try {
        const parsed = JSON.parse(savedContext);
        if (Array.isArray(parsed)) {
          setExtraContext(parsed);
        }
      } catch (e) {
        console.error("Failed to load extra context", e);
      }
    }
  }, []);

  // Handle document upload for extra context
  const handleContextUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const supportedExts = ['pdf', 'txt', 'html', 'css', 'md', 'csv', 'xml', 'rtf', 'js', 'ts', 'py', 'json'];
    
    if (!ext || !supportedExts.includes(ext)) {
      setNotification({ 
        message: t.dashboard.errorReadingFile + ' - PDF, TXT, MD, CSV, JSON, HTML, JS, PY...', 
        type: 'error' 
      });
      e.target.value = '';
      return;
    }

    // For PDF, we'd need a PDF parser - for now show message
    if (ext === 'pdf') {
      setNotification({ 
        message: 'PDF support coming soon. Use TXT, MD, CSV or JSON.', 
        type: 'error' 
      });
      e.target.value = '';
      return;
    }

    // Read text-based files
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && text.trim().length > 0) {
        const newDoc = { name: file.name, content: text.trim() };
        const newContext = [...extraContext, newDoc];
        setExtraContext(newContext);
        localStorage.setItem('gemini_extra_context', JSON.stringify(newContext));
        
        setNotification({ 
          message: t.dashboard.contextAddedDoc.replace('{name}', file.name), 
          type: 'success' 
        });
      }
    };
    reader.onerror = () => {
      setNotification({ 
        message: t.dashboard.errorReadingFile, 
        type: 'error' 
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear extra context
  const clearExtraContext = () => {
    setExtraContext([]);
    localStorage.removeItem('gemini_extra_context');
    setNotification({ 
      message: t.dashboard.contextCleared, 
      type: 'success' 
    });
  };

  const clearPersistedData = () => {
    // If URL is configured, we re-fetch it
    if (DATASET_URL && DATASET_URL.startsWith('http')) {
        window.location.reload();
        return;
    }

    // If hardcoded data exists, revert to it
    if (FIXED_CSV_DATA && FIXED_CSV_DATA.length > 100) {
       Papa.parse(FIXED_CSV_DATA, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const mapped = processParsedData(results.data);
          setProjects(mapped);
          setNotification({ 
            message: t.dashboard.dataResetOriginal, 
            type: 'success' 
          });
        }
      });
    } else {
      localStorage.removeItem('gemini_hub_data');
      setProjects(SAMPLE_DATA);
      setIsDataPersisted(false);
      setNotification({ 
        message: t.dashboard.dataCleared, 
        type: 'success' 
      });
    }
  };

  const downloadDataset = async () => {
    const url = "https://raw.githubusercontent.com/Atypical-Playworks/protoi/main/data/datos.csv";
    const filename = "datos.csv";
    
    try {
      // Fetch el archivo para evitar restricciones CORS con el atributo download
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al descargar');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar el blob URL
      URL.revokeObjectURL(blobUrl);
      
      setNotification({
        message: t.dashboard.datasetDownloaded,
        type: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setNotification({
        message: t.dashboard.errorDownloading,
        type: 'error'
      });
    }
  };

  const handleDismissDataError = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('data_error_dismissed', 'true');
    }
    setShowDataErrorModal(false);
  };

  return (
    <div className="h-screen bg-[#0a0a0b] text-gray-200 font-sans relative overflow-hidden flex flex-col">
      
      {/* TOAST NOTIFICATION - Brutalist style */}
      {notification && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 bg-basalt-900 border-2 animate-slide-up ${
          notification.type === 'success' 
            ? 'border-green-500' 
            : 'border-red-500'
        }`}>
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5 text-green-500" /> 
            : <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className="font-mono text-sm text-white">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/10 p-1 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* DATA ERROR MODAL */}
      {showDataErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="basalt-block max-w-md w-full p-8 space-y-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="bg-basalt-800 border border-basalt-700 p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{t.dataErrorModal.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-mono">
                  {t.dataErrorModal.message}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDismissDataError(false)}
                className="w-full bg-yellow-400 text-black py-3 font-mono font-bold text-sm uppercase hover:translate-x-1 hover:-translate-y-1 transition-transform"
              >
                {t.dataErrorModal.understood}
              </button>
              <button
                onClick={() => handleDismissDataError(true)}
                className="w-full border-2 border-basalt-700 py-3 font-mono font-medium text-sm text-gray-400 hover:border-yellow-400 hover:text-white transition-colors"
              >
                {t.dataErrorModal.dontShowAgain}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col h-full overflow-hidden">
        
        {/* BRUTALIST HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 flex-shrink-0 animate-fade-in">
          <div className="relative">
            <div className="hazard-strip w-24 mb-4"></div>
            <h1 className="brutalist-title text-white">PROTOI<span className="text-yellow-400">.</span></h1>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-gray-500 mt-2 flex items-center gap-3">
              {t.appSubtitle}
              {isFetching && <span className="text-green-400 animate-pulse">● SYNCING...</span>}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher - Brutalist */}
            <div className="flex border-2 border-basalt-700">
              {(['en', 'es'] as const).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 font-mono font-bold text-xs transition-all ${language === lang ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Clear Data Button */}
            {isDataPersisted && (
              <button 
                onClick={clearPersistedData}
                className="border-2 border-basalt-700 text-red-400 px-4 py-2 font-mono font-bold text-xs hover:border-red-400 transition-colors flex items-center gap-2"
                title={t.dashboard.reloadResetData}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Extra Context Indicator */}
            {extraContext.length > 0 && (
              <div className="flex items-center gap-2 border-2 border-cyan-500/50 bg-cyan-500/10 px-3 py-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs text-cyan-400">
                  +{extraContext.length} {t.dashboard.docs}
                </span>
                <button 
                  onClick={clearExtraContext}
                  className="ml-1 hover:bg-red-500/20 p-1 transition-colors"
                  title={t.dashboard.clearContext}
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}

            <button 
              onClick={downloadDataset}
              className="border-2 border-basalt-700 text-gray-400 px-4 py-2 font-mono font-bold text-xs hover:border-yellow-400 hover:text-white transition-colors flex items-center gap-2 group"
              title={t.dashboard.downloadCsvOriginal}
            >
              <CloudDownload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">{t.dashboard.downloadCsv}</span>
            </button>

            <label 
              className="cursor-pointer group flex items-center gap-2 px-5 py-2 bg-cyan-500 text-black font-mono font-bold text-xs hover:translate-x-1 hover:-translate-y-1 transition-transform"
              title={t.dashboard.importYourData}
            >
              <Plus className="w-4 h-4" />
              <span>{t.dashboard.yourData}</span>
              <input 
                type="file" 
                accept={SUPPORTED_DOC_EXTENSIONS}
                className="hidden" 
                onChange={handleContextUpload} 
              />
            </label>
          </div>
        </header>

        {/* NAVIGATION: Brutalist Style */}
        <nav className="flex gap-2 mb-6 flex-shrink-0 animate-fade-in">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={18} />}
            label={t.navDashboard}
          />
          <NavButton 
            active={activeTab === 'discovery'} 
            onClick={() => setActiveTab('discovery')} 
            icon={<Compass size={18} />}
            label={t.navDiscovery}
          />
          <NavButton 
            active={activeTab === 'ai-lab'} 
            onClick={() => setActiveTab('ai-lab')} 
            icon={<Cpu size={18} />}
            label={t.navAILab}
            special
          />
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-0 w-full animate-slide-up overflow-hidden">
          <ErrorBoundary>
            <div className="h-full overflow-y-auto custom-scrollbar pb-6">
              {activeTab === 'dashboard' && <Dashboard projects={projects} />}
              {activeTab === 'discovery' && <Discovery projects={projects} />}
              {activeTab === 'ai-lab' && <AILab projects={projects} extraContext={extraContext} />}
            </div>
          </ErrorBoundary>
        </main>

        {/* BRUTALIST FOOTER */}
        <footer className="mt-4 pt-4 border-t border-basalt-700 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-mono text-[10px] text-gray-500">CORE_SYNC: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-mono text-[10px] text-gray-500">API_STATUS: ONLINE</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-gray-600">
            BASALT_INTELLIGENCE_SCAFFOLDING // V2.5
          </div>
        </footer>
      </div>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, special }: any) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-2.5 font-mono font-bold text-sm transition-all flex items-center gap-2.5 ${
      active 
        ? 'bg-yellow-400 text-black' 
        : 'border-2 border-basalt-700 text-gray-400 hover:border-yellow-400 hover:text-white'
    }`}
  >
    <span className={`transition-colors ${active ? 'text-black' : special ? 'text-green-400' : ''}`}>
      {icon}
    </span>
    <span className="hidden sm:inline whitespace-nowrap uppercase">{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
