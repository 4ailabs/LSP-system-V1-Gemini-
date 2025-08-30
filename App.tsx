import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Chat } from '@google/genai';
import { GenerateContentResponse, Part } from '@google/genai';
import { startChatSession } from './services/geminiService';
import type { Message, MessagePart, Session } from './types';
import { Role, LspPhase } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [sessions, setSessions] = useLocalStorage<Session[]>('lsp-sessions', []);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>('lsp-active-session', null);
  
  const chatRef = useRef<Chat | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewSession();
    } else if (!activeSessionId || !sessions.find(s => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0]?.id || null);
    }
  }, []);

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);

  useEffect(() => {
    const currentSession = sessions.find(s => s.id === activeSessionId);

    if (currentSession) {
      const geminiHistory = currentSession.messages
        .filter(m => m.parts.length > 0)
        .map(msg => ({
            role: msg.role,
            parts: msg.parts.map(part => {
                if (part.text) return { text: part.text };
                if (part.image) return { inlineData: { data: part.image.base64, mimeType: part.image.mimeType } };
                return { text: '' };
            }).filter(p => p.text || p.inlineData) as Part[]
        }));
      chatRef.current = startChatSession(geminiHistory);
    } else {
      chatRef.current = null;
    }
    
    return () => { window.speechSynthesis.cancel(); };
  }, [activeSessionId, sessions]);
  
  const updateActiveSession = useCallback((updater: (session: Session) => Session) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => s.id === activeSessionId ? updater(s) : s));
  }, [activeSessionId, setSessions]);

  const processStream = useCallback(async (stream: AsyncGenerator<GenerateContentResponse>) => {
    let accumulatedText = '';
    let phaseUpdated = false;
    let finalPhase: LspPhase | null = null;

    for await (const chunk of stream) {
      accumulatedText += chunk.text;

      if (!phaseUpdated) {
        const phaseUpdateMatch = accumulatedText.match(/\[PHASE_UPDATE: (\d)\]/);
        if (phaseUpdateMatch) {
          const phase = parseInt(phaseUpdateMatch[1], 10) as LspPhase;
          if (Object.values(LspPhase).includes(phase)) {
            finalPhase = phase;
            phaseUpdated = true;
          }
        }
      }

      const textToDisplay = accumulatedText.replace(/\[PHASE_UPDATE: \d\]\s*/g, '');

      updateActiveSession(currentSession => {
        const updatedMessages = currentSession.messages.map((msg, index) => {
            if (index === currentSession.messages.length - 1 && msg.role === Role.MODEL) {
                return { ...msg, parts: [{ text: textToDisplay }] };
            }
            return msg;
        });
        
        return {
          ...currentSession,
          messages: updatedMessages,
          ...(finalPhase && { currentPhase: finalPhase }),
        };
      });
    }
  }, [updateActiveSession]);

  const handleSendMessage = async (
    text: string, 
    image?: { base64: string; mimeType: string },
    modelTitle?: string,
    ) => {
    const chat = chatRef.current;
    if (!chat || isLoading || !activeSessionId) return;
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
    
    updateActiveSession(session => ({...session, messages: [...session.messages, newUserMessage, modelMessage] }));
    setIsLoading(true);

    try {
        const geminiParts: Part[] = userMessageParts.map(part => {
          if (part.text) return { text: part.text };
          if (part.image) return { inlineData: { data: part.image.base64, mimeType: part.image.mimeType }};
          return { text: "" }; 
        }).filter(part => (part.text !== undefined && part.text !== "") || part.inlineData);
        
        const stream = await chat.sendMessageStream({ message: geminiParts });
        await processStream(stream);

    } catch (error) {
      console.error("Error sending message:", error);
      // CRITICAL FIX: Use immutable update pattern in the catch block.
      // This prevents state corruption on API errors.
      updateActiveSession(session => {
        const updatedMessages = session.messages.map((msg, index) => {
          if (index === session.messages.length - 1 && msg.role === Role.MODEL) {
            return {
              ...msg,
              parts: [{ text: "Lo siento, hubo un problema al procesar tu solicitud." }]
            };
          }
          return msg;
        });
        return { ...session, messages: updatedMessages };
      });
    } finally {
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
    if (!activeSession) return;
      const chatText = activeSession.messages.map(msg => {
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
  }, [activeSession]);

  const handleCopyMessage = useCallback((message: Message) => {
    const textToCopy = message.parts.map(p => p.text).filter(Boolean).join('\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  }, []);

  const handleNewSession = useCallback(() => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: `Sesión ${new Date().toLocaleString()}`,
      messages: [],
      currentPhase: LspPhase.IDENTIFICATION,
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [setSessions, setActiveSessionId]);
  
  const handleSelectSession = (id: string) => setActiveSessionId(id);

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const remainingSessions = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(remainingSessions[0]?.id || null);
      }
      return remainingSessions;
    });
  };

  const handleRenameSession = (id: string, newName: string) => {
    setSessions(prev => prev.map(s => s.id === id ? {...s, name: newName} : s));
  };
  
  const handleToggleInsight = (messageId: string) => {
    updateActiveSession(session => ({
      ...session,
      messages: session.messages.map(m => m.id === messageId ? {...m, isInsight: !m.isInsight} : m)
    }));
  };

  return (
    <div className="h-screen w-screen flex font-sans bg-slate-100 dark:bg-slate-900">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onCopyChat={handleCopyChat}
        isCopied={isCopied}
        activeSession={activeSession}
      />
      <main className="flex-1 flex flex-col pl-80 h-screen">
          <ChatWindow 
            key={activeSessionId} // Re-mount component on session change
            messages={activeSession?.messages || []} 
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