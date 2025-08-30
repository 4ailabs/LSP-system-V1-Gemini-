import { GoogleGenAI, Chat, Content } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

// Obtener la API key desde las variables de entorno de Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY no está configurada. La API no funcionará.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// Función para iniciar una sesión de chat con Gemini
export function startChatSession(history?: Content[]): Chat {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY no está configurada. Por favor, configura tu API key de Gemini.");
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
    history: history || [],
  });
  
  return chat;
}
