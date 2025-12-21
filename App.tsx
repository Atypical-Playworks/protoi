
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
import { LayoutDashboard, Compass, Cpu, Upload, CheckCircle, AlertCircle, X, Trash2, CloudDownload } from 'lucide-react';

// Inner App Component to consume Context
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(SAMPLE_DATA);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isDataPersisted, setIsDataPersisted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showDataErrorModal, setShowDataErrorModal] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();

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
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 font-sans relative overflow-x-hidden">
      
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

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col min-h-screen">
        
        {/* BRUTALIST HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 animate-fade-in">
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
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 font-mono font-bold text-xs transition-all ${language === 'en' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-4 py-2 font-mono font-bold text-xs transition-all ${language === 'es' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                ES
              </button>
            </div>

            {/* Clear Data Button */}
            {isDataPersisted && (
              <button 
                onClick={clearPersistedData}
                className="border-2 border-basalt-700 text-red-400 px-4 py-2 font-mono font-bold text-xs hover:border-red-400 transition-colors flex items-center gap-2"
                title={language === 'es' ? "Recargar o Resetear Datos" : "Reload or Reset Data"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={downloadDataset}
              className="border-2 border-basalt-700 text-gray-400 px-4 py-2 font-mono font-bold text-xs hover:border-yellow-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <CloudDownload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">{t.downloadDataset}</span>
            </button>

            <label className="cursor-pointer group flex items-center gap-2 px-6 py-2 bg-yellow-400 text-black font-mono font-bold text-xs hover:translate-x-1 hover:-translate-y-1 transition-transform">
              <Upload className="w-4 h-4" />
              <span>{t.loadDataset}</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </header>

        {/* NAVIGATION: Brutalist Style */}
        <nav className="flex gap-2 mb-12 animate-fade-in">
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

        {/* BRUTALIST FOOTER */}
        <footer className="mt-16 pt-8 border-t border-basalt-700 flex flex-col md:flex-row justify-between items-center gap-4">
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
