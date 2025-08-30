import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Chat } from '@google/genai';
import { GenerateContentResponse, Part } from '@google/genai';
import { startChatSession } from './services/geminiService';
import type { Message, MessagePart } from './types';
import { Role, LspPhase } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  // Simplificar a una sola sesión
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPhase, setCurrentPhase] = useState<LspPhase>(LspPhase.IDENTIFICATION);
  
  const chatRef = useRef<Chat | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Inicializar el chat una sola vez
  useEffect(() => {
    console.log("🚀 Initializing chat session...");
    chatRef.current = startChatSession();
    console.log("✅ Chat session initialized");
    
    return () => { 
      console.log("🧹 Cleaning up speech synthesis");
      window.speechSynthesis.cancel(); 
    };
  }, []);



  const processStream = useCallback(async (stream: AsyncGenerator<GenerateContentResponse>) => {
    let accumulatedText = '';
    let phaseUpdated = false;
    let finalPhase: LspPhase | null = null;

    console.log("🔄 Starting stream processing...");

    try {
      for await (const chunk of stream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          console.log("📝 Accumulated text length:", accumulatedText.length);

          if (!phaseUpdated) {
            const phaseUpdateMatch = accumulatedText.match(/\[PHASE_UPDATE: (\d)\]/);
            if (phaseUpdateMatch) {
              const phase = parseInt(phaseUpdateMatch[1], 10) as LspPhase;
              if (Object.values(LspPhase).includes(phase)) {
                finalPhase = phase;
                phaseUpdated = true;
                console.log("🎯 Phase updated to:", phase);
              }
            }
          }

          const textToDisplay = accumulatedText.replace(/\[PHASE_UPDATE: \d\]\s*/g, '');
          
          // Update the model message with the accumulated text
          setMessages(prev => prev.map((msg, index) => {
            if (index === prev.length - 1 && msg.role === Role.MODEL) {
              return { ...msg, parts: [{ text: textToDisplay }] };
            }
            return msg;
          }));

          // Update phase if needed
          if (finalPhase) {
            setCurrentPhase(finalPhase);
          }
        }
      }
      
      console.log("✅ Stream processing completed successfully");
      
    } catch (error) {
      console.error("❌ Error processing stream:", error);
      setMessages(prev => prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === Role.MODEL) {
          return { ...msg, parts: [{ text: "Error al procesar la respuesta. Por favor, intenta de nuevo." }] };
        }
        return msg;
      }));
    }
  }, []);

  const handleSendMessage = async (
    text: string, 
    image?: { base64: string; mimeType: string },
    modelTitle?: string,
    retryCount: number = 0
    ) => {
    console.log("🚀 Sending message:", text, retryCount > 0 ? `(retry ${retryCount})` : '');
    
    const chat = chatRef.current;
    if (!chat || isLoading) {
      console.log("❌ Early return:", { chat: !!chat, isLoading });
      return;
    }
    
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    const userMessageParts: MessagePart[] = [];
    if (text.trim()) {
        userMessageParts.push({ text });
    }
    if (image) {
        userMessageParts.push({ image: { ...image, modelTitle } });
    }

    if (userMessageParts.length === 0) return;

    const newUserMessage: Message = { id: Date.now().toString(), role: Role.USER, parts: userMessageParts };
    const modelMessage: Message = { id: (Date.now() + 1).toString(), role: Role.MODEL, parts: [] };
    
    console.log("📝 Adding messages to state");
    setMessages(prev => [...prev, newUserMessage, modelMessage]);
    
    setIsLoading(true);

    try {
        console.log("🔧 Preparing Gemini parts");
        const geminiParts: Part[] = userMessageParts.map(part => {
          if (part.text) return { text: part.text };
          if (part.image) {
            console.log("🖼️ Processing image:", {
              hasBase64: !!part.image.base64,
              base64Length: part.image.base64?.length,
              mimeType: part.image.mimeType,
              modelTitle: part.image.modelTitle
            });
            return { inlineData: { data: part.image.base64, mimeType: part.image.mimeType }};
          }
          return { text: "" }; 
        }).filter(part => (part.text !== undefined && part.text !== "") || part.inlineData);
        
        console.log("📤 Sending message to Gemini with parts:", geminiParts);
        const stream = await chat.sendMessageStream({ message: geminiParts });
        console.log("📥 Stream received, processing...");
        await processStream(stream);

    } catch (error) {
      console.error("❌ Error sending message:", error);
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      let errorMessage = "Lo siento, hubo un problema al procesar tu solicitud.";
      let shouldRetry = false;
      
      if (error instanceof Error) {
        if (error.message.includes("Load failed") && retryCount < 2) {
          errorMessage = "Error de conexión. Reintentando...";
          shouldRetry = true;
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Demasiadas solicitudes. Espera un momento e intenta de nuevo.";
        } else if (error.message.includes("quota")) {
          errorMessage = "Límite de API alcanzado. Intenta más tarde.";
        }
      }
      
      if (shouldRetry) {
        console.log("🔄 Retrying in 2 seconds...");
        setTimeout(() => {
          handleSendMessage(text, image, modelTitle, retryCount + 1);
        }, 2000);
        return;
      }
      
      setMessages(prev => prev.map((msg, index) => {
        if (index === prev.length - 1 && msg.role === Role.MODEL) {
          return { ...msg, parts: [{ text: errorMessage }] };
        }
        return msg;
      }));
    } finally {
      console.log("✅ Message processing completed");
      setIsLoading(false);
    }
  };
  
  const handleToggleSpeech = useCallback((message: Message) => {
      window.speechSynthesis.cancel();
      if (speakingMessageId === message.id) {
          setSpeakingMessageId(null); return;
      }
      const textToSpeak = message.parts.map(p => p.text).join(' ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'es-ES';
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = (e) => {
          console.error("Speech synthesis error:", e.error);
          setSpeakingMessageId(null);
      };
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(message.id);
  }, [speakingMessageId]);
  
  const handleCopyChat = useCallback(() => {
    const chatText = messages.map(msg => {
          const prefix = msg.role === Role.USER ? '[Usuario]' : '[Facilitador]';
          const content = msg.parts.map(part => {
              if (part.text) return part.text;
              if (part.image) return `[Imagen adjunta: ${part.image.modelTitle || 'Sin título'}]`;
              return '';
          }).join('\n');
          return `${prefix}:\n${content}`;
      }).join('\n\n---\n\n');

      navigator.clipboard.writeText(chatText).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      });
  }, [messages]);

  const handleCopyMessage = useCallback((message: Message) => {
    const textToCopy = message.parts.map(p => p.text).filter(Boolean).join('\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  }, []);

  const handleNewSession = useCallback(() => {
    console.log("🆕 Creating new session...");
    setMessages([]);
    setCurrentPhase(LspPhase.IDENTIFICATION);
    console.log("🆕 Session reset completed");
  }, []);

  const handleToggleInsight = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? {...m, isInsight: !m.isInsight} : m));
  };

  return (
    <div className="h-screen w-screen flex font-sans bg-slate-100 dark:bg-slate-900">
      <Sidebar 
        messages={messages}
        currentPhase={currentPhase}
        onNewSession={handleNewSession}
        onCopyChat={handleCopyChat}
        isCopied={isCopied}
      />
      <main className="flex-1 flex flex-col pl-80 h-screen">
          <ChatWindow 
            key={'single-session'} // Re-mount component on session change
            messages={messages} 
            isLoading={isLoading} 
            speakingMessageId={speakingMessageId}
            onToggleSpeech={handleToggleSpeech}
            copiedMessageId={copiedMessageId}
            onCopyMessage={handleCopyMessage}
            onToggleInsight={handleToggleInsight}
          />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;