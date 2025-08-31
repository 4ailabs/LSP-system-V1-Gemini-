import React from 'react';
import Message from './Message';

interface Message {
  id: string;
  role: string;
  content: string;
  isInsight: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  currentPhase: number;
  onToggleInsight: (messageId: string) => void;
  onCopyMessage: (messageId: string) => void;
  onToggleSpeech: (messageId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  currentPhase,
  onToggleInsight,
  onCopyMessage,
  onToggleSpeech
}) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl font-bold">LSP</span>
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Bienvenido a LEGO® Serious Play®
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 leading-relaxed">
            Soy tu facilitador especializado en la metodología LSP. Te guiaré a través de un proceso estructurado donde usarás bricks para construir modelos tridimensionales que representen tus ideas, desafíos y soluciones.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-2">🎯 Exploración Profunda</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Desbloquea nuevas perspectivas y genera insights únicos</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-2">🏗️ Construcción Tangible</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Desarrolla estrategias y planes de acción concretos</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-2">🧠 Reflexión Emocional</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Piensa con tus manos y encuentra tus propias respuestas</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-2">🚀 Resultados Medibles</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Alcanza objetivos específicos con metodología probada</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-5 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200 font-medium">
              💬 ¿Qué tema te gustaría explorar hoy? Escribe tu mensaje y comenzaremos esta experiencia única.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Mensajes */}
        <div className="space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onToggleInsight={onToggleInsight}
              onCopyMessage={onCopyMessage}
              onToggleSpeech={onToggleSpeech}
            />
          ))}
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white dark:bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Gemini está pensando...
              </span>
            </div>
          </div>
        )}

        {/* Espacio al final para scroll */}
        <div className="h-20 sm:h-24 md:h-32"></div>
      </div>
    </div>
  );
};

export default ChatWindow;
