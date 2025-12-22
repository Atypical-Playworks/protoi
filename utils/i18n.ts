
import { Language } from '../types';

export const translations = {
  en: {
    // Header
    appName: "protoi",
    appSubtitle: "From Data to Demo",
    heroTitle: "Validate Your Idea Against 320 Real Hackathon Projects",
    heroDescription: "See what others have built. Check if your idea already exists. Find inspiration in real projects. Get ready-to-deploy prompts for v0, Lovable & AI Studio.",
    heroBadges: [
      "🏆 320 Google Gemini Projects",
      "⚡ Instant Build Pipeline",
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
        subtitle: "Agentic AI Builder – From Idea to Deployed App",
        bestFor: "Modern web apps, dashboards, landing pages, and MVPs with external APIs.",
        strengths: "Now an autonomous agent (v0.app launched August 2025): researches, plans, fixes bugs, and builds full apps with UI+backend+logic. Generates React/Next.js code with shadcn/ui + Tailwind. Integrates with GitHub, searches the web, inspects sites, and deploys to Vercel with one click. Supports MCP (Model Context Protocol) to connect external tools.",
        limitations: "While it handles basic backend (APIs, DB), for very complex logic or advanced external services you need to connect your own APIs (Supabase, Firebase, etc.). 'Agentic mode' is powerful but can make unexpected decisions – requires human validation."
      },
      lovable: {
        title: "❤️ Lovable",
        subtitle: "Full-Stack AI Engineer – Pre-Configured Supabase",
        bestFor: "SaaS MVPs, collaborative apps, internal tools, and any project needing auth + database from minute 1.",
        strengths: "'Lovable 2.0' engine (July 2025): Structured Chat mode as dev agent, real-time multiplayer collaboration, and native Supabase integration (DB+Auth+Storage). Generates full-stack React+Vite apps with backend configured. Bidirectional GitHub sync. Can import designs from Figma via Builder.io. Ideal for non-coders and devs wanting extreme speed.",
        limitations: "Opinionated stack (React+Supabase). UI customization within the platform is limited vs manual coding. Credit model can be costly if you iterate a lot (each change consumes credits). For large/complex apps, exporting to GitHub and continuing in VS Code is usually necessary."
      },
      google: {
        title: "🧠 Google AI Studio + Gemini 3",
        subtitle: "Multimodal Playground for AI-First Prototypes",
        bestFor: "Demos where AI IS the product: multimodal analysis (text+image+video+audio), deep reasoning agents, apps processing massive contexts (1M+ tokens), research projects.",
        strengths: "Direct access to Gemini 3 Pro/Flash (December 2025): Google's smartest model with PhD-level reasoning, top 1 on LMArena (1501 Elo), and state-of-the-art multimodal capabilities. Gemini 3 Deep Think for ultra-complex problems. Built-in tools: function calling, code execution, web search. Exports prompts to Colab/Vertex AI. Ideal for 'vibe coding' with advanced AI and quick experiments without setup.",
        limitations: "Not an 'app builder' like v0 or Lovable – it's a prompt playground. For production you need to move code to Google Cloud (Vertex AI) or integrate manually. Generated UI is functional but basic. Better for complex AI logic than polished app design."
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
    connectingAI: "Connecting to AI...",
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
      langInstructionShort: "Respond in English.",
      langInstructionBuilder: "RESPOND IN ENGLISH.",
      // Builder step descriptions - Informative about what each step does
      stepDescPlatform: "Choose your platform based on your ideal stack: v0 for Next.js apps with instant deploy, Lovable for full-stack MVPs with pre-configured Supabase, or AI Studio for multimodal AI-centric prototypes.",
      stepDescIdea: "Describe your concept or let AI find gaps in the dataset. Press Enter to refine your idea.",
      stepDescValidation: "AI analyzes market fit, competition from the 320 projects, and technical risks for your platform.",
      stepDescPRD: "Generates a Product Requirements Document: features, user flows, and AI integration points.",
      stepDescPrompt: "Creates a copy-paste prompt optimized for your chosen platform to build the app.",
      stepLabelIdea: "IDEA",
      stepLabelValidation: "VALIDATE",
      stepLabelPRD: "PRD",
      stepLabelPrompt: "PROMPT",
      generatingIdea: "Refining your concept...",
      generatingValidation: "Analyzing market • competition • risks...",
      generatingPRD: "Building features • flow • AI touchpoints...",
      generatingPrompt: "Creating deploy-ready prompt...",
      pressEnterToGen: "Press Enter to generate",
      orClickLucky: "or click LUCKY for inspiration",
      // Builder flow
      continueValidate: "CONTINUE → VALIDATE",
      continuePRD: "CONTINUE → PRD",
      continuePrompt: "CONTINUE → MASTER PROMPT",
      readyToDeploy: "Ready to deploy!",
      copyFromTerminal: "Copy your prompt from the terminal.",
      validationComplete: "Validation complete — review findings above",
      prdComplete: "PRD complete — review your build plan",
      exportAll: "EXPORT ALL",
      // UI Preview
      generatePreview: "GENERATE UI PREVIEW",
      regeneratePreview: "REGENERATE PREVIEW",
      generatingPreview: "GENERATING PREVIEW..."
    }
  },
  es: {
    // Header
    appName: "protoi",
    appSubtitle: "De Datos a Demo",
    heroTitle: "Valida Tu Idea Contra 320 Proyectos Reales de Hackathon",
    heroDescription: "Mira qué han construido otros. Verifica si tu idea ya existe. Inspírate con proyectos reales. Obtén prompts listos para desplegar en v0, Lovable y AI Studio.",
    heroBadges: [
      "🏆 320 Proyectos Google Gemini",
      "⚡ Pipeline Instantáneo",
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
        title: "⚡ v0 by Vercel",
        subtitle: "Agentic AI Builder – De Idea a App Deployed",
        bestFor: "Landing pages, dashboards interactivos, MVPs con UI premium y apps Next.js full-stack con backend integrado.",
        strengths: "Ahora es un agente autónomo (v0.app lanzado Agosto 2025): investiga, planifica, corrige errores y construye apps completas con UI+backend+lógica. Genera código React/Next.js con shadcn/ui + Tailwind. Integra con GitHub, busca en web, inspecciona sitios, y se despliega en Vercel con un clic. Soporta MCP (Model Context Protocol) para conectar herramientas externas.",
        limitations: "Aunque ahora maneja backend básico (APIs, DB), para lógica muy compleja o servicios externos avanzados necesitas conectar tus propias APIs (Supabase, Firebase, etc.). El 'agentic mode' es potente pero puede tomar decisiones inesperadas – requiere validación humana."
      },
      lovable: {
        title: "❤️ Lovable",
        subtitle: "Full-Stack AI Engineer – Supabase Pre-Configurado",
        bestFor: "SaaS MVPs, apps colaborativas, herramientas internas, y cualquier proyecto que necesite autenticación + base de datos desde el minuto 1.",
        strengths: "Motor 'Lovable 2.0' (Julio 2025): modo Chat estructurado como agente de desarrollo, colaboración multiplayer en tiempo real, y integración nativa con Supabase (DB+Auth+Storage). Genera apps full-stack React+Vite con todo el backend configurado. GitHub sync bidireccional. Puede importar diseños desde Figma vía Builder.io. Ideal para no-programadores y devs que quieren velocidad extrema.",
        limitations: "Stack opinado (React+Supabase). Personalización UI dentro de la plataforma es limitada vs codear manualmente. Modelo de créditos puede ser costoso si iteras mucho (cada cambio consume créditos). Para apps grandes/complejas, exportar a GitHub y continuar en VS Code suele ser necesario."
      },
      google: {
        title: "🧠 Google AI Studio + Gemini 3",
        subtitle: "Playground Multimodal para Prototipos IA-First",
        bestFor: "Demos donde la IA ES el producto: análisis multimodal (texto+imagen+video+audio), agentes con razonamiento profundo, apps que procesan contextos masivos (1M tokens), proyectos de investigación.",
        strengths: "Acceso directo a Gemini 3 Pro/Flash (Diciembre 2025): el modelo más inteligente de Google con PhD-level reasoning, top 1 en LMArena (1501 Elo), y capacidades multimodales state-of-the-art. Gemini 3 Deep Think para problemas ultra-complejos. Herramientas integradas: function calling, code execution, web search. Exporta prompts a Colab/Vertex AI. Ideal para 'vibe coding' con IA avanzada y experimentos rápidos sin configurar nada.",
        limitations: "No es un 'app builder' como v0 o Lovable – es un playground de prompts. Para producción necesitas mover tu código a Google Cloud (Vertex AI) o integrarlo manualmente. El UI generado es funcional pero básico. Mejor para lógica IA compleja que para apps pulidas con diseño."
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
    processing: "Pensando...", connectingAI: "Conectando con IA...", terminalOutput: "Salida",
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
      langInstructionShort: "Responde en Español.",
      langInstructionBuilder: "CRITICAL: YOU MUST RESPOND EXCLUSIVELY IN SPANISH (ESPAÑOL). Do NOT generate any Master Prompt or deployment prompt in this step.",
      // Builder step descriptions
      // Builder step descriptions - Informative about what each step does
      stepDescPlatform: "Elige tu plataforma según tu stack ideal: v0 para apps Next.js con deploy instantáneo, Lovable para MVPs full-stack con Supabase pre-configurado, o AI Studio para prototipos centrados en IA multimodal.",
      stepDescIdea: "Describe tu concepto o deja que la IA encuentre brechas en el dataset. Enter para refinar tu idea.",
      stepDescValidation: "La IA analiza encaje de mercado, competencia de los 320 proyectos, y riesgos técnicos para tu plataforma.",
      stepDescPRD: "Genera un Documento de Requisitos: funcionalidades, flujos de usuario, y puntos de integración con IA.",
      stepDescPrompt: "Crea un prompt de copiar-pegar optimizado para tu plataforma elegida para construir la app.",
      stepLabelIdea: "IDEA",
      stepLabelValidation: "VALIDAR",
      stepLabelPRD: "PRD",
      stepLabelPrompt: "PROMPT",
      generatingIdea: "Refinando tu concepto...",
      generatingValidation: "Analizando mercado • competencia • riesgos...",
      generatingPRD: "Construyendo features • flujo • puntos de IA...",
      generatingPrompt: "Creando prompt de despliegue...",
      pressEnterToGen: "Presiona Enter para generar",
      orClickLucky: "o click en LUCKY para inspiración",
      // Builder flow
      continueValidate: "CONTINUAR → VALIDAR",
      continuePRD: "CONTINUAR → PRD",
      continuePrompt: "CONTINUAR → MASTER PROMPT",
      readyToDeploy: "¡Listo para desplegar!",
      copyFromTerminal: "Copia tu prompt desde la terminal.",
      validationComplete: "Validación completa — revisa hallazgos arriba",
      prdComplete: "PRD completo — revisa tu plan de construcción",
      exportAll: "EXPORTAR TODO",
      // UI Preview
      generatePreview: "GENERAR UI PREVIEW",
      regeneratePreview: "REGENERAR PREVIEW",
      generatingPreview: "GENERANDO PREVIEW..."
    }
  }
};
