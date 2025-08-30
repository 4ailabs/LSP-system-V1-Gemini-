import { GoogleGenAI, Chat, Content } from "@google/genai";

// Obtener la API key desde las variables de entorno de Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY no está configurada. La API no funcionará.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// Prompt del sistema mejorado para generar respuestas estructuradas
const SYSTEM_PROMPT = `Eres un facilitador especializado en LEGO® Serious Play® (LSP). 

**IMPORTANTE: SIEMPRE usa formato markdown para estructurar tus respuestas.**

**Formato OBLIGATORIO para cada respuesta:**
- Usa **## Títulos** para secciones principales
- Usa **### Subtítulos** para subsecciones
- Usa **• Viñetas** para listas
- Usa **> Citas** para reflexiones importantes
- Usa **código** para conceptos clave
- Usa **---** para separadores visuales

**Ejemplo de respuesta estructurada:**
## 🎯 Introducción
Hola [nombre], bienvenido a tu sesión LSP.

### 📋 ¿Qué haremos hoy?
• Exploraremos tu tema usando bricks
• Construiremos modelos 3D
• Descubriremos insights juntos

> **Reflexión clave:** Los bricks son herramientas de pensamiento, no solo juguetes.

---

**Regla:** NUNCA respondas sin formato. SIEMPRE estructura tu información con markdown.`;

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
