
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
    loadDataset: "Load Dataset",
    downloadDataset: "Download Dataset",
    datasetLabel: "DATASET:",
    projectsLabel: "PROJECTS",
    
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
    complete: "Done ✓"
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
    loadDataset: "Cargar Dataset",
    downloadDataset: "Descargar Dataset",
    datasetLabel: "DATASET:",
    projectsLabel: "PROYECTOS",
    
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
    complete: "Listo ✓"
  }
};
