
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Project } from '../types';
import { geminiService, GeminiService } from '../services/geminiService';
import { Card } from './Card';
import { 
  Sparkles, Zap, Loader2, Terminal, Copy, Check, 
  Volume2, StopCircle, ChevronDown, Lightbulb, 
  Target, FileText, Rocket, Download, Trash2, 
  CheckCircle2, ArrowRight, MessageSquare, Send,
  LayoutTemplate, Layers, Code2, Clock, Database, Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface AILabProps {
  projects: Project[];
}

type PlatformType = 'v0' | 'lovable' | 'google' | null;

interface Pipeline {
  platform: PlatformType;
  idea: string | null;
  validation: string | null;
  prd: string | null;
  masterPrompt: string | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Helper to decode Base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM/Audio Data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AILab: React.FC<AILabProps> = ({ projects }) => {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  
  // Mode: 'explorer' (Chat) or 'builder' (Pipeline)
  const [mode, setMode] = useState<'explorer' | 'builder'>('explorer');
  
  // --- CHAT STATE ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- BUILDER STATE ---
  const [builderStep, setBuilderStep] = useState(0); // 0=Platform, 1=Idea, 2=Validation, 3=PRD, 4=Prompt
  const [pipeline, setPipeline] = useState<Pipeline>({
    platform: null,
    idea: null,
    validation: null,
    prd: null,
    masterPrompt: null
  });
  const [ideaInput, setIdeaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- AUDIO STATE ---
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [copied, setCopied] = useState(false);

  const nextStepLabel = language === 'es' ? 'Siguiente Paso' : 'Next Step';

  // Stats for Context Card
  const uniqueTracks = new Set(projects.map(p => p.track)).size;
  const uniqueTech = new Set(projects.flatMap(p => p.techStack)).size;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getLanguageInstruction = () => {
    return language === 'es' 
      ? "CRITICAL: YOU MUST RESPOND EXCLUSIVELY IN SPANISH (ESPAÑOL). EXCEPT FOR THE MASTER PROMPT WHICH MUST BE IN ENGLISH."
      : "RESPOND IN ENGLISH.";
  };

  // ==================== EXPLORER (CHAT) LOGIC ====================

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    const context = GeminiService.formatContext(projects);
    const langInstruction = language === 'es' ? "Responde en Español." : "Respond in English.";
    
    // Simple context window
    const conversationHistory = chatMessages
      .slice(-4)
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `
      ${context}
      ${langInstruction}
      
      You are a Data Analyst for a Hackathon. Analyze the 320 projects provided in the dataset.
      
      CONVERSATION HISTORY:
      ${conversationHistory}
      
      NEW USER QUESTION: ${userMessage}
      
      CRITICAL INSTRUCTIONS:
      1. Be concise. Keep answers short (max 3-4 sentences unless requested otherwise).
      2. Do NOT summarize the dataset unless explicitly asked.
      3. Use bullet points for readability.
      4. If the user asks for "ideas" or "trends", give 3 specific examples max.
      5. Do not repeat general info. Go straight to the specific answer.
    `;

    const response = await geminiService.generateContent(prompt, 'gemini-2.5-flash');
    
    setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsChatLoading(false);
  };

  const convertChatToIdea = () => {
    const lastAssistantMsg = [...chatMessages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      setIdeaInput(lastAssistantMsg.content); // Pre-fill idea input
      setMode('builder');
      setBuilderStep(0); // Start at platform selection
    }
  };

  // ==================== BUILDER (PIPELINE) LOGIC ====================

  const handlePlatformSelect = (p: PlatformType) => {
    setPipeline(prev => ({ ...prev, platform: p }));
    setBuilderStep(1);
  };

  const generateStep = async (step: 'idea' | 'validation' | 'prd' | 'prompt', luckyMode = false) => {
    setIsGenerating(true);
    stopAudio();
    
    const context = GeminiService.formatContext(projects);
    const langInstruction = getLanguageInstruction();
    const platformInfo = t.platforms[pipeline.platform || 'google'];
    let prompt = '';

    if (step === 'idea') {
      prompt = `
        ${context}
        ${langInstruction}
        
        CONTEXT:
        The user has selected the platform: ${platformInfo.title}.
        Platform Strengths: ${platformInfo.strengths}
        Platform Limitations: ${platformInfo.limitations}
        
        TASK:
        ${luckyMode 
          ? "Analyze the dataset for 'Blue Ocean' gaps (unsolved problems) and generate a killer Hackathon idea that fits the platform's strengths." 
          : `Refine the user's intuition: "${ideaInput}". Ensure it fits the platform's constraints and stands out from the dataset.`}
        
        OUTPUT FORMAT (Markdown):
        # 💡 Concept: [Name]
        **The Pitch:** [Narrative hook]
        **Why this Platform:** Explain why ${platformInfo.title} is perfect for this (e.g. "Because this requires complex reasoning..." or "Because this needs rapid UI...").
        **Viability Check:** Can this be built in 72h on this platform? (Be honest about risks).
      `;
    } else if (step === 'validation') {
      prompt = `
        ${langInstruction}
        
        IDEA:
        ${pipeline.idea}
        
        PLATFORM: ${pipeline.platform}
        
        TASK:
        Perform a Market & Tech Validation.
        
        OUTPUT FORMAT (Markdown):
        # 📊 Validation Analysis
        **Market Opportunity:** Size, urgency, user pain points.
        **Competitive Landscape:** Compare with the provided dataset. What makes this unique?
        **Platform Fit Risk:** Specific technical risks of building THIS idea on ${pipeline.platform}.
        
        ## 💀 Brutal Feedback (No Filters)
        [Act as a cynical Senior Engineer & VC. Tear this idea apart. Why might it fail? What are the hard truths the user is ignoring? Be direct, almost harsh, but constructive. Identify "hand-wavy" logic or technical impossibilities for a hackathon timeframe.]

        **Verdict:** [Viable / Risky / Pivot Needed]
      `;
    } else if (step === 'prd') {
      prompt = `
        ${langInstruction}
        
        IDEA: ${pipeline.idea}
        VALIDATION: ${pipeline.validation}
        PLATFORM: ${pipeline.platform}
        
        TASK:
        Draft a High-Level Conceptual PRD. DO NOT write code. DO NOT list specific libraries unless native to the platform.
        Focus on "WHAT" needs to be built, let the platform decide "HOW".
        
        OUTPUT FORMAT (Markdown):
        # 📝 Conceptual PRD
        **1. Executive Summary:** The vision.
        **2. Core Features (MoSCoW):** Must have vs Nice to have.
        **3. User Flow:** Narrative walkthrough of the demo.
        **4. AI Touchpoints:** Where exactly is GenAI used? (Reasoning, Image generation, etc.)
        **5. Data Needs:** What data is input/output?
      `;
    } else if (step === 'prompt') {
      // MASTER PROMPT IS ALWAYS IN ENGLISH FOR THE TOOLS
      prompt = `
        CONTEXT:
        We are building a hackathon project on: ${platformInfo.title}.
        
        INPUTS:
        Idea: ${pipeline.idea}
        PRD: ${pipeline.prd}
        
        TASK:
        Create a single, structured MASTER PROMPT in ENGLISH that I can copy-paste into ${platformInfo.title}'s AI chat to build this app.
        
        The prompt should:
        1. Set the role (Senior Engineer).
        2. Describe the app goal and user flow clearly.
        3. List key features from the PRD.
        4. Explicitly tell ${platformInfo.title} to make technical choices (stack, styling) based on its own best practices.
        5. Emphasize "Speed to Demo" and "Robustness".
        
        OUTPUT FORMAT (Markdown):
        # 🚀 Master Prompt for ${platformInfo.title}
        
        \`\`\`text
        [The full prompt goes here...]
        \`\`\`
        
        **Next Steps:**
        1. Copy the code block above.
        2. Go to ${platformInfo.title}.
        3. Paste and run.
      `;
    }

    const result = await geminiService.generateContent(prompt, 'gemini-3-pro-preview');
    
    setPipeline(prev => ({
      ...prev,
      [step === 'prompt' ? 'masterPrompt' : step]: result
    }));
    
    setIsGenerating(false);
  };

  const resetPipeline = () => {
    setBuilderStep(0);
    setPipeline({ platform: null, idea: null, validation: null, prd: null, masterPrompt: null });
    setIdeaInput('');
    stopAudio();
  };

  const exportPipeline = () => {
    const content = `# Hackathon Builder Pipeline
Platform: ${pipeline.platform}
Date: ${new Date().toLocaleString()}

## 1. IDEA
${pipeline.idea}

## 2. VALIDATION
${pipeline.validation}

## 3. CONCEPTUAL PRD
${pipeline.prd}

## 4. MASTER PROMPT
${pipeline.masterPrompt}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hackathon-plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- AUDIO LOGIC ---
  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) { stopAudio(); return; }
    
    const content = mode === 'explorer' 
      ? chatMessages[chatMessages.length - 1]?.content 
      : (builderStep === 1 ? pipeline.idea : builderStep === 2 ? pipeline.validation : builderStep === 3 ? pipeline.prd : pipeline.masterPrompt);
      
    if (!content) return;

    try {
      setIsGeneratingAudio(true);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      const base64Audio = await geminiService.generateSpeech(content, language);
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        audioSourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (err) { console.error(err); } 
    finally { setIsGeneratingAudio(false); }
  };

  const handleCopy = () => {
    const content = pipeline.masterPrompt || '';
    // Try to extract content inside code block if exists
    const codeMatch = content.match(/```text\n([\s\S]*?)\n```/);
    const textToCopy = codeMatch ? codeMatch[1] : content;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPlatformCard = (key: 'v0' | 'lovable' | 'google', Icon: any) => {
    const p = t.platforms[key];
    const isSelected = pipeline.platform === key;
    return (
      <div 
        onClick={() => handlePlatformSelect(key)}
        className={`relative p-5 rounded-xl transition-all cursor-pointer group hover:-translate-y-1 ${
          isSelected 
            ? 'neu-card ring-2 ring-neu-primary' 
            : 'neu-flat hover:shadow-neu-convex'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-neu-text font-bold text-lg">
            <Icon className={`w-5 h-5 ${isSelected ? 'text-neu-primary' : 'text-neu-textDim'}`} />
            {p.title}
          </div>
          {isSelected && <CheckCircle2 className="w-5 h-5 text-neu-primary" />}
        </div>
        <p className="text-neu-textDim text-xs font-mono mb-4">{p.subtitle}</p>
        
        <div className="space-y-3">
          <div className="text-xs text-neu-text">
            <span className="text-neu-primary font-bold">Best for: </span>{p.bestFor}
          </div>
          <div className="text-xs text-neu-textDim pl-2 border-l border-neu-border">
            {p.time}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* LEFT COLUMN: CONTROLS */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Mode Switcher - Neumorphic */}
        <div className="neu-pill p-1.5 flex gap-1">
          <button
            onClick={() => setMode('explorer')}
            className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${
              mode === 'explorer' 
                ? 'neu-button-primary' 
                : 'text-neu-textDim hover:text-neu-text'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            {t.modeExplorer}
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${
              mode === 'builder' 
                ? 'neu-button-primary' 
                : 'text-neu-textDim hover:text-neu-text'
            }`}
          >
            <Rocket className="w-4 h-4 inline mr-2" />
            {t.modeBuilder}
          </button>
        </div>

        {mode === 'explorer' ? (
          // EXPLORER CONTROLS
          <div className="space-y-4 animate-slide-up">
            {/* Query Input & Actions */}
            <Card title={t.contextQuery}>
              <div className="space-y-4">
                <div className="relative">
                   <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                      placeholder={t.askPlaceholder}
                      disabled={isChatLoading}
                      className="w-full neu-input py-3 pl-3 pr-10 text-xs text-neu-text"
                    />
                    <button
                      onClick={handleChatSubmit}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neu-primary hover:text-neu-text transition-colors disabled:opacity-50"
                    >
                      {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setChatInput(language === 'es' ? '¿Cuáles son las 5 tecnologías más populares?' : 'What are the top 5 most popular technologies?');
                    }}
                    className="p-2 neu-flat text-[10px] text-neu-textDim hover:text-neu-text transition-all text-left flex items-center"
                  >
                    <Zap className="w-3 h-3 mr-2 text-neu-primary flex-shrink-0" />
                    {language === 'es' ? 'Top Tecnologías' : 'Top Tech'}
                  </button>
                  <button
                    onClick={() => {
                      setChatInput(language === 'es' ? '¿Qué huecos u oportunidades existen?' : 'What gaps or opportunities exist?');
                    }}
                    className="p-2 neu-flat text-[10px] text-neu-textDim hover:text-neu-text transition-all text-left flex items-center"
                  >
                    <Target className="w-3 h-3 mr-2 text-emerald-400 flex-shrink-0" />
                    {language === 'es' ? 'Oportunidades' : 'Opportunities'}
                  </button>
                  <button
                    onClick={() => {
                      setChatInput(language === 'es' ? '¿Cuáles son las tendencias emergentes?' : 'What are the emerging trends?');
                    }}
                    className="p-2 neu-flat text-[10px] text-neu-textDim hover:text-neu-text transition-all text-left flex items-center"
                  >
                    <Sparkles className="w-3 h-3 mr-2 text-purple-400 flex-shrink-0" />
                    {language === 'es' ? 'Tendencias' : 'Trends'}
                  </button>
                  <button
                    onClick={() => {
                      setChatInput(language === 'es' ? 'Dame ideas innovadoras basadas en los datos' : 'Give me innovative ideas based on the data');
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-cyber-dim hover:text-white transition-all text-left flex items-center"
                  >
                    <Lightbulb className="w-3 h-3 mr-2 text-yellow-400 flex-shrink-0" />
                    {language === 'es' ? 'Ideas' : 'Ideas'}
                  </button>
                </div>

                {chatMessages.length > 0 && (
                  <button onClick={convertChatToIdea} className="w-full py-2 neu-button-primary text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all mt-2">
                    <Rocket className="w-3 h-3" />
                    {t.useInsight}
                  </button>
                )}
              </div>
            </Card>

            {/* Query History */}
            {chatMessages.length > 0 && (
              <Card title={language === 'es' ? 'Historial Reciente' : 'Recent History'}>
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                  {chatMessages
                    .filter(msg => msg.role === 'user')
                    .slice(-5)
                    .reverse()
                    .map((msg, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(msg.content)}
                        className="w-full text-left p-3 neu-flat text-xs text-neu-textDim hover:text-neu-text transition-all group flex items-start gap-2"
                      >
                         <Clock className="w-3 h-3 mt-0.5 text-neu-textDim opacity-50 group-hover:text-neu-primary" />
                         <span className="line-clamp-2">{msg.content}</span>
                      </button>
                    ))}
                </div>
              </Card>
            )}

             {/* Dataset Context Info */}
             <Card title={language === 'es' ? 'Contexto del Dataset' : 'Dataset Context'}>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 neu-concave">
                  <div className="flex items-center gap-2 text-neu-textDim">
                    <Database className="w-3 h-3" />
                    <span>Total Projects</span>
                  </div>
                  <span className="text-neu-text font-mono font-bold">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 neu-concave">
                  <div className="flex items-center gap-2 text-neu-textDim">
                    <Layers className="w-3 h-3" />
                    <span>Tracks</span>
                  </div>
                  <span className="text-neu-text font-mono font-bold">{uniqueTracks}</span>
                </div>
                <div className="flex justify-between items-center p-2 neu-concave">
                  <div className="flex items-center gap-2 text-neu-textDim">
                    <Code2 className="w-3 h-3" />
                    <span>Technologies</span>
                  </div>
                  <span className="text-neu-text font-mono font-bold">{uniqueTech}+</span>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // BUILDER CONTROLS
          <div className="space-y-4 animate-fade-in">
             {/* Stepper Header */}
             <div className="flex justify-between items-center px-2 mb-4">
               {[t.stepPlatform, t.stepIdea, t.stepValidation, t.stepPRD, t.stepPrompt].map((step, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => idx <= builderStep && idx !== 0 && setBuilderStep(idx)}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                     idx === builderStep ? 'neu-button-primary shadow-lg scale-110' :
                     idx < builderStep ? 'neu-flat text-emerald-500' :
                     'neu-flat text-neu-textDim'
                   }`}>
                     {idx < builderStep ? <Check className="w-4 h-4" /> : idx + 1}
                   </div>
                   <span className={`text-[9px] uppercase tracking-wider ${idx === builderStep ? 'text-neu-text' : 'text-neu-textDim'}`}>{step.split(' ')[0]}</span>
                 </div>
               ))}
             </div>

             {/* Steps Content */}
             {builderStep === 0 && (
               <div className="space-y-4 animate-slide-up">
                 {renderPlatformCard('v0', LayoutTemplate)}
                 {renderPlatformCard('lovable', Layers)}
                 {renderPlatformCard('google', Code2)}
               </div>
             )}

             {builderStep === 1 && (
               <Card title={t.stepIdea} className="animate-slide-up">
                 <div className="space-y-4">
                    <p className="text-xs text-neu-textDim leading-relaxed">
                       Selected: <span className="text-neu-text font-bold">{t.platforms[pipeline.platform!].title}</span>. 
                       Strengths: {t.platforms[pipeline.platform!].strengths}
                    </p>
                    <textarea 
                      value={ideaInput}
                      onChange={(e) => setIdeaInput(e.target.value)}
                      placeholder={t.describeIntuition}
                      className="w-full h-32 neu-input p-3 text-sm text-neu-text resize-none"
                    />
                    <div className="flex gap-2">
                       <button 
                         onClick={() => generateStep('idea', false)}
                         disabled={!ideaInput || isGenerating}
                         className="flex-1 py-3 neu-button text-neu-text font-bold text-xs uppercase flex items-center justify-center gap-2"
                       >
                         {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                         {t.generateConcept}
                       </button>
                       <button 
                         onClick={() => generateStep('idea', true)}
                         disabled={isGenerating}
                         className="flex-1 py-3 neu-button-primary font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all"
                       >
                         <Zap className="w-4 h-4" />
                         {t.luckyMode}
                       </button>
                    </div>
                    {/* Manual Next Step Button */}
                    {pipeline.idea && (
                       <button onClick={() => setBuilderStep(2)} className="w-full py-2 text-neu-text text-xs hover:text-neu-primary flex items-center justify-center gap-1 mt-2 border-t border-neu-border pt-2">
                         {nextStepLabel} <ArrowRight className="w-3 h-3" />
                       </button>
                    )}
                 </div>
               </Card>
             )}

             {builderStep === 2 && (
               <Card title={t.stepValidation} className="animate-slide-up">
                  <div className="space-y-4">
                     <p className="text-xs text-neu-textDim">Validating viability for {t.platforms[pipeline.platform!].title}...</p>
                     <button 
                       onClick={() => generateStep('validation')}
                       disabled={isGenerating || pipeline.validation !== null}
                       className="w-full py-4 neu-button-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Target className="w-4 h-4" />}
                        {pipeline.validation ? t.complete : t.runValidation}
                     </button>
                     {pipeline.validation && (
                       <button onClick={() => setBuilderStep(3)} className="w-full py-2 text-neu-text text-xs hover:text-neu-primary flex items-center justify-center gap-1">
                         {nextStepLabel} <ArrowRight className="w-3 h-3" />
                       </button>
                     )}
                  </div>
               </Card>
             )}

             {builderStep === 3 && (
                <Card title={t.stepPRD} className="animate-slide-up">
                  <div className="space-y-4">
                     <p className="text-xs text-neu-textDim">Drafting conceptual requirements (No code)...</p>
                     <button 
                       onClick={() => generateStep('prd')}
                       disabled={isGenerating || pipeline.prd !== null}
                       className="w-full py-4 neu-button-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <FileText className="w-4 h-4" />}
                        {pipeline.prd ? t.complete : t.generatePRD}
                     </button>
                     {pipeline.prd && (
                       <button onClick={() => setBuilderStep(4)} className="w-full py-2 text-neu-text text-xs hover:text-neu-primary flex items-center justify-center gap-1">
                         {nextStepLabel} <ArrowRight className="w-3 h-3" />
                       </button>
                     )}
                  </div>
               </Card>
             )}

             {builderStep === 4 && (
                <Card title={t.stepPrompt} className="animate-slide-up">
                   <div className="space-y-4">
                     <p className="text-xs text-neu-textDim">Generating Master Prompt for {t.platforms[pipeline.platform!].title}...</p>
                     <button 
                       onClick={() => generateStep('prompt')}
                       disabled={isGenerating || pipeline.masterPrompt !== null}
                       className="w-full py-4 neu-button-primary font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Terminal className="w-4 h-4" />}
                        {pipeline.masterPrompt ? t.complete : t.generateMasterPrompt}
                     </button>
                     
                     {pipeline.masterPrompt && (
                       <div className="flex gap-2">
                          <button onClick={exportPipeline} className="flex-1 py-3 neu-button text-neu-text text-xs font-bold uppercase flex items-center justify-center gap-2">
                             <Download className="w-4 h-4" /> {t.exportPipeline}
                          </button>
                          <button onClick={resetPipeline} className="flex-1 py-3 neu-button text-red-400 text-xs font-bold uppercase flex items-center justify-center gap-2">
                             <Trash2 className="w-4 h-4" /> {t.resetPipeline}
                          </button>
                       </div>
                     )}
                  </div>
                </Card>
             )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: OUTPUT / TERMINAL */}
      <div className="lg:col-span-7">
         <div className="h-full min-h-[600px] neu-card p-0 relative overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-neu-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="h-5 w-px bg-neu-border mx-2"></div>
                <h2 className="text-xs font-bold text-neu-text font-mono flex items-center gap-2 opacity-80 uppercase tracking-wider">
                  <Terminal className="w-3 h-3" />
                  {mode === 'explorer' ? 'DATA_EXPLORER_OUTPUT' : (builderStep === 0 ? 'PLATFORM_SELECTION' : (builderStep === 1 ? 'IDEA_GENERATION' : (builderStep === 2 ? 'VALIDATION_LOG' : (builderStep === 3 ? 'PRD_DRAFT' : 'MASTER_PROMPT'))))}
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                 <button
                    onClick={handlePlayAudio}
                    disabled={isGeneratingAudio}
                    className={`neu-button p-2 transition-all ${isPlaying ? 'text-neu-secondary' : 'text-neu-textDim hover:text-neu-text'}`}
                  >
                    {isGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                 </button>
                 {(builderStep === 4 && pipeline.masterPrompt) && (
                   <button onClick={handleCopy} className={`neu-button p-2 transition-all ${copied ? 'text-emerald-400' : 'text-neu-textDim hover:text-neu-text'}`}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                 )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto font-mono text-sm leading-relaxed text-neu-text/80 p-6 custom-scrollbar neu-concave m-2 rounded-xl">
               {isGenerating || (isChatLoading && mode === 'explorer') ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-4">
                     <Loader2 className="w-10 h-10 text-neu-primary animate-spin" />
                     <p className="text-xs font-mono uppercase tracking-widest">{t.processing}</p>
                     <div className="w-48 h-0.5 neu-concave rounded-full overflow-hidden">
                        <div className="h-full bg-neu-primary animate-progress origin-left w-full shadow-[0_0_10px_var(--neu-primary)]"></div>
                     </div>
                  </div>
               ) : (
                  <div className="animate-fade-in markdown-content max-w-none">
                     {mode === 'explorer' ? (
                       chatMessages.length > 0 ? (
                         <div className="space-y-8">
                             {/* User Question Highlight */}
                             <div className="relative group">
                                <div className="relative p-4 neu-flat flex items-start gap-4">
                                   <div className="p-2 neu-icon shrink-0">
                                      <Search className="w-5 h-5 text-neu-primary" />
                                   </div>
                                   <div>
                                      <h3 className="text-xs font-bold text-neu-textDim uppercase tracking-widest mb-1">Analysis Query</h3>
                                      <p className="text-neu-text text-base italic leading-relaxed">"{chatMessages[chatMessages.length - (chatMessages[chatMessages.length - 1].role === 'user' ? 1 : 2)].content}"</p>
                                   </div>
                                </div>
                             </div>

                             {/* AI Response */}
                             <div className="pl-2 border-l border-neu-border">
                                <ReactMarkdown components={{
                                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-neu-text mb-4" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-neu-secondary mt-6 mb-3" {...props} />,
                                  strong: ({node, ...props}) => <strong className="text-neu-primary font-bold" {...props} />,
                                  ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                                  li: ({node, ...props}) => <li className="flex items-start gap-2 before:content-['•'] before:text-neu-textDim before:mr-2" {...props} />
                                }}>
                                   {chatMessages[chatMessages.length - 1].role === 'assistant' 
                                      ? chatMessages[chatMessages.length - 1].content 
                                      : ''}
                                </ReactMarkdown>
                             </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full text-neu-textDim opacity-30">
                            <MessageSquare className="w-16 h-16 mb-4 stroke-[1px]" />
                            <p className="text-xs uppercase tracking-widest">Ready to explore dataset...</p>
                         </div>
                       )
                     ) : (
                        // BUILDER OUTPUT
                        builderStep === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-neu-textDim opacity-30">
                             <Layers className="w-16 h-16 mb-4 stroke-[1px]" />
                             <p className="text-xs uppercase tracking-widest">{t.selectPlatform}</p>
                          </div>
                        ) : (
                          <ReactMarkdown components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-neu-text mt-6 mb-4 border-b border-neu-border pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-neu-primary mt-6 mb-3" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-neu-secondary font-bold" {...props} />,
                            code: ({node, ...props}) => <code className="neu-flat text-emerald-500 px-1.5 py-0.5 text-xs font-medium" {...props} />,
                            pre: ({node, ...props}) => <pre className="neu-concave p-4 my-4 overflow-x-auto text-xs text-neu-text/90" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-4 text-neu-textDim" {...props} />,
                            li: ({node, ...props}) => <li className="pl-2" {...props} />
                          }}>
                             {(builderStep === 1 ? pipeline.idea : builderStep === 2 ? pipeline.validation : builderStep === 3 ? pipeline.prd : pipeline.masterPrompt) || ''}
                          </ReactMarkdown>
                        )
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
