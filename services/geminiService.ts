import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  }

  hasKey(): boolean {
    // Assumes env var is present as per guidelines
    return true;
  }

  async generateContent(prompt: string, modelId: string = 'gemini-3-flash-preview', systemInstruction?: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || SYSTEM_INSTRUCTION,
        },
      });

      return response.text || "No response generated.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return `Error: ${error.message || "Unknown error occurred"}`;
    }
  }

  // Streaming version - calls onChunk with each text chunk as it arrives
  async generateContentStream(
    prompt: string,
    onChunk: (text: string) => void,
    modelId: string = 'gemini-3-flash-preview',
    systemInstruction?: string
  ): Promise<string> {
    try {
      const response = await this.ai.models.generateContentStream({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || SYSTEM_INSTRUCTION,
        },
      });

      let fullText = '';
      for await (const chunk of response) {
        const chunkText = chunk.text || '';
        if (chunkText) {
          fullText += chunkText;
          onChunk(chunkText); // Send only the new chunk
        }
      }

      return fullText || "No response generated.";
    } catch (error: any) {
      console.error("Gemini API Stream Error:", error);
      return `Error: ${error.message || "Unknown error occurred"}`;
    }
  }

  async generateSpeech(text: string, language: 'en' | 'es'): Promise<string | null> {
    try {
      // Clean markdown symbols for better speech
      const cleanText = text.replace(/[*#_`]/g, '').trim();

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                // Use 'Kore' (calm/neutral) for English, works reasonably well for generic outputs
                voiceName: 'Kore'
              },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return audioData || null;

    } catch (error: any) {
      console.error("Gemini TTS Error:", error);
      return null;
    }
  }

  // Helper to format projects for context
  static formatContext(projects: any[]): string {
    return JSON.stringify(projects.map(p => ({
      name: p.name,
      description: p.description,
      tech: p.techStack,
      track: p.track
    })));
  }
}

export const geminiService = new GeminiService();