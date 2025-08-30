import React, { useState, useCallback } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import { LspPhase } from './types';

const AppSimple: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: string;
    content: string;
    isInsight?: boolean;
  }>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<LspPhase>(LspPhase.IDENTIFICATION);
  
  const [sessions, setSessions] = useState<Array<{
    id: string;
    name: string;
    currentPhase: number;
    createdAt: number;
  }>>([
    {
      id: '1',
      name: 'Sesión de Prueba',
      currentPhase: 1,
      createdAt: Date.now()
    }
  ]);

  const handleSendMessage = useCallback(async (content: string, imageData?: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);

      // Agregar mensaje del usuario
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        isInsight: false
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Simular respuesta del modelo
      setTimeout(() => {
        const modelMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `Gracias por tu mensaje: "${content}". Este es un sistema de prueba que funciona correctamente.`,
          isInsight: false
        };
        
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }, []);

  const handleNewSession = useCallback(() => {
    const newSession = {
      id: Date.now().toString(),
      name: `Sesión ${sessions.length + 1}`,
      currentPhase: 1,
      createdAt: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setMessages([]);
    setCurrentPhase(LspPhase.IDENTIFICATION);
  }, [sessions.length]);

  const handleSelectSession = useCallback((sessionId: string) => {
    console.log('Selecting session:', sessionId);
    // En una implementación real, cargaría los mensajes de la sesión
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (sessions.length === 1) {
      setMessages([]);
    }
  }, [sessions.length]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        sessions={sessions}
        currentPhase={currentPhase}
        messages={messages}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          currentPhase={currentPhase}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AppSimple;
