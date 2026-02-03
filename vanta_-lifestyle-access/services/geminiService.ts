
import { GoogleGenAI } from "@google/genai";

// Always use named parameter for apiKey and use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getVantaConciergeResponse = async (userPrompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: `You are the Vanta Concierge, an elite assistant for a luxury lifestyle club called VANTA. 
        Your tone is sophisticated, brief, slightly mysterious, and highly helpful. 
        VANTA's slogan is "ESTILO DE VIDA É ACESSO" (Lifestyle is Access).
        You help members with event inquiries, membership upgrades (Classic, Gold, Black), and access requests.
        Refer to members as "Membro" or by their name if provided. 
        If asked about events, mention that we have upcoming sessions like "The Black Mansion" and "Yacht Noir".
        Keep responses under 3 sentences. Answer in Portuguese as the primary language.`
      }
    });
    
    // Always use .text property directly, not as a function call.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lamento, Membro. Tivemos uma instabilidade em nossos servidores de elite. Tente novamente em breve.";
  }
};
