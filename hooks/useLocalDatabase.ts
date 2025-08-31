import { useState, useCallback, useEffect } from 'react';

export interface SimpleMessage {
  id: string;
  role: string;
  content: string;
  isInsight: boolean;
  createdAt: number;
}

export interface SimpleSession {
  id: string;
  name: string;
  currentPhase: number;
  createdAt: number;
  updatedAt: number;
}

export interface SessionImage {
  id: string;
  sessionId: string;
  title: string;
  imageData: string;
  createdAt: number;
}

export const useLocalDatabase = () => {
  const [sessions, setSessions] = useState<SimpleSession[]>([]);
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [images, setImages] = useState<SessionImage[]>([]);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedSessions = localStorage.getItem('lsp-sessions');
    const savedMessages = localStorage.getItem('lsp-messages');
    const savedImages = localStorage.getItem('lsp-images');

    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error('Error parsing sessions:', error);
      }
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error parsing messages:', error);
      }
    }

    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Error parsing images:', error);
      }
    }
  }, []);

  // Guardar sesiones en localStorage
  const saveSessions = useCallback((newSessions: SimpleSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('lsp-sessions', JSON.stringify(newSessions));
  }, []);

  // Guardar mensajes en localStorage
  const saveMessages = useCallback((newMessages: SimpleMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem('lsp-messages', JSON.stringify(newMessages));
  }, []);

  // Guardar imágenes en localStorage
  const saveImages = useCallback((newImages: SessionImage[]) => {
    setImages(newImages);
    localStorage.setItem('lsp-images', JSON.stringify(newImages));
  }, []);

  // Crear nueva sesión
  const createSession = useCallback(async (name: string): Promise<string> => {
    const newSession: SimpleSession = {
      id: Date.now().toString(),
      name,
      currentPhase: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const newSessions = [...sessions, newSession];
    saveSessions(newSessions);
    return newSession.id;
  }, [sessions, saveSessions]);

  // Actualizar sesión
  const updateSession = useCallback(async (sessionId: string, updates: Partial<SimpleSession>) => {
    const newSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, ...updates, updatedAt: Date.now() }
        : session
    );
    saveSessions(newSessions);
  }, [sessions, saveSessions]);

  // Eliminar sesión
  const deleteSession = useCallback(async (sessionId: string) => {
    const newSessions = sessions.filter(session => session.id !== sessionId);
    const newMessages = messages.filter(message => message.id !== sessionId);
    const newImages = images.filter(image => image.sessionId !== sessionId);
    
    saveSessions(newSessions);
    saveMessages(newMessages);
    saveImages(newImages);
  }, [sessions, messages, images, saveSessions, saveMessages, saveImages]);

  // Agregar mensaje
  const addMessage = useCallback(async (message: SimpleMessage) => {
    const newMessages = [...messages, message];
    saveMessages(newMessages);
  }, [messages, saveMessages]);

  // Agregar imagen a una sesión
  const addImageToSession = useCallback(async (sessionId: string, title: string, imageData: string) => {
    const newImage: SessionImage = {
      id: Date.now().toString(),
      sessionId,
      title,
      imageData,
      createdAt: Date.now()
    };

    const newImages = [...images, newImage];
    saveImages(newImages);
    
    // Actualizar la sesión para indicar que tiene imágenes
    await updateSession(sessionId, { updatedAt: Date.now() });
    
    return newImage;
  }, [images, saveImages, updateSession]);

  // Obtener imágenes de una sesión
  const getSessionImages = useCallback((sessionId: string): SessionImage[] => {
    return images.filter(image => image.sessionId === sessionId);
  }, [images]);

  // Eliminar imagen
  const deleteImage = useCallback(async (imageId: string) => {
    const newImages = images.filter(image => image.id !== imageId);
    saveImages(newImages);
  }, [images, saveImages]);

  return {
    sessions,
    messages,
    images,
    createSession,
    updateSession,
    deleteSession,
    addMessage,
    addImageToSession,
    getSessionImages,
    deleteImage
  };
};
