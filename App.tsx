import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import { SessionNameModal } from './components/SessionNameModal';
import { startChatSession } from './services/geminiService';
import { useLocalDatabase } from './hooks/useLocalDatabase';
import { LspPhase } from './types';

const App: React.FC = () => {
  const {
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
    editSessionName,
    deleteSession
  } = useLocalDatabase();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<LspPhase>(LspPhase.IDENTIFICATION);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{ id: string; name: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Inicializar sesión por defecto si no hay ninguna
  useEffect(() => {
    if (isInitialized && sessions.length === 0) {
      handleNewSession();
    }
  }, [isInitialized, sessions.length]);

  // Sincronizar fase actual con la sesión activa
  useEffect(() => {
    if (currentSession) {
      setCurrentPhase(currentSession.currentPhase as LspPhase);
    }
  }, [currentSession]);

  // Scroll automático al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar chat de Gemini
  useEffect(() => {
    if (isInitialized) {
      chatRef.current = startChatSession();
    }
  }, [isInitialized]);

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

  // Procesar respuesta streaming de Gemini
  const processStream = useCallback(async (responseText: string, sessionId: string) => {
    try {
      console.log('🔄 === INICIO PROCESAMIENTO STREAM ===');
      console.log('📊 Mensajes ANTES de processStream:', messages.length);
      
      // Limpiar respuesta de comandos técnicos
      const cleanText = cleanGeminiResponse(responseText);
      console.log('🧹 Texto limpio:', cleanText.substring(0, 100));
      
      // Extraer actualizaciones de fase de la respuesta original
      const phaseUpdates = extractPhaseUpdates(responseText);
      console.log('📈 Actualizaciones de fase detectadas:', phaseUpdates);
      
      // Detectar si la sesión ha concluido
      const isSessionConcluded = detectSessionConclusion(responseText);
      console.log('🏁 Sesión concluida detectada:', isSessionConcluded);
      
      // Agregar respuesta limpia del modelo a la base de datos
      const modelMessage = await addMessage(cleanText, 'model', sessionId);
      console.log('✅ Mensaje del modelo agregado:', modelMessage);
      console.log('📊 Mensajes DESPUÉS de agregar modelo:', messages.length);
      
      // Actualizar fase si se detectó un cambio
      if (phaseUpdates.length > 0) {
        const newPhase = phaseUpdates[phaseUpdates.length - 1];
        await updatePhase(sessionId, newPhase);
        setCurrentPhase(newPhase);
        console.log('🔄 Fase actualizada a:', newPhase);
      }
      
      // Si la sesión concluyó, asegurar que esté en la fase final
      if (isSessionConcluded && currentPhase !== LspPhase.EVALUATION) {
        await updatePhase(sessionId, LspPhase.EVALUATION);
        setCurrentPhase(LspPhase.EVALUATION);
        console.log('🏁 Fase actualizada a EVALUACIÓN (sesión concluida)');
      }
      
      console.log('🏁 === FIN PROCESAMIENTO STREAM ===');

    } catch (error) {
      console.error('❌ Error processing stream:', error);
    }
  }, [addMessage, updatePhase, cleanGeminiResponse, extractPhaseUpdates, detectSessionConclusion, currentPhase, messages]);

  // Función para enviar mensaje
  const handleSendMessage = useCallback(async (content: string, imageData?: string, retryCount = 0) => {
    if (!currentSession || !chatRef.current) return;

    try {
      setIsLoading(true);
      console.log('🚀 === INICIO ENVÍO MENSAJE ===');
      console.log('📊 Mensajes ANTES de enviar:', messages.length);
      console.log('📝 Contenido del mensaje:', content);

      // Agregar mensaje del usuario a la base de datos
      const userMessage = await addMessage(content, 'user', currentSession.id);
      console.log('✅ Mensaje del usuario agregado:', userMessage);
      console.log('📊 Mensajes DESPUÉS del usuario:', messages.length);
      
      // Si hay imagen, guardarla en la base de datos
      if (imageData) {
        await addImage(imageData, 'image/jpeg', 'Modelo construido', currentSession.id, userMessage.id);
      }

      // Preparar contenido para Gemini
      let geminiContent;
      if (imageData) {
        // Crear contenido multimodal con imagen y texto
        geminiContent = {
          contents: [{
            parts: [
              {
                text: content || "Analiza esta imagen de un modelo LEGO construido y proporciona insights sobre lo que representa."
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData.split(',')[1] // Remover el prefijo "data:image/jpeg;base64,"
                }
              }
            ]
          }]
        };
      } else {
        // Solo texto
        geminiContent = { message: content };
      }

      // Obtener respuesta de Gemini
      let response;
      if (imageData) {
        // Enviar contenido multimodal
        response = await chatRef.current.sendMessageStream(geminiContent);
      } else {
        // Enviar solo texto
        response = await chatRef.current.sendMessageStream({ message: content });
      }
      
      let responseText = '';
      
      for await (const chunk of response) {
        if (chunk.text) {
          responseText += chunk.text;
        }
      }
      
      console.log('🤖 Respuesta de Gemini recibida (primeros 100 chars):', responseText.substring(0, 100));
      console.log('📊 Mensajes ANTES de procesar respuesta:', messages.length);
      
      // Procesar respuesta streaming
      await processStream(responseText, currentSession.id);
      console.log('✅ Respuesta procesada');
      console.log('📊 Mensajes DESPUÉS de procesar respuesta:', messages.length);
      console.log('🏁 === FIN ENVÍO MENSAJE ===');

    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      
      // Retry para errores de "Load failed"
      if (error.message?.includes('Load failed') && retryCount < 3) {
        console.log(`🔄 Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => {
          handleSendMessage(content, imageData, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }

      // Agregar mensaje de error
      await addMessage(
        `❌ Error: ${error.message || 'No se pudo procesar tu mensaje. Por favor, intenta de nuevo.'}`,
        'model',
        currentSession.id
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, addMessage, addImage, messages, processStream]);

  // Crear nueva sesión
  const handleNewSession = useCallback(async () => {
    try {
      setIsModalOpen(true);
      setEditingSession(null);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  }, []);

  // Guardar nombre de sesión (nueva o editada)
  const handleSaveSessionName = useCallback(async (name: string) => {
    try {
      if (editingSession) {
        // Editar sesión existente
        await editSessionName(editingSession.id, name);
      } else {
        // Crear nueva sesión
        await createSession(name);
      }
      setIsModalOpen(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session name:', error);
    }
  }, [editingSession, editSessionName, createSession]);

  // Cerrar modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSession(null);
  }, []);

  // Seleccionar sesión
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      
      // Reinicializar chat para la sesión seleccionada
      chatRef.current = startChatSession();
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [loadSession]);

  // Eliminar sesión
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [deleteSession]);

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
      await toggleInsight(messageId);
    } catch (error) {
      console.error('Error toggling insight:', error);
    }
  }, [toggleInsight]);

  // Si la base de datos no está inicializada, mostrar loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Inicializando aplicación...</p>
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
          onEditSessionName={editSessionName}
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
          messages={messages}
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
    </div>
  );
};

export default App;
