
import { Project } from './types';

// ============================================================================
// CONFIGURACIÓN DE DATOS
// ============================================================================

// OPCIÓN 1: URL EXTERNA (RECOMENDADO)
// Pega aquí el enlace directo a tu archivo CSV (Raw GitHub, S3, etc.)
// Ejemplo: "https://raw.githubusercontent.com/usuario/repo/main/data.csv"
export const DATASET_URL: string = "https://raw.githubusercontent.com/Atypical-Playworks/protoi/main/data/datos.csv";

// OPCIÓN 2: DATA HARDCODED (RESPALDO)
// Si la URL falla o está vacía, se usará esto.
export const FIXED_CSV_DATA = `id,title,subtitle,author,track,date,description,technologies,keywords,github_url,demo_url,youtube_url,has_demo,has_github,has_video,content_length,url
0,AfriLex AI,AfriLex AI is a Pan-African legal-rights assistant built with Gemini 3 Pro’s multimodal and multilingual intelligence.,,Overall Track,"Hackathon Writeup · Dec 11, 2025","AfriLex AI Companion is a Pan-African legal-rights assistant built with Gemini 3 Pro’s multimodal and multilingual intelligence.",Gemini,"legal, afrilex, people, african, assistant, built, gemini, understand, documents, digital",,,,False,False,False,1413.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764958735984
1,Orgy - The Organic Health Movement,"Creating a seamless experience to transition into organic healthy eating, healing, and achieving nutritional balance.",,Overall Track,"Hackathon Writeup · Dec 12, 2025","Orgy: The AI That Prescribes Nature Over Pharma",,"nature, orgy, prescribes, over, pharma, mission, augie, just, health, driven",,https://orgy-health.vercel.app/profile,,True,False,False,280.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764959193512
2,I built AURA Creator Studio,Transforming Ideas into Digital Gold,,Overall Track,"Hackathon Writeup · Dec 5, 2025","Welcome to AURA, a next-generation creative workspace designed exclusively for the modern content creator.",,"aura, your, content, just, generation, gemini, like, video, creative, designed",,,,False,False,False,2728.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764959315336
3,Onlygains.ai,Personal coach that tracks and manages fitness and nutrition and recovery of athletes.,,Overall Track,"Hackathon Writeup · Dec 8, 2025","Onlygains.ai is the first closed-loop Preventive Health Operating System designed to democratize elite personal coaching.",Gemini,"health, onlygains, preventive, elite, coaching, your, pocket, fragmented, fitness, recovery",,,,False,False,False,1594.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764959415332
4,Stat'master by F2X,"Stat'Master: AI app for 9th-graders to master statistics with interactive lessons, endless practice, AI homework scan, personalized tutor.",,Overall Track,"Hackathon Writeup · Dec 11, 2025","Stat'Master is an AI-powered learning app for 9th-graders that makes statistics click.",Gemini,"stat, master, powered, learning, graders, makes, statistics, click, combines, clear",,https://stat-master-3-me-104669827200.us-west1.run.app/,,True,False,False,484.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764959458143
5,Penny AI - Gemini 3 Pro AI studio Hackathon,"Penny AI: AI Finance tracker featuring 3D budget visualization voice logging, splitting, and a context-aware reasoning chat assistant",,Overall Track,"Hackathon Writeup · Dec 11, 2025","Penny AI is a financial intelligence platform engineered entirely within Google AI Studio using Gemini 3 Pro",Gemini,"financial, penny, chat, your, spending, within, using, gemini, directly, into",,,https://youtu.be/KdToQYQe2Ps,False,False,True,1761.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764959747065
6,Renalytics,A web application to help in the early detection of Chronic Kidney Disease (CKD) by assessing risk factors,,Overall Track,"Hackathon Writeup · Dec 5, 2025","This web application serves as a comprehensive digital guardian for renal health",,"data, risk, users, medical, application, health, kidney, disease, insights, input",,,,False,False,False,1540.0,https://www.kaggle.com/competitions/gemini-3/writeups/renalytics
7,MediScan360 - AI Powered Multimodal Health Triage & Doctor Assistant,"MediScan360: AI health assistant analyzing symptoms, reports, prescriptions, and images to provide risk, urgency, and doctor-ready summaries",,Overall Track,"Hackathon Writeup · Dec 11, 2025","1️⃣ Overview: What Is MediScan360? MediScan360 is an intelligent, AI-powered medical triaging and personal health-analysis companion.",Gemini,"medical, health, symptoms, users, risk, user, analysis, reports, voice, early",https://github.com/abdulla2025/mediscan360,,,False,True,False,6657.0,https://www.kaggle.com/competitions/gemini-3/writeups/mediscan360
8,Verified Hands: The Multimodal AI Proctor,An AI verification system that audits performance and grades trade skills with strict security checks.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","I built Verified Hands. It’s a real-time AI certification platform that solves this by turning your laptop or phone into a strict exam center.",Gemini,"your, verified, just, gemini, exam, live, work, checks, like, security",,,https://youtu.be/xfQ4sW8_pww,False,False,True,2314.0,https://www.kaggle.com/competitions/gemini-3/writeups/VerifiedHands-ai-certification
9,VibeHow_V0,Vibe Generating Visual Instructions For How-To Questions In Daily Life,,Overall Track,"Hackathon Writeup · Dec 12, 2025","How-To Questions Are Asked In Daily Life. But Can Be Niche And Require Illustrations",,"vibehow, questions, asked, daily, life, niche, require, illustrations, example, only",,,https://www.youtube.com/watch?v=KROhOIzYMwI,False,False,True,270.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764960973367
10,Symptom Chronicler - Personal Health Journal,"Symptom Chronicler is a digital health journal to track and analyze symptoms, helping you share accurate health data with your doctor.",,Overall Track,"Hackathon Writeup · Dec 12, 2025","Symptom Chronicler is a web-based health application designed to simplify the often complex task of managing personal medical history.",,"health, symptom, data, users, their, chronicler, application, logging, record, over",,https://symptom-chronicler-v-2-0-504547146476.us-west1.run.app/,,True,False,False,1109.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764961000586
11,GAT LITE DEMO BY Google AI STODIO AND GEMINI,A web-based Grand Theft Auto demo has been implemented using Gemini.,,Overall Track,"Hackathon Writeup · Dec 10, 2025","Project Overview This project is a web-based, open-world sandbox designed to emulate the core mechanics of Grand Theft Auto, built entirely using Google AI Studio.",GEMINI,"project, core, system, development, world, mechanics, using, google, studio, logic",,,https://youtu.be/A5nbEn7KRXI,False,False,True,1673.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764961114924
12,PDFBoard - A Node Based PDF Editor for Reusable Advanced PDF Workflows,"PDFBoard is a like n8n but for PDFs, its a node based PDF manipulation tool, which allows advanced combinational workflows with nodes.",,Overall Track,"Hackathon Writeup · Dec 11, 2025","There are a lot of PDF editing and manipulation tools in the market, naming few prominent ones, smallpdf or ilovepdf.",,"manipulation, workflow, node, tools, their, like, there, them, time, pdfboard",,,,False,False,False,994.0,https://www.kaggle.com/competitions/gemini-3/writeups/pdfboard
13,MentorAI: The Elite Multimodal Study Assistant,Transforms static content into interactive mastery paths using Gemini 3 Pro reasoning & multimodal RAG.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","MentorAI is a production-grade educational platform designed to bridge the gap between passive reading and active mastery.",Gemini,"real, mentorai, production, grade, educational, platform, designed, bridge, between, passive",https://github.com/nameershah/MentorAI,,,False,True,False,445.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764961316069
14,The Medical AI Hub,Revolutionise learning in medical school with an personalized AI App.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","Medicus AI Hub is a comprehensive educational platform designed specifically to assist medical students and professionals in mastering complex clinical concepts.",,"medical, medicus, platform, students, application, into, user, users, their, complex",,,,False,False,False,2716.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764961450335
15,Project Minus,Less Noise. More Meaning.,,Overall Track,"Hackathon Writeup · Dec 11, 2025","We conquered storage but failed at digestion. Humanity suffers from the ""Indigestion of Alexandria.""",Gemini,"into, content, minus, economy, reveal, transforms, hoarding, learning, user, generates",,,,False,False,False,1438.0,https://www.kaggle.com/competitions/gemini-3/writeups/project-minus
16,CLARA: AI's Life-Saving Intervention,CLARA is a multimodal AI safety net that safeguards clinical logic to detect diagnostic shadowing before it harms patient care.,,Overall Track,"Hackathon Writeup · Dec 10, 2025","The Problem: Cognitive Load & System Strain. Diagnostic error affects 12 million Americans annually.",Gemini,"cognitive, system, clara, logic, load, diagnostic, women, bias, high, physicians",,,https://youtu.be/9_MX2lxChic,False,False,True,1502.0,https://www.kaggle.com/competitions/gemini-3/writeups/clara-ai
17,KITABU AI,An AI Tutor Specific to Kenyan Students,,Overall Track,"Hackathon Writeup · Dec 12, 2025","An AI Tutor for Kenyan students that factors in the Kenyan CBC Education Syllabus.",Gemini,"kenyan, tutor, learners, their, syllabus, teachers, gives, teacher, student, students",,,,False,False,False,846.0,https://www.kaggle.com/competitions/gemini-3/writeups/kitabu-ai
18,ChessOdyssey: The Neuro-Symbolic Grandmaster Engine,ChessOdyssey is a neuro-symbolic engine combining Gemini 3 Pro’s reasoning with game theory to democratize Grandmaster wisdom,,Overall Track,"Hackathon Writeup · Dec 5, 2025","Chess is often an elitist game, accessible mainly through costly coaching. Engines like Stockfish deliver flawless calculations but no guidance.",TypeScript,"chess, board, chessodyssey, vision, game, them, multimodal, source, here, coaching",https://github.com/Abirate/ChessOdyssey,,https://youtu.be/gEYGrUhF0Lw,False,True,True,3691.0,https://www.kaggle.com/competitions/gemini-3/writeups/chessodyssey-the-neurosymbolic-grandmaster-engine
19,HealthHub AI: Multimodal Personal Health Assistant Powered by Gemini 3 Pro,"An AI-powered health hub that analyzes your medical documents, medications, and profile to generate personalized insights and safer decision",,Overall Track,"Hackathon Writeup · Dec 7, 2025","⭐ HealthHub AI – Multimodal Personal Medical Insight Assistant. This writeup presents an intelligent health assistant built using Gemini 3 Pro.",Gemini,"health, medical, multimodal, gemini, users, understand, healthhub, assistant, google, built",,,https://youtu.be/xe2CpY4YJrQ,False,False,True,2734.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764963120384
20,ArborZen AI – Multimodal Tree Intelligence System,ArborZen AI is a multimodal environmental interpretation system that analyzes a tree or plant using only user-uploaded images and real-time,,Overall Track,"Hackathon Writeup · Dec 6, 2025","Tree and plant health evaluation usually requires expert knowledge. Most people cannot detect issues early.",,"arborzen, into, plant, health, oxygen, ecological, environmental, example, each, includes",https://github.com/2KRISHNAYADAV/arborzen.ai,,,False,True,False,1820.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764963320149
21,HiveMind: Collaborative Cognitive Architecture,Turning AI from a Crutch into a Socratic Tutor.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","HiveMind is a ""Cognitive Accelerator""—a local-first collaborative learning environment designed to replace passive studying with active neural engagement.",React,"gemini, hivemind, cognitive, local, students, reasoning, generating, real, time, peer",,,,False,False,False,1159.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764963471677
22,DocuClear,Legal Documents explained in plain English.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","DocuClear: Your Simple Legal Translator. Freelancers and small businesses often sign complicated contracts without fully understanding them.",Gemini,"docuclear, legal, your, simple, translator, freelancers, small, businesses, often, sign",,https://docuclear-243081461378.us-west1.run.app,,True,False,False,530.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764963701460
23,AI Restaurant Finder in Malaysia using my Voice,AI-powered voice restaurant finder that helps Malaysians quickly discover nearby places to eat through smart search and real-time recommends,,Overall Track,"Hackathon Writeup · Dec 5, 2025","AI-Powered Voice Restaurant Finder is a mobile app designed to simplify the way Malaysians search for food by letting users speak their cravings instead of typing.",,"food, voice, search, users, google, restaurants, restaurant, nearby, results, maps",,,,False,False,False,6744.0,https://www.kaggle.com/competitions/gemini-3/writeups/ai-restaurant-finder-in-malaysia-using-my-voice
24,AceAnalyzer,Your personal academic & career AI coach,,Overall Track,"Hackathon Writeup · Dec 7, 2025","# ###### Ace Analyzer: Your Unfiltered Academic Partner. Ace Analyzer isn't another feel‑good app.",,"your, about, mode, what, actually, doesn, answer, maybe, student, analyzer",,,,False,False,False,4234.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964303321
25,Napkin Plan. Turn sketches into projects,Scan messy handwritten ideas with your phone and turn them into professional project dashboards instantly using Gemini AI.,,Overall Track,"Hackathon Writeup · Dec 11, 2025","The Problem: the biggest killer of success is the friction between ""idea"" and ""action.""",Gemini,"napkin, into, plan, management, mobile, project, between, utilizes, gemini, reasoning",,,https://www.youtube.com/watch?v=kWq_pFnzzEc,False,False,True,1688.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964319705
26,StructViz AI,Master Data Structures with Interactive Visualization,,Overall Track,"Hackathon Writeup · Dec 12, 2025","Remember staring at textbook diagrams of binary trees and thinking ""I don't get it""? I built StructViz AI because I was that student.",TypeScript,"gemini, algorithms, each, diagrams, trees, built, structviz, what, when, just",https://github.com/RitamPal26/StructViz,,,False,True,False,1525.0,https://www.kaggle.com/competitions/gemini-3/writeups/structviz-ai
27,Voice Commerce System,Shopping Experience via voice,,Overall Track,"Hackathon Writeup · Dec 9, 2025","Voice Commerce project for people who are blind or visually impaired, both in terms of everyday convenience and broader accessibility.",,"voice, users, access, screen, visually, impaired, everyday, convenience, accessibility, shopping",https://github.com/mzn/Voice-Commerce-System,,,False,True,False,1488.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964373492
28,Credit card Wrapped,"Credit Card Wrapped gives annual personalized story that recaps users spending, visualizing your top purchases, trends, and financial habits",,Overall Track,"Hackathon Writeup · Dec 12, 2025","Credit Card Wrapped is a SaaS platform that delivers an annual, personalized story of users’ spending habits, visualizing top purchases, trends, and financial behaviors.",Gemini,"credit, card, wrapped, users, spending, their, personalized, data, saas, platform",,https://credit-card-wrapped-454040636778.us-west1.run.app/,,True,False,False,1282.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964504231
29,SignAI – Inteligentny tłumacz mowy na język migowy w czasie rzeczywistym,Laczymy swiat slyszacych i nieslyszacych dzieki multimodalnej sztucznej inteligencji Gemini 3 Pro,,Overall Track,"Hackathon Writeup · Dec 10, 2025","SignAI to innowacyjna aplikacja, która w czasie rzeczywistym przekształca mowę w napisany tekst i animowane gesty języka migowego.",Gemini,"signai, aplikacja, czasie, rzeczywistym, migowego, gemini, innowacyjna, napisany, tekst, animowane",https://github.com/Kubusa/SignAI,,,False,True,False,934.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964569964
30,Triager.AI,Remote Health Triager,,Overall Track,"Hackathon Writeup · Dec 10, 2025","Title: Triager.AI: Multimodal AI Medical Assistant. Revolutionizing Remote Triage with Gemini 3 Pro.",TypeScript,"multimodal, medical, gemini, patient, triager, triage, audio, remote, google, application",,,,False,False,False,1615.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764964604789
31,DevPal:  The Emotional Support for Programmer,The Emotional Support for Programmer,,Overall Track,"Hackathon Writeup · Dec 5, 2025","Software development is often portrayed as a purely logical pursuit, but the reality for engineers is deeply emotional.",React,"code, devpal, programmer, tool, mode, engineers, frustration, state, technical, gemini",https://github.com/QiLOL/Devpal,,,False,True,False,1376.0,https://www.kaggle.com/competitions/gemini-3/writeups/devpal-the-emotional-support-for-programmer
32,"Next-Gen Pet Care: AI Vet, SOS Network & Health Tracking",PawPal is an AI-powered Super App for pet owners that integrates health tracking,,Overall Track,"Hackathon Writeup · Dec 5, 2025","PawPal: The Super App for Pet Parents. PawPal is a comprehensive, AI-powered mobile ecosystem designed to simplify the chaotic life of modern pet parents.",Gemini,"pawpal, health, smart, parents, powered, community, guidance, into, care, digital",,,,False,False,False,1359.0,https://www.kaggle.com/competitions/gemini-3/writeups/next-gen-pet-care-ai-vet-sos-network-and-health-tr
33,CrashLens: AI-Powered Accident Reconstruction with Gemini 3 Deep Think,Transforming dashcam footage into legally-admissible 3D forensic reports using Gemini 3's Deep Think reasoning and pixel-precise analysis,,Overall Track,"Hackathon Writeup · Dec 5, 2025","CrashLens AI represents a paradigm shift in how the insurance industry processes collision claims.",Gemini,"video, gemini, scene, collision, reasoning, frame, liability, evidence, legal, claims",,,,False,False,False,9830.0,https://www.kaggle.com/competitions/gemini-3/writeups/crashlens-ai-powered-accident-reconstruction-with
34,Sugar spy AI,"Scan the Lies, See the Spikes: The AI That Reveals the Ugly Truth About Your Food",,Overall Track,"Hackathon Writeup · Dec 8, 2025","Forget mundane calorie counters. Sugar-Spy is an intelligent health intervention system that fuses advanced Multimodal AI with behavioral psychology to break the cycle of sugar addiction.",Gemini,"sugar, users, impact, deep, food, your, forget, mundane, calorie, counters",,,,False,False,False,1174.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764965329827
35,Unlazy - AI Productivity Suite to Beat Procrastination,"Free web app using Gemini AI to break tasks into small steps, chat with a productivity coach, and generate vision boards",,Overall Track,"Hackathon Writeup · Dec 5, 2025","Procrastination affects millions of people daily. The main barrier isn't laziness—it's feeling overwhelmed by large, undefined tasks.",gemini,"gemini, uses, users, integration, flash, procrastination, people, start, unlazy, actionable",,,,False,False,False,1061.0,https://www.kaggle.com/competitions/gemini-3/writeups/unlazy
36,Nexus — The Agentic CLI Builder,"Zero-Config, AI-Driven CLIs that Run Your Repo in Ephemeral Containers",,Overall Track,"Hackathon Writeup · Dec 11, 2025","Nexus is a Meta‑CLI Platform designed to transform code assets into instantly runnable, auditable, and shareable command‑line tools.",Docker,"nexus, developer, code, analysis, manifest, scripts, commands, into, execution, dashboard",https://github.com/marcusmattus/Nexus_CLI.git,,,False,True,False,3273.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764965615708
37,The Lazarus Protocol,"""In the name of Allah, the compassionate, the all-merciful, I tell my tale.""",,Overall Track,"Hackathon Writeup · Dec 5, 2025","Hello everyone, hope all are well, I started this journey into AI and it's surrounding technologies around 3 weeks ago starting with MetaAI.",Gemini,"gemini, pane, lazarus, code, just, through, logic, then, services, video",,,https://youtu.be/dtEwqX1CMAg,False,False,True,2098.0,https://www.kaggle.com/competitions/gemini-3/writeups/the-lazarus-protocol
38,LoveCard.ai,"Create personalized romantic cards with AI—flowers, poems, music, and instant sharing—all crafted from a simple prompt in seconds.",,Overall Track,"Hackathon Writeup · Dec 6, 2025","LoveCard.ai is a multimodal AI application built entirely in Google AI Studio using a single, high-level natural prompt.",Gemini,"gemini, studio, emotional, into, lovecard, multimodal, application, natural, prompt, generation",,https://lovecard-ai.vercel.app/,,True,False,False,1749.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764965933131
39,Vibe‑Check Anthropologist: Street Smarts for Business,AI that reads the street so your business doesn’t miss the vibe,,Overall Track,"Hackathon Writeup · Dec 12, 2025","Vibe-Check (also known as VIBE OS) is an intelligent tool that scans photos or videos of streets and neighborhoods to understand their ""culture.""",Gemini,"vibe, check, also, known, intelligent, tool, scans, photos, videos, streets",,https://vibe-check-anthropologist.netlify.app/,,True,False,False,369.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764966341916
40,VerifyMate: The Accessible AI Fraud Guard,Protecting vulnerable users from scams with a single click—powered by Gemini Multimodal analysis.,,Overall Track,"Hackathon Writeup · Dec 12, 2025","In the age of AI-generated phishing and sophisticated SMS scams, the most vulnerable among us—our elderly relatives and non-technical friends—are being left behind.",Gemini,"verifymate, technical, security, complex, like, fraud, personal, emails, messages, simple",,,,False,False,False,1415.0,https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1764966354750
`;

// OPCION 3: DATOS DE EJEMPLO SIMPLES (Fallback final)
export const SAMPLE_DATA: Project[] = [
  {
    id: '1',
    name: 'MediScan AI',
    description: 'Using computer vision to detect early skin cancer symptoms from smartphone photos.',
    track: 'Health',
    techStack: ['Python', 'TensorFlow', 'React Native', 'FastAPI'],
    teamSize: 4,
    hasDemo: true,
    hasGithub: true,
    hasVideo: false,
    contentLength: 1500,
    keywords: ['medical', 'skin', 'cancer', 'detection', 'vision'],
    category: 'Health',
    effortScore: 70
  }
];

export const SYSTEM_INSTRUCTION = `You are the Gemini Innovation Hub AI.
CRITICAL INSTRUCTION: Be extremely concise. High signal-to-noise ratio.
Do not waste tokens on pleasantries.
If asked a specific question, answer ONLY that question.
Use markdown bullet points for lists.
Adopt a tone: efficient, direct, data-driven.`;

export const UI_GENERATION_SYSTEM_INSTRUCTION = `You are an expert UI/UX Frontend Engineer specializing in Flash UI design.
CRITICAL INSTRUCTION: Your ONLY source of truth is the provided PRD.
Do NOT invent features not listed in the PRD. 
Adhere strictly to modern design principles, accessibility standards, and the specific visual direction provided in the prompt.`;

export const UI_PROMPTS = {
  STYLE_GENERATION: `You are a master UI/UX designer. Generate ONE highly evocative design direction for:

**APP CONCEPT:**
{{IDEA}}

**KEY FEATURES:**
{{PRD}}

**STRICT IP SAFEGUARD:**
No names of artists. 
Instead, describe the *Physicality* and *Material Logic* of the UI.

**CREATIVE GUIDANCE (Use these as EXAMPLES of how to describe style, but INVENT YOUR OWN):**
1. Example: "Asymmetrical Primary Grid" (Heavy black strokes, rectilinear structure, flat primary pigments, high-contrast white space).
2. Example: "Suspended Kinetic Mobile" (Delicate wire-thin connections, floating organic primary shapes, slow-motion balance, white-void background).
3. Example: "Grainy Risograph Press" (Overprinted translucent inks, dithered grain textures, monochromatic color depth, raw paper substrate).
4. Example: "Volumetric Spectral Fluid" (Generative morphing gradients, soft-focus diffusion, bioluminescent light sources, spectral chromatic aberration).

**YOUR TASK:**
- Invent a unique design persona name based on a NEW physical metaphor.
- The name must be evocative (e.g. "Tactile Risograph Press").

**GOAL:**
Return ONLY the design persona name. Nothing else.`,

  COMPONENT_GENERATION: `You are Flash UI. Create a stunning, high-fidelity UI mockup for:

**APP CONCEPT:**
{{IDEA}}

**KEY FEATURES (from PRD):**
{{PRD}}

**CONCEPTUAL DIRECTION: {{STYLE_NAME}}**

**DESIGN SEED:** {{DESIGN_SEED}}

**LANGUAGE REQUIREMENT:**
All text content must be in {{LANGUAGE}}.

**VISUAL EXECUTION RULES:**
1. **Materiality**: Use the specified metaphor to drive every CSS choice. (e.g. if Risograph, use \`feTurbulence\` for grain and \`mix-blend-mode: multiply\` for ink layering).
2. **Typography**: Use high-quality web fonts. Pair a bold sans-serif with a refined monospace for data.
3. **Motion**: Include subtle, high-performance CSS/JS animations (hover transitions, entry reveals).
4. **IP SAFEGUARD**: No artist names or trademarks. 
5. **Layout**: Be bold with negative space and hierarchy. Avoid generic cards. Use the DESIGN SEED ({{DESIGN_SEED}}) to varying the grid structure and component arrangement significantly.
6. **Completeness**: Show a realistic main screen with placeholder data. The layout should reflect the flows implied by the PRD.

Return ONLY RAW HTML starting with <!DOCTYPE html>. Include all CSS in <style> tags. No markdown fences.`
};


