

// Fix: Import `Content` type for chat history and remove deprecated `StartChatParams`.
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
