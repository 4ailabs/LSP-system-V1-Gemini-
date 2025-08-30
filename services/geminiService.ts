

// Fix: Import `Content` type for chat history and remove deprecated `StartChatParams`.
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

// Fix: Use Vite environment variables instead of process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// Fix: Update history parameter to use `Content[]` type.
export function startChatSession(history?: Content[]): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
    history: history || [],
  });
  return chat;
}
