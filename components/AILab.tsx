
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Project } from '../types';
import { geminiService, GeminiService } from '../services/geminiService';
import { 
  Sparkles, Zap, Loader2, Terminal, Copy, Check, 
  Volume2, StopCircle, Lightbulb, 
  Target, FileText, Rocket, Download, Trash2, 
  CheckCircle2, ArrowRight, MessageSquare, Send,
  LayoutTemplate, Layers, Code2, Database
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
      <button 
        onClick={() => handlePlatformSelect(key)}
        className={`w-full p-2 flex items-center gap-3 transition-all text-left ${
          isSelected 
            ? 'bg-yellow-400/10 border border-yellow-400' 
            : 'bg-basalt-900 border border-basalt-700 hover:border-yellow-400/50'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-yellow-400' : 'text-gray-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xs font-mono">{p.title}</span>
            <span className="text-[9px] text-gray-500 font-mono truncate">{p.time}</span>
          </div>
        </div>
        {isSelected && <Check className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
      
      {/* LEFT COLUMN: CONTROLS (Build Pipeline / Scaffolding) */}
      <aside className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar min-h-0">
        
        {/* Mode Switcher - Compact */}
        <div className="flex border-2 border-basalt-700 flex-shrink-0">
          <button
            onClick={() => setMode('explorer')}
            className={`flex-1 py-2 font-mono font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              mode === 'explorer' 
                ? 'bg-yellow-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            {t.modeExplorer}
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 py-2 font-mono font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              mode === 'builder' 
                ? 'bg-yellow-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3 h-3" />
            {t.modeBuilder}
          </button>
        </div>

        {/* Dataset Stats - Compact Row */}
        <section className="grid grid-cols-2 gap-2 flex-shrink-0">
          <div className="bg-basalt-900 border border-basalt-700 p-2 flex items-center justify-between">
            <span className="font-mono text-[9px] text-yellow-400">PROJ</span>
            <span className="text-xl font-bold text-white font-mono">{projects.length}</span>
          </div>
          <div className="bg-basalt-900 border border-basalt-700 p-2 flex items-center justify-between">
            <span className="font-mono text-[9px] text-gray-500">TRACKS</span>
            <span className="text-xl font-bold text-white font-mono">{uniqueTracks}</span>
          </div>
        </section>

        {mode === 'explorer' ? (
          // EXPLORER CONTROLS - Compact High Density
          <div className="flex-1 min-h-0 flex flex-col gap-3 animate-slide-up">
            {/* Query Input */}
            <div className="flex gap-1.5 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                placeholder={t.askPlaceholder}
                disabled={isChatLoading}
                className="flex-1 bg-basalt-800 border border-basalt-700 p-2 font-mono text-xs text-white focus:border-yellow-400 outline-none transition-colors"
              />
              <button
                onClick={handleChatSubmit}
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-yellow-400 text-black px-3 font-bold hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Queries - Compact Grid */}
            <div className="grid grid-cols-4 gap-1 flex-shrink-0">
              <button
                onClick={() => setChatInput(language === 'es' ? '¿Cuáles son las 5 tecnologías más populares?' : 'What are the top 5 most popular technologies?')}
                className="p-1.5 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex flex-col items-center gap-0.5 font-mono"
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                TECH
              </button>
              <button
                onClick={() => setChatInput(language === 'es' ? '¿Qué huecos u oportunidades existen?' : 'What gaps or opportunities exist?')}
                className="p-1.5 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex flex-col items-center gap-0.5 font-mono"
              >
                <Target className="w-3 h-3 text-green-400" />
                GAPS
              </button>
              <button
                onClick={() => setChatInput(language === 'es' ? '¿Cuáles son las tendencias emergentes?' : 'What are the emerging trends?')}
                className="p-1.5 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex flex-col items-center gap-0.5 font-mono"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                TREND
              </button>
              <button
                onClick={() => setChatInput(language === 'es' ? 'Dame ideas innovadoras basadas en los datos' : 'Give me innovative ideas based on the data')}
                className="p-1.5 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex flex-col items-center gap-0.5 font-mono"
              >
                <Lightbulb className="w-3 h-3 text-orange-400" />
                IDEAS
              </button>
            </div>

            {/* Convert to Builder */}
            {chatMessages.length > 0 && (
              <button 
                onClick={convertChatToIdea} 
                className="w-full bg-yellow-400 text-black p-2 font-mono font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors flex-shrink-0"
              >
                {t.useInsight}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          // BUILDER CONTROLS - Compact Pipeline
          <div className="flex-1 min-h-0 flex flex-col gap-3 animate-fade-in">
            {/* Stepper - Minimal Horizontal Row */}
            <div className="flex gap-1 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((num, idx) => (
                <button 
                  key={idx} 
                  onClick={() => idx <= builderStep && idx !== 0 && setBuilderStep(idx)}
                  className={`flex-1 py-1.5 text-[9px] font-mono font-bold transition-all ${
                    idx === builderStep ? 'bg-yellow-400 text-black' :
                    idx < builderStep ? 'bg-basalt-800 border border-green-400 text-green-400' :
                    'bg-basalt-800 border border-basalt-700 text-gray-600'
                  }`}
                >
                  {idx < builderStep ? '✓' : num}
                </button>
              ))}
            </div>

            {/* Build Content - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2">

              {/* Step 0: Platform Selection */}
              {builderStep === 0 && (
                <div className="space-y-1.5 animate-slide-up">
                  <span className="font-mono text-[9px] text-gray-500 block">SELECT_PLATFORM:</span>
                  {renderPlatformCard('v0', LayoutTemplate)}
                  {renderPlatformCard('lovable', Layers)}
                  {renderPlatformCard('google', Code2)}
                </div>
              )}

              {/* Step 1: Idea Input */}
              {builderStep === 1 && (
                <div className="space-y-2 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-gray-500">PLATFORM: <span className="text-yellow-400">{t.platforms[pipeline.platform!].title}</span></span>
                  </div>
                  <textarea 
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    placeholder={t.describeIntuition}
                    className="w-full h-20 bg-basalt-800 border border-basalt-700 p-2 font-mono text-xs text-white resize-none focus:border-yellow-400 outline-none"
                  />
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => generateStep('idea', false)}
                      disabled={!ideaInput || isGenerating}
                      className="flex-1 py-2 border border-basalt-700 text-white font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1 hover:border-yellow-400 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
                      GEN
                    </button>
                    <button 
                      onClick={() => generateStep('idea', true)}
                      disabled={isGenerating}
                      className="flex-1 py-2 bg-yellow-400 text-black font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" />
                      LUCKY
                    </button>
                  </div>
                  {pipeline.idea && (
                    <button onClick={() => setBuilderStep(2)} className="w-full py-1.5 text-yellow-400 text-[10px] font-mono hover:text-white flex items-center justify-center gap-1 border-t border-basalt-700">
                      NEXT <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Validation */}
              {builderStep === 2 && (
                <div className="space-y-2 animate-slide-up">
                  <span className="font-mono text-[9px] text-gray-500">VALIDATING: {t.platforms[pipeline.platform!].title}</span>
                  <button 
                    onClick={() => generateStep('validation')}
                    disabled={isGenerating || pipeline.validation !== null}
                    className="w-full py-2 bg-yellow-400 text-black font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <Target className="w-3 h-3" />}
                    {pipeline.validation ? '✓ DONE' : 'VALIDATE'}
                  </button>
                  {pipeline.validation && (
                    <button onClick={() => setBuilderStep(3)} className="w-full py-1.5 text-yellow-400 text-[10px] font-mono hover:text-white flex items-center justify-center gap-1 border-t border-basalt-700">
                      NEXT <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: PRD */}
              {builderStep === 3 && (
                <div className="space-y-2 animate-slide-up">
                  <span className="font-mono text-[9px] text-gray-500">GENERATING_PRD...</span>
                  <button 
                    onClick={() => generateStep('prd')}
                    disabled={isGenerating || pipeline.prd !== null}
                    className="w-full py-2 bg-yellow-400 text-black font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <FileText className="w-3 h-3" />}
                    {pipeline.prd ? '✓ DONE' : 'GEN PRD'}
                  </button>
                  {pipeline.prd && (
                    <button onClick={() => setBuilderStep(4)} className="w-full py-1.5 text-yellow-400 text-[10px] font-mono hover:text-white flex items-center justify-center gap-1 border-t border-basalt-700">
                      NEXT <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Master Prompt */}
              {builderStep === 4 && (
                <div className="space-y-2 animate-slide-up">
                  <span className="font-mono text-[9px] text-gray-500">MASTER_PROMPT: {t.platforms[pipeline.platform!].title}</span>
                  <button 
                    onClick={() => generateStep('prompt')}
                    disabled={isGenerating || pipeline.masterPrompt !== null}
                    className="w-full py-2 bg-yellow-400 text-black font-mono font-bold uppercase text-[10px] flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <Terminal className="w-3 h-3" />}
                    {pipeline.masterPrompt ? '✓ DONE' : 'GENERATE'}
                  </button>
                  
                  {pipeline.masterPrompt && (
                    <div className="flex gap-1.5">
                      <button onClick={exportPipeline} className="flex-1 py-1.5 border border-basalt-700 text-white text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 hover:border-yellow-400">
                        <Download className="w-3 h-3" /> EXPORT
                      </button>
                      <button onClick={resetPipeline} className="flex-1 py-1.5 border border-red-500/50 text-red-400 text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 hover:border-red-500">
                        <Trash2 className="w-3 h-3" /> RESET
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* RIGHT COLUMN: THE "BASALT" TERMINAL */}
      <main className="lg:col-span-8 min-h-0 flex flex-col">
        <div className="basalt-block flex-1 flex flex-col bg-black overflow-hidden border-2 border-basalt-800 min-h-0">
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between bg-basalt-800 p-3 border-b-2 border-basalt-800 flex-shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500"></div>
              <div className="w-3 h-3 bg-yellow-500"></div>
              <div className="w-3 h-3 bg-basalt-700"></div>
            </div>
            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              {mode === 'explorer' ? 'DATA_EXPLORER_OUTPUT.exe' : (builderStep === 0 ? 'PLATFORM_SELECTION' : (builderStep === 1 ? 'IDEA_GENERATION' : (builderStep === 2 ? 'VALIDATION_LOG' : (builderStep === 3 ? 'PRD_DRAFT' : 'MASTER_PROMPT'))))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayAudio}
                disabled={isGeneratingAudio}
                className={`p-1 transition-all ${isPlaying ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
              >
                {isGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {(builderStep === 4 && pipeline.masterPrompt) && (
                <button onClick={handleCopy} className={`p-1 transition-all ${copied ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="flex-1 min-h-0 p-6 font-mono text-sm relative overflow-y-auto terminal-glow custom-scrollbar">
            {isGenerating || (isChatLoading && mode === 'explorer') ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
                <p className="text-xs font-mono uppercase tracking-widest text-gray-500">{t.processing}</p>
                <div className="w-48 h-1 bg-basalt-800 overflow-hidden">
                  <div className="h-full bg-yellow-400 animate-progress origin-left w-full"></div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in markdown-content max-w-none">
                {mode === 'explorer' ? (
                  chatMessages.length > 0 ? (
                    <div className="space-y-6">
                      <div className="text-green-400 mb-4">&gt; INITIALIZING_DATA_QUERY...</div>
                      <div className="text-gray-500 mb-4">[SYSTEM] Loaded {projects.length} projects from basalt-matrix.csv</div>
                      
                      {/* User Query Display */}
                      <div className="border-l-4 border-yellow-400 pl-6 my-6 py-2">
                        <h4 className="text-xs uppercase text-yellow-400 font-bold mb-2">Query:</h4>
                        <p className="text-white italic">"{chatMessages[chatMessages.length - (chatMessages[chatMessages.length - 1].role === 'user' ? 1 : 2)]?.content}"</p>
                      </div>

                      {/* AI Response */}
                      <div className="text-white">
                        <ReactMarkdown components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-yellow-400 mb-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-green-400 mt-6 mb-3" {...props} />,
                          strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                          ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-300 pl-4 relative before:content-['+'] before:absolute before:left-0 before:text-yellow-400 before:font-bold" {...props} />,
                          code: ({node, ...props}) => <code className="bg-basalt-800 text-green-300 px-1.5 py-0.5 text-xs" {...props} />,
                          pre: ({node, ...props}) => <pre className="bg-basalt-800/50 p-4 border border-basalt-700 my-4 overflow-x-auto text-xs text-green-300" {...props} />,
                        }}>
                          {chatMessages[chatMessages.length - 1]?.role === 'assistant' 
                            ? chatMessages[chatMessages.length - 1].content 
                            : ''}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <Terminal className="w-16 h-16 mb-4 stroke-[1px]" />
                      <p className="text-xs uppercase tracking-widest">Ready to analyze dataset...</p>
                      <p className="text-[10px] text-gray-700 mt-2">Type a query or use quick actions</p>
                    </div>
                  )
                ) : (
                  // BUILDER OUTPUT
                  builderStep === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <Layers className="w-16 h-16 mb-4 stroke-[1px]" />
                      <p className="text-xs uppercase tracking-widest">{t.selectPlatform}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-green-400 mb-4">&gt; EXECUTING_BUILD_PIPELINE...</div>
                      <div className="text-gray-500 mb-6">[SYSTEM] Platform: {pipeline.platform?.toUpperCase()} | Step: {builderStep}/4</div>
                      <ReactMarkdown components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-yellow-400 mt-6 mb-4 border-b border-basalt-700 pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-green-400 mt-6 mb-3" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                        code: ({node, ...props}) => <code className="bg-basalt-800 text-green-300 px-1.5 py-0.5 text-xs font-medium" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-basalt-800/50 p-4 my-4 overflow-x-auto text-xs text-green-300 border border-basalt-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-1 my-4 text-gray-300" {...props} />,
                        li: ({node, ...props}) => <li className="pl-4 relative before:content-['+'] before:absolute before:left-0 before:text-yellow-400 before:font-bold" {...props} />
                      }}>
                        {(builderStep === 1 ? pipeline.idea : builderStep === 2 ? pipeline.validation : builderStep === 3 ? pipeline.prd : pipeline.masterPrompt) || ''}
                      </ReactMarkdown>
                    </div>
                  )
                )}
              </div>
            )}
            
            {/* Terminal Cursor */}
            {!isGenerating && !isChatLoading && (
              <div className="mt-4 flex items-center">
                <span className="text-green-400">&gt;</span>
                <div className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-2"></div>
              </div>
            )}
          </div>

          {/* Terminal Input - Only show in Explorer mode */}
          {mode === 'explorer' && (
            <div className="p-4 bg-basalt-900 border-t-2 border-basalt-800 flex items-center gap-4 flex-shrink-0">
              <span className="text-yellow-400 font-mono font-bold">$</span>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                className="bg-transparent border-none outline-none font-mono text-sm flex-grow text-white placeholder:text-gray-600 placeholder:uppercase" 
                placeholder="ENTER QUERY TO ANALYZE DATASET..."
                disabled={isChatLoading}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
