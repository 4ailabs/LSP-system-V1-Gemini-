import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
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
  
  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para la sesión actual
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  // Estado para el chat
  const [isChatInitialized, setIsChatInitialized] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Obtener la sesión actual
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Estado local para mensajes de la sesión actual
  const [currentSessionMessages, setCurrentSessionMessages] = useState<SimpleMessage[]>([]);

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
      try {
        chatRef.current = startChatSession();
        setIsChatInitialized(true);
        console.log('Chat inicializado para sesión:', currentSession.id);
      } catch (error) {
        console.error('Error inicializando chat:', error);
        setIsChatInitialized(false);
        
        let errorMessage = 'Error al inicializar el chat.';
        
        if (error instanceof Error) {
          if (error.message.includes('VITE_GEMINI_API_KEY')) {
            errorMessage = 'Error: API Key no configurada. Contacta al administrador.';
          } else if (error.message.includes('navegador')) {
            errorMessage = 'Error: Problema de compatibilidad del navegador.';
          } else if (error.message.includes('inicializar')) {
            errorMessage = 'Error: No se pudo conectar con Gemini. Verifica tu internet.';
          }
        }
        
        console.error('Error de inicialización:', errorMessage);
        // No mostrar alert aquí para evitar spam, solo en el input
      }
    }
  }, [currentSession]);

  // Sincronizar fase actual con la sesión activa
  useEffect(() => {
    if (currentSession) {
      setCurrentPhase(currentSession.currentPhase);
    }
  }, [currentSession]);

  // Sincronizar mensajes cuando cambie la sesión
  useEffect(() => {
    if (currentSessionId) {
      const messages = getSessionMessages(currentSessionId);
      setCurrentSessionMessages(messages);
    }
  }, [currentSessionId, getSessionMessages]);

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
    
    // PRIORIDAD 1: Buscar marcadores explícitos [PHASE_UPDATE: X]
    const phaseUpdateMatches = text.match(/\[PHASE_UPDATE:\s*(\d+)\]/g);
    if (phaseUpdateMatches) {
      phaseUpdateMatches.forEach(match => {
        const phaseNumber = parseInt(match.match(/\d+/)?.[0] || '1');
        if (phaseNumber >= 1 && phaseNumber <= 6) {
          updates.push(phaseNumber as LspPhase);
          console.log('🎯 Marcador de fase detectado:', phaseNumber);
        }
      });
    }
    
    // PRIORIDAD 2: Solo usar detección por palabras clave si es EXTREMADAMENTE específica
    if (updates.length === 0) {
      const lowerText = text.toLowerCase();
      console.log('🔍 Buscando frases específicas de transición de fase en:', lowerText.substring(0, 100));
      
      // Solo buscar frases EXTREMADAMENTE específicas que indiquen transición clara de fase
      // Y que NO sean parte de explicaciones o referencias generales
      
      // Verificar que no sea solo una referencia o explicación
      const isReference = lowerText.includes('en la fase') || 
                         lowerText.includes('durante la') ||
                         lowerText.includes('sobre la') ||
                         lowerText.includes('explicar') ||
                         lowerText.includes('refiere') ||
                         lowerText.includes('menciona');
      
      if (!isReference) {
        // Fase 1: Solo al inicio con bienvenida muy específica
        if ((lowerText.includes('¡hola!') && lowerText.includes('soy tu asistente') && lowerText.includes('lsp')) ||
            (lowerText.includes('bienvenid') && lowerText.includes('lego® serious play') && lowerText.includes('facilitador')) ||
            (lowerText.includes('¿cómo te llamas?') && lowerText.includes('comenzar'))) {
          updates.push(LspPhase.IDENTIFICATION);
        }
        
        // Fase 2: Solo cuando se presenta protocolo ESTRUCTURADO
        else if (lowerText.includes('diseñaremos el siguiente protocolo estructurado') ||
                 (lowerText.includes('protocolo personalizado') && lowerText.includes('paso a paso')) ||
                 (lowerText.includes('secuencia de construcción') && lowerText.includes('tiempos específicos'))) {
          updates.push(LspPhase.PROTOCOL_DEVELOPMENT);
        }
        
        // Fase 3: Solo con instrucción DIRECTA y EXPLÍCITA de construir
        else if (lowerText.includes('ahora es momento de construir tu primer modelo') ||
                 lowerText.includes('comienza la construcción con tus bricks') ||
                 lowerText.includes('toma tus bricks y construye ahora')) {
          updates.push(LspPhase.IMPLEMENTATION);
        }
        
        // Fase 4: Solo cuando se solicita DIRECTAMENTE compartir modelo construido
        else if (lowerText.includes('comparte una foto de tu modelo completado') ||
                 lowerText.includes('cuéntame sobre tu modelo ya construido') ||
                 lowerText.includes('describe el modelo que terminaste de construir')) {
          updates.push(LspPhase.INSIGHT_DISCOVERY);
        }
        
        // Fase 5: Solo cuando se presentan planes de acción ESPECÍFICOS con timeframes
        else if ((lowerText.includes('plan de acción de 7 días') && lowerText.includes('micro-hábitos')) ||
                 (lowerText.includes('plan de 30 días') && lowerText.includes('comportamentales')) ||
                 (lowerText.includes('plan de 100 días') && lowerText.includes('transformación'))) {
          updates.push(LspPhase.STRATEGY_DEVELOPMENT);
        }
        
        // Fase 6: Solo con cierre EXPLÍCITO y FORMAL
        else if (lowerText.includes('con esto concluimos formalmente nuestra sesión lsp') ||
                 lowerText.includes('hemos completado exitosamente el proceso completo') ||
                 lowerText.includes('resumen final y cierre de nuestra sesión')) {
          updates.push(LspPhase.EVALUATION);
        }
      }
      
      // SAFEGUARD: Validación adicional de transición
      if (updates.length > 0 && currentPhase) {
        const detectedPhase = updates[updates.length - 1];
        
        // No permitir saltos de más de 1 fase
        if (detectedPhase > currentPhase + 1) {
          console.log('⚠️ Salto de fase demasiado grande bloqueado:', currentPhase, '→', detectedPhase);
          updates.length = 0; // Limpiar detección
        }
        
        // No avanzar si es la misma fase
        else if (detectedPhase === currentPhase) {
          console.log('⚠️ Misma fase detectada, ignorando:', detectedPhase);
          updates.length = 0; // Limpiar detección
        }
        
        // Verificación de coherencia: no retroceder
        else if (detectedPhase < currentPhase) {
          console.log('⚠️ Intento de retroceso bloqueado:', currentPhase, '→', detectedPhase);
          updates.length = 0; // Limpiar detección
        }
      }
    }
    
    if (updates.length > 0) {
      console.log('📈 Fases detectadas:', updates);
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
            console.log('=== INICIO PROCESAMIENTO STREAM ===');
            console.log('Mensajes ANTES de processStream:', currentSessionMessages.length);

    try {
      let responseText = '';
      
      // Procesar chunks de respuesta
      for await (const chunk of response) {
        if (chunk.text) {
          responseText += chunk.text;
        }
      }

      // PRIMERO: Extraer actualizaciones de fase ANTES de limpiar
      const phaseUpdates = extractPhaseUpdates(responseText);
      console.log('📈 Actualizaciones de fase detectadas:', phaseUpdates);

      // DESPUÉS: Limpiar respuesta de Gemini removiendo comandos técnicos
      const cleanText = cleanGeminiResponse(responseText);
      console.log('🧹 Texto limpio:', cleanText.substring(0, 100));

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
              console.log('Mensaje del modelo agregado:', modelMessage);
              console.log('Mensajes DESPUÉS de agregar modelo:', currentSessionMessages.length);

      // Actualizar fase si es necesario
      if (phaseUpdates.length > 0) {
        const newPhase = phaseUpdates[phaseUpdates.length - 1];
        console.log('🔄 Actualizando fase de', currentPhase, 'a', newPhase);
        await updateSession(sessionId, { currentPhase: newPhase });
        setCurrentPhase(newPhase);
        console.log('✅ Fase actualizada exitosamente a:', newPhase);
        
        // Actualizar estado local inmediatamente para UI
        setCurrentSessionMessages(prev => [...prev, {
          ...modelMessage,
          metadata: { phaseUpdate: newPhase }
        } as any]);
      }

      // Detectar si la sesión concluyó
      const isSessionConcluded = detectSessionConclusion(cleanText);
      if (isSessionConcluded && currentPhase !== LspPhase.EVALUATION) {
        await updateSession(sessionId, { currentPhase: LspPhase.EVALUATION });
        setCurrentPhase(LspPhase.EVALUATION);
        console.log('🏁 Fase actualizada a EVALUACIÓN (sesión concluida)');
      }

              console.log('=== FIN PROCESAMIENTO STREAM ===');
    } catch (error) {
              console.error('Error processing stream:', error);
    }
  }, [addMessage, updateSession, cleanGeminiResponse, extractPhaseUpdates, detectSessionConclusion, currentPhase, currentSessionMessages]);

  // Obtener descripción de fase
  const getPhaseDescription = (phase: number): string => {
    const descriptions: { [key: number]: string } = {
      1: 'Identificación',
      2: 'Protocolo', 
      3: 'Implementación',
      4: 'Insights',
      5: 'Estrategia',
      6: 'Evaluación'
    };
    return descriptions[phase] || 'Desconocida';
  };

  // Función para enviar mensaje
  const handleSendMessage = async (text: string, imageData?: string) => {
    if (!currentSession || !text.trim()) return;
    
    // Verificar que el chat esté inicializado
    if (!chatRef.current) {
      console.error('Chat no inicializado, intentando reinicializar...');
      
      try {
        // Intentar reinicializar el chat
        chatRef.current = startChatSession();
        setIsChatInitialized(true);
        console.log('Chat reinicializado exitosamente');
      } catch (error) {
        console.error('Error reinicializando chat:', error);
        setIsChatInitialized(false);
        
        let errorMessage = 'Error: No se pudo inicializar el chat.';
        
        if (error instanceof Error) {
          if (error.message.includes('VITE_GEMINI_API_KEY')) {
            errorMessage = 'Error: API Key no configurada. Contacta al administrador.';
          } else if (error.message.includes('navegador')) {
            errorMessage = 'Error: Problema de compatibilidad del navegador.';
          } else if (error.message.includes('inicializar')) {
            errorMessage = 'Error: No se pudo conectar con Gemini. Verifica tu internet.';
          }
        }
        
        alert(errorMessage);
        return;
      }
    }

    try {
      setIsLoading(true);
      console.log('=== INICIO ENVÍO MENSAJE ===');
              console.log('Mensajes ANTES de enviar:', currentSessionMessages.length);
              console.log('Contenido del mensaje:', text);

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
      
      // Actualizar estado local inmediatamente
      setCurrentSessionMessages(prev => [...prev, userMessage]);
      
      console.log('Mensaje del usuario agregado:', userMessage);
      console.log('Mensajes DESPUÉS del usuario:', currentSessionMessages.length + 1);

      // Si hay imagen, guardarla en la base de datos
      if (imageData) {
        await addImageToSession(currentSession.id, 'Modelo construido', imageData);
      }

      // Enviar mensaje a Gemini
      console.log('Enviando mensaje a Gemini...');
      console.log('Chat ref:', chatRef.current);
      
      let response;
      try {
        // Intentar diferentes formatos para Gemini
        console.log('Intentando enviar mensaje con texto:', text);
        
                          if (imageData) {
           // Mensaje con imagen - usar API correcta de Gemini
           console.log('Enviando mensaje con imagen usando ai.models.generateContentStream');
           response = await chatRef.current.ai.models.generateContentStream({
             model: chatRef.current.model,
             contents: [
               text,
               {
                 inlineData: {
                   data: imageData.split(',')[1],
                   mimeType: 'image/jpeg'
                 }
               }
             ],
             config: {
               systemInstruction: chatRef.current.systemPrompt
             }
           });
         } else {
           // Solo texto - usar API correcta de Gemini
           console.log('Enviando solo texto usando ai.models.generateContentStream');
           
           // Construir historial completo para mantener contexto
           const conversationHistory = currentSessionMessages.map(msg => ({
             role: msg.role === 'user' ? 'user' : 'model',
             parts: [{ text: msg.content }]
           }));
           
           // Agregar el mensaje actual
           const currentMessage = { role: 'user', parts: [{ text }] };
           
           response = await chatRef.current.ai.models.generateContentStream({
             model: chatRef.current.model,
             contents: [...conversationHistory, currentMessage],
             config: {
               systemInstruction: chatRef.current.systemPrompt
             }
           });
         }
        
        console.log('Respuesta de Gemini recibida:', response);
      } catch (geminiError) {
        console.error('Error enviando mensaje a Gemini:', geminiError);
        throw new Error(`Error de Gemini: ${geminiError instanceof Error ? geminiError.message : 'Error desconocido'}`);
      }

      // Procesar respuesta
              console.log('Mensajes ANTES de procesar respuesta:', currentSessionMessages.length);
      await processStream(response, currentSession.id);
              console.log('Respuesta procesada');
              console.log('Mensajes DESPUÉS de procesar respuesta:', currentSessionMessages.length);

              console.log('=== FIN ENVÍO MENSAJE ===');
    } catch (error) {
              console.error('Error sending message:', error);
      
      // Mostrar error más específico
      let errorMessage = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
      
      if (error instanceof Error) {
        console.error('Error detallado:', error.message);
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
        } else if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('VITE_GEMINI_API_KEY')) {
          errorMessage = 'Error de autenticación. Contacta al administrador.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Límite de uso alcanzado. Intenta más tarde.';
        } else if (error.message.includes('chat') || error.message.includes('session')) {
          errorMessage = 'Error de sesión. Por favor, recarga la página.';
        }
      }
      
      console.error('Error final:', errorMessage);
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
        .map(msg => `${msg.role === 'user' ? 'Tú' : 'Facilitador LSP'}: ${msg.content}`)
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

  // Toggle speech (text-to-speech) con Gemini TTS nativo
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

      // Intentar usar Gemini TTS nativo primero
      if (chatRef.current && chatRef.current.model === 'gemini-2.0-flash-001') {
        try {
          console.log('Intentando usar Gemini TTS nativo...');
          
          // Usar Gemini TTS nativo
          const response = await chatRef.current.ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: `Lee este texto en voz alta en ESPAÑOL con una voz natural y clara, sin acento ruso: ${cleanContent}`,
            config: {
              systemInstruction: 'Eres un asistente de TTS que lee texto en voz alta EN ESPAÑOL. Debes usar una voz clara y natural en español, sin acentos extranjeros. Responde solo con el audio del texto proporcionado.',
              generationConfig: {
                responseMimeType: 'audio/mp3',
                languageCode: 'es-ES'
              }
            }
          });
          
          if (response.audio) {
            console.log('Gemini TTS nativo funcionando!');
            // Reproducir audio de Gemini
            const audioBlob = new Blob([response.audio], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            return;
          }
        } catch (geminiTtsError) {
          console.log('Gemini TTS no disponible, usando Web Speech API:', geminiTtsError);
        }
      }

      // Fallback a Web Speech API mejorada
      console.log('Usando Web Speech API como fallback...');
      
      // Crear utterance para la síntesis de voz
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      
      // Obtener voces disponibles y configurar la mejor
      const voices = window.speechSynthesis.getVoices();
      
      // PRIORIDAD 1: Voces en español específicamente
      let bestVoice = voices.find(voice => 
        voice.lang.startsWith('es') || voice.lang.startsWith('es-')
      );
      
      // PRIORIDAD 2: Si no hay español, buscar voces premium en español
      if (!bestVoice) {
        bestVoice = voices.find(voice => 
          (voice.name.includes('Google') || voice.name.includes('Premium') || voice.name.includes('Natural')) &&
          (voice.lang.startsWith('es') || voice.lang.startsWith('es-'))
        );
      }
      
      // PRIORIDAD 3: Si no hay español, buscar voces premium en general
      if (!bestVoice) {
        bestVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Premium') || 
          voice.name.includes('Natural') ||
          voice.name.includes('Enhanced')
        );
      }
      
      // PRIORIDAD 4: Como último recurso, usar la primera voz disponible
      if (!bestVoice && voices.length > 0) {
        bestVoice = voices[0];
        console.log('⚠️ No se encontró voz en español, usando:', bestVoice.name, bestVoice.lang);
      }
      
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log('Using voice:', bestVoice.name, bestVoice.lang);
      }
      
      // Configurar propiedades optimizadas para mejor calidad
      utterance.lang = bestVoice?.lang || 'es-ES';
      utterance.rate = 0.85; // Velocidad más lenta para mejor claridad
      utterance.pitch = 1.1; // Tono ligeramente más alto para menos robótico
      utterance.volume = 0.9; // Volumen alto pero no máximo
      
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
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900" style={{ height: '100svh' }}>
      {/* Header simplificado con indicador de fase */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            {/* 4 Barras de Colores LEGO® */}
            <div className="flex space-x-1">
              <div className="w-2 h-6 bg-red-600 rounded-full"></div>
              <div className="w-2 h-6 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-6 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                LSP Insight System
              </h1>
              {currentSession && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentSession.name}
                </p>
              )}
            </div>
          </div>

          {/* Indicador de fase y controles */}
          <div className="flex items-center space-x-4">
            {/* Indicador de fase actual */}
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Fase {currentPhase}/6: {getPhaseDescription(currentPhase)}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewSession}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Nueva</span>
              </button>
              
              <button
                onClick={handleOpenGallery}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">Galería</span>
              </button>

              {/* Menú de sesiones */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center space-x-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Menú</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Simplificado */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="absolute inset-y-0 right-0 w-80 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="h-full bg-white dark:bg-slate-900 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sesiones</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Lista simple de sesiones */}
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      session.id === currentSessionId 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => {
                      handleSelectSession(session.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {session.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Fase {session.currentPhase} • {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal - Full width */}
      <div className="flex-1 flex flex-col">
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
          isChatInitialized={isChatInitialized}
        />
        
        {/* Footer con estadísticas */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 px-4 py-2">
          <div className="flex items-center justify-center space-x-6 max-w-6xl mx-auto">
            <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{messages.length} mensajes</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{messages.filter(m => m.isInsight).length} insights</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>{sessions.length} sesiones</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-500">
              <span className="text-blue-600 dark:text-blue-400 font-medium">4ailabs</span>
            </div>
          </div>
        </div>
        
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