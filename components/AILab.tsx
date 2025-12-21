
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Project } from '../types';
import { geminiService, GeminiService } from '../services/geminiService';
import { 
  Sparkles, Zap, Loader2, Terminal, Copy, Check, 
  Volume2, StopCircle, Lightbulb, 
  Target, FileText, Rocket, Download, Trash2, 
  CheckCircle2, ArrowRight, MessageSquare, Send,
  LayoutTemplate, Layers, Code2, Database, Plus, History, X,
  Maximize2, Minimize2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AILabProps {
  projects: Project[];
  extraContext?: {name: string, content: string}[];
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

interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
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

export const AILab: React.FC<AILabProps> = ({ projects, extraContext = [] }) => {
  const { language, t } = useLanguage();
  
  // Mode: 'explorer' (Chat) or 'builder' (Pipeline)
  const [mode, setMode] = useState<'explorer' | 'builder'>('explorer');
  
  // --- THREADS STATE ---
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newQueryInput, setNewQueryInput] = useState(''); // Input in aside (new thread)
  const [followUpInput, setFollowUpInput] = useState(''); // Input in terminal (continue thread)
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // --- TERMINAL MODAL STATE ---
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  
  // Get active thread
  const activeThread = threads.find(t => t.id === activeThreadId) || null;
  const chatMessages = activeThread?.messages || [];

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

  const nextStepLabel = t.aiLab.nextStep;

  // Load threads from localStorage on mount
  useEffect(() => {
    try {
      const savedThreads = localStorage.getItem('protoi-threads');
      const savedActiveId = localStorage.getItem('protoi-active-thread');
      if (savedThreads) {
        const parsed = JSON.parse(savedThreads);
        setThreads(parsed);
        if (savedActiveId && parsed.some((t: Thread) => t.id === savedActiveId)) {
          setActiveThreadId(savedActiveId);
        }
      }
    } catch (e) {
      console.error('Error loading threads from localStorage:', e);
    }
  }, []);

  // Save threads to localStorage when they change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('protoi-threads', JSON.stringify(threads));
    } else {
      localStorage.removeItem('protoi-threads');
    }
  }, [threads]);

  // Save active thread ID to localStorage
  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem('protoi-active-thread', activeThreadId);
    } else {
      localStorage.removeItem('protoi-active-thread');
    }
  }, [activeThreadId]);

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
    return aiLabLabels.langInstructionFull;
  };

  // Use translations for common labels
  const aiLabLabels = t.aiLab;

  // ==================== EXPLORER (CHAT) LOGIC ====================

  // Create new thread and send first message
  const handleNewThread = async (initialQuery?: string) => {
    const query = initialQuery || newQueryInput.trim();
    if (!query || isChatLoading) return;

    setNewQueryInput('');
    setIsChatLoading(true);

    // Create new thread
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: query.slice(0, 40) + (query.length > 40 ? '...' : ''),
      messages: [{ role: 'user', content: query }],
      createdAt: Date.now()
    };

    // Add to threads (keep max 5)
    setThreads(prev => [newThread, ...prev].slice(0, 5));
    setActiveThreadId(newThread.id);

    // Generate response
    const context = GeminiService.formatContext(projects);
    const extraContextStr = extraContext.length > 0 
      ? `\n\nADDITIONAL DOCUMENTS PROVIDED BY USER:\n${extraContext.map(doc => `--- ${doc.name} ---\n${doc.content}`).join('\n\n')}`
      : '';
    const langInstruction = aiLabLabels.langInstructionShort;

    const prompt = `
      ${context}
      ${extraContextStr}
      ${langInstruction}
      
      You are a Data Analyst for a Hackathon. Analyze the 320 projects provided in the dataset.
      ${extraContext.length > 0 ? `The user has uploaded ${extraContext.length} additional document(s) above - use them to enrich your analysis when relevant.` : ''}
      
      USER QUESTION: ${query}
      
      CRITICAL INSTRUCTIONS:
      1. Be concise. Keep answers short (max 3-4 sentences unless requested otherwise).
      2. Do NOT summarize the dataset unless explicitly asked.
      3. Use bullet points for readability.
      4. If the user asks for "ideas" or "trends", give 3 specific examples max.
      5. Do not repeat general info. Go straight to the specific answer.
    `;

    const response = await geminiService.generateContent(prompt, 'gemini-2.5-flash');
    
    // Update thread with response
    setThreads(prev => prev.map(t => 
      t.id === newThread.id 
        ? { ...t, messages: [...t.messages, { role: 'assistant', content: response }] }
        : t
    ));
    setIsChatLoading(false);
  };

  // Continue conversation in active thread
  const handleFollowUp = async () => {
    if (!followUpInput.trim() || isChatLoading || !activeThreadId) return;

    const userMessage = followUpInput.trim();
    setFollowUpInput('');
    
    // Add user message to thread
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
        ? { ...t, messages: [...t.messages, { role: 'user', content: userMessage }] }
        : t
    ));
    setIsChatLoading(true);

    const context = GeminiService.formatContext(projects);
    const extraContextStr = extraContext.length > 0 
      ? `\n\nADDITIONAL DOCUMENTS PROVIDED BY USER:\n${extraContext.map(doc => `--- ${doc.name} ---\n${doc.content}`).join('\n\n')}`
      : '';
    const langInstruction = aiLabLabels.langInstructionShort;
    
    // Get conversation history from active thread
    const thread = threads.find(t => t.id === activeThreadId);
    const conversationHistory = thread?.messages
      .slice(-6)
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n') || '';

    const prompt = `
      ${context}
      ${extraContextStr}
      ${langInstruction}
      
      You are a Data Analyst for a Hackathon. Analyze the 320 projects provided in the dataset.
      ${extraContext.length > 0 ? `The user has uploaded ${extraContext.length} additional document(s) above - use them to enrich your analysis when relevant.` : ''}
      
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
    
    // Update thread with response
    setThreads(prev => prev.map(t => 
      t.id === activeThreadId 
        ? { ...t, messages: [...t.messages, { role: 'assistant', content: response }] }
        : t
    ));
    setIsChatLoading(false);
  };

  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(threads.length > 1 ? threads.find(t => t.id !== threadId)?.id || null : null);
    }
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
    const extraContextStr = extraContext.length > 0 
      ? `\n\nADDITIONAL DOCUMENTS PROVIDED BY USER:\n${extraContext.map(doc => `--- ${doc.name} ---\n${doc.content}`).join('\n\n')}`
      : '';
    const langInstruction = getLanguageInstruction();
    const platformInfo = t.platforms[pipeline.platform || 'google'];
    let prompt = '';

    if (step === 'idea') {
      prompt = `
        ${context}
        ${extraContextStr}
        ${langInstruction}
        
        CONTEXT:
        The user has selected the platform: ${platformInfo.title}.
        Platform Strengths: ${platformInfo.strengths}
        Platform Limitations: ${platformInfo.limitations}
        ${extraContext.length > 0 ? `The user has uploaded ${extraContext.length} additional document(s) above - consider them when generating ideas.` : ''}
        
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
    <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-6 h-full min-h-0">
      
      {/* LEFT COLUMN: CONTROLS - Compact on mobile, scrollable on desktop */}
      <aside className="md:col-span-5 lg:col-span-4 xl:col-span-3 flex flex-col gap-2 flex-shrink-0 md:min-h-0 md:overflow-y-auto custom-scrollbar">
        
        {/* Mode Switcher - Always visible */}
        <div className="flex border-2 border-basalt-700 flex-shrink-0">
          <button
            onClick={() => setMode('explorer')}
            className={`flex-1 py-1.5 md:py-2 font-mono font-bold uppercase text-[9px] md:text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
              mode === 'explorer' 
                ? 'bg-yellow-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 flex-shrink-0" />
            <span>{aiLabLabels.data}</span>
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 py-1.5 md:py-2 font-mono font-bold uppercase text-[9px] md:text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
              mode === 'builder' 
                ? 'bg-yellow-400 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3 h-3 flex-shrink-0" />
            <span>{aiLabLabels.build}</span>
          </button>
        </div>

        {/* New Query Input - Explorer mode */}
        {mode === 'explorer' && (
          <div className="flex gap-1.5 flex-shrink-0">
            <input
              type="text"
              value={newQueryInput}
              onChange={(e) => setNewQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleNewThread()}
              placeholder={aiLabLabels.newQuestion}
              disabled={isChatLoading}
              className="flex-1 bg-basalt-800 border border-basalt-700 p-2 font-mono text-xs text-white focus:border-yellow-400 outline-none transition-colors placeholder:text-yellow-400/50"
            />
            <button
              onClick={() => handleNewThread()}
              disabled={isChatLoading || !newQueryInput.trim()}
              className="bg-yellow-400 text-black px-3 font-bold hover:bg-yellow-300 transition-colors disabled:opacity-50"
              title={aiLabLabels.newThread}
            >
              {isChatLoading && !activeThreadId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Context Badge - Only in Explorer */}
        {mode === 'explorer' && (
          <div className="bg-basalt-900 border border-basalt-700 p-2 flex items-center gap-2 flex-shrink-0">
            <Database className="w-3 h-3 text-yellow-400" />
            <span className="font-mono text-[9px] text-gray-400">
              <span className="text-yellow-400">{projects.length}</span> projects loaded from AI Studio Global Hackathon
            </span>
          </div>
        )}

        {mode === 'explorer' ? (
          // EXPLORER CONTROLS - Thread-based Chat
          <div className="flex-1 min-h-0 flex flex-col gap-2 animate-slide-up">

            {/* Quick Queries - Create new threads */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 flex-shrink-0">
              <button
                onClick={() => handleNewThread(aiLabLabels.topTechnologies)}
                disabled={isChatLoading}
                className="p-1.5 md:p-2 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex items-center sm:flex-col justify-center gap-1 sm:gap-0.5 font-mono disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>TECH</span>
              </button>
              <button
                onClick={() => handleNewThread(aiLabLabels.gapsOpportunities)}
                disabled={isChatLoading}
                className="p-1.5 md:p-2 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex items-center sm:flex-col justify-center gap-1 sm:gap-0.5 font-mono disabled:opacity-50"
              >
                <Target className="w-3 h-3 text-green-400" />
                <span>GAPS</span>
              </button>
              <button
                onClick={() => handleNewThread(aiLabLabels.emergingTrends)}
                disabled={isChatLoading}
                className="p-1.5 md:p-2 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex items-center sm:flex-col justify-center gap-1 sm:gap-0.5 font-mono disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>TREND</span>
              </button>
              <button
                onClick={() => handleNewThread(aiLabLabels.innovativeIdeas)}
                disabled={isChatLoading}
                className="p-1.5 md:p-2 border border-basalt-700 text-[9px] text-gray-400 hover:border-yellow-400 hover:text-white transition-all flex items-center sm:flex-col justify-center gap-1 sm:gap-0.5 font-mono disabled:opacity-50"
              >
                <Lightbulb className="w-3 h-3 text-orange-400" />
                <span>IDEAS</span>
              </button>
            </div>

            {/* Thread History - Horizontal scroll on mobile, vertical on desktop */}
            {threads.length > 0 && (
              <div className="flex flex-col gap-1 flex-shrink-0 md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <History className="w-3 h-3 text-gray-500" />
                    <span className="font-mono text-[9px] text-gray-500 uppercase">
                      {aiLabLabels.history} ({threads.length})
                    </span>
                  </div>
                </div>
                {/* Mobile: horizontal scroll / Desktop: vertical list */}
                <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-1 px-1">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`group flex-shrink-0 w-[140px] md:w-full p-1.5 md:p-2 text-left transition-all flex items-center gap-2 ${
                        activeThreadId === thread.id
                          ? 'bg-yellow-400/10 border border-yellow-400'
                          : 'bg-basalt-900 border border-basalt-700 hover:border-basalt-600'
                      }`}
                    >
                      <MessageSquare className={`w-3 h-3 flex-shrink-0 ${
                        activeThreadId === thread.id ? 'text-yellow-400' : 'text-gray-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-mono text-[9px] md:text-[10px] truncate ${
                          activeThreadId === thread.id ? 'text-white' : 'text-gray-400'
                        }`}>
                          {thread.title}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                        className="p-0.5 text-gray-600 hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
      <main className="md:col-span-7 lg:col-span-8 xl:col-span-9 min-h-0 flex flex-col flex-1">
        <div className="basalt-block flex flex-col bg-black overflow-hidden border-2 border-basalt-800 h-[280px] md:h-auto md:flex-1 md:min-h-0">
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between bg-basalt-800 p-2 md:p-3 border-b-2 border-basalt-800 flex-shrink-0">
            <div className="flex gap-1.5 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-basalt-700"></div>
            </div>
            <div className="font-mono text-[8px] md:text-[10px] text-gray-500 uppercase tracking-wider md:tracking-widest truncate max-w-[30vw] md:max-w-none">
              {mode === 'explorer' ? 'EXPLORER.exe' : (builderStep === 0 ? 'PLATFORM' : (builderStep === 1 ? 'IDEA' : (builderStep === 2 ? 'VALIDATE' : (builderStep === 3 ? 'PRD' : 'PROMPT'))))}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Maximize button - mobile only */}
              <button
                onClick={() => setIsTerminalMaximized(true)}
                className="p-1 text-gray-500 hover:text-white transition-all md:hidden"
                title={aiLabLabels.maximize}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handlePlayAudio}
                disabled={isGeneratingAudio}
                className={`p-1 transition-all hidden md:block ${isPlaying ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
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
          <div className="flex-1 min-h-0 p-3 md:p-6 font-mono text-xs md:text-sm relative overflow-y-auto terminal-glow custom-scrollbar">
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
                    <div className="space-y-3 md:space-y-4">
                      <div className="text-green-400 text-xs md:text-sm">&gt; {activeThread?.title.slice(0, 30)}...</div>
                      
                      {/* Full Conversation */}
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`${msg.role === 'user' ? 'border-l-2 border-yellow-400 pl-3 md:pl-4' : ''}`}>
                          <span className={`font-mono text-[9px] md:text-[10px] uppercase ${msg.role === 'user' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {msg.role === 'user' ? '>' : '<'}
                          </span>
                          {msg.role === 'user' ? (
                            <p className="text-white text-xs md:text-sm mt-1 line-clamp-3 md:line-clamp-none">"{msg.content}"</p>
                          ) : (
                            <div className="text-white mt-1 md:mt-2">
                              <ReactMarkdown components={{
                                h1: ({node, ...props}) => <h1 className="text-base md:text-xl font-bold text-yellow-400 mb-2 md:mb-3" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-sm md:text-base font-bold text-green-400 mt-3 md:mt-4 mb-1 md:mb-2" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                                ul: ({node, ...props}) => <ul className="space-y-0.5 md:space-y-1 my-1 md:my-2" {...props} />,
                                li: ({node, ...props}) => <li className="text-gray-300 pl-3 md:pl-4 relative before:content-['+'] before:absolute before:left-0 before:text-yellow-400 before:font-bold text-xs md:text-sm" {...props} />,
                                code: ({node, ...props}) => <code className="bg-basalt-800 text-green-300 px-1 py-0.5 text-[10px] md:text-xs" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-basalt-800/50 p-2 md:p-3 border border-basalt-700 my-2 md:my-3 overflow-x-auto text-[10px] md:text-xs text-green-300" {...props} />,
                                p: ({node, ...props}) => <p className="text-xs md:text-sm text-gray-300 my-1 md:my-2" {...props} />,
                              }}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          {idx < chatMessages.length - 1 && <div className="border-b border-basalt-800 my-2 md:my-4" />}
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 px-4">
                      <Terminal className="w-10 h-10 md:w-16 md:h-16 mb-3 md:mb-4 stroke-[1px]" />
                      <p className="text-[10px] md:text-xs uppercase tracking-widest text-center">
                        {aiLabLabels.readyToAnalyze}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-gray-700 mt-1 md:mt-2 text-center">
                        {aiLabLabels.useLeftPanel}
                      </p>
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

          {/* Terminal Input - Only show in Explorer mode when thread is active */}
          {mode === 'explorer' && activeThreadId && (
            <div className="p-2 md:p-3 bg-basalt-900 border-t-2 border-basalt-800 flex items-center gap-2 flex-shrink-0">
              <span className="text-yellow-400 font-mono font-bold text-xs md:text-sm">$</span>
              <input 
                type="text" 
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleFollowUp()}
                className="bg-transparent border-none outline-none font-mono text-xs flex-grow text-white placeholder:text-gray-500" 
                placeholder={aiLabLabels.followUp}
                disabled={isChatLoading}
              />
              <button
                onClick={handleFollowUp}
                disabled={isChatLoading || !followUpInput.trim()}
                className="bg-yellow-400 text-black p-1.5 md:p-2 disabled:opacity-50 transition-colors"
              >
                {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* MAXIMIZED TERMINAL MODAL */}
      {isTerminalMaximized && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsTerminalMaximized(false)}
        >
          <div 
            className="absolute inset-2 md:inset-4 bg-[#0a0a0b] border-2 border-basalt-700 flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-basalt-800 p-3 border-b-2 border-basalt-700 flex-shrink-0">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500"></div>
                <div className="w-3 h-3 bg-yellow-500"></div>
                <div className="w-3 h-3 bg-green-500"></div>
              </div>
              <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                {mode === 'explorer' ? 'EXPLORER.exe' : `BUILDER_STEP_${builderStep}`} — {aiLabLabels.maximized}
              </div>
              <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setIsTerminalMaximized(false)}
                  className="p-1 text-gray-500 hover:text-white transition-all"
                  title={aiLabLabels.close}
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Full conversation */}
            <div className="flex-1 min-h-0 p-4 md:p-6 font-mono text-sm overflow-y-auto terminal-glow custom-scrollbar">
              {isGenerating || (isChatLoading && mode === 'explorer') ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
                  <p className="text-sm font-mono uppercase tracking-widest text-gray-500">{t.processing}</p>
                </div>
              ) : (
                <div className="animate-fade-in markdown-content max-w-4xl mx-auto">
                  {mode === 'explorer' && chatMessages.length > 0 ? (
                    <div className="space-y-6">
                      <div className="text-green-400 text-lg">&gt; {activeThread?.title}</div>
                      <div className="text-gray-600 text-xs">[{chatMessages.length} {aiLabLabels.messages}]</div>
                      
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`${msg.role === 'user' ? 'border-l-4 border-yellow-400 pl-6 py-2' : 'py-2'}`}>
                          <span className={`font-mono text-xs uppercase ${msg.role === 'user' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {msg.role === 'user' ? '> USER' : '< AI'}
                          </span>
                          {msg.role === 'user' ? (
                            <p className="text-white text-base mt-2">"{msg.content}"</p>
                          ) : (
                            <div className="text-white mt-3">
                              <ReactMarkdown components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-yellow-400 mb-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-green-400 mt-6 mb-3" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                                ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                                li: ({node, ...props}) => <li className="text-gray-300 pl-6 relative before:content-['+'] before:absolute before:left-0 before:text-yellow-400 before:font-bold" {...props} />,
                                code: ({node, ...props}) => <code className="bg-basalt-800 text-green-300 px-2 py-1 text-sm" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-basalt-800/50 p-4 border border-basalt-700 my-4 overflow-x-auto text-sm text-green-300" {...props} />,
                                p: ({node, ...props}) => <p className="text-base text-gray-300 my-3 leading-relaxed" {...props} />,
                              }}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          {idx < chatMessages.length - 1 && <div className="border-b border-basalt-800 my-6" />}
                        </div>
                      ))}
                    </div>
                  ) : mode === 'builder' && builderStep > 0 ? (
                    <div>
                      <div className="text-green-400 mb-4 text-lg">&gt; BUILD_PIPELINE</div>
                      <div className="text-gray-500 mb-6">[SYSTEM] Platform: {pipeline.platform?.toUpperCase()} | Step: {builderStep}/4</div>
                      <ReactMarkdown components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-yellow-400 mt-8 mb-6 border-b border-basalt-700 pb-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-green-400 mt-8 mb-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-yellow-400 font-bold" {...props} />,
                        code: ({node, ...props}) => <code className="bg-basalt-800 text-green-300 px-2 py-1 text-sm font-medium" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-basalt-800/50 p-6 my-6 overflow-x-auto text-sm text-green-300 border border-basalt-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2 my-4 text-gray-300" {...props} />,
                        li: ({node, ...props}) => <li className="pl-6 relative before:content-['+'] before:absolute before:left-0 before:text-yellow-400 before:font-bold" {...props} />,
                        p: ({node, ...props}) => <p className="text-base text-gray-300 my-3 leading-relaxed" {...props} />,
                      }}>
                        {(builderStep === 1 ? pipeline.idea : builderStep === 2 ? pipeline.validation : builderStep === 3 ? pipeline.prd : pipeline.masterPrompt) || ''}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <Terminal className="w-20 h-20 mb-6 stroke-[1px]" />
                      <p className="text-sm uppercase tracking-widest">{aiLabLabels.noContentYet}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Input */}
            {mode === 'explorer' && activeThreadId && (
              <div className="p-4 bg-basalt-900 border-t-2 border-basalt-700 flex items-center gap-4 flex-shrink-0">
                <span className="text-yellow-400 font-mono font-bold text-lg">$</span>
                <input 
                  type="text" 
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleFollowUp()}
                  className="bg-transparent border-none outline-none font-mono text-base flex-grow text-white placeholder:text-gray-500" 
                  placeholder={aiLabLabels.continueConversation}
                  disabled={isChatLoading}
                  autoFocus
                />
                <button
                  onClick={handleFollowUp}
                  disabled={isChatLoading || !followUpInput.trim()}
                  className="bg-yellow-400 text-black px-4 py-2 font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
