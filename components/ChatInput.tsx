import React, { useState, useRef } from 'react';
import { SendHorizontal, Image as ImageIcon, X } from 'lucide-react';
import { MicrophoneIcon, StopCircleIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (text: string, imageData?: string) => void;
  isLoading: boolean;
  isChatInitialized?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isChatInitialized = true }) => {
  const [message, setMessage] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<any>(null);
  const recordingIntervalRef = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      try {
        onSendMessage(message.trim(), imageData || undefined);
        setMessage('');
        setImageData(null);
        setImagePreview(null);
      } catch (error) {
        console.error('Error sending message:', error);
        // Mostrar error más amigable para móviles
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }

      // Validar tamaño (máximo 5MB para móviles)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageData(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para iniciar grabación de audio
  const startRecording = async () => {
    try {
      // Iniciar reconocimiento de voz directamente (más simple y efectivo)
      const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcripción recibida:', transcript);
        setMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        alert('Error en el reconocimiento de voz. Por favor, intenta de nuevo.');
      };

      recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado');
      };

      // Iniciar reconocimiento
      recognition.start();
      
      // Simular grabación para la UI
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar contador de tiempo
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Guardar referencia para poder detener
      mediaRecorderRef.current = recognition as any;

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  // Función para detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Detener reconocimiento de voz
      if (mediaRecorderRef.current.stop) {
        mediaRecorderRef.current.stop();
      }
      if (mediaRecorderRef.current.abort) {
        mediaRecorderRef.current.abort();
      }
      
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      setRecordingTime(0);
      console.log('Grabación detenida');
    }
  };

  // Formatear tiempo de grabación
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Preview de imagen */}
        {imagePreview && (
          <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Indicador de grabación */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Grabando... {formatRecordingTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Input principal */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Botón de imagen */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            className="flex-shrink-0 w-12 h-12 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Adjuntar imagen"
          >
            <ImageIcon size={20} />
          </button>

          {/* Botón de grabación de audio */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={isLoading}
              className="flex-shrink-0 w-12 h-12 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Grabar audio"
            >
              <MicrophoneIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex-shrink-0 w-12 h-12 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center animate-pulse"
              title="Detener grabación"
            >
              <StopCircleIcon />
            </button>
          )}

          {/* Campo de texto */}
          <div className="flex-1 relative">
            {/* Indicador de estado del chat */}
            {!isChatInitialized && (
              <div className="absolute -top-8 left-0 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                ⚠️ Chat no inicializado
              </div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                fontSize: '16px', // Prevenir zoom en iOS
                WebkitAppearance: 'none'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
              onFocus={(e) => {
                // Fix para iOS: prevenir zoom automático
                e.target.style.fontSize = '16px';
              }}
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`flex-shrink-0 w-12 h-12 sm:w-12 sm:h-12 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${
              message.trim() && !isLoading 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
            }`}
            title="Enviar mensaje"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </div>

        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />


      </form>
    </div>
  );
};

export default ChatInput;
