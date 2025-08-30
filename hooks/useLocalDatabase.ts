import { useState, useEffect, useCallback } from 'react';
import { LspPhase } from '../types';

// Tipos simplificados para el navegador
interface SimpleSession {
  id: string;
  name: string;
  currentPhase: number;
  createdAt: number;
}

interface SimpleMessage {
  id: string;
  role: string;
  content: string;
  isInsight: boolean;
  createdAt: number;
}

export const useLocalDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState<SimpleSession | null>(null);
  const [sessions, setSessions] = useState<SimpleSession[]>([]);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);

  // Inicializar datos desde localStorage
  const initialize = useCallback(async () => {
    try {
      // Cargar sesiones desde localStorage
      const savedSessions = localStorage.getItem('lsp-sessions');
      if (savedSessions) {
        const sessionsData = JSON.parse(savedSessions);
        setSessions(sessionsData);
        
        // Si hay sesiones, cargar la primera
        if (sessionsData.length > 0) {
          setCurrentSession(sessionsData[0]);
          
          // Cargar mensajes de la sesión actual
          const savedMessages = localStorage.getItem(`lsp-messages-${sessionsData[0].id}`);
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          }
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing from localStorage:', error);
      setIsInitialized(true); // Siempre marcar como inicializado
    }
  }, []);

  // Guardar sesiones en localStorage
  const saveSessions = useCallback((newSessions: SimpleSession[]) => {
    localStorage.setItem('lsp-sessions', JSON.stringify(newSessions));
  }, []);

  // Guardar mensajes en localStorage
  const saveMessages = useCallback((sessionId: string, newMessages: SimpleMessage[]) => {
    localStorage.setItem(`lsp-messages-${sessionId}`, JSON.stringify(newMessages));
  }, []);

  // Crear nueva sesión
  const createSession = useCallback(async (name: string) => {
    try {
      const newSession: SimpleSession = {
        id: Date.now().toString(),
        name,
        currentPhase: 1,
        createdAt: Date.now()
      };
      
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      setCurrentSession(newSession);
      setMessages([]);
      setImages([]);
      setInsights([]);
      
      saveSessions(newSessions);
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [sessions, saveSessions]);

  // Cargar sesión
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        
        // Cargar mensajes de la sesión
        const savedMessages = localStorage.getItem(`lsp-messages-${sessionId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages([]);
        }
        
        setImages([]);
        setInsights([]);
      }
      
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  }, [sessions]);

  // Agregar mensaje
  const addMessage = useCallback(async (content: string, role: 'user' | 'model', sessionId: string) => {
    try {
      const newMessage: SimpleMessage = {
        id: Date.now().toString(),
        role,
        content,
        isInsight: false,
        createdAt: Date.now()
      };
      
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, newMessage];
        
        // Guardar en localStorage
        if (currentSession) {
          saveMessages(currentSession.id, newMessages);
        }
        
        return newMessages;
      });
      
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }, [currentSession, saveMessages]);

  // Agregar imagen (simplificado)
  const addImage = useCallback(async (imageData: string, mimeType: string, title: string, sessionId: string, messageId?: string) => {
    try {
      const newImage = {
        id: Date.now().toString(),
        sessionId,
        messageId,
        title,
        imageData,
        mimeType,
        createdAt: Date.now()
      };
      
      setImages(prev => [newImage, ...prev]);
      return newImage;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }, []);

  // Toggle insight
  const toggleInsight = useCallback(async (messageId: string) => {
    try {
      const newMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, isInsight: !msg.isInsight } : msg
      );
      
      setMessages(newMessages);
      
      if (currentSession) {
        saveMessages(currentSession.id, newMessages);
      }
      
      // Actualizar insights
      const newInsights = newMessages.filter(msg => msg.isInsight);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error toggling insight:', error);
    }
  }, [messages, currentSession, saveMessages]);

  // Actualizar fase
  const updatePhase = useCallback(async (sessionId: string, phase: number) => {
    try {
      const newSessions = sessions.map(s => 
        s.id === sessionId ? { ...s, currentPhase: phase } : s
      );
      
      setSessions(newSessions);
      setCurrentSession(prev => prev?.id === sessionId ? { ...prev, currentPhase: phase } : prev);
      
      saveSessions(newSessions);
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  }, [sessions, saveSessions]);

  // Eliminar sesión
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const newSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(newSessions);
      
      if (currentSession?.id === sessionId) {
        if (newSessions.length > 0) {
          setCurrentSession(newSessions[0]);
          loadSession(newSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
          setImages([]);
          setInsights([]);
        }
      }
      
      // Limpiar mensajes de la sesión eliminada
      localStorage.removeItem(`lsp-messages-${sessionId}`);
      saveSessions(newSessions);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [sessions, currentSession, loadSession, saveSessions]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isInitialized,
    currentSession,
    sessions,
    messages,
    images,
    insights,
    phases,
    createSession,
    loadSession,
    addMessage,
    addImage,
    toggleInsight,
    updatePhase,
    deleteSession
  };
};
