
import { Language } from '../types';

export const translations = {
  en: {
    // Header
    appName: "protoi",
    appSubtitle: "From Data to Demo in 90 Minutes",
    heroTitle: "Validate Your Idea Against 320 Real Hackathon Projects",
    heroDescription: "See what others have built. Check if your idea already exists. Find inspiration in real projects. Get ready-to-deploy prompts for v0, Lovable & AI Studio.",
    heroBadges: [
      "🏆 320 Google Gemini Projects",
      "⚡ 90-Minute Build Pipeline",
      "🚀 Deploy-Ready Prompts"
    ],
    downloadTemplate: "Template.csv",
    addContext: "Add Context",
    downloadDataset: "Download Source",
    datasetLabel: "DATASET:",
    projectsLabel: "PROJECTS",
    extraContextLabel: "EXTRA CONTEXT:",
    extraContextItems: "items",
    clearExtraContext: "Clear extra context",
    contextAdded: "Context added",
    contextCleared: "Extra context cleared",
    
    // Data Error Modal
    dataErrorModal: {
      title: "Dataset Not Loaded",
      message: "We couldn't load the dataset automatically. You can upload your own CSV file or download the full dataset from GitHub and load it manually.",
      understood: "Got it",
      dontShowAgain: "Don't show this again"
    },
    
    // Nav
    navDashboard: "Overview",
    navDiscovery: "Browse 320 Projects",
    navAILab: "Build Mode",

    // Dashboard
    totalProjects: "Projects Analyzed",
    developers: "Contributors",
    topTrack: "Hottest Track",
    techStack: "Top Tech",
    trackDist: "Track Breakdown",
    topTech: "Most Used Technologies",

    // Discovery
    searchPlaceholder: "Find projects using TensorFlow, healthcare AI, vision models...",
    noProjects: "Nothing found. Try different keywords.",
    resetFilters: "Clear Filters",
    superpowers: {
      all: "All Capabilities",
      reasoning: "🧠 Complex Problem Solving",
      vision: "👁️ Image & Video AI",
      live: "⚡ Real-Time Apps",
      audio: "🗣️ Voice & Audio AI",
      context: "📚 Long-Context Analysis",
      tools: "🛠️ AI Agents & Tools"
    },
    modal: {
      projectDetails: "Project Details",
      track: "Track / Category",
      team: "Team Size",
      tech: "Technologies Used",
      description: "Description",
      close: "Close"
    },

    // AI Lab - Modes
    modeExplorer: "Ask The Data",
    modeBuilder: "Build Your Project",
    
    // Explorer
    contextQuery: "Ask The Data",
    askPlaceholder: "What problems haven't been solved? What's missing? Ask me anything...",
    useInsight: "Build This Idea →",

    // Builder Steps
    stepPlatform: "1. Platform",
    stepIdea: "2. Idea",
    stepValidation: "3. Validate",
    stepPRD: "4. Plan",
    stepPrompt: "5. Deploy",

    // Platform Selection
    platforms: {
      v0: {
        title: "⚡ v0.dev",
        subtitle: "Ship Beautiful UIs Fast",
        bestFor: "Modern web apps, dashboards, landing pages, and MVPs with external APIs.",
        strengths: "Generates production-ready React/Next.js code with shadcn/ui components. Deploys instantly to Vercel. Perfect for frontend-heavy projects.",
        limitations: "No built-in database or backend logic. You'll need to connect your own data services (Supabase, Firebase, etc.).",
        time: "working prototype in < 1 hour"
      },
      lovable: {
        title: "❤️ Lovable",
        subtitle: "Full-Stack, No Setup",
        bestFor: "Apps with user accounts, real-time features, and persistent data (social apps, SaaS tools, collaborative platforms).",
        strengths: "Complete full-stack apps with Supabase backend, authentication, real-time updates, and database setup included. Export code anytime.",
        limitations: "Opinionated tech stack (Supabase-based). Best if you're comfortable with their ecosystem. Adding custom AI models takes extra setup.",
        time: "full app with auth in 1-2 hours"
      },
      google: {
        title: "🧠 Google AI Studio",
        subtitle: "AI-First Prototypes",
        bestFor: "Projects where AI is the core feature: multimodal apps, long-context analysis, reasoning-heavy demos.",
        strengths: "Direct access to Gemini 1.5 Pro/Flash. Native support for audio, video, and images. Handles 1M+ token context windows. Built-in Python sandbox.",
        limitations: "Focus on AI functionality over polished UI. Best suited for Google Cloud deployments.",
        time: "advanced AI demo in 1-3 hours"
      }
    },

    // Actions
    selectPlatform: "Choose Your Platform",
    describeIntuition: "What problem are you solving? Describe your idea...",
    luckyMode: "🎲 Surprise Me (Find Blue Ocean)",
    generateConcept: "Refine My Idea",
    runValidation: "Validate This Idea",
    generatePRD: "Create Build Plan",
    generateMasterPrompt: "Get Deploy Prompt",
    exportPipeline: "Download Full Plan",
    resetPipeline: "Start Fresh",
    
    // Status
    waiting: "Ready when you are...",
    processing: "Thinking...",
    terminalOutput: "Output",
    complete: "Done ✓",
    
    // Dashboard - New KPIs & Modals
    dashboard: {
      // Notifications
      datasetLoaded: "Dataset loaded: {count} projects",
      projectsLoadedCached: "{count} projects loaded and cached",
      urlFetchFailed: "URL Fetch failed. Using local data.",
      contextAddedCsv: "{count} rows added as context",
      contextAddedDoc: "Document added: {name}",
      contextAddedJson: "JSON added: {keys} keys",
      errorReadingFile: "Error reading file",
      contextCleared: "Extra context cleared",
      dataResetOriginal: "Data reset to Original Dataset.",
      dataCleared: "Data cleared. Using samples.",
      datasetDownloaded: "Dataset downloaded successfully",
      errorDownloading: "Error downloading dataset",
      
      // UI Labels
      reloadResetData: "Reload or Reset Data",
      docs: "docs",
      clearContext: "Clear context",
      downloadCsvOriginal: "Download original CSV",
      downloadCsv: "Download CSV",
      importYourData: "Import your scraped data, CSVs or documents",
      yourData: "Your Data",
      
      // Modal
      projects: "projects",
      noProjectsCategory: "No projects in this category",
      escToClose: "ESC or click outside to close",
      projectsWithDemo: "Projects with Demo",
      projectsWithGithub: "Projects with GitHub", 
      projectsWithVideo: "Projects with Video",
      eliteProjects: "Elite Projects",
      clickToSeeList: "Click to see list",
      clickBarToSee: "Click a bar to see projects",
      
      // KPI Cards
      deploymentRate: "Deployment Rate",
      deploymentRateDesc: "Projects with Demo",
      githubRate: "GitHub Rate",
      githubRateDesc: "With Repository",
      videoRate: "Video Rate",
      videoRateDesc: "With Demo Video",
      eliteProjectsDesc: "Demo + GitHub + Video",
      avgEffort: "Avg Effort Score",
      avgEffortDesc: "Maturity Score",
      stackDominant: "Dominant Stack",
      stackDominantDesc: "Most used (excl. Gemini)",
      
      // Charts
      categoryBreakdown: "Category Breakdown",
      categoryBreakdownDesc: "Inferred from description & keywords",
      techStackChart: "Tech Stack",
      techStackChartDesc: "Most used technologies",
      keywordsCloud: "Trending Keywords",
      keywordsCloudDesc: "Most frequent keywords",
      gapOpportunities: "Gap Opportunities",
      gapOpportunitiesDesc: "Categories with less competition",
      projectsLower: "projects",
      insight: "INSIGHT",
      insightLegal: "Legal has very low competition. Real opportunity.",
      insightAccessibility: "Accessibility is a high-impact, low-saturation niche.",
      analyzingProjects: "Analyzing {count} projects..."
    },
    
    // AI Lab extras
    aiLab: {
      nextStep: "Next Step",
      noApiKey: "API key not configured. Add your VITE_GEMINI_API_KEY to .env",
      data: "DATA",
      build: "BUILD",
      newQuestion: "+ New question...",
      newThread: "New thread",
      topTechnologies: "What are the top 5 most popular technologies?",
      gapsOpportunities: "What gaps or opportunities exist?",
      emergingTrends: "What are the emerging trends?",
      innovativeIdeas: "Give me innovative ideas based on the data",
      history: "History",
      maximize: "Maximize",
      readyToAnalyze: "Ready to analyze...",
      useLeftPanel: "Use left panel",
      followUp: "Follow up...",
      maximized: "MAXIMIZED",
      close: "Close",
      messages: "messages",
      noContentYet: "No content yet...",
      continueConversation: "Continue conversation...",
      langInstructionFull: "RESPOND IN ENGLISH.",
      langInstructionShort: "Respond in English."
    }
  },
  es: {
    // Header
    appName: "protoi",
    appSubtitle: "De Datos a Demo en 90 Minutos",
    heroTitle: "Valida Tu Idea Contra 320 Proyectos Reales de Hackathon",
    heroDescription: "Mira qué han construido otros. Verifica si tu idea ya existe. Inspírate con proyectos reales. Obtén prompts listos para desplegar en v0, Lovable y AI Studio.",
    heroBadges: [
      "🏆 320 Proyectos Google Gemini",
      "⚡ Pipeline de 90 Minutos",
      "🚀 Prompts Listos para Usar"
    ],
    downloadTemplate: "Plantilla.csv",
    addContext: "Agregar Contexto",
    downloadDataset: "Descargar Fuente",
    datasetLabel: "DATASET:",
    projectsLabel: "PROYECTOS",
    extraContextLabel: "CONTEXTO EXTRA:",
    extraContextItems: "items",
    clearExtraContext: "Limpiar contexto extra",
    contextAdded: "Contexto agregado",
    contextCleared: "Contexto extra limpiado",
    
    // Data Error Modal
    dataErrorModal: {
      title: "Dataset No Cargado",
      message: "No pudimos cargar el dataset automáticamente. Puedes subir tu propio archivo CSV o descargar el dataset completo de GitHub y cargarlo manualmente.",
      understood: "Entendido",
      dontShowAgain: "No volver a mostrar"
    },
    
    // Nav
    navDashboard: "Resumen",
    navDiscovery: "Explorar 320 Proyectos",
    navAILab: "Modo Constructor",

    // Dashboard
    totalProjects: "Proyectos Analizados",
    developers: "Contribuidores",
    topTrack: "Track Más Popular",
    techStack: "Tech Principal",
    trackDist: "Desglose por Track",
    topTech: "Tecnologías Más Usadas",

    // Discovery
    searchPlaceholder: "Busca proyectos con TensorFlow, IA médica, modelos de visión...",
    noProjects: "Nada encontrado. Prueba otras palabras clave.",
    resetFilters: "Limpiar Filtros",
    superpowers: {
      all: "Todas las Capacidades",
      reasoning: "🧠 Resolución de Problemas Complejos",
      vision: "👁️ IA de Imagen y Video",
      live: "⚡ Apps en Tiempo Real",
      audio: "🗣️ IA de Voz y Audio",
      context: "📚 Análisis de Contexto Largo",
      tools: "🛠️ Agentes y Herramientas IA"
    },
    modal: {
      projectDetails: "Detalles del Proyecto",
      track: "Track / Categoría",
      team: "Tamaño del Equipo",
      tech: "Tecnologías Usadas",
      description: "Descripción",
      close: "Cerrar"
    },

    // AI Lab - Modes
    modeExplorer: "Preguntar a los Datos",
    modeBuilder: "Construir Tu Proyecto",

    // Explorer
    contextQuery: "Preguntar a los Datos",
    askPlaceholder: "¿Qué problemas no se han resuelto? ¿Qué falta? Pregúntame lo que sea...",
    useInsight: "Construir Esta Idea →",

    // Builder Steps
    stepPlatform: "1. Plataforma",
    stepIdea: "2. Idea",
    stepValidation: "3. Validar",
    stepPRD: "4. Planificar",
    stepPrompt: "5. Desplegar",

    // Platform Selection
    platforms: {
      v0: {
        title: "⚡ v0.dev",
        subtitle: "UI Hermosas, Rápido",
        bestFor: "Apps web modernas, dashboards, landing pages y MVPs con APIs externas.",
        strengths: "Genera código React/Next.js listo para producción con componentes shadcn/ui. Despliega al instante en Vercel. Perfecto para proyectos frontend.",
        limitations: "Sin base de datos o lógica backend incluida. Necesitarás conectar tus propios servicios de datos (Supabase, Firebase, etc.).",
        time: "prototipo funcional en < 1 hora"
      },
      lovable: {
        title: "❤️ Lovable",
        subtitle: "Full-Stack, Sin Configuración",
        bestFor: "Apps con cuentas de usuario, funciones en tiempo real y datos persistentes (apps sociales, herramientas SaaS, plataformas colaborativas).",
        strengths: "Apps full-stack completas con backend Supabase, autenticación, actualizaciones en tiempo real y base de datos incluida. Exporta el código cuando quieras.",
        limitations: "Stack tecnológico opinado (basado en Supabase). Ideal si te sientes cómodo con su ecosistema. Agregar modelos IA personalizados requiere configuración extra.",
        time: "app completa con auth en 1-2 horas"
      },
      google: {
        title: "🧠 Google AI Studio",
        subtitle: "Prototipos Centrados en IA",
        bestFor: "Proyectos donde la IA es la característica principal: apps multimodales, análisis de contexto largo, demos con razonamiento complejo.",
        strengths: "Acceso directo a Gemini 1.5 Pro/Flash. Soporte nativo para audio, video e imágenes. Maneja ventanas de contexto de 1M+ tokens. Sandbox Python integrado.",
        limitations: "Enfoque en funcionalidad IA sobre UI pulido. Mejor para despliegues en Google Cloud.",
        time: "demo IA avanzada en 1-3 horas"
      }
    },

    // Actions
    selectPlatform: "Elige Tu Plataforma",
    describeIntuition: "¿Qué problema estás resolviendo? Describe tu idea...",
    luckyMode: "🎲 Sorpréndeme (Buscar Océano Azul)",
    generateConcept: "Refinar Mi Idea",
    runValidation: "Validar Esta Idea",
    generatePRD: "Crear Plan de Construcción",
    generateMasterPrompt: "Obtener Prompt de Despliegue",
    exportPipeline: "Descargar Plan Completo",
    resetPipeline: "Empezar de Nuevo",

    // Status
    waiting: "Listo cuando tú lo estés...",
    processing: "Pensando...",
    terminalOutput: "Salida",
    complete: "Listo ✓",
    
    // Dashboard - New KPIs & Modals
    dashboard: {
      // Notifications
      datasetLoaded: "Dataset cargado: {count} proyectos",
      projectsLoadedCached: "{count} proyectos cargados y guardados",
      urlFetchFailed: "Error cargando URL. Usando datos locales.",
      contextAddedCsv: "{count} filas agregadas como contexto",
      contextAddedDoc: "Documento agregado: {name}",
      contextAddedJson: "JSON agregado: {keys} claves",
      errorReadingFile: "Error leyendo archivo",
      contextCleared: "Contexto extra limpiado",
      dataResetOriginal: "Datos reseteados al Dataset Original.",
      dataCleared: "Datos borrados. Usando ejemplos.",
      datasetDownloaded: "Dataset descargado correctamente",
      errorDownloading: "Error al descargar el dataset",
      
      // UI Labels
      reloadResetData: "Recargar o Resetear Datos",
      docs: "docs",
      clearContext: "Limpiar contexto",
      downloadCsvOriginal: "Descargar CSV original",
      downloadCsv: "Descargar CSV",
      importYourData: "Importa tus propios datos scrapeados, CSVs o documentos",
      yourData: "Tus Datos",
      
      // Modal
      projects: "proyectos",
      noProjectsCategory: "No hay proyectos en esta categoría",
      escToClose: "ESC o click afuera para cerrar",
      projectsWithDemo: "Proyectos con Demo",
      projectsWithGithub: "Proyectos con GitHub",
      projectsWithVideo: "Proyectos con Video",
      eliteProjects: "Proyectos Elite",
      clickToSeeList: "Click para ver lista",
      clickBarToSee: "Click en una barra para ver proyectos",
      
      // KPI Cards
      deploymentRate: "Tasa de Despliegue",
      deploymentRateDesc: "Proyectos con Demo",
      githubRate: "Tasa de GitHub",
      githubRateDesc: "Con Repositorio",
      videoRate: "Tasa de Video",
      videoRateDesc: "Con Demo Video",
      eliteProjectsDesc: "Demo + GitHub + Video",
      avgEffort: "Esfuerzo Promedio",
      avgEffortDesc: "Score de Madurez",
      stackDominant: "Stack Dominante",
      stackDominantDesc: "Más usado (sin Gemini)",
      
      // Charts
      categoryBreakdown: "Distribución por Categoría",
      categoryBreakdownDesc: "Inferido de descripción y keywords",
      techStackChart: "Stack Tecnológico",
      techStackChartDesc: "Tecnologías más usadas",
      keywordsCloud: "Tendencias",
      keywordsCloudDesc: "Keywords más frecuentes",
      gapOpportunities: "Oportunidades (Gaps)",
      gapOpportunitiesDesc: "Categorías con menos competencia",
      projectsLower: "proyectos",
      insight: "INSIGHT",
      insightLegal: "Legal tiene muy poca competencia. Oportunidad real.",
      insightAccessibility: "Accesibilidad es un nicho con alto impacto y baja saturación.",
      analyzingProjects: "Analizando {count} proyectos..."
    },
    
    // AI Lab extras
    aiLab: {
      nextStep: "Siguiente Paso",
      noApiKey: "API key no configurada. Agrega tu VITE_GEMINI_API_KEY en .env",
      data: "DATOS",
      build: "CREAR",
      newQuestion: "+ Nueva pregunta...",
      newThread: "Nuevo thread",
      topTechnologies: "¿Cuáles son las 5 tecnologías más populares?",
      gapsOpportunities: "¿Qué huecos u oportunidades existen?",
      emergingTrends: "¿Cuáles son las tendencias emergentes?",
      innovativeIdeas: "Dame ideas innovadoras basadas en los datos",
      history: "Historial",
      maximize: "Maximizar",
      readyToAnalyze: "Listo para analizar...",
      useLeftPanel: "Usa el panel izquierdo",
      followUp: "Seguir...",
      maximized: "MAXIMIZADO",
      close: "Cerrar",
      messages: "mensajes",
      noContentYet: "Sin contenido aún...",
      continueConversation: "Continuar conversación...",
      langInstructionFull: "CRITICAL: YOU MUST RESPOND EXCLUSIVELY IN SPANISH (ESPAÑOL). EXCEPT FOR THE MASTER PROMPT WHICH MUST BE IN ENGLISH.",
      langInstructionShort: "Responde en Español."
    }
  }
};
