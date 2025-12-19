
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { SAMPLE_DATA, FIXED_CSV_DATA, DATASET_URL } from './constants';
import { Project, TabView } from './types';
import { Dashboard } from './components/Dashboard';
import { Discovery } from './components/Discovery';
import { AILab } from './components/AILab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LayoutDashboard, Compass, Cpu, Upload, Download, CheckCircle, AlertCircle, X, Sparkles, Trash2, CloudDownload, Sun, Moon } from 'lucide-react';

// Inner App Component to consume Context
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(SAMPLE_DATA);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isDataPersisted, setIsDataPersisted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showDataErrorModal, setShowDataErrorModal] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  // Helper to process raw CSV rows into Project objects
  const processParsedData = (data: any[]): Project[] => {
    return data
      .filter((row: any) => row && typeof row === 'object' && (row.name || row.title))
      .map((row: any, idx) => {
        const name = String(row.name || row.title || 'Untitled').trim();
        const description = String(row.description || row.subtitle || 'No description provided').trim();
        const rawTech = row.techStack || row.technologies || '';
        
        return {
          id: String(row.id || `csv-${idx}-${Date.now()}`),
          name: name,
          description: description,
          track: String(row.track || 'General').trim(),
          techStack: rawTech 
            ? String(rawTech).split(/[,;]/).map((s: string) => s.trim()).filter(s => s.length > 0) 
            : [],
          teamSize: Math.max(1, parseInt(String(row.teamSize || 1)) || 1)
        };
      });
  };

  // Load Data on Mount (Priority: LocalStorage > URL > Fixed CSV > Sample)
  useEffect(() => {
    const initData = async () => {
      setIsFetching(true);

      // 1. Try LocalStorage first (instant load)
      const savedData = localStorage.getItem('gemini_hub_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
            setIsDataPersisted(true);
            setNotification({ 
              message: language === 'es' ? `Dataset cargado: ${parsed.length} proyectos` : `Dataset loaded: ${parsed.length} projects`, 
              type: 'success' 
            });
            console.log("Loaded data from localStorage");
            setIsFetching(false);
            return; // Stop here if cached data exists
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
                  message: language === 'es' ? `${mapped.length} proyectos cargados y guardados` : `${mapped.length} projects loaded and cached`,
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
            message: language === 'es' ? 'Error cargando URL. Usando datos locales.' : 'URL Fetch failed. Using local data.',
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const mapped = processParsedData(results.data);
            
            if (mapped.length > 0) {
              setProjects(mapped);
              setIsDataPersisted(true);
              localStorage.setItem('gemini_hub_data', JSON.stringify(mapped)); // Save to storage
              setNotification({ 
                message: language === 'es' ? `Dataset cargado y guardado: ${mapped.length} proyectos.` : `Dataset loaded and saved: ${mapped.length} projects.`, 
                type: 'success' 
              });
              setActiveTab('discovery');
            } else {
              setNotification({ 
                message: language === 'es' ? "No se encontraron proyectos válidos." : "No valid projects found.", 
                type: 'error' 
              });
            }
          } catch (err: any) {
            console.error(err);
            setNotification({ 
              message: `Error: ${err.message}`, 
              type: 'error' 
            });
          }
        },
        error: (error) => {
          setNotification({ message: `Upload failed: ${error.message}`, type: 'error' });
        }
      });
    }
    e.target.value = ''; 
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
            message: language === 'es' ? "Datos reseteados al Dataset Original." : "Data reset to Original Dataset.", 
            type: 'success' 
          });
        }
      });
    } else {
      localStorage.removeItem('gemini_hub_data');
      setProjects(SAMPLE_DATA);
      setIsDataPersisted(false);
      setNotification({ 
        message: language === 'es' ? "Datos borrados. Usando ejemplos." : "Data cleared. Using samples.", 
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
        message: language === 'es' ? 'Dataset descargado correctamente' : 'Dataset downloaded successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setNotification({
        message: language === 'es' ? 'Error al descargar el dataset' : 'Error downloading dataset',
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
    <div className="min-h-screen bg-neu-bg text-neu-text font-sans selection:bg-neu-primary/20 relative overflow-x-hidden transition-colors duration-400">
      
      {/* NEUMORPHISM BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle noise grain - reduced in light mode */}
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}></div>
        
        {/* Sophisticated ambient glows - adjusted for both modes */}
        <div className={`absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-neu-primary/5' : 'bg-neu-primary/10'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-500 ${isDark ? 'bg-neu-secondary/5' : 'bg-neu-secondary/8'}`}></div>
      </div>

      {/* TOAST NOTIFICATION - Neumorphic style */}
      {notification && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl neu-card animate-slide-up ${
          notification.type === 'success' 
            ? 'border-emerald-500/30' 
            : 'border-red-500/30'
        }`}>
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5 text-emerald-500" /> 
            : <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className="font-medium text-sm text-neu-text">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-neu-primary/10 p-1 rounded-full transition-colors">
            <X className="w-4 h-4 text-neu-textDim" />
          </button>
        </div>
      )}

      {/* DATA ERROR MODAL */}
      {showDataErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="neu-card max-w-md w-full p-8 space-y-6 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="neu-icon flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neu-text mb-2">{t.dataErrorModal.title}</h3>
                <p className="text-neu-textDim text-sm leading-relaxed">
                  {t.dataErrorModal.message}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDismissDataError(false)}
                className="w-full neu-button-primary py-3 rounded-xl font-semibold text-sm"
              >
                {t.dataErrorModal.understood}
              </button>
              <button
                onClick={() => handleDismissDataError(true)}
                className="w-full neu-button py-3 rounded-xl font-medium text-sm text-neu-textDim hover:text-neu-text"
              >
                {t.dataErrorModal.dontShowAgain}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col min-h-screen">
        
        {/* HEADER AREA */}
        <header className="flex flex-col mb-10 animate-fade-in">
          
          {/* Top Bar: Logo & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className={`absolute inset-0 blur-lg transition-opacity duration-500 ${isDark ? 'bg-neu-primary opacity-20 group-hover:opacity-40' : 'bg-neu-primary opacity-10 group-hover:opacity-25'}`}></div>
                <div className="relative w-12 h-12 neu-icon flex items-center justify-center">
                  <Sparkles className="text-neu-primary w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neu-text tracking-tight leading-none">{t.appName}</h1>
                <p className="text-[10px] text-neu-textDim font-mono tracking-[0.2em] uppercase mt-1 opacity-60 flex items-center gap-2">
                  {t.appSubtitle}
                  {isFetching && <span className="text-neu-primary animate-pulse">● SYNCING...</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle - Neumorphic */}
              <button
                onClick={toggleTheme}
                className="neu-button w-10 h-10 flex items-center justify-center group"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Language Pill - Neumorphic */}
              <div className="neu-pill flex items-center">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 ${language === 'en' ? 'bg-neu-primary text-white shadow-lg' : 'text-neu-textDim hover:text-neu-text'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('es')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 ${language === 'es' ? 'bg-neu-primary text-white shadow-lg' : 'text-neu-textDim hover:text-neu-text'}`}
                >
                  ES
                </button>
              </div>

              <div className="h-8 w-px bg-neu-border"></div>

              {/* Clear Data Button */}
              {isDataPersisted && (
                <button 
                  onClick={clearPersistedData}
                  className="neu-button text-xs font-medium text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-2"
                  title={language === 'es' ? "Recargar o Resetear Datos" : "Reload or Reset Data"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button 
                onClick={downloadDataset}
                className="neu-button text-xs font-medium text-neu-textDim hover:text-neu-primary transition-colors flex items-center gap-2 px-3 py-2 group"
              >
                <CloudDownload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">{t.downloadDataset}</span>
              </button>

              <label className="cursor-pointer group flex items-center gap-2 px-5 py-2.5 neu-button-primary rounded-xl hover:scale-105 active:scale-95 duration-300">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-bold">{t.loadDataset}</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {/* HERO SECTION */}
          <div className="text-center max-w-4xl mx-auto space-y-8 py-4">
             {/* Badges */}
             <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{animationDelay: '0.1s'}}>
                {t.heroBadges.map((badge, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full neu-flat text-neu-primary text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider">
                    {badge}
                  </span>
                ))}
             </div>
             
             {/* Title */}
             <h2 className="text-4xl md:text-6xl font-bold text-neu-text tracking-tighter leading-tight animate-slide-up" style={{animationDelay: '0.2s'}}>
               {t.heroTitle.includes(':') ? (
                 <>
                   {t.heroTitle.split(':')[0]}<span className="text-neu-textDim">:</span> <br className="hidden md:block" />
                   <span className="bg-clip-text text-transparent bg-gradient-to-r from-neu-primary via-neu-text to-neu-secondary">
                     {t.heroTitle.split(':')[1]}
                   </span>
                 </>
               ) : (
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-neu-text via-neu-primary to-neu-text">
                   {t.heroTitle}
                 </span>
               )}
             </h2>

             {/* Description */}
             <p className="text-neu-textDim text-sm md:text-lg leading-relaxed max-w-2xl mx-auto animate-slide-up font-light" style={{animationDelay: '0.3s'}}>
               {t.heroDescription}
             </p>
          </div>

        </header>

        {/* NAVIGATION: Neumorphic Dock Style */}
        <nav className="sticky top-4 z-40 mx-auto neu-flat p-1.5 flex items-center gap-1 mb-8 animate-fade-in w-fit max-w-[95vw] overflow-x-auto no-scrollbar">
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
        <main className="flex-1 w-full animate-slide-up">
          <ErrorBoundary>
            <div className="pb-12">
              {activeTab === 'dashboard' && <Dashboard projects={projects} />}
              {activeTab === 'discovery' && <Discovery projects={projects} />}
              {activeTab === 'ai-lab' && <AILab projects={projects} />}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, special }: any) => (
  <button
    onClick={onClick}
    className={`relative px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 md:gap-2.5 outline-none group flex-shrink-0 ${
      active 
        ? 'text-neu-text neu-concave' 
        : 'text-neu-textDim hover:text-neu-text hover:bg-neu-surface/50'
    }`}
  >
    <span className={`transition-colors duration-300 ${active ? (special ? 'text-neu-secondary' : 'text-neu-primary') : 'text-neu-textDim group-hover:text-neu-text'}`}>
      {icon}
    </span>
    <span className="hidden sm:inline whitespace-nowrap">{label}</span>
    {active && special && <span className="absolute inset-0 rounded-xl shadow-[0_0_15px_-3px_rgba(167,139,250,0.3)] pointer-events-none"></span>}
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
