import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import { SessionNameModal } from './components/SessionNameModal';
import SessionGallery from './components/SessionGallery';
import ImageUploadModal from './components/ImageUploadModal';
import { startChatSession } from './services/geminiService';
import { useLocalDatabase, SimpleMessage } from './hooks/useLocalDatabase';
import { LspPhase } from './types';

const App: React.FC = () => {
  const {
    sessions,
    messages,
    images,
    createSession,
    updateSession,
    deleteSession,
    addMessage,
    getSessionMessages,
    addImageToSession,
    getSessionImages
  } = useLocalDatabase();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<LspPhase>(LspPhase.IDENTIFICATION);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Estados para el modal de sesiones
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{ id: string; name: string } | null>(null);
  
  // Estado para la galería
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Estado para el modal de subida de imágenes
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  
  // Estado para la sesión actual
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Obtener la sesión actual
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Obtener mensajes de la sesión actual
  const currentSessionMessages = getSessionMessages(currentSessionId);

  // Inicializar con la primera sesión si existe
  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
    
    // Marcar como inicializado después de un breve delay
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [sessions, currentSessionId]);

  // Inicializar chat de Gemini
  useEffect(() => {
    if (currentSession) {
      chatRef.current = startChatSession();
    }
  }, [currentSession]);

  // Sincronizar fase actual con la sesión activa
  useEffect(() => {
    if (currentSession) {
      setCurrentPhase(currentSession.currentPhase);
    }
  }, [currentSession]);

  // Scroll al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSessionMessages]);

  // Crear nueva sesión
  const handleNewSession = useCallback(async () => {
    try {
      const sessionId = await createSession('Nueva Sesión LSP');
      setCurrentSessionId(sessionId);
      
      // Reinicializar chat para la nueva sesión
      if (chatRef.current) {
        chatRef.current = startChatSession();
      }
      
      // Abrir modal para nombrar la sesión
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error al crear la sesión. Por favor, intenta de nuevo.');
    }
  }, [createSession]);

  // Si no hay sesiones, crear una por defecto
  useEffect(() => {
    if (sessions.length === 0 && !isInitializing) {
      handleNewSession();
    }
  }, [sessions.length, isInitializing, handleNewSession]);

  // Extraer actualizaciones de fase del texto
  const extractPhaseUpdates = useCallback((text: string): LspPhase[] => {
    const updates: LspPhase[] = [];
    
    // Buscar patrones más inteligentes de cambio de fase en el texto
    const lowerText = text.toLowerCase();
    
    // Fase 1: Identificación y Contextualización
    if (lowerText.includes('fase 1') || 
        lowerText.includes('identificación') || 
        lowerText.includes('contextualización') ||
        lowerText.includes('nombre del usuario') ||
        lowerText.includes('objetivo central') ||
        lowerText.includes('tema específico')) {
      updates.push(LspPhase.IDENTIFICATION);
    }
    
    // Fase 2: Desarrollo de Protocolos
    if (lowerText.includes('fase 2') || 
        lowerText.includes('protocolo') ||
        lowerText.includes('diseñar protocolo') ||
        lowerText.includes('número de modelos') ||
        lowerText.includes('secuencia lógica') ||
        lowerText.includes('tiempos asignados')) {
      updates.push(LspPhase.PROTOCOL_DEVELOPMENT);
    }
    
    // Fase 3: Implementación LSP
    if (lowerText.includes('fase 3') || 
        lowerText.includes('implementación') ||
        lowerText.includes('construcción') ||
        lowerText.includes('construir modelo') ||
        lowerText.includes('pensar con las manos') ||
        lowerText.includes('modelo 3d')) {
      updates.push(LspPhase.IMPLEMENTATION);
    }
    
    // Fase 4: Descubrimiento de Insights
    if (lowerText.includes('fase 4') || 
        lowerText.includes('insights') ||
        lowerText.includes('descubrimiento') ||
        lowerText.includes('analizar modelo') ||
        lowerText.includes('metáforas') ||
        lowerText.includes('significado personal')) {
      updates.push(LspPhase.INSIGHT_DISCOVERY);
    }
    
    // Fase 5: Desarrollo de Estrategias
    if (lowerText.includes('fase 5') || 
        lowerText.includes('estrategia') ||
        lowerText.includes('plan de acción') ||
        lowerText.includes('próximos pasos') ||
        lowerText.includes('micro-hábitos') ||
        lowerText.includes('cambios de comportamiento')) {
      updates.push(LspPhase.STRATEGY_DEVELOPMENT);
    }
    
    // Fase 6: Evaluación y Análisis
    if (lowerText.includes('fase 6') || 
        lowerText.includes('evaluación') ||
        lowerText.includes('conclusión') ||
        lowerText.includes('resumen final') ||
        lowerText.includes('sesión concluida') ||
        lowerText.includes('cerrar proceso') ||
        lowerText.includes('finalizar sesión')) {
      updates.push(LspPhase.EVALUATION);
    }
    
    return updates;
  }, []);

  // Limpiar respuesta de Gemini removiendo comandos técnicos
  const cleanGeminiResponse = useCallback((responseText: string): string => {
    return responseText
      // Remover comandos de actualización de fase
      .replace(/\[PHASE_UPDATE:\s*\d+\]/g, '')
      // Remover otros comandos técnicos que puedan aparecer
      .replace(/\[.*?\]/g, '')
      // Limpiar líneas vacías múltiples
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Limpiar espacios al inicio y final
      .trim();
  }, []);

  // Detectar si la sesión ha concluido
  const detectSessionConclusion = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Patrones que indican que la sesión ha concluido
    const conclusionPatterns = [
      'con esto concluimos',
      'sesión concluida',
      'finalizar sesión',
      'hemos terminado',
      'conclusión de la sesión',
      'resumen final',
      'cerrar proceso',
      'última fase',
      'evaluación final',
      'proceso completado'
    ];
    
    return conclusionPatterns.some(pattern => lowerText.includes(pattern));
  }, []);

  // Procesar respuesta streaming
  const processStream = useCallback(async (response: any, sessionId: string) => {
    console.log('🔄 === INICIO PROCESAMIENTO STREAM ===');
    console.log('📊 Mensajes ANTES de processStream:', currentSessionMessages.length);

    try {
      let responseText = '';
      
      // Procesar chunks de respuesta
      for await (const chunk of response) {
        if (chunk.text) {
          responseText += chunk.text;
        }
      }

      // Limpiar respuesta de Gemini
      const cleanText = cleanGeminiResponse(responseText);
      console.log('🧹 Texto limpio:', cleanText.substring(0, 100));

      // Extraer actualizaciones de fase
      const phaseUpdates = extractPhaseUpdates(cleanText);
      console.log('📈 Actualizaciones de fase detectadas:', phaseUpdates);

      // Crear mensaje del modelo
      const modelMessage: SimpleMessage = {
        id: Date.now().toString(),
        sessionId: sessionId, // Agregar sessionId
        role: 'model',
        content: cleanText,
        isInsight: false,
        createdAt: Date.now()
      };

      // Agregar mensaje del modelo
      await addMessage(modelMessage);
      console.log('✅ Mensaje del modelo agregado:', modelMessage);
      console.log('📊 Mensajes DESPUÉS de agregar modelo:', currentSessionMessages.length);

      // Actualizar fase si es necesario
      if (phaseUpdates.length > 0) {
        const newPhase = phaseUpdates[phaseUpdates.length - 1];
        await updateSession(sessionId, { currentPhase: newPhase });
        setCurrentPhase(newPhase);
        console.log('🔄 Fase actualizada a:', newPhase);
      }

      // Detectar si la sesión concluyó
      const isSessionConcluded = detectSessionConclusion(cleanText);
      if (isSessionConcluded && currentPhase !== LspPhase.EVALUATION) {
        await updateSession(sessionId, { currentPhase: LspPhase.EVALUATION });
        setCurrentPhase(LspPhase.EVALUATION);
        console.log('🏁 Fase actualizada a EVALUACIÓN (sesión concluida)');
      }

      console.log('🏁 === FIN PROCESAMIENTO STREAM ===');
    } catch (error) {
      console.error('❌ Error processing stream:', error);
    }
  }, [addMessage, updateSession, cleanGeminiResponse, extractPhaseUpdates, detectSessionConclusion, currentPhase, currentSessionMessages]);

  // Función para enviar mensaje
  const handleSendMessage = async (text: string, imageData?: string) => {
    if (!currentSession || !text.trim()) return;
    
    // Verificar que el chat esté inicializado
    if (!chatRef.current) {
      console.error('❌ Chat no inicializado');
      alert('Error: Chat no inicializado. Por favor, recarga la página.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 === INICIO ENVÍO MENSAJE ===');
      console.log('📊 Mensajes ANTES de enviar:', currentSessionMessages.length);
      console.log('📝 Contenido del mensaje:', text);

      // Crear mensaje del usuario
      const userMessage: SimpleMessage = {
        id: Date.now().toString(),
        sessionId: currentSession.id, // Agregar sessionId
        role: 'user',
        content: text,
        isInsight: false,
        createdAt: Date.now()
      };

      // Agregar mensaje del usuario
      await addMessage(userMessage);
      console.log('✅ Mensaje del usuario agregado:', userMessage);
      console.log('📊 Mensajes DESPUÉS del usuario:', currentSessionMessages.length);

      // Si hay imagen, guardarla en la base de datos
      if (imageData) {
        await addImageToSession(currentSession.id, 'Modelo construido', imageData);
      }

      // Enviar mensaje a Gemini
      const response = await chatRef.current.sendMessageStream([
        {
          text: imageData ? `Imagen: ${text}` : text
        },
        ...(imageData ? [{
          inlineData: {
            data: imageData.split(',')[1], // Remover el prefijo data:image/...;base64,
            mimeType: 'image/jpeg'
          }
        }] : [])
      ]);

      console.log('🤖 Respuesta de Gemini recibida');

      // Procesar respuesta
      console.log('📊 Mensajes ANTES de procesar respuesta:', currentSessionMessages.length);
      await processStream(response, currentSession.id);
      console.log('✅ Respuesta procesada');
      console.log('📊 Mensajes DESPUÉS de procesar respuesta:', currentSessionMessages.length);

      console.log('🏁 === FIN ENVÍO MENSAJE ===');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Mostrar error más específico
      let errorMessage = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
        } else if (error.message.includes('API key') || error.message.includes('authentication')) {
          errorMessage = 'Error de autenticación. Contacta al administrador.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Límite de uso alcanzado. Intenta más tarde.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar nombre de sesión (nueva o editada)
  const handleSaveSessionName = useCallback(async (name: string) => {
    try {
      if (editingSession) {
        // Editar sesión existente
        await updateSession(editingSession.id, { name });
      } else {
        // Crear nueva sesión
        await createSession(name);
      }
      setIsModalOpen(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session name:', error);
    }
  }, [editingSession, updateSession, createSession]);

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  // Abrir galería
  const handleOpenGallery = () => {
    setIsGalleryOpen(true);
  };

  // Cerrar galería
  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
  };

  // Abrir modal de subida de imágenes
  const handleOpenImageUpload = () => {
    setIsImageUploadOpen(true);
  };

  // Cerrar modal de subida de imágenes
  const handleCloseImageUpload = () => {
    setIsImageUploadOpen(false);
  };

  // Manejar subida de imagen
  const handleUploadImage = async (sessionId: string, title: string, imageData: string) => {
    try {
      // Guardar imagen en la base de datos
      await addImageToSession(sessionId, title, imageData);
      
      // Mostrar mensaje de éxito
      alert('Imagen subida exitosamente a la galería');
      
      // Cerrar el modal
      handleCloseImageUpload();
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir la imagen');
    }
  };

  // Seleccionar sesión
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      
      // Reinicializar chat para la sesión seleccionada
      chatRef.current = startChatSession();
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, []);

  // Eliminar sesión
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId('');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [deleteSession, currentSessionId]);

  // Copiar chat completo
  const handleCopyChat = useCallback(async () => {
    if (!currentSession) return;

    try {
      const chatText = messages
        .map(msg => `${msg.role === 'user' ? '👤 Tú' : '🤖 Facilitador LSP'}: ${msg.content}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(chatText);
      alert('Chat copiado al portapapeles');
    } catch (error) {
      console.error('Error copying chat:', error);
    }
  }, [messages, currentSession]);

  // Copiar mensaje individual
  const handleCopyMessage = useCallback(async (message: any) => {
    try {
      // Limpiar el contenido de markdown antes de copiar
      const cleanContent = message.content
        .replace(/\[PHASE_UPDATE:\s*\d+\]/g, '') // Remover comandos de fase
        .replace(/\[.*?\]/g, '') // Remover otros comandos técnicos
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remover **bold** markdown
        .replace(/\*(.*?)\*/g, '$1') // Remover *italic* markdown
        .replace(/^#+\s*/gm, '') // Remover headers markdown
        .replace(/^[-*+]\s*/gm, '• ') // Convertir listas markdown a viñetas
        .replace(/^\d+\.\s*/gm, '• ') // Convertir listas numeradas a viñetas
        .trim();
      
      await navigator.clipboard.writeText(cleanContent);
      console.log('Message copied (cleaned):', cleanContent);
    } catch (error) {
      console.error('Error copying message:', error);
    }
  }, []);

  // Toggle speech (text-to-speech)
  const handleToggleSpeech = useCallback(async (message: any) => {
    try {
      // Si ya hay algo reproduciéndose, detenerlo
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        console.log('Speech stopped');
        return;
      }

      // Limpiar el contenido del mensaje para la lectura
      const cleanContent = message.content
        .replace(/\[PHASE_UPDATE:\s*\d+\]/g, '') // Remover comandos de fase
        .replace(/\[.*?\]/g, '') // Remover otros comandos técnicos
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remover **bold** markdown
        .replace(/\*(.*?)\*/g, '$1') // Remover *italic* markdown
        .replace(/^#+\s*/gm, '') // Remover headers markdown
        .replace(/^[-*+]\s*/gm, '• ') // Convertir listas markdown a viñetas
        .replace(/^\d+\.\s*/gm, '• ') // Convertir listas numeradas a viñetas
        .trim();

      // Crear utterance para la síntesis de voz
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      
      // Configurar voz en español si está disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') || voice.lang.startsWith('es-')
      );
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      // Configurar propiedades de la voz
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Velocidad ligeramente más lenta
      utterance.pitch = 1.0; // Tono normal
      utterance.volume = 1.0; // Volumen máximo
      
      // Eventos para manejar el estado
      utterance.onstart = () => {
        console.log('Speech started for message:', message.id);
      };
      
      utterance.onend = () => {
        console.log('Speech ended for message:', message.id);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
      };
      
      // Iniciar la síntesis de voz
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error with speech synthesis:', error);
    }
  }, []);

  // Toggle insight en mensaje
  const handleToggleInsight = useCallback(async (messageId: string) => {
    try {
      // TODO: Implementar lógica para toggle insight
      console.log('Toggling insight for message:', messageId);
    } catch (error) {
      console.error('Error toggling insight:', error);
    }
  }, []);

  // Si la base de datos no está inicializada, mostrar loading
  if (isInitializing || (!currentSession && sessions.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isInitializing ? 'Inicializando aplicación...' : 'Cargando sesión...'}
          </p>
        </div>
      </div>
    );
  }

  // Si no hay sesión actual pero hay sesiones disponibles, seleccionar la primera
  if (!currentSession && sessions.length > 0) {
    setCurrentSessionId(sessions[0].id);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Inicializando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900">
      {/* Sidebar - Oculto en móviles */}
      <div className="hidden lg:block">
        <Sidebar
          sessions={sessions}
          currentPhase={currentPhase}
          messages={messages}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onEditSessionName={handleSaveSessionName}
          onOpenGallery={handleOpenGallery}
        />
      </div>
      
      {/* Contenido principal - Full width en móviles */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header móvil con botón de menú */}
        <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              LSP Insight System
            </h1>
            <button
              onClick={() => {/* TODO: Implementar menú móvil */}}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <ChatWindow
          messages={currentSessionMessages}
          isLoading={isLoading}
          currentPhase={currentPhase}
          onToggleInsight={handleToggleInsight}
          onCopyMessage={handleCopyMessage}
          onToggleSpeech={handleToggleSpeech}
        />
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
        
        <div ref={chatEndRef} />
      </div>

      {/* Modal para nombrar/editar sesiones */}
      <SessionNameModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSessionName}
        initialName={editingSession?.name || ''}
        isEditing={!!editingSession}
      />

      {/* Galería de sesiones */}
      <SessionGallery
        sessions={sessions.map(session => ({
          id: session.id,
          name: session.name,
          currentPhase: session.currentPhase,
          createdAt: session.createdAt,
          images: getSessionImages(session.id),
          messageCount: getSessionMessages(session.id).length // Usar mensajes de la sesión específica
        }))}
        isOpen={isGalleryOpen}
        onClose={handleCloseGallery}
        onSelectSession={handleSelectSession}
        onUploadImage={handleOpenImageUpload}
      />

      {/* Modal de subida de imágenes */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={handleCloseImageUpload}
        onUploadImage={handleUploadImage}
        sessions={sessions}
      />
    </div>
  );
};

export default App;