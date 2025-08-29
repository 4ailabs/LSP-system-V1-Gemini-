import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { GenerateContentResponse } from '@google/genai';
import { startChatSession } from './services/geminiService';
import type { Message, MessagePart } from './types';
import { Role, LspPhase } from './types';
import PhaseTracker from './components/PhaseTracker';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<LspPhase>(LspPhase.IDENTIFICATION);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Effect to clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    };
  }, []);

  const processStream = useCallback(async (stream: AsyncGenerator<GenerateContentResponse>) => {
    let accumulatedText = '';
    let phaseUpdated = false;

    for await (const chunk of stream) {
        accumulatedText += chunk.text;

        let textToDisplay = accumulatedText;
        
        if (!phaseUpdated) {
            const phaseUpdateMatch = accumulatedText.match(/\[PHASE_UPDATE: (\d)\]/);
            if (phaseUpdateMatch) {
                const phase = parseInt(phaseUpdateMatch[1], 10) as LspPhase;
                if (Object.values(LspPhase).includes(phase)) {
                    setCurrentPhase(phase);
                    phaseUpdated = true; 
                }
            }
        }

        textToDisplay = accumulatedText.replace(/\[PHASE_UPDATE: \d\]\s*/g, '');
        
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === Role.MODEL) {
                lastMessage.parts = [{ text: textToDisplay }];
            }
            return newMessages;
        });
    }
  }, [setCurrentPhase]);

  useEffect(() => {
    const chatSession = startChatSession();
    setChat(chatSession);
  }, []);

  const handleSendMessage = async (
    text: string, 
    image?: { base64: string; mimeType: string }
    ) => {
    if (!chat || isLoading) return;
    window.speechSynthesis.cancel(); // Stop any speech on new message
    setSpeakingMessageId(null);

    const userMessageParts: MessagePart[] = [];
    if (text.trim()) {
        userMessageParts.push({ text });
    }
    if (image) {
        userMessageParts.push({ image });
    }

    if (userMessageParts.length === 0) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      parts: userMessageParts,
    };
    
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, newUserMessage, { id: modelMessageId, role: Role.MODEL, parts: [] }]);
    setIsLoading(true);

    try {
        const geminiParts: any[] = [];
        if (image) {
            geminiParts.push({
                inlineData: { data: image.base64, mimeType: image.mimeType }
            });
        }
        if (text) {
            geminiParts.push({ text });
        }
        
        const stream = await chat.sendMessageStream({
            message: geminiParts
        });

        await processStream(stream);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if(lastMessage && lastMessage.role === Role.MODEL) {
          lastMessage.parts = [{ text: "Lo siento, hubo un problema al procesar tu solicitud." }];
        }
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleSpeech = useCallback((message: Message) => {
      window.speechSynthesis.cancel();

      if (speakingMessageId === message.id) {
          setSpeakingMessageId(null);
          return;
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
              if (part.image) return '[Imagen adjunta]';
              return '';
          }).join('\n');
          return `${prefix}:\n${content}`;
      }).join('\n\n---\n\n');

      navigator.clipboard.writeText(chatText).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
          console.error('Failed to copy chat: ', err);
      });
  }, [messages]);

  const handleCopyMessage = useCallback((message: Message) => {
    const textToCopy = message.parts
      .map(p => p.text)
      .filter(Boolean)
      .join('\n');

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  }, []);


  return (
    <div className="h-screen w-screen flex font-sans bg-slate-100 dark:bg-slate-900">
      <PhaseTracker currentPhase={currentPhase} onCopyChat={handleCopyChat} isCopied={isCopied} />
      <main className="flex-1 flex flex-col pl-80 h-screen">
          <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
            speakingMessageId={speakingMessageId}
            onToggleSpeech={handleToggleSpeech}
            copiedMessageId={copiedMessageId}
            onCopyMessage={handleCopyMessage}
          />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;